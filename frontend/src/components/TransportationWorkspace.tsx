import React from 'react';
import { Car, CheckCircle2, PlugZap } from 'lucide-react';
import type { WorkflowState } from '../types';
import type { WorkflowAction } from '../state/workflowState';
import { CareLinkRidePanel } from './CareLinkRidePanel';

interface TransportationWorkspaceProps {
  state: WorkflowState;
  reducedMotion?: boolean;
  onRideAction: React.Dispatch<WorkflowAction>;
  /** Rendered inside the staff shell, which already owns the page heading and padding. */
  embedded?: boolean;
}

export const TransportationWorkspace: React.FC<TransportationWorkspaceProps> = ({
  state,
  reducedMotion = false,
  onRideAction,
  embedded = false,
}) => {
  const Title = embedded ? 'h2' : 'h1';
  const transport = state.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION');
  const planVersion = transport?.transportDetails?.planVersion ?? 1;
  const rideStatus = state.ride.currentStatus === 'RECOVERED'
    ? 'Plan complete'
    : state.ride.currentStatus === 'NO_OPTION'
      ? 'Treatment at risk'
      : state.ride.currentStatus === 'OPEN'
        ? 'Recovery not started'
        : 'Recovery in progress';

  return (
    <div className={embedded ? 'space-y-6' : 'page-shell py-6 sm:py-8 space-y-6'}>
      <section className="card-sticker overflow-hidden" aria-labelledby="transport-dashboard-title">
        <div className="p-5 sm:p-7 bg-gradient-to-br from-white via-white to-sun/15 border-b-2 border-ink/10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-2xl bg-sun/40 text-ink flex items-center justify-center shrink-0 border-2 border-ink">
                <Car className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <p className="label-caps text-muted-fg">Transportation operations</p>
                <Title id="transport-dashboard-title" className="font-display text-3xl font-extrabold mt-1">CareLink Transportation Workspace</Title>
                <p className="text-sm text-muted-fg mt-2 max-w-2xl">
                  Coordinate Camila Lopez's ride recovery, preserve assignment history, and verify the current logistics plan before treatment day.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Transportation case summary">
          <div className="metric-tile"><div className="label-caps text-muted-fg">Active cases</div><div className="font-display text-2xl font-extrabold mt-1">1</div><div className="text-xs text-muted-fg">Camila Lopez</div></div>
          <div className="metric-tile"><div className="label-caps text-muted-fg">Ride status</div><div className="font-heading font-bold mt-1">{rideStatus}</div><div className="text-xs text-muted-fg">Current trip</div></div>
          <div className="metric-tile"><div className="label-caps text-muted-fg">Appointment</div><div className="font-heading font-bold mt-1">{state.appointment.scheduledTime}</div><div className="text-xs text-muted-fg">Benson Cancer Center</div></div>
          <div className="metric-tile"><div className="label-caps text-muted-fg">Current plan</div><div className="font-display text-2xl font-extrabold mt-1">v{planVersion}</div><div className="text-xs text-muted-fg">Versioned after changes</div></div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="provider-readiness-title">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="label-caps text-muted-fg">Provider network</p>
            <h2 id="provider-readiness-title" className="font-heading font-bold text-lg">How partners connect</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <article className="card-sticker p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading font-bold">CareLink</h3>
              <CheckCircle2 className="w-4 h-4 text-mint" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold">OncoReady vendor portal · Active</p>
            <p className="text-xs text-muted-fg">Local transport partners without their own software receive trips and post status updates here.</p>
          </article>
          <article className="card-sticker p-4 space-y-2 border-black">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div role="img" aria-label="Uber Health wordmark" className="font-sans text-xs font-black tracking-[0.16em] text-black">UBER HEALTH</div>
                <h3 className="font-heading font-bold mt-1">Uber Health</h3>
              </div>
              <PlugZap className="w-4 h-4 text-accent" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold">API integration · Planned</p>
            <p className="text-xs text-muted-fg">Trip status will sync automatically through the Uber Health API. Not yet connected.</p>
          </article>
        </div>
      </section>

      <CareLinkRidePanel state={state} reducedMotion={reducedMotion} onAction={onRideAction} />
    </div>
  );
};
