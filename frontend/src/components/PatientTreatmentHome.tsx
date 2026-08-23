import React, { useState } from 'react';
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
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Pill, 
  ShieldCheck
} from 'lucide-react';
import { 
  AppointmentDetails, 
  PatientProfile, 
  CaregiverProfile,
  Task,
  LabResult,
  VitalSign
} from '../types';

interface PatientTreatmentHomeProps {
  patient: PatientProfile;
  appointment: AppointmentDetails;
  caregiver: CaregiverProfile;
  readinessCheckCompleted: boolean;
  patientAcknowledged: boolean;
  tasks: Task[];
  labs: LabResult[];
  vitals: VitalSign[];
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
  const [isDrugsExpanded, setIsDrugsExpanded] = useState<boolean>(false);

  const clinicalTask = tasks.find((t) => t.type === 'CLINICAL_REVIEW');
  const transportTask = tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');
  
  const clinicalResolved = clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED';
  const transportResolved = transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED';
  const allStaffResolved = clinicalResolved && transportResolved;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      
      {/* Patient Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={patient.avatarUrl}
                alt={patient.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md ring-2 ring-indigo-50"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active Patient Account">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {patient.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {patient.diagnosis}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                MRN: {patient.mrn} • {patient.stage} • BSA: {patient.bodySurfaceArea}
              </p>
              <div className="text-xs text-slate-600 font-medium">
                Oncologist: <span className="text-slate-900 font-semibold">{patient.oncologist}</span>
              </div>
            </div>
          </div>

          {/* Infusion Cycle Progress Bar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 min-w-[200px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500 uppercase text-[10px] font-bold">Treatment Progress</span>
              <span className="font-bold text-indigo-700">Cycle {appointment.cycleNumber} of {appointment.totalCycles}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${(appointment.cycleNumber / appointment.totalCycles) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 text-right">
              {Math.round((appointment.cycleNumber / appointment.totalCycles) * 100)}% Protocol Completed
            </div>
          </div>
        </div>

        {/* Quick Vitals & Pre-Infusion Baseline Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase">BLOOD PRESSURE</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">124 / 78</div>
            <div className="text-[10px] text-slate-500">Normal range</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase">ABSOLUTE NEUTROPHILS</div>
            <div className="font-bold text-emerald-700 text-sm mt-0.5">1.82 × 10³/µL</div>
            <div className="text-[10px] text-emerald-600">Plan Confirmed</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase">PLATELETS</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">168 × 10³/µL</div>
            <div className="text-[10px] text-slate-500">Normal baseline</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase">ECOG PERFORMANCE</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Status 1</div>
            <div className="text-[10px] text-slate-500">Fully ambulatory</div>
          </div>
        </div>
      </div>

      {/* Hero Banner: Upcoming Infusion & Time Proximity */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 -mb-20 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Scheduled Next Session
              </span>
              <span className="text-xs text-indigo-300 font-mono">Benson Suite B</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {appointment.protocol}
            </h2>
            <p className="text-sm text-slate-300">
              {appointment.treatmentName}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <Calendar className="w-4 h-4 text-indigo-300" />
                <span className="font-bold text-white">{appointment.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-sky-300" />
                <span>{appointment.infusionChair}</span>
              </div>
            </div>
          </div>

          {/* Time Proximity Countdown Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[210px] shadow-lg">
            <div className="text-[11px] font-mono text-indigo-200 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-300" />
              Time Proximity
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums mt-1">
              23<span className="text-xs font-normal text-indigo-200 uppercase ml-0.5 mr-2">h</span>
              45<span className="text-xs font-normal text-indigo-200 uppercase ml-0.5">m</span>
            </div>
            <div className="text-xs text-slate-300 mt-1 font-medium">
              Until scheduled arrival (8:30 AM)
            </div>
          </div>
        </div>
      </div>

      {/* Main Readiness Action Callout */}
      {!readinessCheckCompleted ? (
        /* STATE 1: Readiness check pending */
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 sm:p-7 shadow-lg shadow-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 uppercase">
                  Action Required
                </span>
                <span className="text-xs text-slate-500 font-medium">Takes &lt; 2 minutes</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Complete Your Pre-Infusion Readiness Check
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Confirm your transportation and let your oncology care team know if you have any new symptoms or concerns before tomorrow morning.
              </p>
            </div>
          </div>

          <button
            onClick={onStartReadinessCheck}
            className="w-full sm:w-auto px-7 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span>Start Readiness Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : !patientAcknowledged && allStaffResolved ? (
        /* STATE 2: Staff resolved, awaiting Maria's acknowledgment */
        <div className="bg-white rounded-3xl border-2 border-indigo-500 p-6 sm:p-7 shadow-xl shadow-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-900 uppercase">
                  Updated Plan Ready
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Nurse Sarah & Navigator Marcus Actioned
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Updated Treatment Plan is Ready for Review
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sarah Jenkins, RN authorized your pre-medication labs and hydration plan, and Marcus Vance confirmed your 7:45 AM Med-Van pickup.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenResolutionView}
            className="w-full sm:w-auto px-7 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review & Confirm Plan</span>
          </button>
        </div>
      ) : patientAcknowledged ? (
        /* STATE 3: Plan Confirmed */
        <div className="bg-emerald-50/90 rounded-3xl border-2 border-emerald-300 p-6 sm:p-7 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-200 text-emerald-950 uppercase">
                  Ready for Tomorrow
                </span>
                <span className="text-xs text-slate-600 font-mono">Plan Confirmed</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Treatment Plan Confirmed & Ready
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                Med-Van #402 scheduled for 7:45 AM pickup. Pre-medication labs scheduled at 8:00 AM at Benson Cancer Center Suite B.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenResolutionView}
            className="w-full sm:w-auto px-5 py-3 bg-white text-emerald-800 font-bold rounded-xl border border-emerald-300 hover:bg-emerald-100 transition text-xs shrink-0 shadow-xs"
          >
            View Confirmation Details
          </button>
        </div>
      ) : (
        /* STATE 4: Readiness reported, staff triage in progress */
        <div className="bg-white rounded-3xl border border-sky-200 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-900 uppercase">
                  Under Triage Review
                </span>
                <span className="text-xs text-slate-500 font-medium">2 Actions Dispatched</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Reported Barriers are Being Resolved
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sarah Jenkins, RN is evaluating your symptom report and Marcus Vance, MSW is scheduling your medical transportation.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSwitchPerspective('STAFF')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition text-xs flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <span>View Staff Workbench</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Expandable Protocol Drug Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setIsDrugsExpanded(!isDrugsExpanded)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/70 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm sm:text-base">
                Chemotherapy Regimen Specifications
              </div>
              <div className="text-xs text-slate-500">
                mFOLFOX6 + Bevacizumab Protocol Breakdown & Doses
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <span>{isDrugsExpanded ? 'Hide Details' : 'View 5 Agents'}</span>
            {isDrugsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isDrugsExpanded && (
          <div className="p-6 pt-0 border-t border-slate-100 space-y-4 animate-fade-in text-xs">
            <div className="grid grid-cols-1 gap-3">
              {appointment.drugs.map((drug, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-sm">{drug.name}</span>
                    <span className="font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      {drug.dosage}
                    </span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Route:</span> {drug.route} • <span className="font-semibold text-slate-800">Schedule:</span> {drug.schedule}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Mechanism: {drug.indication}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Standard Pre-Medication Orders</span>
              </div>
              <ul className="list-disc list-inside text-slate-700 space-y-1 pl-1">
                {appointment.premeds.map((pre, idx) => (
                  <li key={idx}>{pre}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Context Cards: Caregiver & Care Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Caregiver Access Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <HeartHandshake className="w-4 h-4 text-teal-600" />
                <span>Authorized Caregiver</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                Transportation Scope
              </span>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <img
                src={caregiver.avatarUrl}
                alt={caregiver.name}
                className="w-12 h-12 rounded-xl object-cover border border-teal-200"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">{caregiver.name}</div>
                <div className="text-[11px] text-slate-500">{caregiver.relationship} • {caregiver.phone}</div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Authorized for Ride Tracking</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ana receives vehicle dispatch notices while your confidential clinical symptoms and triage notes remain strictly private.
            </p>
          </div>

          <button
            onClick={() => onSwitchPerspective('CAREGIVER')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 self-start"
          >
            <span>Preview Caregiver View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Oncology Care Team Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>Oncology Care Team</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Benson Suite B</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={appointment.oncologistAvatar}
                    alt={patient.oncologist}
                    className="w-10 h-10 rounded-lg object-cover border border-indigo-200"
                  />
                  <div>
                    <div className="font-bold text-slate-900">{patient.oncologist}</div>
                    <div className="text-[11px] text-slate-500">Attending Medical Oncologist</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">Physician</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1594824813629-923c5e7b233a?auto=format&fit=crop&q=80&w=256"
                    alt="Sarah Jenkins RN"
                    className="w-10 h-10 rounded-lg object-cover border border-sky-200"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Sarah Jenkins, BSN, RN, OCN</div>
                    <div className="text-[11px] text-slate-500">Oncology Triage Nurse</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">Triage</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Benson Triage Direct: (504) 555-0100 (Mon–Fri 7am–6pm)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
