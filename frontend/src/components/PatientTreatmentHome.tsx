import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  HeartHandshake, 
  Stethoscope, 
  PhoneCall, 
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { 
  AppointmentDetails, 
  PatientProfile, 
  CaregiverProfile,
  Task 
} from '../types';

interface PatientTreatmentHomeProps {
  patient: PatientProfile;
  appointment: AppointmentDetails;
  caregiver: CaregiverProfile;
  readinessCheckCompleted: boolean;
  patientAcknowledged: boolean;
  tasks: Task[];
  onStartReadinessCheck: () => void;
  onOpenResolutionView: () => void;
  onSwitchPerspective: (p: 'STAFF' | 'CAREGIVER' | 'SYSTEM') => void;
}

export const PatientTreatmentHome: React.FC<PatientTreatmentHomeProps> = ({
  patient,
  appointment,
  caregiver,
  readinessCheckCompleted,
  patientAcknowledged,
  tasks,
  onStartReadinessCheck,
  onOpenResolutionView,
  onSwitchPerspective,
}) => {
  const clinicalTask = tasks.find((t) => t.type === 'CLINICAL_REVIEW');
  const transportTask = tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');
  
  const clinicalResolved = clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED';
  const transportResolved = transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED';
  const allStaffResolved = clinicalResolved && transportResolved;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Patient Welcome & Proximity Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle Decorative Aura */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Patient Portal • Maria Hernandez
              </span>
              <span className="text-xs text-slate-400 font-mono">MRN: {patient.mrn}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Upcoming Infusion: {appointment.protocol}
            </h1>
            <p className="text-sm text-slate-300">
              Cycle {appointment.cycleNumber} • {appointment.treatmentName}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                <Calendar className="w-4 h-4 text-indigo-300" />
                <span className="font-semibold text-white">{appointment.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                <MapPin className="w-4 h-4 text-sky-300" />
                <span>{appointment.location}</span>
              </div>
            </div>
          </div>

          {/* Time Proximity Countdown Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center min-w-[200px] flex flex-col justify-center shadow-inner">
            <div className="text-[11px] font-mono text-indigo-200 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Time Proximity
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
              23<span className="text-xs font-normal text-indigo-200 uppercase ml-0.5 mr-1.5">h</span>
              45<span className="text-xs font-normal text-indigo-200 uppercase ml-0.5">m</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-medium">
              Until scheduled arrival (8:30 AM)
            </div>
          </div>
        </div>
      </div>

      {/* Main Readiness Action Callout */}
      {!readinessCheckCompleted ? (
        /* STATE 1: Readiness check pending */
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-md shadow-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 uppercase">
                  Action Required
                </span>
                <span className="text-xs text-slate-500 font-medium">Takes &lt; 2 minutes</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Complete Your Pre-Infusion Readiness Check
              </h2>
              <p className="text-sm text-slate-600">
                Confirm your transportation and let your oncology team know if you have any new symptoms or barriers before tomorrow morning.
              </p>
            </div>
          </div>

          <button
            onClick={onStartReadinessCheck}
            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span>Start Readiness Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : !patientAcknowledged && allStaffResolved ? (
        /* STATE 2: Staff resolved, awaiting Maria's acknowledgment */
        <div className="bg-white rounded-2xl border-2 border-indigo-400 p-6 shadow-lg shadow-indigo-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 uppercase">
                  Updated Plan Ready
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Nurse & Navigator Actioned
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Updated Treatment Plan is Ready for Review
              </h2>
              <p className="text-sm text-slate-600">
                Nurse Sarah provided pre-infusion hydration guidance and Navigator Marcus confirmed Med-Van pickup at 7:45 AM.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenResolutionView}
            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review & Confirm Plan</span>
          </button>
        </div>
      ) : patientAcknowledged ? (
        /* STATE 3: Plan Confirmed */
        <div className="bg-emerald-50/80 rounded-2xl border-2 border-emerald-300 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-200 text-emerald-900 uppercase">
                  Ready for Tomorrow
                </span>
                <span className="text-xs text-slate-600 font-mono">Plan Confirmed</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Treatment Plan Confirmed & Closed
              </h2>
              <p className="text-sm text-emerald-900">
                Med-Van #402 scheduled for 7:45 AM pickup. Pre-medication labs scheduled at 8:00 AM at Benson Cancer Center.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenResolutionView}
            className="w-full sm:w-auto px-4 py-2 bg-white text-emerald-800 font-semibold rounded-lg border border-emerald-300 hover:bg-emerald-100 transition text-xs shrink-0"
          >
            View Confirmation Details
          </button>
        </div>
      ) : (
        /* STATE 4: Readiness reported, staff triage in progress */
        <div className="bg-white rounded-2xl border border-sky-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800 uppercase">
                  Under Review
                </span>
                <span className="text-xs text-slate-500">2 Tasks Routed</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Reported Barriers are Being Resolved
              </h2>
              <p className="text-sm text-slate-600">
                Sarah Jenkins, RN is reviewing your symptom note and Marcus Vance, MSW is arranging your transportation.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSwitchPerspective('STAFF')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition text-xs flex items-center justify-center gap-2 shrink-0"
          >
            <span>View Staff Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of Key Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Caregiver Access Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <HeartHandshake className="w-4 h-4 text-teal-600" />
                <span>Authorized Caregiver</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                Transportation Only
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="font-semibold text-slate-900 text-xs">{caregiver.name}</div>
              <div className="text-[11px] text-slate-500">{caregiver.relationship} • {caregiver.phone}</div>
              <div className="text-[11px] text-slate-600 pt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Authorized by Maria for Ride Status</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Ana can view transportation status but cannot view your clinical notes or medical symptoms.
            </p>
          </div>

          <button
            onClick={() => onSwitchPerspective('CAREGIVER')}
            className="mt-4 text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 self-start"
          >
            <span>Preview Caregiver View</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Oncology Care Team Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>Oncology Care Team</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Benson Cancer Center</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-900">{patient.oncologist}</div>
                  <div className="text-[11px] text-slate-500">Medical Oncologist</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">Physician</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-900">Sarah Jenkins, RN, OCN</div>
                  <div className="text-[11px] text-slate-500">Oncology Triage Nurse</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">Triage</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
              <span>Benson Triage Line: (504) 555-0100 (Mon–Fri 7am–6pm)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
