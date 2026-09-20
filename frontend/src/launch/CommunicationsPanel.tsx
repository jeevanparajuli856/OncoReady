import React from 'react';
import {
  Check,
  Clock3,
  LockKeyhole,
  MessageSquareText,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import type { StaffCommunication } from '../api/client';

type Channel = StaffCommunication['channel'];
type CommunicationStatus = StaffCommunication['status'];

const formatDateTime = (value?: string | null) => {
  if (!value) return 'No definitive provider time yet';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
};

const humanize = (value: string) => value
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const channelDetails: Record<Channel, {
  title: string;
  provider: string;
  purpose: string;
  stages: CommunicationStatus[];
  Icon: typeof MessageSquareText;
}> = {
  sms: {
    title: 'SMS readiness messages',
    provider: 'Twilio SMS',
    purpose: 'Short readiness and plan-update messages to the fixed, consented recipient.',
    stages: ['queued', 'sent', 'delivered'],
    Icon: MessageSquareText,
  },
  voice: {
    title: 'Voice readiness calls',
    provider: 'ElevenLabs voice through Twilio',
    purpose: 'A bounded readiness conversation that returns structured outcomes without storing audio or transcripts.',
    stages: ['queued', 'answered', 'completed'],
    Icon: PhoneCall,
  },
};

const failureStatuses: CommunicationStatus[] = [
  'undelivered',
  'no_answer',
  'failed',
  'opted_out',
  'outcome_unknown',
];

const statusDescription = (attempt: StaffCommunication) => {
  const liveEvidence = attempt.provenance === 'provider_callback';
  const evidence = liveEvidence
    ? 'Verified provider callback'
    : 'Deterministic rehearsal state — not live provider proof';

  const descriptions: Record<CommunicationStatus, string> = {
    queued: 'Durable intent exists, but the provider has not confirmed delivery or completion.',
    sent: 'A sent state is recorded. This is not the same as delivery.',
    delivered: 'A delivery state is recorded for the SMS attempt.',
    undelivered: 'The SMS was not delivered. The continuity dependency remains open.',
    answered: 'An answered state is recorded. The call is not complete until its governed outcome is received.',
    no_answer: 'The call was not answered. A human recovery path remains required.',
    failed: 'The provider attempt failed. No success is inferred.',
    opted_out: 'The recipient opted out. Automated messaging must remain stopped.',
    completed: 'A completed structured call outcome is recorded.',
    outcome_unknown: 'The network result is uncertain. Blind resend is disabled.',
  };

  return `${descriptions[attempt.status]} ${evidence}.`;
};

const ChannelLifecycle: React.FC<{ channel: Channel; status?: CommunicationStatus }> = ({ channel, status }) => {
  const stages = channelDetails[channel].stages;
  const activeIndex = status ? stages.indexOf(status) : -1;
  return (
    <ol className="launch-communication-lifecycle" aria-label={`${channelDetails[channel].title} lifecycle`}>
      {stages.map((stage, index) => {
        const complete = activeIndex >= index;
        const current = activeIndex === index;
        return (
          <li key={stage} className={complete ? 'is-complete' : current ? 'is-current' : ''}>
            <span aria-hidden="true">{complete ? <Check /> : index + 1}</span>
            <small>{humanize(stage)}</small>
          </li>
        );
      })}
    </ol>
  );
};

const AttemptEvidence: React.FC<{ attempt: StaffCommunication; refresh: () => void }> = ({ attempt, refresh }) => {
  const uncertain = attempt.status === 'outcome_unknown'
    || attempt.reconciliation.state === 'outcome_unknown'
    || attempt.reconciliation.state === 'reconciliation_required'
    || attempt.reconciliation.state === 'manual_recovery_required';
  const failed = failureStatuses.includes(attempt.status);
  const reconciled = attempt.reconciliation.state === 'reconciled';
  const canRefresh = ['await_callback', 'refresh_status', 'reconcile_provider'].includes(attempt.reconciliation.permitted_recovery);

  return (
    <article className={`launch-communication-attempt ${uncertain ? 'is-uncertain' : ''} ${failed ? 'is-failed' : ''}`}>
      <div className="launch-communication-attempt__heading">
        <div>
          <p className="launch-kicker">{humanize(attempt.purpose)} attempt</p>
          <h4>{humanize(attempt.status)}</h4>
        </div>
        <span className={`launch-chip ${reconciled ? 'launch-chip--success' : failed ? 'launch-chip--danger' : attempt.status === 'queued' ? 'launch-chip--warning' : 'launch-chip--active'}`}>
          {reconciled ? 'Reconciled' : humanize(attempt.reconciliation.state)}
        </span>
      </div>
      <p>{statusDescription(attempt)}</p>
      <dl className="launch-provider-facts">
        <div><dt>Recorded</dt><dd>{formatDateTime(attempt.occurred_at)}</dd></div>
        <div><dt>Attempt reference</dt><dd>{attempt.reconciliation.attempt_reference ?? 'Not available'}</dd></div>
        <div><dt>Permitted recovery</dt><dd>{humanize(attempt.reconciliation.permitted_recovery)}</dd></div>
      </dl>
      {uncertain && (
        <div className="launch-provider__recovery" role="alert">
          <TriangleAlert aria-hidden="true" />
          <p>Outcome not confirmed. The original action will not be resent automatically.</p>
          {canRefresh ? (
            <button className="launch-button launch-button--small" onClick={refresh}><RefreshCw /> Refresh current state</button>
          ) : (
            <span>Follow the named manual recovery path.</span>
          )}
        </div>
      )}
    </article>
  );
};

const ChannelCard: React.FC<{
  channel: Channel;
  attempts: StaffCommunication[];
  refresh: () => void;
}> = ({ channel, attempts, refresh }) => {
  const details = channelDetails[channel];
  const latest = attempts.at(-1);
  const Icon = details.Icon;

  return (
    <article className="launch-communication-channel">
      <div className="launch-communication-channel__heading">
        <span className="launch-icon"><Icon aria-hidden="true" /></span>
        <div>
          <p className="launch-kicker">{details.provider}</p>
          <h3>{details.title}</h3>
          <p>{details.purpose}</p>
        </div>
        <span className={`launch-chip ${latest ? 'launch-chip--active' : 'launch-chip--neutral'}`}>
          {latest ? humanize(latest.status) : 'No attempt'}
        </span>
      </div>
      <ChannelLifecycle channel={channel} status={latest?.status} />
      {attempts.length ? (
        <div className="launch-communication-attempts">
          {attempts.map((attempt) => <AttemptEvidence key={attempt.communication_id} attempt={attempt} refresh={refresh} />)}
        </div>
      ) : (
        <div className="launch-channel-held">
          <LockKeyhole aria-hidden="true" />
          <div>
            <strong>Live provider action held</strong>
            <p>No durable {channel.toUpperCase()} attempt has been recorded. This view will not show queued, delivered, answered, or completed until those states exist in the API projection.</p>
          </div>
          <button type="button" disabled aria-disabled="true">No live send</button>
        </div>
      )}
    </article>
  );
};

export const CommunicationsPanel: React.FC<{
  communications: StaffCommunication[];
  refresh: () => void;
}> = ({ communications, refresh }) => (
  <section aria-labelledby="communications-title" className="launch-communications">
    <div className="launch-section-heading">
      <div>
        <p className="launch-section-label">Provider truth</p>
        <h2 id="communications-title">SMS and voice continuity</h2>
      </div>
      <span className="launch-chip launch-chip--warning"><Clock3 /> Activation staged</span>
    </div>
    <div className="launch-activation-boundary">
      <ShieldCheck aria-hidden="true" />
      <div>
        <strong>Rehearsal-safe provider boundary</strong>
        <p>Provider initiation controls are intentionally unavailable in this public workspace. Operators may activate providers only after Railway deployment, allowlists, callback verification, and a controlled live test are complete. API evidence—not button state—determines every status shown below. A disabled or provider-unavailable dependency stays unresolved; it never becomes queued, delivered, answered, or completed.</p>
      </div>
    </div>
    <div className="launch-communication-grid">
      {(['sms', 'voice'] as const).map((channel) => (
        <ChannelCard
          key={channel}
          channel={channel}
          attempts={communications.filter((attempt) => attempt.channel === channel)}
          refresh={refresh}
        />
      ))}
    </div>
  </section>
);
