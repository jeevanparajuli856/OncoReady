import React, { useRef } from 'react';
import {
  ArrowRight,
  Building2,
  HeartHandshake,
  Route,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react';
import { PreparedWorkspace, WorkflowState } from '../types';
import { useDialogFocus } from '../lib/useDialogFocus';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WorkflowState;
  onSelectWorkspace: (workspace: PreparedWorkspace) => void;
}

const destinationCopy: Array<{
  id: PreparedWorkspace;
  label: string;
  title: string;
  description: string;
  testId: string;
  Icon: typeof Stethoscope;
  tone: string;
}> = [
  {
    id: 'STAFF',
    label: 'Recorded start',
    title: 'Staff workspace',
    description: 'Sarah Jenkins, RN and Marcus Vance, MSW coordinate the prepared case.',
    testId: 'auth-staff-card',
    Icon: Stethoscope,
    tone: 'chip-accent',
  },
  {
    id: 'PATIENT',
    label: 'Patient',
    title: 'Camila Lopez',
    description: 'Report a concern and review the current continuity plan.',
    testId: 'auth-patient-card',
    Icon: UserRound,
    tone: 'chip-accent',
  },
  {
    id: 'CAREGIVER',
    label: 'Caregiver',
    title: 'Ana Hernandez',
    description: 'Transportation details only; clinical content stays private.',
    testId: 'auth-caregiver-card',
    Icon: HeartHandshake,
    tone: 'chip-mint',
  },
  {
    id: 'TRANSPORTATION',
    label: 'Transportation',
    title: 'CareLink Dispatch',
    description: 'Open the existing staff logistics context for the prepared scenario.',
    testId: 'auth-transport-card',
    Icon: Route,
    tone: 'chip-sun',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  state,
  onSelectWorkspace,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(isOpen, dialogRef, onClose);

  if (!isOpen) return null;

  const handleSelect = (workspace: PreparedWorkspace) => {
    onSelectWorkspace(workspace);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/55 flex items-start sm:items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
    >
      <div ref={dialogRef} tabIndex={-1} className="bg-white rounded-2xl max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] border border-line shadow-glass-lg overflow-hidden animate-slide-up flex flex-col">
        <div className="bg-ink text-white p-6 sm:p-7 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold bg-white/10 text-white">
                Prepared scenario
              </span>
              <h2 id="auth-modal-title" className="text-xl font-extrabold text-white mt-2">
                Prepared workspaces
              </h2>
              <p id="auth-modal-description" className="text-xs text-white/70 mt-1 max-w-xl">
                Choose a local view of one synthetic scenario. This does not sign you in or grant provider access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close prepared workspaces"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 min-h-0">
          {destinationCopy.map(({ id, label, title, description, testId, Icon, tone }) => (
            <button
              key={id}
              type="button"
              data-testid={testId}
              data-dialog-initial-focus={id === 'STAFF' ? 'true' : undefined}
              onClick={() => handleSelect(id)}
              className="p-4 sm:p-5 rounded-2xl border border-line bg-white/80 hover:bg-white hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-start justify-between gap-5 text-left shadow-glass min-h-44"
            >
              <span className="w-full flex items-start justify-between gap-3">
                <span className="w-11 h-11 rounded-xl bg-muted text-accent flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <span className={`chip ${tone}`}>{label}</span>
              </span>
              <span>
                <span className="block font-heading font-extrabold text-base text-ink">{title}</span>
                <span className="block text-xs text-muted-fg leading-relaxed mt-1">{description}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-heading font-bold text-accent">
                Open local view
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:px-7 bg-muted/60 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-mint" aria-hidden="true" />
            Synthetic prepared personas • local navigation only
          </span>
          <span className="text-muted-fg font-mono text-[11px]">
            Scenario {state.version}
          </span>
        </div>
      </div>
    </div>
  );
};
