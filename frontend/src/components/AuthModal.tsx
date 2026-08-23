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
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-cream rounded-lg max-w-2xl w-full border-2 border-ink shadow-pop-lg overflow-hidden animate-pop">
        
        {/* Modal Header */}
        <div className="bg-accent text-white p-6 sm:p-7 flex items-center justify-between border-b-2 border-ink">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-sun border-2 border-ink text-ink flex items-center justify-center">
              <Activity className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="chip bg-sun text-ink">Authentication Gateway</span>
                <span className="text-xs text-white/70">Benson Cancer Center</span>
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
            onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handleSelect('PATIENT')}
            role="button"
            tabIndex={0}
            className="p-4 sm:p-5 rounded-xl border-2 border-ink bg-white hover:bg-sun/20 hover:-rotate-1 transition-transform duration-300 ease-bouncey cursor-pointer flex items-center justify-between gap-4 group shadow-pop-soft"
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
                  <span className="font-heading font-extrabold text-base">
                    {state.patient.name}
                  </span>
                  <span className="chip chip-accent">PATIENT</span>
                </div>
                <p className="text-xs text-muted-fg">
                  {state.appointment.protocol} • Cycle {state.appointment.cycleNumber} (Tomorrow 8:30 AM)
                </p>
                <div className="text-[11px] text-muted-fg flex items-center gap-1 font-medium pt-0.5">
                  <Clock className="w-3 h-3 text-accent" />
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

            <span className="inline-flex items-center gap-1 text-xs font-heading font-bold text-accent shrink-0">
              <span className="hidden sm:inline">Enter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Card 2: Authorized Caregiver (Ana Hernandez) */}
          <div 
            data-testid="auth-caregiver-card"
            onClick={() => handleSelect('CAREGIVER')}
            onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handleSelect('CAREGIVER')}
            role="button"
            tabIndex={0}
            className="p-4 sm:p-5 rounded-xl border-2 border-ink bg-white hover:bg-mint/20 hover:-rotate-1 transition-transform duration-300 ease-bouncey cursor-pointer flex items-center justify-between gap-4 group shadow-pop-soft"
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
                  <span className="font-heading font-extrabold text-base">
                    {state.caregiver.name}
                  </span>
                  <span className="chip chip-mint">CAREGIVER</span>
                </div>
                <p className="text-xs text-muted-fg">
                  {state.caregiver.relationship}
                </p>
                <div className="text-[11px] text-ink flex items-center gap-1 font-medium pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-mint" />
                  <span>Privacy Guard Active (Transit Logistics Only)</span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-heading font-bold text-accent shrink-0">
              <span className="hidden sm:inline">Enter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Card 3: Clinical Care Team (Sarah Jenkins RN & Marcus Vance MSW) */}
          <div 
            data-testid="auth-staff-card"
            onClick={() => handleSelect('STAFF')}
            onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handleSelect('STAFF')}
            role="button"
            tabIndex={0}
            className="p-4 sm:p-5 rounded-xl border-2 border-ink bg-white hover:bg-accent/10 hover:-rotate-1 transition-transform duration-300 ease-bouncey cursor-pointer flex items-center justify-between gap-4 group shadow-pop-soft"
          >
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4 shrink-0">
                <Avatar
                  src=""
                  alt="Sarah Jenkins RN"
                  size="md"
                  roleType="NURSE"
                  className="ring-2 ring-white"
                />
                <Avatar
                  src=""
                  alt="Marcus Vance MSW"
                  size="md"
                  roleType="NAVIGATOR"
                  className="ring-2 ring-white"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-base">
                    Oncology Triage &amp; Navigation Team
                  </span>
                  <span className="chip chip-accent">CARE TEAM</span>
                </div>
                <p className="text-xs text-muted-fg">
                  Sarah Jenkins, RN (Triage) &amp; Marcus Vance, MSW (Navigation)
                </p>
                <div className="text-[11px] text-muted-fg flex items-center gap-1 font-medium pt-0.5">
                  <Stethoscope className="w-3.5 h-3.5 text-accent" />
                  <span>{pendingBlockers > 0 ? `${pendingBlockers} Active Infusion Blockers` : 'Exception Queue Cleared'}</span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-heading font-bold text-accent shrink-0">
              <span className="hidden sm:inline">Open Hub</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Card 4: Continuity Telemetry & Dependency Graph */}
          <div 
            data-testid="auth-system-card"
            onClick={() => handleSelect('SYSTEM')}
            onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handleSelect('SYSTEM')}
            role="button"
            tabIndex={0}
            className="p-4 sm:p-5 rounded-xl border-2 border-ink bg-white hover:bg-muted hover:-rotate-1 transition-transform duration-300 ease-bouncey cursor-pointer flex items-center justify-between gap-4 group shadow-pop-soft"
          >
            <div className="flex items-center gap-4">
              <Avatar
                alt="Continuity Engine"
                size="lg"
                roleType="SYSTEM"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-base">
                    Treatment Readiness Graph &amp; Audit Log
                  </span>
                  <span className="chip">ARCHITECTURE</span>
                </div>
                <p className="text-xs text-muted-fg">
                  Deterministic Finite State Machine &amp; SVG Dependency Graph
                </p>
                <div className="text-[11px] text-muted-fg flex items-center gap-1 font-medium pt-0.5">
                  <Network className="w-3.5 h-3.5 text-accent" />
                  <span>Real-Time Clinical Telemetry</span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-heading font-bold text-ink shrink-0">
              <span className="hidden sm:inline">Inspect Graph</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-7 bg-sun/30 border-t-2 border-ink flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" />
            <span>Benson Cancer Center • Training environment</span>
          </div>
          <span className="text-muted-fg font-mono text-[11px]">
            Enterprise access controls • Training environment
          </span>
        </div>

      </div>
    </div>
  );
};
