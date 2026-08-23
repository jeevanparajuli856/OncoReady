import React, { useState } from 'react';
import {
  History,
  User,
  Stethoscope,
  Car,
  Cpu,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { AuditEvent, ActorRole } from '../types';

interface AuditTimelineProps {
  events: AuditEvent[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events }) => {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const filteredEvents = selectedRole === 'ALL'
    ? events
    : events.filter((e) => e.actorRole === selectedRole);

  const getActorBadge = (role: ActorRole) => {
    const tone =
      role === 'PATIENT' ? 'bg-accent text-white'
      : role === 'TRIAGE_NURSE' ? 'bg-sun text-ink'
      : role === 'NAVIGATOR' ? 'bg-mint text-ink'
      : 'bg-ink text-cream';
    const Icon =
      role === 'PATIENT' ? User
      : role === 'TRIAGE_NURSE' ? Stethoscope
      : role === 'NAVIGATOR' ? Car
      : Cpu;
    return (
      <div className={`w-8 h-8 rounded-full ${tone} flex items-center justify-center border-2 border-ink`}>
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>
    );
  };

  const filters = [
    ['ALL', `All Events (${events.length})`],
    ['PATIENT', 'Patient'],
    ['TRIAGE_NURSE', 'Nurse'],
    ['NAVIGATOR', 'Navigator'],
    ['SYSTEM', 'Engine'],
  ] as const;

  return (
    <div className="card-sticker p-5 sm:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-ink/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <History className="w-5 h-5 text-accent" strokeWidth={2.5} />
            <h2 className="font-display text-lg font-extrabold">Append-Only Causal Event Timeline</h2>
            <span className="chip">Immutable Audit Log</span>
          </div>
          <p className="text-sm text-muted-fg mt-1">
            Transparent event sequence demonstrating causal transitions from detection to closure.
          </p>
        </div>
        <div className="filter-bar">
          {filters.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSelectedRole(id)}
              className={`filter-pill ${selectedRole === id ? 'filter-pill-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-ink/20">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-4 animate-fade-in">
            <div className="absolute -left-6 bg-cream p-0.5 rounded-full z-10">
              {getActorBadge(evt.actorRole)}
            </div>
            <div className="flex-1 metric-tile space-y-1.5 ml-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading font-bold text-sm">{evt.action}</span>
                  <span className="chip font-mono">{evt.id}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-muted-fg">
                  <Clock className="w-3 h-3" strokeWidth={2.5} />
                  {evt.timestamp}
                </div>
              </div>
              <p className="text-sm text-muted-fg leading-relaxed">{evt.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/10 text-xs">
                <div>
                  Actor: <span className="font-heading font-bold">{evt.actor}</span>
                </div>
                {evt.stateDiff && (
                  <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-white px-2 py-0.5 rounded-full border-2 border-ink">
                    <span className="text-muted-fg">{evt.stateDiff.from}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span className="font-bold">{evt.stateDiff.to}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
