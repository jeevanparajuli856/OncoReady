import React, { useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Flag, MapPin, Phone, ShieldCheck, Truck, UserRound } from 'lucide-react';
import type { VendorTripView } from '../types';
import { HISTORICAL_RIDE_EVENTS, type WorkflowAction } from '../state/workflowState';
import { ST_CHARLES_TO_BENSON, ST_CHARLES_TO_BENSON_SUMMARY } from '../data/routes';
import { CareLinkMark } from './CareLinkMark';
import { BENSON_CENTER, NEW_ORLEANS_PICKUP, RideMap } from './RideMap';

interface CareLinkVendorPortalProps {
  trip: VendorTripView;
  onAction: React.Dispatch<WorkflowAction>;
}

const DECLINE_REASONS = ['Outside service window', 'No vehicle available', 'Driver unavailable'];
const UNAVAILABLE_REASONS = ['Vehicle out of service', 'Driver unavailable', 'Outside service window'];
const TRIP_DAY_STEPS = ['En route to pickup', 'Picked up', 'Dropped off'];

const STATUS_BADGE: Record<VendorTripView['status'], { label: string; className: string }> = {
  NONE: { label: 'No offer', className: 'bg-slate-100 text-slate-700' },
  OFFERED: { label: 'New trip offer', className: 'bg-amber-100 text-amber-900' },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-900' },
  RELEASED: { label: 'Released', className: 'bg-slate-200 text-slate-800' },
};

const priorTrip = {
  id: 'carelink-prior-001',
  date: 'Sep 11, 2026',
  driver: 'Ellis Morgan',
  vehicle: 'CL-218',
  pickedUp: HISTORICAL_RIDE_EVENTS.find((event) => event.id === 'RIDE-HIST-PICKUP')?.timestamp.split('• ')[1] ?? '',
  completed: HISTORICAL_RIDE_EVENTS.find((event) => event.id === 'RIDE-HIST-COMPLETE')?.timestamp.split('• ')[1] ?? '',
};

const ReasonForm: React.FC<{
  id: string;
  label: string;
  reasons: string[];
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}> = ({ id, label, reasons, submitLabel, onCancel, onSubmit }) => {
  const [reason, setReason] = useState(reasons[0]);
  return (
    <form
      className="rounded-xl border border-amber-300 bg-amber-50 p-3 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(reason);
      }}
    >
      <label htmlFor={id} className="block text-sm font-semibold text-slate-900">{label}</label>
      <select id={id} className="input-pop w-full" value={reason} onChange={(event) => setReason(event.target.value)}>
        {reasons.map((option) => <option key={option}>{option}</option>)}
      </select>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="carelink-btn carelink-btn-warn">{submitLabel}</button>
        <button type="button" className="carelink-btn carelink-btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export const CareLinkVendorPortal: React.FC<CareLinkVendorPortalProps> = ({ trip, onAction }) => {
  const [releaseMode, setReleaseMode] = useState<null | 'decline' | 'unavailable'>(null);
  const badge = STATUS_BADGE[trip.status];
  const hasTrip = trip.status !== 'NONE';
  const openOffers = trip.status === 'OFFERED' ? 1 : 0;
  const acceptedTrips = trip.status === 'ACCEPTED' ? 1 : 0;

  const release = (reason: string, declined: boolean) => {
    onAction({ type: 'FAIL_PRIMARY_RIDE', payload: { reason, declined } });
    setReleaseMode(null);
  };

  return (
    <div className="carelink-portal min-h-full bg-[#F3F7F5]">
      <div className="bg-[#0B3B33] text-white">
        <div className="page-shell px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <CareLinkMark size={28} inverted />
            <span className="hidden sm:block h-6 w-px bg-white/25" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{trip.vendorName}</p>
              <p className="text-[11px] text-emerald-100/80">Dispatch desk · Vendor portal</p>
            </div>
          </div>
          <p className="text-[11px] text-emerald-100/80">Powered by <span className="font-semibold text-white">OncoReady</span></p>
        </div>
      </div>

      <div className="page-shell px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0E7C66]">Trip board</p>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 mt-1">Today's trips</h1>
            <p className="text-sm text-slate-600 mt-1">Wed, Sep 24, 2026 · Trips offered by OncoReady care navigators</p>
          </div>
          <dl className="grid grid-cols-3 gap-2 sm:gap-3 text-center" aria-label="Trip counts">
            {[
              ['Open offers', openOffers],
              ['Accepted', acceptedTrips],
              ['Completed · Sep', 1],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white border border-slate-200 px-3 py-2 min-w-[92px]">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="font-display text-2xl font-extrabold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)] gap-5">
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" aria-labelledby="carelink-trip-title">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-slate-200">
              <div>
                <h2 id="carelink-trip-title" className="font-heading font-bold text-slate-900">
                  {hasTrip ? `Trip for ${trip.riderName}` : 'No open trips'}
                </h2>
                <p className="font-mono text-xs text-slate-500">{trip.tripId}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`} role="status">{badge.label}</span>
            </div>

            {!hasTrip ? (
              <div className="px-5 py-10 text-center space-y-2">
                <Truck className="w-8 h-8 mx-auto text-slate-400" aria-hidden="true" />
                <p className="font-semibold text-slate-800">No trips offered right now.</p>
                <p className="text-sm text-slate-600">New trips from OncoReady care navigators appear here as soon as they are assigned to you.</p>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-pink-500 shrink-0" aria-hidden="true" />
                    <div><dt className="text-xs font-semibold text-slate-500">Pickup</dt><dd className="font-semibold text-slate-900">{trip.pickupAddress}</dd></div>
                  </div>
                  <div className="flex gap-3">
                    <Flag className="w-4 h-4 mt-0.5 text-violet-600 shrink-0" aria-hidden="true" />
                    <div><dt className="text-xs font-semibold text-slate-500">Drop-off</dt><dd className="font-semibold text-slate-900">{trip.destination}</dd></div>
                  </div>
                  <div className="flex gap-3">
                    <CalendarClock className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" aria-hidden="true" />
                    <div><dt className="text-xs font-semibold text-slate-500">Pickup window</dt><dd className="font-semibold text-slate-900">{trip.pickupWindow}</dd></div>
                  </div>
                  <div className="flex gap-3">
                    <Truck className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" aria-hidden="true" />
                    <div><dt className="text-xs font-semibold text-slate-500">Vehicle type</dt><dd className="font-semibold text-slate-900">{trip.vehicleType}</dd></div>
                  </div>
                  <div className="flex gap-3">
                    <UserRound className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" aria-hidden="true" />
                    <div><dt className="text-xs font-semibold text-slate-500">Driver and vehicle</dt><dd className="font-semibold text-slate-900">{trip.driverName} · {trip.vehicleId}</dd></div>
                  </div>
                  {trip.status !== 'RELEASED' && (
                    <div className="flex gap-3">
                      <Phone className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" aria-hidden="true" />
                      <div><dt className="text-xs font-semibold text-slate-500">Rider callback</dt><dd className="font-semibold text-slate-900">{trip.riderPhone}</dd></div>
                    </div>
                  )}
                </dl>

                <RideMap
                  title="Trip route"
                  subtitle="Pickup to drop-off"
                  summary={`${ST_CHARLES_TO_BENSON_SUMMARY.distanceMiles} mi · about ${ST_CHARLES_TO_BENSON_SUMMARY.driveMinutes} min drive`}
                  pickup={NEW_ORLEANS_PICKUP}
                  destination={BENSON_CENTER}
                  route={ST_CHARLES_TO_BENSON}
                  height={220}
                />

                {trip.status === 'OFFERED' && (
                  releaseMode === 'decline' ? (
                    <ReasonForm
                      id="carelink-decline-reason"
                      label="Why are you declining this trip?"
                      reasons={DECLINE_REASONS}
                      submitLabel="Decline trip"
                      onCancel={() => setReleaseMode(null)}
                      onSubmit={(reason) => release(reason, true)}
                    />
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button type="button" className="carelink-btn carelink-btn-primary flex-1" onClick={() => onAction({ type: 'VENDOR_ACCEPT_TRIP' })}>
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />Accept trip
                      </button>
                      <button type="button" className="carelink-btn carelink-btn-ghost" onClick={() => setReleaseMode('decline')}>Decline</button>
                    </div>
                  )
                )}

                {trip.status === 'ACCEPTED' && (
                  <div className="space-y-4">
                    <p className="text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      Accepted {trip.acceptedAt}. The care navigator can see your acceptance.
                    </p>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Trip-day status</h3>
                      <div className="grid sm:grid-cols-3 gap-2">
                        {TRIP_DAY_STEPS.map((step) => (
                          <button key={step} type="button" disabled className="carelink-btn carelink-btn-ghost" aria-describedby="carelink-trip-day-hint">
                            <Clock className="w-4 h-4" aria-hidden="true" />{step}
                          </button>
                        ))}
                      </div>
                      <p id="carelink-trip-day-hint" className="text-xs text-slate-500 mt-2">Status buttons open on trip day, Sep 25.</p>
                    </div>
                    {releaseMode === 'unavailable' ? (
                      <ReasonForm
                        id="carelink-unavailable-reason"
                        label="What changed?"
                        reasons={UNAVAILABLE_REASONS}
                        submitLabel="Report unavailable"
                        onCancel={() => setReleaseMode(null)}
                        onSubmit={(reason) => release(reason, false)}
                      />
                    ) : (
                      <button type="button" className="carelink-btn carelink-btn-warn w-full" onClick={() => setReleaseMode('unavailable')}>
                        <AlertTriangle className="w-4 h-4" aria-hidden="true" />Report unavailable
                      </button>
                    )}
                  </div>
                )}

                {trip.status === 'RELEASED' && (
                  <p className="text-sm text-slate-700 bg-slate-100 rounded-xl px-3 py-2">
                    You released this trip {trip.releasedAt}. The OncoReady care navigator has been notified and is reassigning it.
                  </p>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5" aria-labelledby="carelink-completed-title">
              <h2 id="carelink-completed-title" className="font-heading font-bold text-slate-900">Completed trips</h2>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                <li className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-slate-500">{priorTrip.id}</p>
                    <p className="font-semibold text-slate-900">{priorTrip.date}</p>
                    <p className="text-xs text-slate-600">{priorTrip.driver} · {priorTrip.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 px-2 py-0.5 text-xs font-bold"><CheckCircle2 className="w-3 h-3" aria-hidden="true" />Completed</span>
                    <p className="text-xs text-slate-500 mt-1">Picked up {priorTrip.pickedUp}</p>
                    <p className="text-xs text-slate-500">Dropped off {priorTrip.completed}</p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl bg-[#E6F2EE] border border-emerald-200 p-5 space-y-2" aria-labelledby="carelink-privacy-title">
              <h2 id="carelink-privacy-title" className="font-heading font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#0E7C66]" aria-hidden="true" />Trip details only</h2>
              <p className="text-sm text-slate-700">CareLink shows what your drivers need to run the trip. Clinical information stays with the care team in OncoReady.</p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
