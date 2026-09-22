import React from 'react';
import {
  Car,
  Calendar,
  EyeOff,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { WorkflowState } from '../types';
import { deriveCaregiverProjection } from '../state/workflowState';
import { BENSON_CENTER, NEW_ORLEANS_PICKUP, RideMap } from './RideMap';

interface CaregiverViewProps {
  state: WorkflowState;
}

export const CaregiverView: React.FC<CaregiverViewProps> = ({ state }) => {
  const projection = deriveCaregiverProjection(state);

  return (
    <div className="page-shell space-y-5 overflow-x-clip">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-fg">Caregiver</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
            Caregiver Portal • {state.caregiver.name}
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            Supporting {projection.patientName} • {state.caregiver.relationship}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-mint/30 text-ink border-2 border-ink">
            Authorized Contact
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-white text-ink border-2 border-ink">
            Transportation & Logistics
          </span>
        </div>
      </div>

      <div className="card-sticker p-4 sm:p-5 flex items-start gap-3">
        <span className="icon-bubble w-10 h-10 bg-mint text-ink shrink-0">
          <EyeOff className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading font-bold">Patient Privacy Boundary Enforced</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-bold bg-cream border-2 border-ink">
              DATA MINIMIZATION
            </span>
          </div>
          <p className="text-sm text-muted-fg mt-1 leading-relaxed">
            {projection.privacyBoundaryNotice}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-sticker p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-heading font-bold">
              <Calendar className="w-4 h-4 text-accent" strokeWidth={2.5} />
              <span>Upcoming Appointment</span>
            </div>
            <span className="text-xs text-muted-fg">Benson Cancer Center</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-cream border-2 border-ink/10">
              <div className="label-caps text-muted-fg">Scheduled time</div>
              <div className="font-heading font-bold mt-1">{projection.appointmentTime}</div>
            </div>
            <div className="p-3 rounded-xl bg-cream border-2 border-ink/10">
              <div className="label-caps text-muted-fg">Location & suite</div>
              <div className="font-heading font-bold mt-1">{projection.appointmentLocation}</div>
            </div>
          </div>
        </div>

        <div className="card-sticker p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-heading font-bold">
              <Car className="w-4 h-4 text-mint" strokeWidth={2.5} />
              <span>Transportation Coordination</span>
            </div>
            {projection.transportConfirmed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-heading font-bold bg-mint/30 text-ink border-2 border-ink">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                Ride Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-heading font-bold bg-sun/40 text-ink border-2 border-ink">
                <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                Navigation Coordination In Progress
              </span>
            )}
          </div>

          {projection.transportConfirmed && projection.transportInfo ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-mint/15 border-2 border-ink/10 text-sm space-y-3">
                <div className="font-heading font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                  Transportation Coordination Confirmed
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="label-caps text-muted-fg">Pickup time</div>
                    <div className="font-semibold">{projection.transportInfo.pickupTime}</div>
                  </div>
                  <div>
                    <div className="label-caps text-muted-fg">Assigned vehicle</div>
                    <div className="font-semibold">{projection.transportInfo.vehicleId}</div>
                  </div>
                  <div>
                    <div className="label-caps text-muted-fg">Driver</div>
                    <div className="font-semibold">{projection.transportInfo.driverName}</div>
                  </div>
                  <div>
                    <div className="label-caps text-muted-fg">Pickup address</div>
                    <div className="font-semibold">{projection.transportInfo.pickupAddress}</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-fg">
                Jerome's arrival link will text 30 minutes before pickup.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-cream border-2 border-ink/10 text-sm">
              <div className="font-heading font-bold">Transportation Pending Confirmation</div>
              <p className="text-muted-fg mt-1">
                Oncology Navigator Marcus Vance is coordinating medical transit for Camila's 9:30 AM arrival. Updates will appear here as soon as dispatch confirms vehicle assignment.
              </p>
            </div>
          )}
        </div>
      </div>

      {projection.transportConfirmed && (
        <RideMap
          title="Ride corridor"
          subtitle="Pickup to Benson Suite B. Caregiver-safe route only."
          pickup={NEW_ORLEANS_PICKUP}
          destination={BENSON_CENTER}
          confirmed
          height={360}
        />
      )}

      <p className="text-center text-xs text-muted-fg">
        Caregiver view prepared under Camila Lopez's transportation-only permissions.
      </p>
    </div>
  );
};
