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

  const clinicalResolved = clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED';
  const transportResolved = transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED';
  const allStaffResolved = clinicalResolved && transportResolved;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      {/* Graph Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Treatment Readiness Graph</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-medium border border-indigo-100">
              Live Dependency Network
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-agent dependency mapping anchoring pre-treatment blockers to tomorrow's infusion.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Resolved
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Active Blocker
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
            Unscreened
          </span>
        </div>
      </div>

      {/* Interactive Visual Graph Canvas */}
      <div className="relative min-h-[460px] bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between">
        
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-center min-h-[420px]">
          
          {/* LEFT COLUMN: The Two Upstream Blocker Nodes */}
          <div className="flex flex-col gap-5 justify-center">
            
            {/* NODE 1: Clinical Symptom Review */}
            <div 
              onClick={() => setSelectedNode('CLINICAL')}
              tabIndex={0}
              role="button"
              aria-label="Clinical Symptom Review Node"
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                !readinessCheckCompleted
                  ? 'border-slate-200 opacity-75'
                  : clinicalResolved
                  ? 'border-emerald-300 shadow-sm shadow-emerald-50 hover:border-emerald-400'
                  : 'border-amber-300 shadow-md shadow-amber-50 pulse-amber-ring hover:border-amber-400'
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
                    <h3 className="text-xs font-bold text-slate-900">Clinical Symptom Clearance</h3>
                    <p className="text-[11px] text-slate-500">Sarah Jenkins, RN (Triage)</p>
                  </div>
                </div>

                {clinicalResolved ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Cleared
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
                      ✓ Nurse advice documented • 8:00 AM labs cleared
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
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                !readinessCheckCompleted
                  ? 'border-slate-200 opacity-75'
                  : transportResolved
                  ? 'border-emerald-300 shadow-sm shadow-emerald-50 hover:border-emerald-400'
                  : 'border-amber-300 shadow-md shadow-amber-50 pulse-amber-ring hover:border-amber-400'
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
                    Dispatched
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
                    1420 St. Charles Ave (7:45 AM Pickup)
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
              className={`w-full max-w-sm p-5 rounded-2xl border transition-all cursor-pointer bg-white text-center shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                overallReadiness === 'PLAN_CONFIRMED'
                  ? 'border-emerald-400 shadow-glow-emerald bg-gradient-to-b from-white to-emerald-50/40'
                  : overallReadiness === 'AT_RISK'
                  ? 'border-amber-400 shadow-glow-amber bg-gradient-to-b from-white to-amber-50/40'
                  : 'border-indigo-200 shadow-glow-indigo'
              }`}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
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
                    PLAN CONFIRMED & READY
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
                    <p className="text-[11px] text-slate-500">Maria Hernandez (Patient)</p>
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
                    Awaiting Maria
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">
                    Locked
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-2">
                {patientAcknowledged
                  ? 'Maria confirmed receipt of 7:45 AM ride and clinical guidance.'
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
                  className="mt-3 w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 shadow-sm"
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
        <div className="mt-4 p-4 bg-slate-900 text-white rounded-xl text-xs flex items-start justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-300">
              <Info className="w-4 h-4" />
              Node Inspector: {selectedNode}
            </div>
            <p className="text-slate-300">
              {selectedNode === 'CLINICAL' && 'Deterministic Clinical Review Task assigned to Sarah Jenkins, RN. Triage protocol preserves patient symptom input verbatim without automated diagnosis.'}
              {selectedNode === 'TRANSPORT' && 'Simulated Non-Emergency Medical Transport Task assigned to Marcus Vance, MSW. Coordinates vehicle pickup at 7:45 AM.'}
              {selectedNode === 'CENTER' && 'Upcoming FOLFOX6 Cycle 4 treatment anchor. Evaluates dependency graph status before confirming readiness.'}
              {selectedNode === 'CLOSURE' && 'Patient confirmation closure gate. Ensures Maria receives and acknowledges updated care instructions.'}
            </p>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
