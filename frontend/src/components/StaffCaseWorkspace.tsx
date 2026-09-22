import React, { KeyboardEvent, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Car, CheckCircle2, CloudDownload, FlaskConical, HeartPulse, Network, Pill, Sparkles, Stethoscope } from 'lucide-react';
import { WorkflowState, WorkspaceRole } from '../types';
import { isClinicalDispositionComplete, isContinuityPlanConfirmed, isCurrentTransportPlanComplete } from '../state/workflowState';
import { TreatmentReadinessGraph } from './TreatmentReadinessGraph';
import { AuditTimeline } from './AuditTimeline';
import { EpicClinicalContextPanel } from './EpicClinicalContext';
import { ReadinessInsights } from './ReadinessInsights';

interface Props {
  state: WorkflowState;
  workspaceRole: WorkspaceRole;
  onBackToQueue: () => void;
  onAcknowledgeClinical: () => void;
  onRecordClinicalDisposition: (disposition: string, followUpBlocking: boolean) => void;
  onConfirmTransportation: (details: { vehicleId?: string; driverName?: string; pickupTime?: string; returnArrangement?: string; logisticsContact?: string; backupPlan?: string }) => void;
  onFailTransportation: () => void;
  onLoadCheckpoint: (checkpoint: WorkflowState['currentCheckpoint']) => void;
  onSwitchPerspective: (p: 'PATIENT' | 'CAREGIVER') => void;
}

const TaskMeta = ({ owner, next, due, waiting }: { owner: string; next: string; due: string; waiting: string }) => (
  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
    {[["Owner", owner], ["Next action", next], ["Scenario target", due], ["Waiting on", waiting]].map(([label, value]) => (
      <div key={label} className="metric-tile"><dt className="label-caps text-muted-fg">{label}</dt><dd className="font-heading font-semibold mt-1">{value}</dd></div>
    ))}
  </dl>
);

export const StaffCaseWorkspace: React.FC<Props> = ({ state, workspaceRole, onBackToQueue, onAcknowledgeClinical, onRecordClinicalDisposition, onConfirmTransportation, onFailTransportation, onLoadCheckpoint, onSwitchPerspective }) => {
  type CaseTab = 'ACTIONS' | 'REGIMEN' | 'LABS' | 'EPIC' | 'INSIGHTS' | 'GRAPH';
  const tabOrder: CaseTab[] = workspaceRole === 'CARE_NAVIGATOR'
    ? ['ACTIONS', 'GRAPH']
    : ['ACTIONS', 'REGIMEN', 'LABS', 'EPIC', 'INSIGHTS', 'GRAPH'];
  const [activeTab, setActiveTab] = useState<CaseTab>('ACTIONS');
  const tabRefs = useRef<Partial<Record<CaseTab, HTMLButtonElement | null>>>({});
  const [disposition, setDisposition] = useState('Human contact completed; no blocking follow-up recorded.');
  const [followUpBlocking, setFollowUpBlocking] = useState(false);
  const clinical = state.tasks.find((task) => task.type === 'CLINICAL_REVIEW');
  const transport = state.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION');
  const clinicalDone = isClinicalDispositionComplete(state);
  const transportDone = isCurrentTransportPlanComplete(state);
  const confirmed = isContinuityPlanConfirmed(state);
  const ownershipAccepted = Boolean(clinical?.clinicalDetails?.ownershipAcknowledgedAt);
  const planVersion = transport?.transportDetails?.planVersion ?? 1;
  const visibleTaskCount = workspaceRole === 'CARE_NAVIGATOR' ? (transport ? 1 : 0) : (clinical ? 1 : 0);
  const visibleAuditEvents = workspaceRole === 'CARE_NAVIGATOR'
    ? state.auditEvents.filter((event) => event.actorRole !== 'TRIAGE_NURSE' && !event.id.includes('FLOW-REPLY') && !event.action.toLowerCase().includes('clinical'))
    : state.auditEvents;
  const selectTab = (tab: CaseTab) => setActiveTab(tab);
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tab: CaseTab) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectTab(tab);
      return;
    }
    const index = tabOrder.indexOf(tab);
    let nextIndex: number | undefined;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabOrder.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabOrder.length) % tabOrder.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabOrder.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    tabRefs.current[tabOrder[nextIndex]]?.focus();
  };
  const tabProps = (tab: CaseTab) => ({
    id: `case-tab-${tab.toLowerCase()}`,
    role: 'tab' as const,
    'aria-selected': activeTab === tab,
    'aria-controls': `case-panel-${tab.toLowerCase()}`,
    tabIndex: activeTab === tab ? 0 : -1,
    ref: (element: HTMLButtonElement | null) => { tabRefs.current[tab] = element; },
    onClick: () => selectTab(tab),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => handleTabKeyDown(event, tab),
  });

  return <div className="page-shell space-y-5 pb-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button onClick={onBackToQueue} className="inline-flex items-center gap-1.5 text-sm font-heading font-bold hover:text-accent"><ArrowLeft className="w-4 h-4" />Back to Exception Queue</button>
      <div className="flex flex-wrap gap-2 items-center">
        {workspaceRole === 'CARE_TEAM' && <>
          <label className="label-caps" htmlFor="flow-checkpoint">Private checkpoint</label>
          <select id="flow-checkpoint" value={state.currentCheckpoint} onChange={(event) => onLoadCheckpoint(event.target.value as WorkflowState['currentCheckpoint'])} className="input-pop !py-2 text-sm">
            <option value="START">Start</option><option value="CONTEXT_INSIGHTS">Context / insights</option><option value="SPLIT_WORK">Split work</option><option value="FAILED_RIDE">Failed ride</option><option value="RECOVERED_PLAN">Recovered plan</option><option value="FINAL_CONFIRMATION">Final confirmation</option>
          </select>
        </>}
        <span className={`chip ${confirmed ? 'chip-mint' : 'chip-sun'}`}>{confirmed ? 'Continuity plan confirmed' : 'Treatment at risk'}</span>
      </div>
    </div>

    <section className="card-sticker p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="label-caps text-muted-fg">Camila scenario • attendance unknown</p><h1 className="font-display text-xl font-extrabold">{state.patient.name}</h1><p className="text-sm text-muted-fg">{state.appointment.scheduledTime} • Current transport plan v{planVersion}</p></div>
        <div className="filter-bar" role="tablist" aria-label="Case information">
          <button {...tabProps('ACTIONS')} className={`filter-pill ${activeTab === 'ACTIONS' ? 'filter-pill-active' : ''}`}>Actions ({visibleTaskCount})</button>
          {workspaceRole === 'CARE_TEAM' && <>
            <button {...tabProps('REGIMEN')} className={`filter-pill ${activeTab === 'REGIMEN' ? 'filter-pill-active' : ''}`}><Pill className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />Regimen</button>
            <button {...tabProps('LABS')} className={`filter-pill ${activeTab === 'LABS' ? 'filter-pill-active' : ''}`}><FlaskConical className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />Labs ({state.labs.length})</button>
            <button {...tabProps('EPIC')} className={`filter-pill ${activeTab === 'EPIC' ? 'filter-pill-active' : ''}`}><CloudDownload className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />Epic</button>
            <button {...tabProps('INSIGHTS')} className={`filter-pill ${activeTab === 'INSIGHTS' ? 'filter-pill-active' : ''}`}><Sparkles className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />Insights</button>
          </>}
          <button {...tabProps('GRAPH')} className={`filter-pill ${activeTab === 'GRAPH' ? 'filter-pill-active' : ''}`}><Network className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />Graph</button>
        </div>
      </div>
      {state.readinessCheckCompleted && <blockquote className="metric-tile text-sm italic">“{state.readinessSubmission.clinicalConcernText}”<footer className="not-italic label-caps text-muted-fg mt-2">Exact prepared reply • Sep 24, 10:12 AM CT</footer></blockquote>}
    </section>

    <div role="tabpanel" id={`case-panel-${activeTab.toLowerCase()}`} aria-labelledby={`case-tab-${activeTab.toLowerCase()}`}>
    {activeTab === 'EPIC' ? <EpicClinicalContextPanel /> : activeTab === 'INSIGHTS' ? <ReadinessInsights /> : activeTab === 'GRAPH' ? <div className="space-y-5"><TreatmentReadinessGraph appointment={state.appointment} tasks={state.tasks} overallReadiness={state.overallReadiness} patientAcknowledged={state.patientAcknowledgedPlanVersion === planVersion} readinessCheckCompleted={state.readinessCheckCompleted} onNavigateToPatient={() => onSwitchPerspective('PATIENT')} /><AuditTimeline events={visibleAuditEvents} /></div> : activeTab === 'REGIMEN' ? (
      <section className="card-sticker p-5 sm:p-6 space-y-4"><div className="pb-4 border-b-2 border-ink/10"><p className="label-caps text-muted-fg mb-1">OncoReady scenario</p><h2 className="font-heading font-extrabold text-lg">mFOLFOX6 + Bevacizumab Protocol Order Set</h2><p className="text-sm text-muted-fg">Cycle 4 of 12 • Standard colorectal regimen</p></div><div className="space-y-3">{state.appointment.drugs.map((drug) => <div key={drug.name} className="metric-tile space-y-1"><div className="flex flex-wrap justify-between gap-1"><span className="font-heading font-bold">{drug.name}</span><span className="chip chip-accent font-mono">{drug.dosage}</span></div><p className="text-sm text-muted-fg"><strong className="text-ink">Administration:</strong> {drug.route} ({drug.schedule})</p><p className="text-xs text-muted-fg">Pharmacology: {drug.indication}</p></div>)}</div><div className="metric-tile"><h3 className="font-heading font-bold">Pre-medication protocol</h3><ul className="list-disc list-inside text-sm text-muted-fg mt-2 space-y-1">{state.appointment.premeds.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
    ) : activeTab === 'LABS' ? (
      <div className="space-y-5"><section className="card-sticker p-5 sm:p-6 space-y-4"><div><p className="label-caps text-muted-fg mb-1">OncoReady scenario</p><h2 className="font-heading font-bold flex items-center gap-2"><FlaskConical className="w-4 h-4 text-accent" />Pre-infusion diagnostic labs</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b-2 border-ink/10">{['Test name','Result','Reference range','Status','Collection'].map((h) => <th key={h} className="py-2.5 label-caps text-muted-fg">{h}</th>)}</tr></thead><tbody className="divide-y divide-ink/10">{state.labs.map((lab) => <tr key={lab.name}><td className="py-3 font-heading font-bold">{lab.name}</td><td className="py-3 font-mono">{lab.value} {lab.unit}</td><td className="py-3 text-muted-fg font-mono text-xs">{lab.referenceRange}</td><td className="py-3"><span className={`chip ${lab.status === 'NORMAL' ? 'chip-mint' : 'chip-sun'}`}>{lab.status}</span></td><td className="py-3 text-xs text-muted-fg">{lab.collectedAt}</td></tr>)}</tbody></table></div></section><section className="card-sticker p-5 sm:p-6 space-y-4"><p className="label-caps text-muted-fg">OncoReady scenario</p><h2 className="font-heading font-bold flex items-center gap-2"><HeartPulse className="w-4 h-4 text-pop" />Vital signs &amp; clinical monitoring</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{state.vitals.map((vital) => <div key={vital.name} className="metric-tile"><div className="label-caps text-muted-fg">{vital.name}</div><div className="font-display text-xl font-extrabold mt-1">{vital.value}</div><div className="text-[11px] text-muted-fg">{vital.collectedAt}</div></div>)}</div></section></div>
    ) :
      !clinical || !transport ? <section className="card-sticker p-6 text-center space-y-3"><AlertTriangle className="w-6 h-6 mx-auto text-accent" /><h2 className="font-heading font-bold">Prepared reply has not opened work yet</h2><p className="text-sm text-muted-fg">Submit Camila’s prepared reply or load the Split work checkpoint.</p></section> :
      <div className="space-y-3"><p className="label-caps text-muted-fg">{workspaceRole === 'CARE_NAVIGATOR' ? 'CareLink coordination workflow' : 'Clinical readiness workflow'}</p><div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {workspaceRole === 'CARE_TEAM' && <section className={`card-sticker p-5 space-y-4 ${clinicalDone ? 'bg-mint/10' : ''}`}>
          <div className="flex items-start justify-between gap-3"><div className="flex gap-2"><span className="icon-bubble w-10 h-10 bg-accent text-white"><Stethoscope className="w-4 h-4" /></span><div><h2 className="font-heading font-bold">Clinical contact</h2><p className="text-xs text-muted-fg">{clinical.id}</p></div></div><span className={`chip ${clinicalDone ? 'chip-mint' : 'chip-sun'}`}>{clinicalDone ? 'Human disposition recorded' : ownershipAccepted ? 'Ownership accepted' : 'Contact required'}</span></div>
          <TaskMeta owner={clinical.owner.name} next={clinical.nextAction} due={clinical.dueTime} waiting={clinical.waitingReason} />
          {!ownershipAccepted ? <button onClick={onAcknowledgeClinical} className="btn-candy w-full">Accept ownership</button> : !clinicalDone ? <div className="space-y-3"><label className="label-caps" htmlFor="clinical-disposition">Human contact and disposition</label><textarea id="clinical-disposition" rows={3} value={disposition} onChange={(e) => setDisposition(e.target.value)} className="input-pop text-sm" /><label className="flex gap-2 text-sm"><input type="checkbox" checked={followUpBlocking} onChange={(e) => setFollowUpBlocking(e.target.checked)} />Human follow-up remains blocking</label><button disabled={!disposition.trim()} onClick={() => onRecordClinicalDisposition(disposition, followUpBlocking)} className="btn-candy w-full">Record human disposition</button></div> : <p className="p-3 rounded-xl bg-mint/20 border-2 border-ink/10 text-sm"><CheckCircle2 className="w-4 h-4 inline mr-1" />{clinical.clinicalDetails?.disposition}</p>}
        </section>}

        {workspaceRole === 'CARE_NAVIGATOR' && <section className={`card-sticker p-5 space-y-4 ${transportDone ? 'bg-mint/10' : ''}`}>
          <div className="flex items-start justify-between gap-3"><div className="flex gap-2"><span className="icon-bubble w-10 h-10 bg-sun text-ink"><Car className="w-4 h-4" /></span><div><h2 className="font-heading font-bold">Transportation recovery</h2><p className="text-xs text-muted-fg">{transport.id} • plan v{planVersion}</p></div></div><span className={`chip ${transportDone ? 'chip-mint' : 'chip-sun'}`}>{transportDone ? 'Current plan complete' : transport.transportDetails?.planFailed ? 'Plan failed • reopened' : 'Plan incomplete'}</span></div>
          <TaskMeta owner={transport.owner.name} next={transport.nextAction} due={transport.dueTime} waiting={transport.waitingReason} />
          {transportDone ? <div className="space-y-3"><div className="p-3 rounded-xl bg-mint/20 border-2 border-ink/10 text-sm space-y-1"><p><strong>Outbound:</strong> {transport.transportDetails?.confirmedPickupTime}</p><p><strong>Return:</strong> {transport.transportDetails?.returnArrangement}</p><p><strong>Contact:</strong> {transport.transportDetails?.logisticsContact}</p><p><strong>Backup:</strong> {transport.transportDetails?.backupPlan}</p></div><button onClick={onFailTransportation} className="btn-ghost w-full">Record plan change or failure</button></div> : <button onClick={() => onConfirmTransportation({})} className="btn-candy w-full">Complete current transport plan</button>}
        </section>}
      </div></div>}
    </div>

    {confirmed && <section className="card-sticker p-5 bg-mint/20"><div><h2 className="font-heading font-bold">Continuity plan confirmed</h2><p className="text-sm text-muted-fg">Human disposition, complete plan v{planVersion}, and Camila’s current-version acknowledgment are recorded. Attendance remains unknown. The readiness graph and audit timeline are available in the Graph tab.</p></div></section>}
  </div>;
};
