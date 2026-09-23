import { useState } from 'react';
import { CheckCircle2, Clock3, ArrowDownRight } from 'lucide-react';
import { WorkflowState } from '../types';
import { isClinicalDispositionComplete, isCurrentTransportPlanComplete } from '../state/workflowState';

type ReceiptItem = { id: string; label: string; detail: string; eventId: string | null };

export function ClosingReceipt({ state }: { state: WorkflowState }) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const planVersion = state.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION')?.transportDetails?.planVersion ?? 1;
  const clinicalComplete = isClinicalDispositionComplete(state);
  const transportComplete = isCurrentTransportPlanComplete(state);
  const patientComplete = state.patientAcknowledgedPlanVersion === planVersion;
  const items: ReceiptItem[] = [
    {
      id: 'clinical', label: 'Clinical barrier addressed',
      detail: 'Human contact and a nonblocking disposition recorded by Sarah Jenkins, RN.',
      eventId: clinicalComplete ? 'EVT-FLOW-DISPOSITION-NONBLOCKING' : null,
    },
    {
      id: 'transport', label: 'Backup transportation arranged',
      detail: `Current outbound, return, contact and backup plan v${planVersion} recorded.`,
      eventId: transportComplete ? `EVT-RIDE-RECOVERED-V${planVersion}` : null,
    },
    {
      id: 'patient', label: 'Current plan acknowledged',
      detail: `Camila acknowledged transport plan v${planVersion}. Treatment attendance remains unknown.`,
      eventId: patientComplete ? `EVT-FLOW-PATIENT-ACK-V${planVersion}` : null,
    },
  ];
  const completeCount = items.filter((item) => item.eventId && state.auditEvents.some((event) => event.id === item.eventId)).length;

  return (
    <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="closing-receipt-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-caps text-muted-fg">Current scenario evidence</p>
          <h2 id="closing-receipt-title" className="font-display text-lg font-extrabold">Continuity plan receipt</h2>
          <p className="mt-1 text-sm text-muted-fg">Each completed item links to its event in the audit timeline. This is coordination status, not medical clearance or treatment attendance.</p>
        </div>
        <span className={`chip ${completeCount === items.length ? 'chip-mint' : 'chip-sun'}`}>{completeCount} of {items.length} recorded</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => {
          const event = item.eventId ? state.auditEvents.find((entry) => entry.id === item.eventId) : undefined;
          const complete = Boolean(event);
          const expanded = openItem === item.id && complete;
          return (
            <div key={item.id} className="metric-tile min-w-0 space-y-2">
              <div className="flex items-start gap-2">
                {complete ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" aria-hidden="true" /> : <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-sun" aria-hidden="true" />}
                <div><h3 className="font-heading text-sm font-bold">{item.label}</h3><p className="text-xs text-muted-fg">{complete ? item.detail : 'Pending current-scenario action'}</p></div>
              </div>
              {event && <>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`receipt-evidence-${item.id}`}
                  onClick={() => setOpenItem(expanded ? null : item.id)}
                  className="min-h-11 text-left text-sm font-semibold text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >{expanded ? 'Hide timeline evidence' : 'Open timeline evidence'}</button>
                {expanded && <div id={`receipt-evidence-${item.id}`} className="rounded-xl border border-line bg-white p-3 text-xs space-y-1">
                  <p className="font-mono text-muted-fg break-all">{event.id} · {event.timestamp}</p>
                  <p className="font-semibold">{event.action}</p>
                  <p>{event.description}</p>
                  <a href={`#timeline-${event.id}`} className="inline-flex min-h-11 items-center gap-1 font-semibold text-accent underline underline-offset-2">Jump to timeline <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
                </div>}
              </>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
