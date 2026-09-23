/**
 * Transport provider registry.
 *
 * OncoReady does not dispatch rides itself. It owns the readiness decision
 * (who is at risk, who owns the fix, when the plan is confirmed) and hands the
 * actual trip to whichever provider the program has contracted. Each provider
 * below is reached through one adapter that speaks the provider's own API and
 * normalises the result back into `RideAssignment`.
 *
 * The three verbs every adapter implements:
 *   estimate(trip)  -> price + ETA before committing
 *   dispatch(trip)  -> create the trip, return a provider trip id
 *   cancel(tripId)  -> release it and free the plan for a fallback
 *
 * Status webhooks land on /api/v1/transport/webhook/:providerId and are folded
 * into the audit timeline, so a provider-side change (driver assigned, ride
 * cancelled) moves the readiness plan without anyone re-keying it.
 */

export type TransportProviderId = 'uber-health' | 'lyft-healthcare' | 'carelink-nemt';

export type ProviderKind = 'RIDESHARE_HEALTH' | 'NEMT';

/** Whether this program has finished credentialing the provider. */
export type ConnectionState = 'CONNECTED' | 'AVAILABLE' | 'CONTRACT_REQUIRED';

export interface ProviderCapability {
  label: string;
  supported: boolean;
}

export interface TransportProvider {
  id: TransportProviderId;
  name: string;
  /** Short wordmark used on chips where the full name will not fit. */
  mark: string;
  kind: ProviderKind;
  tagline: string;
  summary: string;
  /** Brand colour, used only for the provider's own chip and rule. */
  brand: string;
  /** Text colour that sits legibly on `brand`. */
  brandFg: string;
  connection: ConnectionState;
  /** Base URL the adapter targets. */
  apiBase: string;
  /** How the adapter authenticates. */
  auth: string;
  /** The endpoints the adapter actually calls, in dispatch order. */
  endpoints: readonly string[];
  /** Provider-side events OncoReady subscribes to. */
  webhookEvents: readonly string[];
  capabilities: readonly ProviderCapability[];
  /** Typical time from dispatch call to a driver being assigned. */
  dispatchWindow: string;
  docsUrl: string;
}

export const TRANSPORT_PROVIDERS: readonly TransportProvider[] = [
  {
    id: 'uber-health',
    name: 'Uber Health',
    mark: 'Uber Health',
    kind: 'RIDESHARE_HEALTH',
    tagline: 'On-demand and scheduled, no rider app required',
    summary:
      'Care coordinators request a trip against the patient roster. The patient gets an SMS or a call with the driver details, so no smartphone or Uber account is needed on their end.',
    brand: '#000000',
    brandFg: '#FFFFFF',
    connection: 'CONNECTED',
    apiBase: 'https://api.uber.com/v1/health',
    auth: 'OAuth 2.0 client credentials · scope health.trips',
    endpoints: [
      'POST /trips/estimates',
      'POST /trips',
      'POST /trips/{request_id}/dispatch',
      'GET  /trips/{request_id}',
      'DELETE /trips/{request_id}',
    ],
    webhookEvents: ['status_changed', 'driver_location', 'trip_message', 'receipt_ready'],
    capabilities: [
      { label: 'Scheduled ahead', supported: true },
      { label: 'On demand', supported: true },
      { label: 'No rider app needed', supported: true },
      { label: 'Wheelchair accessible (WAV)', supported: true },
      { label: 'Curb-to-curb assist', supported: true },
      { label: 'Stretcher transport', supported: false },
    ],
    dispatchWindow: '2–6 min to driver assignment',
    docsUrl: 'https://developer.uber.com/docs/health',
  },
  {
    id: 'lyft-healthcare',
    name: 'Lyft Healthcare',
    mark: 'Lyft',
    kind: 'RIDESHARE_HEALTH',
    tagline: 'Concierge API, booked on behalf of the patient',
    summary:
      'The Concierge API books on the patient’s behalf and can hand the request back to them as a Lyft Pass when they would rather set their own pickup time.',
    brand: '#EA0B8C',
    brandFg: '#FFFFFF',
    connection: 'CONNECTED',
    apiBase: 'https://api.lyft.com/v1',
    auth: 'OAuth 2.0 client credentials · scope rides.request',
    endpoints: [
      'POST /cost',
      'POST /rides',
      'GET  /rides/{ride_id}',
      'POST /rides/{ride_id}/cancel',
    ],
    webhookEvents: ['ride.status.updated', 'ride.driver.assigned', 'ride.receipt'],
    capabilities: [
      { label: 'Scheduled ahead', supported: true },
      { label: 'On demand', supported: true },
      { label: 'No rider app needed', supported: true },
      { label: 'Wheelchair accessible (WAV)', supported: true },
      { label: 'Curb-to-curb assist', supported: true },
      { label: 'Stretcher transport', supported: false },
    ],
    dispatchWindow: '3–8 min to driver assignment',
    docsUrl: 'https://www.lyft.com/healthcare',
  },
  {
    id: 'carelink-nemt',
    name: 'CareLink NEMT',
    mark: 'CareLink',
    kind: 'NEMT',
    tagline: 'Contracted medical transport for the trips rideshare cannot take',
    summary:
      'The regional non-emergency medical transport contract. Slower to schedule, but it covers stretcher, bariatric and oxygen-dependent trips that no rideshare vehicle will accept.',
    brand: '#0C3C34',
    brandFg: '#FFFDF9',
    connection: 'CONNECTED',
    apiBase: 'https://partner.carelink-nemt.example/v2',
    auth: 'Mutual TLS · per-site client certificate',
    endpoints: ['POST /quotes', 'POST /bookings', 'GET  /bookings/{id}', 'POST /bookings/{id}/cancel'],
    webhookEvents: ['booking.confirmed', 'booking.vehicle_assigned', 'booking.cancelled'],
    capabilities: [
      { label: 'Scheduled ahead', supported: true },
      { label: 'On demand', supported: false },
      { label: 'No rider app needed', supported: true },
      { label: 'Wheelchair accessible (WAV)', supported: true },
      { label: 'Curb-to-curb assist', supported: true },
      { label: 'Stretcher transport', supported: true },
    ],
    dispatchWindow: '30–90 min, scheduling desk',
    docsUrl: '#',
  },
];

export const getProvider = (id: TransportProviderId): TransportProvider =>
  TRANSPORT_PROVIDERS.find((provider) => provider.id === id) ?? TRANSPORT_PROVIDERS[0];

/**
 * Fallback order when a dispatch fails. Rideshare first because it recovers in
 * minutes; NEMT last because it is the only one that can take a stretcher and
 * we do not want to burn a scheduling slot on a trip rideshare could have run.
 */
export const FALLBACK_ORDER: readonly TransportProviderId[] = [
  'uber-health',
  'lyft-healthcare',
  'carelink-nemt',
];

/** The next provider to try after `id` has failed, or null when exhausted. */
export const nextFallback = (id: TransportProviderId): TransportProviderId | null => {
  const index = FALLBACK_ORDER.indexOf(id);
  if (index < 0 || index === FALLBACK_ORDER.length - 1) return null;
  return FALLBACK_ORDER[index + 1];
};

/**
 * Providers that can serve a trip with the given requirement. Used to narrow
 * the fallback chain, since a stretcher trip should never route to rideshare.
 */
export const providersSupporting = (capability: string): readonly TransportProvider[] =>
  TRANSPORT_PROVIDERS.filter((provider) =>
    provider.capabilities.some((entry) => entry.label === capability && entry.supported),
  );
