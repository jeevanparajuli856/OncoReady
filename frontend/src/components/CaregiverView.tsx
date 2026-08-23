import React from 'react';
import { 
  HeartHandshake, 
  Car, 
  Calendar, 
  EyeOff, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { WorkflowState } from '../types';
import { deriveCaregiverProjection } from '../state/workflowState';

interface CaregiverViewProps {
  state: WorkflowState;
}

export const CaregiverView: React.FC<CaregiverViewProps> = ({ state }) => {
  // Enforce strict projection derivation: this filter strips all clinical data
  const projection = deriveCaregiverProjection(state);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Caregiver Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  Caregiver Portal • {state.caregiver.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-200">
                  Authorized Contact
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Supporting {projection.patientName} • {state.caregiver.relationship}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[11px] font-mono text-slate-400">PERMISSION SCOPE</div>
            <div className="text-xs font-semibold text-slate-800">Transportation & Logistics</div>
          </div>
        </div>

        {/* Clinical Privacy Guard Callout (Data Minimization Proof) */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
          <EyeOff className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>Patient Privacy Boundary Enforced</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-teal-100 text-teal-800 font-mono">
                DATA MINIMIZATION
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {projection.privacyBoundaryNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Upcoming Appointment</span>
          </div>
          <span className="text-xs font-mono text-slate-500">Benson Cancer Center</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="text-slate-500 font-mono text-[11px]">SCHEDULED TIME</div>
            <div className="font-bold text-slate-900 text-sm">{projection.appointmentTime}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="text-slate-500 font-mono text-[11px]">LOCATION & SUITE</div>
            <div className="font-bold text-slate-900 text-sm">{projection.appointmentLocation}</div>
          </div>
        </div>
      </div>

      {/* Authorized Transportation Coordination Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Car className="w-4 h-4 text-teal-600" />
            <span>Transportation Coordination</span>
          </div>
          
          {projection.transportConfirmed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ride Confirmed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
              Navigation Coordination In Progress
            </span>
          )}
        </div>

        {projection.transportConfirmed && projection.transportInfo ? (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transportation Coordination Confirmed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 block">PICKUP TIME:</span>
                  <span className="font-semibold text-slate-900">{projection.transportInfo.pickupTime}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">ASSIGNED VEHICLE:</span>
                  <span className="font-semibold text-slate-900">{projection.transportInfo.vehicleId}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">DRIVER:</span>
                  <span className="font-semibold text-slate-900">{projection.transportInfo.driverName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">PICKUP ADDRESS:</span>
                  <span className="font-semibold text-slate-900">{projection.transportInfo.pickupAddress}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              An SMS update with driver Jerome's live arrival link will be dispatched 30 minutes prior to pickup tomorrow morning.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900">Transportation Pending Confirmation</div>
            <p>
              Oncology Navigator Marcus Vance is coordinating medical transit for Maria's 8:30 AM arrival. Updates will appear here as soon as dispatch confirms vehicle assignment.
            </p>
          </div>
        )}
      </div>

      {/* Reassurance Footer */}
      <div className="text-center text-xs text-slate-400">
        Caregiver access granted under Maria Hernandez's authorized healthcare proxy permissions.
      </div>
    </div>
  );
};
