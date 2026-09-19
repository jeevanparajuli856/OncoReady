import React from 'react';
import {
  ShieldCheck,
  Activity,
  ArrowRight,
  Network,
  Clock,
  Stethoscope,
  Sparkles,
  Calendar,
  Building2,
} from 'lucide-react';
import { WorkflowState, Perspective } from '../types';

interface PortalAuthScreenProps {
  state: WorkflowState;
  onSelectPerspective: (p: Perspective) => void;
  onReset: () => void;
}

export const PortalAuthScreen: React.FC<PortalAuthScreenProps> = ({
  state,
  onSelectPerspective,
  onReset,
}) => {
  const pendingBlockers = state.tasks.filter((t) => t.status !== 'RESOLVED').length;

  const cards: Array<{
    key: Perspective;
    testId?: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    body: string;
    foot: string;
    cta: string;
    status: React.ReactNode;
    media: React.ReactNode;
  }> = [
    {
      key: 'PATIENT',
      eyebrow: 'Patient Portal',
      title: state.patient.name,
      subtitle: `MRN: ${state.patient.mrn} • Age ${state.patient.age}`,
      body: 'Complete the 2-minute pre-infusion barrier screening, report symptoms to Nurse Sarah, and review your confirmed transit & lab schedule.',
      foot: 'Patient Treatment Readiness',
      cta: 'Enter Patient View',
      status: (
        <span className={`chip ${
          state.overallReadiness === 'PLAN_CONFIRMED' ? 'chip-mint' : state.readinessCheckCompleted ? 'chip-sun' : 'chip-accent'
        }`}>
          <Clock className="w-3 h-3" strokeWidth={2.5} />
          {state.overallReadiness === 'PLAN_CONFIRMED'
            ? 'Plan Confirmed'
            : state.readinessCheckCompleted
            ? 'Triage Active'
            : 'Screening Pending'}
        </span>
      ),
      media: (
        <img
          src={state.patient.avatarUrl}
          alt={state.patient.name}
          className="w-14 h-14 rounded-xl object-cover border-2 border-ink"
        />
      ),
    },
    {
      key: 'STAFF',
      eyebrow: 'Clinical Care Team',
      title: 'Oncology Triage & Hub',
      subtitle: 'Sarah Jenkins, RN & Marcus Vance, MSW',
      body: 'Exception operations with two owned actions: human clinical review and transportation coordination.',
      foot: 'EHR Clinical Workspace',
      cta: 'Open Staff Workspace',
      status: (
        <span className="chip">
          <Stethoscope className="w-3 h-3" strokeWidth={2.5} />
          {pendingBlockers > 0 ? `${pendingBlockers} Blockers Active` : 'Queue Cleared'}
        </span>
      ),
      media: (
        <div className="flex -space-x-2">
          <div className="w-12 h-12 rounded-xl bg-accent border-2 border-ink" />
          <div className="w-12 h-12 rounded-xl bg-mint border-2 border-ink" />
        </div>
      ),
    },
    {
      key: 'CAREGIVER',
      eyebrow: 'Authorized Caregiver',
      title: state.caregiver.name,
      subtitle: state.caregiver.relationship,
      body: "Caregiver view with strict data-minimization: Ana can track vehicle arrival and appointment times, while Maria's clinical symptom text is completely excluded.",
      foot: 'Family & Transit Logistics',
      cta: 'Enter Caregiver View',
      status: (
        <span className="chip chip-mint">
          <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
          Privacy Guard Active
        </span>
      ),
      media: (
        <img
          src={state.caregiver.avatarUrl}
          alt={state.caregiver.name}
          className="w-14 h-14 rounded-xl object-cover border-2 border-ink"
        />
      ),
    },
    {
      key: 'SYSTEM',
      eyebrow: 'Continuity Engine',
      title: 'Readiness Graph & Audit',
      subtitle: 'Deterministic Directed Graph',
      body: 'Explore the dependency graph connecting patient reports and transportation to plan confirmation alongside the causal audit log.',
      foot: 'System Telemetry & Architecture',
      cta: 'Inspect Readiness Graph',
      status: (
        <span className="chip chip-accent">
          <Activity className="w-3 h-3" strokeWidth={2.5} />
          Current Graph
        </span>
      ),
      media: (
        <span className="icon-bubble w-14 h-14 bg-ink text-sun">
          <Network className="w-6 h-6" strokeWidth={2.5} />
        </span>
      ),
    },
  ];

  return (
    <div className="page-shell min-h-[80vh] flex flex-col justify-between py-4 sm:py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-white/80 text-xs font-heading font-semibold shadow-glass">
          <Building2 className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
          Benson Cancer Center • Clinical Continuity System
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          OncoReady Gateway
        </h1>
        <p className="text-sm sm:text-base text-muted-fg leading-relaxed max-w-2xl mx-auto">
          Select a workspace to coordinate pre-infusion barriers, owned clinical review, navigation tasks, and patient plan confirmation.
        </p>
        <div className="inline-flex flex-wrap items-center justify-center gap-2 p-2 px-3 rounded-xl bg-white/70 border border-white/80 text-xs font-heading font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-accent" strokeWidth={2.5} />
            Target Patient: Maria Hernandez (54F)
          </span>
          <span className="hidden sm:inline text-muted-fg">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
            mFOLFOX6 Cycle 4 • Tomorrow 8:30 AM
          </span>
          <span className="hidden sm:inline text-muted-fg">•</span>
          <span className="inline-flex items-center gap-1.5 font-mono uppercase">
            <span className={`w-2 h-2 rounded-full ${
              state.overallReadiness === 'PLAN_CONFIRMED'
                ? 'bg-mint'
                : state.overallReadiness === 'AT_RISK'
                ? 'bg-sun'
                : 'bg-accent'
            }`} />
            {state.overallReadiness.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            type="button"
            key={card.key}
            onClick={() => onSelectPerspective(card.key)}
            className="card-sticker p-5 sm:p-6 flex flex-col justify-between gap-5 cursor-pointer text-left hover:-translate-y-0.5 hover:shadow-glass-hover transition-all duration-200"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  {card.media}
                  <div className="min-w-0">
                    <span className="chip chip-accent">{card.eyebrow}</span>
                    <h2 className="font-heading font-extrabold text-lg mt-1.5 break-words">{card.title}</h2>
                    <p className="text-xs text-muted-fg break-words">{card.subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-wrap">{card.status}</div>
              </div>
              <p className="text-sm text-muted-fg leading-relaxed">{card.body}</p>
            </div>
            <div className="pt-4 border-t-2 border-ink/10 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-fg">{card.foot}</span>
              <span className="inline-flex items-center gap-1 text-sm font-heading font-bold text-accent">
                {card.cta}
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-fg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" strokeWidth={2.5} />
          Benson Cancer Center • Role-based product workspace
        </div>
        <button onClick={onReset} className="btn-ghost btn-compact">
          Reset Application to Initial State
        </button>
      </div>
    </div>
  );
};
