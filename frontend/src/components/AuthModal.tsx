import React from 'react';
import { 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Stethoscope, 
  Network, 
  Building2, 
  Activity
} from 'lucide-react';
import { WorkflowState, Perspective } from '../types';
import { Avatar } from './Avatar';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WorkflowState;
  onSelectPerspective: (p: Perspective) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  state,
  onSelectPerspective,
}) => {
  if (!isOpen) return null;

  const handleSelect = (p: Perspective) => {
    onSelectPerspective(p);
    onClose();
  };

  const pendingBlockers = state.tasks.filter((t) => t.status !== 'RESOLVED').length;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase">
                  Authentication Gateway
                </span>
                <span className="text-xs text-slate-400 font-mono">Benson Cancer Center</span>
              </div>
              <h2 id="auth-modal-title" className="text-xl font-extrabold text-white mt-1">
                Select Your Clinical Workspace
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 4 Role Selection Cards */}
        <div className="p-6 sm:p-7 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Card 1: Patient (Maria Hernandez) */}
          <div 
            data-testid="auth-patient-card"
            onClick={() => handleSelect('PATIENT')}
            className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-2xs hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <Avatar
                src={state.patient.avatarUrl}
                alt={state.patient.name}
                size="lg"
                roleType="PATIENT"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">
                    {state.patient.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                    PATIENT
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {state.appointment.protocol} • Cycle {state.appointment.cycleNumber} (Tomorrow 8:30 AM)
                </p>
                <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium pt-0.5">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  <span>
                    {state.overallReadiness === 'PLAN_CONFIRMED'
                      ? 'Treatment Plan Confirmed'
                      : state.readinessCheckCompleted
                      ? 'Readiness Screening Under Triage'
                      : 'Pre-Infusion Screening Pending (2 min)'}
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0">
              <span className="hidden sm:inline">Enter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Card 2: Authorized Caregiver (Ana Hernandez) */}
          <div 
            data-testid="auth-caregiver-card"
            onClick={() => handleSelect('CAREGIVER')}
            className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-2xs hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <Avatar
                src={state.caregiver.avatarUrl}
                alt={state.caregiver.name}
                size="lg"
                roleType="CAREGIVER"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base group-hover:text-teal-600 transition">
                    {state.caregiver.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-mono">
                    CAREGIVER
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {state.caregiver.relationship}
                </p>
                <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Privacy Guard Active (Transit Logistics Only)</span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform shrink-0">
              <span className="hidden sm:inline">Enter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Card 3: Clinical Care Team (Sarah Jenkins RN & Marcus Vance MSW) */}
          <div 
            data-testid="auth-staff-card"
            onClick={() => handleSelect('STAFF')}
            className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-sky-500 bg-white hover:bg-sky-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-2xs hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4 shrink-0">
                <Avatar
                  src="https://images.unsplash.com/photo-1594824813629-923c5e7b233a?auto=format&fit=crop&q=80&w=256"
                  alt="Sarah Jenkins RN"
                  size="md"
                  roleType="NURSE"
                  className="ring-2 ring-white"
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256"
                  alt="Marcus Vance MSW"
                  size="md"
                  roleType="NAVIGATOR"
                  className="ring-2 ring-white"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base group-hover:text-sky-600 transition">
                    Oncology Triage &amp; Navigation Team
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-mono">
                    CARE TEAM
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Sarah Jenkins, RN (Triage) &amp; Marcus Vance, MSW (Navigation)
                </p>
                <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium pt-0.5">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                  <span>{pendingBlockers > 0 ? `${pendingBlockers} Active Infusion Blockers` : 'Exception Queue Cleared'}</span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform shrink-0">
              <span className="hidden sm:inline">Open Hub</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Card 4: Continuity Telemetry & Dependency Graph */}
          <div 
            data-testid="auth-system-card"
            onClick={() => handleSelect('SYSTEM')}
            className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-2xs hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <Avatar
                alt="Continuity Engine"
                size="lg"
                roleType="SYSTEM"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base group-hover:text-slate-900 transition">
                    Treatment Readiness Graph &amp; Audit Log
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    ARCHITECTURE
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Deterministic Finite State Machine &amp; SVG Dependency Graph
                </p>
                <div className="text-[11px] text-indigo-700 flex items-center gap-1 font-medium pt-0.5">
                  <Network className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Real-Time Clinical Telemetry</span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:translate-x-1 transition-transform shrink-0">
              <span className="hidden sm:inline">Inspect Graph</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-7 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Ochsner Health • Benson Cancer Center</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            Enterprise access controls • Training environment
          </span>
        </div>

      </div>
    </div>
  );
};
