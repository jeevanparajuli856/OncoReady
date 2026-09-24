import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, MessageSquareText, Phone, PhoneCall, PhoneOff, Radio, Send, Sparkles } from 'lucide-react';
import type { WorkspaceRole } from '../types';
import { PREPARED_OUTREACH_THREADS, PREPARED_REPLY } from '../data/preparedOutreach';
import { parseMlInsights, savedMlInsightsArtifact, type MlCheckpointName } from '../data/mlInsights';

const apiOrigin = import.meta.env.VITE_API_ORIGIN ?? '';
const DEMO_CALL_URL = `${apiOrigin}/api/v1/outreach/demo-call`;

interface OutreachPanelProps {
  role: WorkspaceRole;
  patientName: string;
  /** Camila's latest reply has arrived and opened the split work. */
  replyReceived: boolean;
}

interface CallStatus {
  enabled: boolean;
  call: string;
  in_progress: boolean;
  calls_today: number;
  daily_limit: number;
}

type Decision = { tone: 'calm' | 'watch' | 'act'; text: string };

interface HistoryItem {
  id: string;
  channel: 'VOICE' | 'SMS';
  title: string;
  at: string;
  checkpoint?: MlCheckpointName;
  outbound?: string;
  outcome?: string;
  reply?: string;
  /** A navigator-safe summary instead of the patient's words. */
  replySummary?: string;
  decisions: Decision[];
}

const CALL_LABEL: Record<string, string> = {
  initiating: 'Dialing…',
  queued: 'Dialing…',
  initiated: 'Dialing…',
  ringing: 'Ringing…',
  in_progress: 'Connected',
  completed: 'Call completed',
  busy: 'Line busy',
  no_answer: 'No answer',
  failed: 'Call could not connect',
  canceled: 'Call canceled',
  unknown: 'Status unavailable',
};

const DECISION_STYLE: Record<Decision['tone'], string> = {
  calm: 'bg-mint/15 text-ink',
  watch: 'bg-sun/30 text-ink',
  act: 'bg-accent/10 text-ink',
};

const firstName = (name: string) => name.split(' ')[0];

/** Engine outreach history. Navigator sees transportation outcomes; clinical words stay with the care team. */
const buildHistory = (role: WorkspaceRole, patient: string, replyReceived: boolean): HistoryItem[] => {
  const [first, second] = PREPARED_OUTREACH_THREADS;
  const name = firstName(patient);
  const latest: HistoryItem = {
    id: 'sms-t1',
    channel: 'SMS',
    title: 'Automated follow-up text',
    at: second.sentAt,
    checkpoint: 'T-1',
    outbound: second.message,
    decisions: [{ tone: 'watch', text: 'Awaiting reply · voice follow-up if none by 12:00 PM CT' }],
  };
  if (replyReceived) {
    if (role === 'CARE_TEAM') latest.reply = PREPARED_REPLY;
    else latest.replySummary = 'Ride cancelled. Clinical details went to the care team.';
    latest.decisions = role === 'CARE_TEAM'
      ? [
        { tone: 'act', text: 'Symptom mention → routed to Sarah Jenkins, RN for human review' },
        { tone: 'act', text: 'Transportation barrier → routed to Marcus Vance, MSW' },
      ]
      : [
        { tone: 'act', text: 'Transportation barrier → ride recovery opened for you' },
        { tone: 'calm', text: 'Clinical content → routed to the care team' },
      ];
  }
  return [
    latest,
    {
      id: 'sms-t2',
      channel: 'SMS',
      title: 'Automated check-in text',
      at: first.sentAt,
      checkpoint: 'T-2',
      outbound: first.message,
      reply: first.reply,
      decisions: [{ tone: 'watch', text: 'Ride not yet confirmed → follow-up scheduled for Sep 24, 10:06 AM CT' }],
    },
    {
      id: 'voice-t7',
      channel: 'VOICE',
      title: 'Automated voice check-in',
      at: 'Sep 18, 2026 • 9:30 AM CT',
      checkpoint: 'T-7',
      outcome: `Answered · 1 min 12 s · ${name} confirmed the Sep 25 infusion; her daughter usually drives.`,
      decisions: [{ tone: 'calm', text: 'No barrier found → next check-in at T−2' }],
    },
  ];
};

export const OutreachPanel: React.FC<OutreachPanelProps> = ({ role, patientName, replyReceived }) => {
  const scores = useMemo(() => {
    const result = parseMlInsights(savedMlInsightsArtifact);
    return result.status === 'ready' ? Object.fromEntries(result.data.checkpoints.map((checkpoint) => [checkpoint.checkpoint, checkpoint.score])) : {};
  }, []);
  const history = useMemo(() => buildHistory(role, patientName, replyReceived), [role, patientName, replyReceived]);
  const isNavigator = role === 'CARE_NAVIGATOR';
  const name = firstName(patientName);

  const [callStatus, setCallStatus] = useState<CallStatus | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [callError, setCallError] = useState('');
  const [placedAt, setPlacedAt] = useState<string | null>(null);
  const [liveCalls, setLiveCalls] = useState<{ id: string; at: string; result: string }[]>([]);
  const trackingCall = useRef(false);

  const readStatus = useCallback(async () => {
    try {
      const response = await fetch(DEMO_CALL_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('unavailable');
      const next = (await response.json()) as CallStatus;
      setCallStatus(next);
      return next;
    } catch {
      setCallStatus((current) => current ?? { enabled: false, call: 'not_started', in_progress: false, calls_today: 0, daily_limit: 0 });
      return null;
    }
  }, []);

  useEffect(() => {
    if (isNavigator) void readStatus();
  }, [isNavigator, readStatus]);

  // Follow any live call until it reaches a final status, including one placed before a reload,
  // so the button re-enables on its own. Only calls placed here are logged in the history.
  useEffect(() => {
    if (!callStatus?.in_progress) return undefined;
    const timer = window.setInterval(() => { void readStatus(); }, 2000);
    return () => window.clearInterval(timer);
  }, [callStatus?.in_progress, readStatus]);

  useEffect(() => {
    if (!placedAt || !trackingCall.current || !callStatus || callStatus.in_progress) return;
    trackingCall.current = false;
    setLiveCalls((calls) => [{ id: `live-${calls.length + 1}`, at: placedAt, result: CALL_LABEL[callStatus.call] ?? 'Call ended' }, ...calls]);
  }, [callStatus, placedAt]);

  const placeCall = async () => {
    setConfirming(false);
    setPlacing(true);
    setCallError('');
    try {
      const response = await fetch(DEMO_CALL_URL, { method: 'POST', cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? 'The call could not be placed.');
      trackingCall.current = true;
      setPlacedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      setCallStatus(payload as CallStatus);
    } catch (caught) {
      setCallError(caught instanceof Error ? caught.message : 'The call could not be placed.');
    } finally {
      setPlacing(false);
    }
  };

  const callEnabled = Boolean(callStatus?.enabled) && !callStatus?.in_progress && !placing;
  const liveLabel = placedAt && callStatus ? CALL_LABEL[callStatus.call] ?? callStatus.call.replace(/_/g, ' ') : null;

  return (
    <div className="space-y-5">
      <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="outreach-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="icon-bubble w-10 h-10 bg-accent/15 text-accent"><Radio className="w-5 h-5" aria-hidden="true" /></span>
            <div>
              <span className="chip chip-accent mb-2">Automated outreach</span>
              <h2 id="outreach-title" className="font-heading font-extrabold text-lg">Outreach with {name}</h2>
              <p className="text-sm text-muted-fg mt-1 max-w-2xl">ReadySignal decides when to check in. The outreach engine calls or texts, reads the reply and routes each decision to the right owner.</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm" aria-label="Outreach channels">
            <div className="metric-tile !py-2"><dt className="label-caps text-muted-fg">Voice</dt><dd className="font-heading font-bold flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-mint" aria-hidden="true" />Active</dd></div>
            <div className="metric-tile !py-2"><dt className="label-caps text-muted-fg">Text</dt><dd className="font-heading font-bold flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-mint" aria-hidden="true" />Active</dd></div>
          </dl>
        </div>

        {isNavigator && (
          <div className="rounded-2xl border border-line bg-white p-4 space-y-3" aria-labelledby="manual-outreach-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 id="manual-outreach-title" className="font-heading font-bold">Reach {name} now</h3>
                <p className="text-xs text-muted-fg">Calls use the same check-in agent as automated outreach.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-candy btn-compact" disabled={!callEnabled} onClick={() => setConfirming(true)}>
                  <PhoneCall className="w-4 h-4" aria-hidden="true" />{placing ? 'Placing call…' : `Call ${name}`}
                </button>
                <button type="button" className="btn-ghost btn-compact" disabled aria-describedby="manual-text-note">
                  <Send className="w-4 h-4" aria-hidden="true" />Send text
                </button>
              </div>
            </div>
            <p id="manual-text-note" className="text-[11px] text-muted-fg">Texts go out automatically on the check-in schedule.</p>

            {confirming && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 flex flex-wrap items-center justify-between gap-3" role="dialog" aria-label={`Confirm call to ${name}`}>
                <p className="text-sm font-semibold">Place a check-in call to {patientName}?</p>
                <div className="flex gap-2">
                  <button type="button" className="btn-candy btn-compact" onClick={() => void placeCall()}><Phone className="w-4 h-4" aria-hidden="true" />Call now</button>
                  <button type="button" className="btn-ghost btn-compact" onClick={() => setConfirming(false)}>Cancel</button>
                </div>
              </div>
            )}

            {liveLabel && (
              <div className={`rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm font-semibold ${callStatus?.in_progress ? 'bg-accent/10' : 'bg-mint/15'}`} role="status" aria-live="polite">
                {callStatus?.in_progress
                  ? <span className="relative flex w-2.5 h-2.5" aria-hidden="true"><span className="absolute inline-flex w-full h-full rounded-full bg-accent opacity-60 animate-ping" /><span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-accent" /></span>
                  : <CheckCircle2 className="w-4 h-4 text-mint" aria-hidden="true" />}
                {liveLabel} · {patientName}
              </div>
            )}
            {callError && <p role="alert" className="text-sm text-red-700 flex items-center gap-2"><PhoneOff className="w-4 h-4" aria-hidden="true" />{callError}</p>}
            {callStatus && !callStatus.enabled && !callStatus.in_progress && !liveLabel && <p className="text-xs text-muted-fg">Calling is paused for this workspace.</p>}
          </div>
        )}
      </section>

      <section className="card-sticker p-5 sm:p-6" aria-labelledby="outreach-history-title">
        <h2 id="outreach-history-title" className="font-heading font-bold mb-4">Outreach history</h2>
        <ol className="relative space-y-4 before:absolute before:left-[1.2rem] before:top-2 before:bottom-2 before:w-px before:bg-line">
          {liveCalls.map((call) => (
            <li key={call.id} className="relative pl-12">
              <span className="absolute left-0 top-0 icon-bubble w-10 h-10 bg-accent text-white"><PhoneCall className="w-4 h-4" aria-hidden="true" /></span>
              <div className="metric-tile space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading font-bold">Voice check-in · placed by Marcus Vance, MSW</h3><span className="text-xs text-muted-fg">Today • {call.at}</span></div>
                <p className="text-sm">{call.result}</p>
              </div>
            </li>
          ))}
          {history.map((item) => (
            <li key={item.id} className="relative pl-12">
              <span className={`absolute left-0 top-0 icon-bubble w-10 h-10 ${item.channel === 'VOICE' ? 'bg-accent/15 text-accent' : 'bg-mint/20 text-ink'}`}>
                {item.channel === 'VOICE' ? <Phone className="w-4 h-4" aria-hidden="true" /> : <MessageSquareText className="w-4 h-4" aria-hidden="true" />}
              </span>
              <div className="metric-tile space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-heading font-bold">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    {item.checkpoint && scores[item.checkpoint] !== undefined && (
                      <span className="chip"><Sparkles className="w-3 h-3 text-accent" aria-hidden="true" />ReadySignal {item.checkpoint.replace('-', '−')} · {scores[item.checkpoint]}</span>
                    )}
                    <span className="text-xs text-muted-fg">{item.at}</span>
                  </div>
                </div>
                {item.outbound && <p className="text-sm"><span className="label-caps text-muted-fg mr-2">Sent</span>“{item.outbound}”</p>}
                {item.outcome && <p className="text-sm">{item.outcome}</p>}
                {item.reply && <p className="text-sm"><span className="label-caps text-muted-fg mr-2">{name} replied</span>“{item.reply}”</p>}
                {item.replySummary && <p className="text-sm"><span className="label-caps text-muted-fg mr-2">Reply summary</span>{item.replySummary}</p>}
                <ul className="flex flex-wrap gap-2" aria-label="Decisions">
                  {item.decisions.map((decision) => (
                    <li key={decision.text} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${DECISION_STYLE[decision.tone]}`}>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />{decision.text}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
