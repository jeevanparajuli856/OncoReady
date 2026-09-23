import React, { useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronDown, Clock, Flag, MapPin, Phone, ShieldCheck, Truck, UserRound } from 'lucide-react';
import type { Perspective, VendorTripView } from '../types';
import { HISTORICAL_RIDE_EVENTS, type WorkflowAction } from '../state/workflowState';
import { ST_CHARLES_TO_BENSON, ST_CHARLES_TO_BENSON_SUMMARY } from '../data/routes';
import { CareLinkMark } from './CareLinkMark';
import { WorkspaceSwitchMenu } from './WorkspaceSwitchMenu';
import { BENSON_CENTER, NEW_ORLEANS_PICKUP, RideMap } from './RideMap';

interface CareLinkVendorPortalProps {
  trip: VendorTripView;
  onAction: React.Dispatch<WorkflowAction>;
  /** Presenter workspace switcher; only avatar images are passed, never patient records. */
  switcher?: {
    patientAvatarUrl: string;
    caregiverAvatarUrl: string;
    onSelect: (perspective: Perspective) => void;
  };
}

/** Gives the standalone portal its own tab title and icon while it is open. */
const useCareLinkDocumentBrand = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    const previousIcon = icon?.getAttribute('href') ?? null;
    document.title = 'CareLink by OncoReady · Trip board';
    icon?.setAttribute('href', '/carelink-mark.svg');
    return () => {
      document.title = previousTitle;
      if (icon && previousIcon) icon.setAttribute('href', previousIcon);
    };
  }, []);
};

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

export const CareLinkVendorPortal: React.FC<CareLinkVendorPortalProps> = ({ trip, onAction, switcher }) => {
  const [releaseMode, setReleaseMode] = useState<null | 'decline' | 'unavailable'>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  useCareLinkDocumentBrand();
  const badge = STATUS_BADGE[trip.status];
  const hasTrip = trip.status !== 'NONE';
  const openOffers = trip.status === 'OFFERED' ? 1 : 0;
  const acceptedTrips = trip.status === 'ACCEPTED' ? 1 : 0;

  const release = (reason: string, declined: boolean) => {
    onAction({ type: 'FAIL_PRIMARY_RIDE', payload: { reason, declined } });
    setReleaseMode(null);
  };

  return (
    <div className="carelink-portal min-h-screen flex flex-col bg-[#F3F7F5]">
      <header className="sticky top-0 z-40 bg-[#0B3B33] text-white shadow-[0_8px_24px_-18px_rgba(0,0,0,0.6)]">
        <div className="page-shell px-4 sm:px-6 h-[4.25rem] flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <CareLinkMark size={34} inverted endorsed />
            <span className="hidden md:block h-8 w-px bg-white/20" aria-hidden="true" />
            <div className="hidden md:block min-w-0">
              <p className="text-sm font-semibold truncate">{trip.vendorName}</p>
              <p className="text-[11px] text-emerald-100/80">Vendor portal · Dispatch desk</p>
            </div>
          </div>
          {switcher && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsSwitcherOpen((open) => !open)}
                aria-expanded={isSwitcherOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 pl-1.5 pr-2.5 py-1.5"
              >
                <span className="w-8 h-8 rounded-lg bg-emerald-300 text-[#0B3B33] text-xs font-extrabold flex items-center justify-center" aria-hidden="true">DD</span>
                <span className="text-left hidden sm:block">
                  <span className="block text-xs font-semibold leading-tight">Dispatch desk</span>
                  <span className="block text-[10px] text-emerald-100/80">Switch workspace</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="sr-only sm:hidden">Switch workspace</span>
              </button>
              {isSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-ink rounded-2xl border border-line shadow-glass-lg py-2 z-50 animate-fade-in" onMouseLeave={() => setIsSwitcherOpen(false)}>
                  <WorkspaceSwitchMenu
                    currentPerspective="CARELINK_VENDOR"
                    patientAvatarUrl={switcher.patientAvatarUrl}
                    caregiverAvatarUrl={switcher.caregiverAvatarUrl}
                    onSelect={(perspective) => { setIsSwitcherOpen(false); switcher.onSelect(perspective); }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 w-full page-shell px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <p className="md:hidden text-sm font-semibold text-slate-800">{trip.vendorName} · Dispatch desk</p>
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

      <footer className="border-t border-slate-200 bg-white">
        <div className="page-shell px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <CareLinkMark size={22} endorsed />
          <div className="flex items-center gap-4">
            <span>For local transport partners</span>
            <a href="/privacy" className="hover:text-[#0E7C66] hover:underline">Privacy</a>
            <a href="/terms" className="hover:text-[#0E7C66] hover:underline">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
