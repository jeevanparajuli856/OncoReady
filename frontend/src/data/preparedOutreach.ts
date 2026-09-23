import type { AuditEvent } from '../types';

export const PREPARED_REPLY = 'My ride was cancelled, and I’m not feeling well today.';

export const PREPARED_OUTREACH_THREADS = [
  {
    id: 'check-in-1',
    eventIds: ['EVT-HISTORY-SCHEDULED-01', 'EVT-HISTORY-SMS-01', 'EVT-HISTORY-REPLY-01', 'EVT-HISTORY-FOLLOWUP-01'],
    scheduledAt: 'Sep 23, 2026 • 10:05 AM CT',
    sentAt: 'Sep 23, 2026 • 10:06 AM CT',
    message: 'Is your transportation plan ready for your upcoming appointment?',
    replyAt: 'Sep 23, 2026 • 10:18 AM CT',
    reply: 'I think my ride is set. I’ll confirm tomorrow.',
    followUpAt: 'Sep 23, 2026 • 10:19 AM CT',
    followUp: 'Next prepared check-in scheduled for Sep 24 at 10:06 AM CT.',
  },
  {
    id: 'check-in-2',
    eventIds: ['EVT-HISTORY-SMS-02', 'EVT-FLOW-REPLY'],
    scheduledAt: 'Sep 23, 2026 • 10:19 AM CT',
    sentAt: 'Sep 24, 2026 • 10:06 AM CT',
    message: 'Please confirm your ride plan or let us know if you need help.',
    replyAt: 'Sep 24, 2026 • 10:12 AM CT',
    reply: PREPARED_REPLY,
    followUpAt: 'Sep 24, 2026 • 10:12 AM CT',
    followUp: 'Automated follow-up cancelled; separate nurse and transportation work opened.',
  },
] as const;

const first = PREPARED_OUTREACH_THREADS[0];
const second = PREPARED_OUTREACH_THREADS[1];

export const PREPARED_OUTREACH_EVENTS: AuditEvent[] = [
  { id: first.eventIds[0], timestamp: first.scheduledAt, actor: 'Prepared outreach history', actorRole: 'SYSTEM', action: 'Automatic check-in scheduled', description: 'Prepared SMS due Sep 23 at 10:06 AM CT. This is scenario history, not provider delivery evidence.' },
  { id: first.eventIds[1], timestamp: first.sentAt, actor: 'Prepared outreach history', actorRole: 'SYSTEM', action: 'Prepared SMS sent', description: `“${first.message}”` },
  { id: first.eventIds[2], timestamp: first.replyAt, actor: 'Camila Lopez', actorRole: 'PATIENT', action: 'Prepared reply received', description: `“${first.reply}”` },
  { id: first.eventIds[3], timestamp: first.followUpAt, actor: 'Prepared outreach history', actorRole: 'SYSTEM', action: 'Follow-up scheduled', description: first.followUp },
  { id: second.eventIds[0], timestamp: second.sentAt, actor: 'Prepared outreach history', actorRole: 'SYSTEM', action: 'Prepared follow-up SMS sent', description: `“${second.message}”` },
];
