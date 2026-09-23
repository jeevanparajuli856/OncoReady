import React, { useEffect, useState } from 'react';
import { AlertTriangle, Car, CheckCircle2, CirclePause, History, Play, RotateCcw, X } from 'lucide-react';
import type { WorkflowState } from '../types';
import { HISTORICAL_RIDE_EVENTS, type WorkflowAction } from '../state/workflowState';
import { BENSON_CENTER, NEW_ORLEANS_PICKUP, RideMap } from './RideMap';

interface CareLinkRidePanelProps {
  state: WorkflowState;
  reducedMotion?: boolean;
  onAction: React.Dispatch<WorkflowAction>;
}

const INITIAL_LOGISTICS = {
  pickupTime: 'Sep 25, 8:15–8:30 AM CT',
  plannedArrival: 'Sep 25, 9:15 AM CT',
  returnArrangement: 'Return coordination 1:00–4:00 PM CT',
  logisticsContact: 'CareLink Dispatch • (504) 555-0124',
  backupOwner: 'Ana Hernandez',
};

const statusLabel: Record<WorkflowState['ride']['currentStatus'], string> = {
  OPEN: 'Recovery open',
  REQUESTED: 'Request recorded',
  PRIMARY_ASSIGNED: 'Primary assigned',
  PRIMARY_FAILED: 'Primary unavailable',
  BACKUP_ASSIGNED: 'Backup selected · logistics incomplete',
  RECOVERED: 'Current plan complete',
  NO_OPTION: 'No option · treatment at risk',
};

export const CareLinkRidePanel: React.FC<CareLinkRidePanelProps> = ({
  state,
  reducedMotion = false,
  onAction,
}) => {
  const [logistics, setLogistics] = useState(INITIAL_LOGISTICS);
  const replay = state.ride.replay;
  const current = state.ride.currentStatus;
  const transport = state.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION');
  const details = transport?.transportDetails;
  const visibleReplayEvents = HISTORICAL_RIDE_EVENTS.slice(0, replay.visibleEventCount);
  const logisticsComplete = Object.values(logistics).every((value) => value.trim().length > 0);

  useEffect(() => {
    if (replay.status !== 'PLAYING') return undefined;
    const timer = window.setTimeout(() => {
      onAction({
        type: 'ADVANCE_HISTORICAL_RIDE',
        payload: { tripId: replay.tripId, sessionToken: replay.sessionToken },
      });
    }, reducedMotion ? 160 : 900);
    return () => window.clearTimeout(timer);
  }, [onAction, reducedMotion, replay.sessionToken, replay.status, replay.tripId, replay.visibleEventCount]);

  const updateLogistics = (field: keyof typeof logistics, value: string) => {
    setLogistics((currentValues) => ({ ...currentValues, [field]: value }));
  };

  return (
    <section className="space-y-4" aria-labelledby="carelink-recovery-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-caps text-muted-fg">CareLink coordination</p>
          <h2 id="carelink-recovery-title" className="font-heading font-bold text-lg">Current-ride recovery</h2>
          <p className="text-xs text-muted-fg font-mono mt-1">{state.ride.currentTripId}</p>
        </div>
        <span className={`chip ${current === 'RECOVERED' ? 'chip-mint' : 'chip-sun'}`}>{statusLabel[current]}</span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-4">
        <article className="card-sticker p-4 sm:p-5 space-y-4" aria-labelledby="current-ride-title">
          <div className="flex items-start gap-3">
            <span className="icon-bubble w-10 h-10 bg-sun text-ink shrink-0"><Car className="w-4 h-4" aria-hidden="true" /></span>
            <div>
              <h3 id="current-ride-title" className="font-heading font-bold">Current ride · plan v{details?.planVersion ?? 1}</h3>
              <p className="text-xs text-muted-fg">Planned times</p>
            </div>
          </div>

          <ol className="space-y-2 text-sm" aria-label="Ride recovery steps">
            <li className="metric-tile">1. Request the current ride</li>
            <li className="metric-tile">2. Assign and evaluate Partner A</li>
            <li className="metric-tile">3. Select Partner B and save required logistics</li>
          </ol>

          <div role="status" aria-live="polite" aria-atomic="true" className="text-sm font-semibold">
            Ride status: {statusLabel[current]}
          </div>

          {current === 'OPEN' && <button type="button" className="btn-candy w-full" onClick={() => onAction({ type: 'REQUEST_CURRENT_RIDE' })}>Request ride</button>}
          {current === 'REQUESTED' && <button type="button" className="btn-candy w-full" onClick={() => onAction({ type: 'ASSIGN_PRIMARY_RIDE' })}>Assign CareLink Partner A</button>}
          {current === 'PRIMARY_ASSIGNED' && <button type="button" className="btn-candy w-full" onClick={() => onAction({ type: 'FAIL_PRIMARY_RIDE' })}>Record primary unavailable</button>}
          {current === 'PRIMARY_FAILED' && (
            <div className="grid sm:grid-cols-2 gap-2">
              <button type="button" className="btn-candy" onClick={() => onAction({ type: 'ASSIGN_BACKUP_RIDE' })}>Select CareLink Partner B</button>
              <button type="button" className="btn-ghost" onClick={() => onAction({ type: 'MARK_NO_RIDE_OPTION' })}>No option available</button>
            </div>
          )}

          {current === 'BACKUP_ASSIGNED' && (
            <fieldset className="space-y-3">
              <legend className="font-heading font-bold">Required recovered logistics</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  ['pickupTime', 'Planned pickup'],
                  ['plannedArrival', 'Planned arrival'],
                  ['returnArrangement', 'Return arrangement'],
                  ['logisticsContact', 'Logistics contact'],
                  ['backupOwner', 'Backup owner'],
                ] as const).map(([field, label]) => (
                  <label key={field} className={field === 'backupOwner' ? 'sm:col-span-2 text-sm font-semibold' : 'text-sm font-semibold'}>
                    {label}
                    <input
                      className="input-pop mt-1"
                      value={logistics[field]}
                      onChange={(event) => updateLogistics(field, event.target.value)}
                      aria-invalid={!logistics[field].trim()}
                      aria-describedby="ride-logistics-requirement"
                    />
                  </label>
                ))}
              </div>
              <p id="ride-logistics-requirement" className="text-xs text-muted-fg">Add every required logistics field to save the current plan.</p>
              <button
                type="button"
                className="btn-candy w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!logisticsComplete}
                onClick={() => onAction({ type: 'SAVE_RECOVERED_RIDE', payload: logistics })}
              >
                Save recovered logistics
              </button>
            </fieldset>
          )}

          {current === 'NO_OPTION' && (
            <div className="p-3 rounded-xl bg-sun/25 border-2 border-ink/10 flex items-start gap-2 text-sm" role="alert">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <p>No ride option is available. Transportation remains open and treatment stays at risk.</p>
            </div>
          )}

          {state.ride.assignments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-sm">Assignment history</h4>
              <ul className="space-y-2">
                {state.ride.assignments.map((assignment) => (
                  <li key={assignment.id} className="metric-tile text-sm flex flex-wrap items-start justify-between gap-2">
                    <div><div className="font-semibold">{assignment.providerName}</div><div className="font-mono text-xs text-muted-fg">{assignment.id}</div></div>
                    <span className={`chip ${assignment.status === 'CURRENT' ? 'chip-accent' : 'chip-sun'}`}>{assignment.status === 'CURRENT' ? 'Current' : 'Failed'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {current === 'RECOVERED' && details && (
            <div className="space-y-3">
              <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                <div className="metric-tile"><dt className="label-caps text-muted-fg">Planned pickup</dt><dd className="font-semibold mt-1">{details.confirmedPickupTime}</dd></div>
                <div className="metric-tile"><dt className="label-caps text-muted-fg">Planned arrival</dt><dd className="font-semibold mt-1">{details.plannedArrival}</dd></div>
                <div className="metric-tile"><dt className="label-caps text-muted-fg">Return</dt><dd className="font-semibold mt-1">{details.returnArrangement}</dd></div>
                <div className="metric-tile"><dt className="label-caps text-muted-fg">Contact</dt><dd className="font-semibold mt-1">{details.logisticsContact}</dd></div>
                <div className="metric-tile sm:col-span-2"><dt className="label-caps text-muted-fg">Backup owner</dt><dd className="font-semibold mt-1">{details.backupOwner}</dd></div>
              </dl>
              <button type="button" className="btn-ghost w-full" onClick={() => onAction({ type: 'FAIL_CURRENT_RIDE' })}>Record current plan failure</button>
            </div>
          )}
        </article>

        <article className="card-sticker p-4 sm:p-5 space-y-4" aria-labelledby="historical-replay-title">
          <div className="flex items-start gap-3">
            <span className="icon-bubble w-10 h-10 bg-accent/15 text-accent shrink-0"><History className="w-4 h-4" aria-hidden="true" /></span>
            <div>
              <h3 id="historical-replay-title" className="font-heading font-bold">Previous CareLink trip</h3>
              <p className="font-mono text-xs text-muted-fg"><span>carelink-prior-001</span><span aria-hidden="true"> · </span><span>Sep 11, 2026</span></p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {replay.status !== 'PLAYING' && <button type="button" className="btn-candy btn-compact" onClick={() => onAction({ type: 'PLAY_HISTORICAL_RIDE' })}><Play className="w-4 h-4" aria-hidden="true" />{replay.status === 'PAUSED' ? 'Resume previous trip' : 'Play previous trip'}</button>}
            {replay.status === 'PLAYING' && <button type="button" className="btn-ghost btn-compact" onClick={() => onAction({ type: 'PAUSE_HISTORICAL_RIDE' })}><CirclePause className="w-4 h-4" aria-hidden="true" />Pause previous trip</button>}
            <button type="button" className="btn-ghost btn-compact" onClick={() => onAction({ type: 'RESTART_HISTORICAL_RIDE' })}><RotateCcw className="w-4 h-4" aria-hidden="true" />Restart previous trip</button>
            <button type="button" className="btn-ghost btn-compact" onClick={() => onAction({ type: 'EXIT_HISTORICAL_RIDE' })}><X className="w-4 h-4" aria-hidden="true" />Exit previous trip</button>
          </div>

          <p className="text-xs text-muted-fg"><span>Previous trip · original trip times</span></p>
          <div role="status" aria-live="polite" aria-atomic="true" className="text-sm font-semibold">
            Replay {replay.status.toLowerCase()}{visibleReplayEvents.at(-1) ? ` · ${visibleReplayEvents.at(-1)?.status}` : ''}
          </div>

          {visibleReplayEvents.length ? (
            <ol className="space-y-2">
              {visibleReplayEvents.map((event) => (
                <li key={event.id} className="metric-tile text-sm">
                  <div className="flex items-start justify-between gap-2"><span className="font-semibold">{event.status}</span><CheckCircle2 className="w-4 h-4 text-mint shrink-0" aria-hidden="true" /></div>
                  <div className="text-xs text-muted-fg mt-1">{event.timestamp}</div>
                  <p className="text-xs mt-1">{event.detail}</p>
                </li>
              ))}
            </ol>
          ) : <p className="metric-tile text-sm text-muted-fg">Play to reveal the saved dispatch sequence.</p>}

          <RideMap
            staticOnly
            title="Route"
            subtitle="Previous trip corridor"
            pickup={NEW_ORLEANS_PICKUP}
            destination={BENSON_CENTER}
            confirmed={replay.status === 'COMPLETE'}
            height={190}
          />
        </article>
      </div>
    </section>
  );
};
