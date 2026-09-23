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
  ShieldCheck,
} from 'lucide-react';
import {
  AppointmentDetails,
  PatientProfile,
  CaregiverProfile,
  Task,
  LabResult,
  VitalSign,
} from '../types';
import { NURSE_AVATAR } from '../state/workflowState';

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
  onSwitchPerspective: (p: 'CARE_TEAM' | 'CAREGIVER') => void;
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

  const clinicalResolved = Boolean(clinicalTask?.clinicalDetails?.dispositionRecordedAt && clinicalTask.clinicalDetails.followUpBlocking === false);
  const transportResolved = Boolean(
    transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED' &&
    !transportTask.transportDetails.planFailed &&
    transportTask.transportDetails.returnArrangement &&
    transportTask.transportDetails.logisticsContact &&
    transportTask.transportDetails.backupPlan
  );
  const allStaffResolved = clinicalResolved && transportResolved;
  const progress = Math.round((appointment.cycleNumber / appointment.totalCycles) * 100);

  return (
    <div className="page-shell space-y-5 pb-8">
      <div className="card-sticker p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b-2 border-ink/10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <img
                src={patient.avatarUrl}
                alt={patient.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-ink"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-mint border-2 border-ink flex items-center justify-center text-ink" title="Active Patient Account">
                <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
              </span>
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
                  {patient.name}
                </h1>
                <span className="chip chip-accent">{patient.diagnosis}</span>
              </div>
              <p className="text-xs text-muted-fg font-mono">
                MRN: {patient.mrn} • {patient.stage} • BSA: {patient.bodySurfaceArea}
              </p>
              <p className="text-xs text-muted-fg">
                Oncologist: <span className="font-heading font-bold text-ink">{patient.oncologist}</span>
              </p>
            </div>
          </div>

          <div className="metric-tile w-full sm:w-auto sm:min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="label-caps text-muted-fg">Treatment Progress</span>
              <span className="font-heading font-bold">Cycle {appointment.cycleNumber} of {appointment.totalCycles}</span>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border-2 border-ink">
              <div
                className="h-full bg-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-fg text-right">{progress}% Protocol Completed</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
          {[
            ['Blood pressure', '124 / 78', 'Normal range'],
            ['Absolute neutrophils', '1.82 × 10³/µL', 'Plan Confirmed'],
            ['Platelets', '168 × 10³/µL', 'Normal baseline'],
            ['ECOG performance', 'Status 1', 'Fully ambulatory'],
          ].map(([label, value, hint]) => (
            <div key={label} className="metric-tile">
              <div className="label-caps text-muted-fg">{label}</div>
              <div className="font-heading font-bold text-sm mt-1">{value}</div>
              <div className="text-[11px] text-muted-fg mt-0.5">{hint}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-sticker p-5 sm:p-6 bg-ink text-cream overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-sun text-ink">Scheduled Next Session</span>
              <span className="text-xs text-cream/70">Benson Suite B</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">{appointment.protocol}</h2>
            <p className="text-sm text-cream/75">{appointment.treatmentName}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border-2 border-white/20 text-xs font-heading font-bold">
                <Calendar className="w-3.5 h-3.5 text-sun" strokeWidth={2.5} />
                {appointment.scheduledTime}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border-2 border-white/20 text-xs font-heading font-bold">
                <MapPin className="w-3.5 h-3.5 text-mint" strokeWidth={2.5} />
                {appointment.infusionChair}
              </span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border-2 border-white/20 text-center w-full sm:w-auto sm:min-w-[180px]">
            <div className="label-caps text-cream/70 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sun" strokeWidth={2.5} />
              Time proximity
            </div>
            <div className="font-display text-3xl font-extrabold tabular-nums mt-1">
              23<span className="text-sm font-heading font-bold text-cream/70 ml-0.5 mr-2">h</span>
              45<span className="text-sm font-heading font-bold text-cream/70 ml-0.5">m</span>
            </div>
            <div className="text-xs text-cream/70 mt-1">Arrival 9:30 AM</div>
          </div>
        </div>
      </div>

      {!readinessCheckCompleted ? (
        <div className="card-sticker p-5 sm:p-6 shadow-pop-sun btn-stack flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="icon-bubble w-11 h-11 bg-sun text-ink">
              <ShieldAlert className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-sun">Action Required</span>
                <span className="text-xs text-muted-fg">Takes &lt; 2 minutes</span>
              </div>
              <h2 className="font-heading font-bold text-lg">
                Complete Your Pre-Infusion Readiness Check
              </h2>
              <p className="text-sm text-muted-fg leading-relaxed">
                Confirm your transportation and let your oncology care team know if you have any new symptoms or concerns before tomorrow morning.
              </p>
            </div>
          </div>
          <button onClick={onStartReadinessCheck} className="btn-candy shrink-0">
            <span>Start Readiness Check</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      ) : !patientAcknowledged && allStaffResolved ? (
        <div className="card-sticker p-5 sm:p-6 btn-stack flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="icon-bubble w-11 h-11 bg-accent text-white">
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-accent">Updated Plan Ready</span>
                <span className="chip chip-mint">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Nurse Sarah & Navigator Marcus Actioned
                </span>
              </div>
              <h2 className="font-heading font-bold text-lg">
                Your Updated Treatment Plan is Ready for Review
              </h2>
              <p className="text-sm text-muted-fg leading-relaxed">
                Sarah Jenkins, RN recorded your human contact and disposition. Marcus Vance completed the current outbound, return, contact, and backup plan.
              </p>
            </div>
          </div>
          <button onClick={onOpenResolutionView} className="btn-candy shrink-0">
            <FileCheck2 className="w-4 h-4" strokeWidth={2.5} />
            <span>Review & Confirm Plan</span>
          </button>
        </div>
      ) : patientAcknowledged ? (
        <div className="card-sticker p-5 sm:p-6 bg-mint/20 btn-stack flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="icon-bubble w-11 h-11 bg-mint text-ink">
              <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-mint">Continuity plan confirmed</span>
                <span className="text-xs text-muted-fg">Attendance remains unknown</span>
              </div>
              <h2 className="font-heading font-bold text-lg">Current Coordination Plan Acknowledged</h2>
              <p className="text-sm text-muted-fg leading-relaxed">
                Your current transportation and care-team coordination plan is recorded. This does not confirm treatment attendance.
              </p>
            </div>
          </div>
          <button onClick={onOpenResolutionView} className="btn-ghost shrink-0">
            View Confirmation Details
          </button>
        </div>
      ) : (
        <div className="card-sticker p-5 sm:p-6 btn-stack flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="icon-bubble w-11 h-11 bg-accent/20 text-ink">
              <Clock className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-accent">Under Triage Review</span>
                <span className="text-xs text-muted-fg">2 Actions Dispatched</span>
              </div>
              <h2 className="font-heading font-bold text-lg">
                Your Reported Barriers are Being Resolved
              </h2>
              <p className="text-sm text-muted-fg leading-relaxed">
                Sarah Jenkins, RN is evaluating your symptom report and Marcus Vance, MSW is scheduling your medical transportation.
              </p>
            </div>
          </div>
          <button onClick={() => onSwitchPerspective('CARE_TEAM')} className="btn-candy shrink-0">
            <span>View Care Team Workbench</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      )}

      <div className="card-sticker overflow-hidden">
        <button
          onClick={() => setIsDrugsExpanded(!isDrugsExpanded)}
          className="w-full p-5 flex items-center justify-between gap-3 text-left hover:bg-sun/10 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="icon-bubble w-10 h-10 bg-accent/15 text-ink">
              <Pill className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <div className="font-heading font-bold">Chemotherapy Regimen Specifications</div>
              <div className="text-xs text-muted-fg">mFOLFOX6 + Bevacizumab Protocol Breakdown & Doses</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-heading font-bold shrink-0">
            <span>{isDrugsExpanded ? 'Hide Details' : 'View 5 Agents'}</span>
            {isDrugsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isDrugsExpanded && (
          <div className="p-5 pt-0 border-t-2 border-ink/10 space-y-3 animate-fade-in">
            {appointment.drugs.map((drug, idx) => (
              <div key={idx} className="metric-tile space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-heading font-bold">{drug.name}</span>
                  <span className="chip chip-accent font-mono">{drug.dosage}</span>
                </div>
                <p className="text-sm text-muted-fg">
                  <span className="font-heading font-bold text-ink">Route:</span> {drug.route} • <span className="font-heading font-bold text-ink">Schedule:</span> {drug.schedule}
                </p>
                <p className="text-xs text-muted-fg">Mechanism: {drug.indication}</p>
              </div>
            ))}
            <div className="p-4 rounded-xl bg-accent/10 border-2 border-ink/10 space-y-2">
              <div className="font-heading font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" strokeWidth={2.5} />
                Standard Pre-Medication Orders
              </div>
              <ul className="list-disc list-inside text-sm text-muted-fg space-y-1">
                {appointment.premeds.map((pre, idx) => (
                  <li key={idx}>{pre}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-sticker p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-heading font-bold">
              <HeartHandshake className="w-4 h-4 text-mint" strokeWidth={2.5} />
              Authorized Caregiver
            </div>
            <span className="chip chip-mint">Transportation Scope</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-cream border-2 border-ink/10">
            <img
              src={caregiver.avatarUrl}
              alt={caregiver.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-ink"
            />
            <div>
              <div className="font-heading font-bold text-sm">{caregiver.name}</div>
              <div className="text-xs text-muted-fg">{caregiver.relationship} • {caregiver.phone}</div>
              <div className="text-xs font-heading font-bold text-ink mt-0.5">Authorized for Ride Tracking</div>
            </div>
          </div>
          <p className="text-sm text-muted-fg leading-relaxed">
            Ana receives vehicle dispatch notices while your confidential clinical symptoms and triage notes remain strictly private.
          </p>
          <button
            onClick={() => onSwitchPerspective('CAREGIVER')}
            className="inline-flex items-center gap-1 text-sm font-heading font-bold hover:text-accent"
          >
            Open Caregiver View
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="card-sticker p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-heading font-bold">
              <Stethoscope className="w-4 h-4 text-accent" strokeWidth={2.5} />
              Oncology Care Team
            </div>
            <span className="text-xs text-muted-fg">Benson Suite B</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cream border-2 border-ink/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={appointment.oncologistAvatar}
                  alt={patient.oncologist}
                  className="w-10 h-10 rounded-lg object-cover border-2 border-ink"
                />
                <div className="min-w-0">
                  <div className="font-heading font-bold text-sm truncate">{patient.oncologist}</div>
                  <div className="text-xs text-muted-fg">Attending Medical Oncologist</div>
                </div>
              </div>
              <span className="chip chip-accent shrink-0">Physician</span>
            </div>
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cream border-2 border-ink/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={NURSE_AVATAR}
                  alt="Sarah Jenkins, BSN, RN, OCN"
                  className="w-10 h-10 rounded-lg object-cover border-2 border-ink"
                />
                <div className="min-w-0">
                  <div className="font-heading font-bold text-sm">Sarah Jenkins, BSN, RN, OCN</div>
                  <div className="text-xs text-muted-fg">Oncology Triage Nurse</div>
                </div>
              </div>
              <span className="chip chip-accent shrink-0">Triage</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-fg">
            <PhoneCall className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={2.5} />
            Benson Triage Direct: (504) 555-0100 (Mon-Fri 7am-6pm)
          </div>
        </div>
      </div>
    </div>
  );
};
