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
import { PREPARED_OUTREACH_THREADS } from '../data/preparedOutreach';

interface AuditTimelineProps {
  events: AuditEvent[];
  showFinalReply?: boolean;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events, showFinalReply = false }) => {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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
            <h2 className="font-display text-lg font-extrabold">Prepared Scenario Timeline</h2>
            <span className="chip">Stable event IDs</span>
          </div>
          <p className="text-sm text-muted-fg mt-1">
            Fixed CT scenario times show the transition from the prepared reply to continuity-plan closure. They are separate from actual delivery time.
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
        {filteredEvents.map((evt) => {
          const thread = PREPARED_OUTREACH_THREADS.find((item) => (item.eventIds as readonly string[]).includes(evt.id));
          const expanded = Boolean(thread && selectedEventId === evt.id);
          return (
          <div key={evt.id} id={`timeline-${evt.id}`} className="relative flex items-start gap-4 animate-fade-in scroll-mt-24">
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
              {thread && <>
                <button
                  type="button"
                  className="mt-1 rounded-lg text-sm font-semibold text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  aria-expanded={expanded}
                  aria-controls={`prepared-thread-${evt.id}`}
                  onClick={() => setSelectedEventId(expanded ? null : evt.id)}
                >{expanded ? 'Close prepared message thread' : 'Open prepared message thread'}</button>
                {expanded && <div id={`prepared-thread-${evt.id}`} className="mt-3 rounded-xl border border-line bg-white p-4 text-sm space-y-3">
                  <p className="label-caps text-muted-fg">Prepared scenario history · no provider request</p>
                  <dl className="space-y-2">
                    <div><dt className="font-semibold">Scheduled</dt><dd>{thread.scheduledAt}</dd></div>
                    <div><dt className="font-semibold">Sent · {thread.sentAt}</dt><dd>“{thread.message}”</dd></div>
                    {(thread.id === 'check-in-1' || showFinalReply) && <>
                      <div><dt className="font-semibold">Reply · {thread.replyAt}</dt><dd>“{thread.reply}”</dd></div>
                      <div><dt className="font-semibold">Follow-up · {thread.followUpAt}</dt><dd>{thread.followUp}</dd></div>
                    </>}
                  </dl>
                  {thread.id === 'check-in-2' && !showFinalReply && <p className="text-muted-fg">The later reply and follow-up appear after the prepared reply is submitted.</p>}
                </div>}
              </>}
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
        )})}
      </div>
    </div>
  );
};
