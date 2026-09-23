import React from 'react';
import { Car } from 'lucide-react';
import type { WorkflowState } from '../types';
import type { WorkflowAction } from '../state/workflowState';
import { RideDispatchPanel } from './RideDispatchPanel';
import { TransportIntegrations } from './TransportIntegrations';

interface TransportationWorkspaceProps {
  state: WorkflowState;
  reducedMotion?: boolean;
  onRideAction: React.Dispatch<WorkflowAction>;
}

export const TransportationWorkspace: React.FC<TransportationWorkspaceProps> = ({
  state,
  reducedMotion = false,
  onRideAction,
}) => {
  const transport = state.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION');
  const planVersion = transport?.transportDetails?.planVersion ?? 1;
  const rideStatus = state.ride.currentStatus === 'RECOVERED'
    ? 'Plan confirmed'
    : state.ride.currentStatus === 'NO_OPTION'
      ? 'Treatment at risk'
      : state.ride.currentStatus === 'OPEN'
        ? 'Not yet requested'
        : 'Dispatch in progress';

  return (
    <div className="page-shell py-6 sm:py-8 space-y-6">
      <section className="card-sticker overflow-hidden" aria-labelledby="transport-dashboard-title">
        <div className="p-5 sm:p-7 border-b border-line">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-lg bg-accent text-accent-fg flex items-center justify-center shrink-0">
                <Car className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <p className="label-caps text-muted-fg">Transportation operations</p>
                <h1 id="transport-dashboard-title" className="font-display text-3xl font-semibold mt-1">Transport dispatch</h1>
                <p className="text-sm text-muted-fg mt-2 max-w-2xl">
                  Book and recover treatment-day rides across every contracted provider, keep the assignment history, and confirm the logistics plan before treatment day.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Transportation case summary">
          <div className="metric-tile"><div className="label-caps text-muted-fg">Active cases</div><div className="font-display text-2xl font-semibold mt-1">1</div><div className="text-xs text-muted-fg">Camila Lopez</div></div>
          <div className="metric-tile"><div className="label-caps text-muted-fg">Ride status</div><div className="font-heading font-bold mt-1">{rideStatus}</div><div className="text-xs text-muted-fg">Treatment-day trip</div></div>
          <div className="metric-tile"><div className="label-caps text-muted-fg">Appointment</div><div className="font-heading font-bold mt-1">{state.appointment.scheduledTime}</div><div className="text-xs text-muted-fg">Benson Cancer Center</div></div>
          <div className="metric-tile"><div className="label-caps text-muted-fg">Current plan</div><div className="font-display text-2xl font-semibold mt-1">v{planVersion}</div><div className="text-xs text-muted-fg">Versioned after changes</div></div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="provider-readiness-title">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="label-caps text-muted-fg">Provider adapters</p>
            <h2 id="provider-readiness-title" className="font-display font-semibold text-xl">Connected transport</h2>
          </div>
          <p className="text-xs text-muted-fg">Fallback runs left to right until a provider accepts.</p>
        </div>
        <TransportIntegrations showTechnicalDetail />
      </section>

      <RideDispatchPanel state={state} reducedMotion={reducedMotion} onAction={onRideAction} />
    </div>
  );
};
