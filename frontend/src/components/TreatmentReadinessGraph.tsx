import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Car, 
  Stethoscope, 
  UserCheck, 
  Calendar, 
  Info,
  ArrowUpRight
} from 'lucide-react';
import { Task, ReadinessStatus, AppointmentDetails } from '../types';

interface TreatmentReadinessGraphProps {
  appointment: AppointmentDetails;
  tasks: Task[];
  overallReadiness: ReadinessStatus;
  patientAcknowledged: boolean;
  readinessCheckCompleted: boolean;
  onNavigateToStaff?: () => void;
  onNavigateToPatient?: () => void;
}

export const TreatmentReadinessGraph: React.FC<TreatmentReadinessGraphProps> = ({
  appointment,
  tasks,
  overallReadiness,
  patientAcknowledged,
  readinessCheckCompleted,
  onNavigateToPatient,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const clinicalTask = tasks.find((t) => t.type === 'CLINICAL_REVIEW');
  const transportTask = tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');

  const clinicalResolved = Boolean(clinicalTask?.clinicalDetails?.dispositionRecordedAt && clinicalTask.clinicalDetails.followUpBlocking === false);
  const transportResolved = Boolean(transportTask?.status === 'RESOLVED' && transportTask.transportDetails?.dispatchStatus === 'CONFIRMED' && !transportTask.transportDetails.planFailed && transportTask.transportDetails.returnArrangement && transportTask.transportDetails.logisticsContact && transportTask.transportDetails.backupPlan);
  const allStaffResolved = clinicalResolved && transportResolved;

  return (
    <div className="card-sticker p-5 sm:p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-line">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-display font-extrabold tracking-tight">Treatment Readiness Graph</h2>
            <span className="chip chip-accent">Shared care state</span>
          </div>
          <p className="text-sm text-muted-fg mt-1">
            Dependencies that must close before treatment. Attendance is confirmed separately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-heading font-bold">
          <span className="chip chip-mint">Resolved</span>
          <span className="chip chip-sun">Active Blocker</span>
          <span className="chip">Unscreened</span>
        </div>
      </div>

      {/* Interactive Visual Graph Canvas */}
      <div className="relative min-h-0 md:min-h-[460px] bg-white/50 rounded-xl border border-line p-3 sm:p-4 flex flex-col justify-between gap-4">
        
        {/* SVG Bezier Dynamic Connectors */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-0" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Desktop Bezier paths */}
          <g className="hidden md:block">
            {/* Link from Clinical Node (top left) to Center Infusion */}
            <path
              d="M 280,110 C 380,110 380,230 480,230"
              fill="none"
              stroke={
                !readinessCheckCompleted
                  ? '#CBD5E1'
                  : clinicalResolved
                  ? '#10B981'
                  : '#F59E0B'
              }
              strokeWidth={clinicalResolved ? 3.5 : 2.5}
              className={readinessCheckCompleted && !clinicalResolved ? 'animate-svg-dash' : ''}
              strokeLinecap="round"
            />

            {/* Link from Transport Node (bottom left) to Center Infusion */}
            <path
              d="M 280,350 C 380,350 380,230 480,230"
              fill="none"
              stroke={
                !readinessCheckCompleted
                  ? '#CBD5E1'
                  : transportResolved
                  ? '#10B981'
                  : '#F59E0B'
              }
              strokeWidth={transportResolved ? 3.5 : 2.5}
              className={readinessCheckCompleted && !transportResolved ? 'animate-svg-dash' : ''}
              strokeLinecap="round"
            />

            {/* Link from Center Infusion to Patient Plan Confirmation (right) */}
            <path
              d="M 680,230 C 760,230 760,230 840,230"
              fill="none"
              stroke={
                patientAcknowledged
                  ? '#10B981'
                  : allStaffResolved
                  ? '#F59E0B'
                  : '#CBD5E1'
              }
              strokeWidth={patientAcknowledged ? 3.5 : 2.5}
              className={allStaffResolved && !patientAcknowledged ? 'animate-svg-dash' : ''}
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* 3-Column Node Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10 items-center min-h-0 md:min-h-[420px]">
          
          {/* LEFT COLUMN: The Two Upstream Blocker Nodes */}
          <div className="flex flex-col gap-5 justify-center">
            
            {/* NODE 1: Clinical Symptom Review */}
            <div 
              onClick={() => setSelectedNode('CLINICAL')}
              tabIndex={0}
              role="button"
              aria-label="Clinical Symptom Review Node"
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white/90 text-left focus:outline-none ${
                !readinessCheckCompleted
                  ? 'border-line opacity-75'
                  : clinicalResolved
                  ? 'border-mint/30 shadow-pop-mint'
                  : 'border-sun/30 pulse-amber-ring'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    clinicalResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Clinical Review &amp; Disposition</h3>
                    <p className="text-[11px] text-slate-500">Sarah Jenkins, RN (Triage)</p>
                  </div>
                </div>

                {clinicalResolved ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Reviewed
                  </span>
                ) : readinessCheckCompleted ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" />
                    Pending Review
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                    Unscreened
                  </span>
                )}
              </div>

              {readinessCheckCompleted && (
                <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-mono">Patient Report:</div>
                  <p className="text-slate-800 italic line-clamp-2">
                    "{clinicalTask?.clinicalDetails?.verbatimReport || 'Mild fever 100.4°F and tingling in fingers'}"
                  </p>
                  {clinicalResolved && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] text-emerald-800 font-medium">
                      ✓ Nurse review and disposition documented
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* NODE 2: Transportation Navigation */}
            <div 
              onClick={() => setSelectedNode('TRANSPORT')}
              tabIndex={0}
              role="button"
              aria-label="Transportation Navigation Node"
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white/90 text-left focus:outline-none ${
                !readinessCheckCompleted
                  ? 'border-line opacity-75'
                  : transportResolved
                  ? 'border-mint/30 shadow-pop-mint'
                  : 'border-sun/30 pulse-amber-ring'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    transportResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Transit Fulfillment</h3>
                    <p className="text-[11px] text-slate-500">Marcus Vance, MSW (Navigator)</p>
                  </div>
                </div>

                {transportResolved ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Current plan complete
                  </span>
                ) : readinessCheckCompleted ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" />
                    Ride Cancelled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                    Unscreened
                  </span>
                )}
              </div>

              {readinessCheckCompleted && (
                <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-mono">Pickup Request:</div>
                  <p className="text-slate-800">
                    1420 St. Charles Ave (8:15–8:30 AM pickup; 9:15 AM planned arrival)
                  </p>
                  {transportResolved && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] text-emerald-800 font-medium">
                      ✓ Med-Van #402 confirmed (Driver: Jerome Davis)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Central Target Infusion Node */}
          <div className="flex justify-center">
            <div 
              onClick={() => setSelectedNode('CENTER')}
              tabIndex={0}
              role="button"
              aria-label="Upcoming Infusion Target Node"
              className={`w-full max-w-sm p-5 rounded-xl border border-line transition-all cursor-pointer bg-white text-center focus:outline-none ${
                overallReadiness === 'PLAN_CONFIRMED'
                  ? 'shadow-pop-mint'
                  : overallReadiness === 'AT_RISK'
                  ? 'shadow-pop-sun'
                  : 'shadow-pop-accent'
              }`}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-white mb-3">
                <Calendar className="w-6 h-6" />
              </div>

              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                Target Treatment Event
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {appointment.protocol}
              </h3>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">
                Cycle {appointment.cycleNumber} • {appointment.scheduledTime}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {appointment.location}
              </p>

              {/* Status Badge in Center */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-mono text-slate-400 mb-1">READINESS STATUS</div>
                {overallReadiness === 'PLAN_CONFIRMED' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    CONTINUITY PLAN CONFIRMED
                  </div>
                ) : overallReadiness === 'AT_RISK' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs animate-pulse-subtle">
                    <AlertTriangle className="w-4 h-4" />
                    AT RISK (2 BLOCKERS)
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-500" />
                    SCREENING REQUIRED
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Patient Plan Confirmation Closure Node */}
          <div className="flex justify-center md:justify-start">
            <div 
              onClick={() => setSelectedNode('CLOSURE')}
              tabIndex={0}
              role="button"
              aria-label="Patient Plan Confirmation Closure Node"
              className={`w-full p-4 rounded-xl border transition-all cursor-pointer bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                patientAcknowledged
                  ? 'border-emerald-300 shadow-sm shadow-emerald-50 hover:border-emerald-400'
                  : allStaffResolved
                  ? 'border-amber-400 shadow-md shadow-amber-50 pulse-amber-ring hover:border-amber-500'
                  : 'border-slate-200 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    patientAcknowledged 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : allStaffResolved 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Patient Plan Confirmation</h3>
                    <p className="text-[11px] text-slate-500">Camila Lopez (Patient)</p>
                  </div>
                </div>

                {patientAcknowledged ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Confirmed
                  </span>
                ) : allStaffResolved ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3" />
                    Awaiting Camila
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">
                    Locked
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-2">
                {patientAcknowledged
                  ? 'Camila acknowledged the current coordination plan version.'
                  : allStaffResolved
                  ? 'Staff actions complete. Awaiting final patient acknowledgment.'
                  : 'Requires Nurse Triage review and Transport dispatch before closure.'}
              </p>

              {allStaffResolved && !patientAcknowledged && onNavigateToPatient && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToPatient();
                  }}
                  className="mt-3 w-full py-2 px-3 bg-accent hover:bg-brand-600 text-white rounded-xl text-xs font-heading font-semibold flex items-center justify-center gap-1"
                >
                  <span>Switch to Patient View & Confirm</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Node Detail Inspector Drawer */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-ink text-cream rounded-xl text-xs flex items-start justify-between gap-4 animate-fade-in border-2 border-ink">
          <div className="space-y-1">
            <div className="font-heading font-bold flex items-center gap-1.5 text-sun">
              <Info className="w-4 h-4" />
              Node Inspector: {selectedNode}
            </div>
            <p className="text-cream/80">
              {selectedNode === 'CLINICAL' && 'Deterministic Clinical Review Task assigned to Sarah Jenkins, RN. Triage protocol preserves patient symptom input verbatim without automated diagnosis.'}
              {selectedNode === 'TRANSPORT' && 'Transportation recovery is owned by Marcus Vance, MSW. Closure requires outbound, return, contact, and backup details for the current plan version.'}
              {selectedNode === 'CENTER' && 'Upcoming FOLFOX6 Cycle 4 treatment anchor. Evaluates dependency graph status before confirming readiness.'}
              {selectedNode === 'CLOSURE' && 'Patient acknowledgment is tied to the current transport plan version and expires after a material plan change.'}
            </p>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="btn-ghost btn-compact !bg-white shrink-0"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
