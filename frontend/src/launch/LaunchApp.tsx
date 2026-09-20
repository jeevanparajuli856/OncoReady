import React, { FormEvent, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Database,
  FileCheck2,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  Mail,
  Menu,
  MessageSquareText,
  Network,
  PhoneCall,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { ApiProblem, ApiSchemas, ActorRole, CaregiverProjection, FINALS_SCENARIO_ID, finalsApi, FhirEvidence, MetricsEvidence, newIdempotencyKey, PatientProjection, PriorityEvidence, RoleProjection, StaffProjection, TransportProjection } from '../api/client';
import { ContinuityField } from '../components/ContinuityField';
import { Logo } from '../components/Logo';
import { useDialogFocus } from '../lib/useDialogFocus';
import { CommunicationsPanel } from './CommunicationsPanel';
import { accessEntries, AppPath, pricing, routeRoles, WorkspacePath } from './config';
import { useProjection } from './useProjection';

type Navigate = (path: AppPath, establish?: boolean) => void;
type Reconciliation = ApiSchemas['ProviderReconciliationSummary'];
type TransportStatus = ApiSchemas['TransportStatus'];

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not yet available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
};

const humanize = (value?: string | null) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase()) : 'Not yet available';

const readinessCopy: Record<RoleProjection['readiness_status'], string> = {
  not_started: 'Readiness check pending',
  at_risk: 'Continuity at risk',
  action_in_progress: 'Owned work in progress',
  continuity_plan_confirmed: 'Continuity plan confirmed',
};

const readinessTone: Record<RoleProjection['readiness_status'], string> = {
  not_started: 'launch-chip--neutral',
  at_risk: 'launch-chip--warning',
  action_in_progress: 'launch-chip--active',
  continuity_plan_confirmed: 'launch-chip--success',
};

const transportOrder: TransportStatus[] = [
  'need_detected', 'eligibility_reviewed', 'request_ready', 'offered', 'accepted', 'driver_assigned',
  'patient_notified', 'patient_acknowledged', 'en_route', 'arrived', 'picked_up', 'return_pending', 'completed',
];

const isTransportFailure = (status: TransportStatus) => [
  'declined', 'cancelled', 'provider_unavailable', 'outcome_unknown', 'stale_assignment',
  'backup_required', 'escalated_to_navigator',
].includes(status);

const routeFromLocation = (): AppPath => {
  const path = window.location.pathname;
  return path === '/' || path === '/access' || path in routeRoles ? path as AppPath : '/access';
};

const SessionBoundary = {
  get: () => sessionStorage.getItem('oncoready.workspace') as WorkspacePath | null,
  set: (path: WorkspacePath) => sessionStorage.setItem('oncoready.workspace', path),
  clear: () => sessionStorage.removeItem('oncoready.workspace'),
};

export const LaunchApp: React.FC = () => {
  const [path, setPath] = useState<AppPath>(() => routeFromLocation());
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const navigate: Navigate = (next, establish = false) => {
    if (next === '/access' || next === '/') SessionBoundary.clear();
    if (establish && next in routeRoles) SessionBoundary.set(next as WorkspacePath);
    window.history.pushState({}, '', next);
    setPath(next);
  };

  useEffect(() => {
    const onPop = () => setPath(routeFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const rolePath = path in routeRoles ? path as WorkspacePath : null;
    if (rolePath && SessionBoundary.get() !== rolePath) {
      window.history.replaceState({}, '', '/access');
      setPath('/access');
      return;
    }
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }, [path]);

  return (
    <div className={`launch-app ${reducedMotion ? 'motion-reduce' : ''}`}>
      <a className="launch-skip" href="#main-content">Skip to main content</a>
      <LaunchHeader path={path} navigate={navigate} reducedMotion={reducedMotion} setReducedMotion={setReducedMotion} />
      <main id="main-content">
        {path === '/' && <PublicLanding navigate={navigate} reducedMotion={reducedMotion} headingRef={headingRef} />}
        {path === '/access' && <AccessGateway navigate={navigate} headingRef={headingRef} />}
        {path in routeRoles && (
          <WorkspaceRoute
            key={path}
            path={path as WorkspacePath}
            navigate={navigate}
            headingRef={headingRef}
          />
        )}
      </main>
    </div>
  );
};

const LaunchHeader: React.FC<{
  path: AppPath;
  navigate: Navigate;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
}> = ({ path, navigate, reducedMotion, setReducedMotion }) => {
  const [open, setOpen] = useState(false);
  const workspace = path in routeRoles;
  return (
    <header className="launch-header">
      <button className="launch-brand" onClick={() => navigate('/')} aria-label="OncoReady home"><Logo size={34} /></button>
      {workspace ? (
        <nav aria-label="Workspace navigation" className="launch-header__nav">
          <button onClick={() => navigate('/access')}><UsersRound aria-hidden="true" /> Switch workspace</button>
          <button onClick={() => setReducedMotion(!reducedMotion)} aria-pressed={reducedMotion}>{reducedMotion ? 'Motion off' : 'Reduce motion'}</button>
        </nav>
      ) : (
        <>
          <nav aria-label="Public navigation" className="launch-header__nav launch-header__nav--public">
            <a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a>
            <button className="launch-button launch-button--small" onClick={() => navigate('/access')}>Workspace access</button>
          </nav>
          <button className="launch-menu" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          {open && <nav aria-label="Mobile public navigation" className="launch-mobile-menu"><a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a><a href="#pricing" onClick={() => setOpen(false)}>Pricing</a><button onClick={() => navigate('/access')}>Workspace access</button></nav>}
        </>
      )}
    </header>
  );
};

const PublicLanding: React.FC<{ navigate: Navigate; reducedMotion: boolean; headingRef: React.RefObject<HTMLHeadingElement> }> = ({ navigate, reducedMotion, headingRef }) => (
  <div className="launch-public">
    <section className="launch-hero">
      <div className="launch-shell launch-hero__grid">
        <div>
          <p className="launch-eyebrow"><Sparkles aria-hidden="true" /> Treatment continuity before the chair</p>
          <h1 ref={headingRef} tabIndex={-1}>Tomorrow’s treatment deserves a closed plan.</h1>
          <p className="launch-lede">OncoReady turns early patient signals into owned clinical, transportation, and callback work—then keeps every dependency visible until the complete plan is acknowledged.</p>
          <div className="launch-actions"><button className="launch-button" onClick={() => navigate('/access')}>Explore workspaces <ArrowRight /></button><a className="launch-button launch-button--secondary" href="#pricing">View pilot pricing</a></div>
          <ul className="launch-trust" aria-label="Product principles"><li><ShieldCheck /> Human clinical authority</li><li><LockKeyhole /> Minimized role views</li><li><Network /> Causal event evidence</li></ul>
        </div>
        <div className="launch-hero__visual">
          <ContinuityField reducedMotion={reducedMotion} />
          <p className="launch-visual-caption"><span>Signal</span><ArrowRight /><span>Owned work</span><ArrowRight /><span>Confirmed plan</span></p>
        </div>
      </div>
    </section>
    <section id="how-it-works" className="launch-section launch-shell" aria-labelledby="how-title">
      <p className="launch-section-label">A closed-loop operating model</p><h2 id="how-title">Every recoverable blocker gets an owner, a deadline, and proof.</h2>
      <div className="launch-feature-grid">
        <Feature Icon={MessageSquareText} title="Detect early" text="A short readiness check preserves the patient’s words and captures practical barriers before treatment day." />
        <Feature Icon={ClipboardCheck} title="Route separately" text="Clinical review, transportation, and callback work stay independently owned and time-bound." />
        <Feature Icon={CheckCircle2} title="Confirm closure" text="A request or assignment is not closure. The complete current plan stays open until acknowledged." />
      </div>
    </section>
    <section className="launch-section launch-section--tint" aria-labelledby="roles-title"><div className="launch-shell"><p className="launch-section-label">One continuity record, minimized by role</p><h2 id="roles-title">Focused views for everyone responsible for tomorrow.</h2><div className="launch-role-grid"><Feature Icon={UserRound} title="Patient" text="One clear next action and the current complete plan." /><Feature Icon={Stethoscope} title="Staff" text="Owners, deadlines, provider truth, and causal evidence." /><Feature Icon={HeartHandshake} title="Caregiver" text="Authorized transportation logistics—and nothing clinical." /><Feature Icon={CarFront} title="Transportation" text="Cutoff, eligibility, accommodations, outbound and return fulfillment." /></div></div></section>
    <section id="pricing" className="launch-section launch-shell" aria-labelledby="pricing-title"><p className="launch-section-label">Pilot pricing</p><h2 id="pricing-title">Start with one accountable readiness operation.</h2><div className="launch-pricing"><article><Building2 /><p className="launch-kicker">{pricing.pilot.name}</p><h3>{pricing.pilot.annual}</h3><p>{pricing.pilot.monthlyEquivalent}</p><button className="launch-button" onClick={() => navigate('/access')}>Request a pilot</button></article><article><Network /><p className="launch-kicker">{pricing.enterprise.name}</p><h3>{pricing.enterprise.price}</h3><p>Configuration and expansion shaped around the oncology program.</p><button className="launch-button launch-button--secondary">Talk to us</button></article></div><p className="launch-pricing-note">{pricing.usageNote} No self-serve checkout.</p></section>
    <footer className="launch-footer"><div className="launch-shell"><Logo size={34} /><p>Accountable continuity before oncology treatment.</p></div></footer>
  </div>
);

const Feature: React.FC<{ Icon: React.ComponentType<{ className?: string }>; title: string; text: string }> = ({ Icon, title, text }) => <article className="launch-feature"><span><Icon /></span><h3>{title}</h3><p>{text}</p></article>;

const AccessGateway: React.FC<{ navigate: Navigate; headingRef: React.RefObject<HTMLHeadingElement> }> = ({ navigate, headingRef }) => (
  <section className="launch-access launch-shell" aria-labelledby="access-title">
    <div className="launch-access__intro"><p className="launch-eyebrow"><LockKeyhole /> Controlled workspace gateway</p><h1 ref={headingRef} tabIndex={-1} id="access-title">Choose a role-based workspace.</h1><p>This local selector opens a controlled illustrative environment. It does not verify identity and is not production authentication.</p></div>
    <div className="launch-access-grid">
      {accessEntries.map((entry) => <button key={entry.path} className="launch-access-card" onClick={() => navigate(entry.path, true)}><span className="launch-provider-mark" aria-hidden="true">{entry.provider === 'Email' ? <Mail /> : entry.provider.slice(0, 1)}</span><span><strong>Continue with {entry.provider}</strong><small>Opens {entry.destination}</small></span><ArrowRight aria-hidden="true" /></button>)}
    </div>
    <p className="launch-boundary"><ShieldCheck /> Controlled illustrative data only. No credentials are collected and no identity-provider request is made.</p>
  </section>
);

const WorkspaceRoute: React.FC<{ path: WorkspacePath; navigate: Navigate; headingRef: React.RefObject<HTMLHeadingElement> }> = ({ path, navigate, headingRef }) => {
  const role = routeRoles[path];
  const { projection, loading, refreshing, error, refresh } = useProjection(role);

  useEffect(() => {
    if (error instanceof ApiProblem && (error.status === 401 || error.status === 403)) {
      SessionBoundary.clear();
      const timeout = window.setTimeout(() => navigate('/access'), 900);
      return () => window.clearTimeout(timeout);
    }
  }, [error, navigate]);

  if (loading) return <WorkspaceLoading headingRef={headingRef} role={role} />;
  if (error && !projection) return <WorkspaceError headingRef={headingRef} error={error} retry={refresh} />;
  if (!projection || projection.role !== role) return <WorkspaceError headingRef={headingRef} error={new Error('The server returned a different role projection. No workspace data was displayed.')} retry={refresh} />;

  return <WorkspaceFrame projection={projection} refreshing={refreshing} refreshError={error} refresh={refresh} headingRef={headingRef}>{
    projection.role === 'patient' ? <PatientWorkspace projection={projection} refresh={refresh} />
      : projection.role === 'caregiver' ? <CaregiverWorkspace projection={projection} />
      : projection.role === 'staff' ? <StaffWorkspace projection={projection} refresh={refresh} />
      : <TransportWorkspace projection={projection} refresh={refresh} />
  }</WorkspaceFrame>;
};

const WorkspaceLoading: React.FC<{ headingRef: React.RefObject<HTMLHeadingElement>; role: ActorRole }> = ({ headingRef, role }) => <section className="launch-workspace launch-shell" aria-busy="true"><h1 ref={headingRef} tabIndex={-1}>Loading {humanize(role)} workspace</h1><p className="launch-muted">Retrieving the current minimized projection…</p><div className="launch-skeleton" /><div className="launch-skeleton launch-skeleton--short" /></section>;

const WorkspaceError: React.FC<{ headingRef: React.RefObject<HTMLHeadingElement>; error: Error; retry: () => void }> = ({ headingRef, error, retry }) => {
  const problem = error instanceof ApiProblem ? error : null;
  const denied = problem?.status === 401 || problem?.status === 403;
  return <section className="launch-workspace launch-shell"><div className="launch-state launch-state--error" role="alert"><AlertCircle /><h1 ref={headingRef} tabIndex={-1}>{denied ? 'Controlled workspace unavailable' : 'Current workspace unavailable'}</h1><p>{denied ? 'Returning to workspace access. No role data was displayed.' : error.message}</p>{!denied && <button className="launch-button" onClick={retry}>Retry current projection</button>}</div></section>;
};

const WorkspaceFrame: React.FC<{ projection: RoleProjection; refreshing: boolean; refreshError: Error | null; refresh: () => void; headingRef: React.RefObject<HTMLHeadingElement>; children: React.ReactNode }> = ({ projection, refreshing, refreshError, refresh, children, headingRef }) => (
  <section className="launch-workspace">
    <div className="launch-projection-bar launch-shell"><div><p className="launch-section-label">{humanize(projection.role)} workspace</p><h1 ref={headingRef} tabIndex={-1}>{projection.role === 'transport_coordinator' ? 'CareLink transportation operations' : projection.role === 'staff' ? 'Treatment continuity hub' : projection.role === 'caregiver' ? 'Authorized ride plan' : 'My treatment readiness'}</h1></div><div className="launch-projection-meta"><span className={`launch-chip ${readinessTone[projection.readiness_status]}`}>{readinessCopy[projection.readiness_status]}</span><span>Version {projection.scenario_version}</span><span>Updated {formatDateTime(projection.as_of)}</span><button onClick={refresh} disabled={refreshing}>{refreshing ? <Loader2 className="launch-spin" /> : <RefreshCw />}<span>{refreshing ? 'Refreshing' : 'Refresh'}</span></button></div></div>
    <div className="launch-shell launch-workspace__content">
      {refreshError && <div className="launch-stale-banner" role="alert"><TriangleAlert /><div><strong>Showing the last confirmed projection</strong><p>{refreshError.message} Refresh again before taking a consequential action.</p></div><button className="launch-button launch-button--small" onClick={refresh}>Retry refresh</button></div>}
      {children}
    </div>
  </section>
);

const TreatmentCard: React.FC<{ treatment: RoleProjection['treatment'] }> = ({ treatment }) => <article className="launch-panel launch-treatment"><div><p className="launch-kicker">Upcoming treatment</p><h2>{treatment.location_display_name}</h2><p><CalendarDays /> {formatDateTime(treatment.starts_at)}</p></div><div><p className="launch-kicker">Arrival window</p><strong>{formatDateTime(treatment.arrival_window.starts_at)}</strong><small>Transportation notice cutoff: {formatDateTime(treatment.transport_notice_cutoff)}</small></div></article>;

const PatientWorkspace: React.FC<{ projection: PatientProjection; refresh: () => void }> = ({ projection, refresh }) => {
  const [showForm, setShowForm] = useState(false);
  const unresolved = projection.blockers.filter((blocker) => blocker.status !== 'resolved');
  return <div className="launch-stack"><TreatmentCard treatment={projection.treatment} /><article className="launch-panel launch-next-action"><span className="launch-icon"><Sparkles /></span><div><p className="launch-kicker">Your next action</p><h2>{projection.next_action ?? (projection.readiness_status === 'not_started' ? 'Complete your readiness check' : 'Your care team is updating the plan')}</h2><p>OncoReady keeps the plan open until every current dependency is resolved and the complete ride plan is acknowledged.</p></div>{projection.readiness_status === 'not_started' && <button className="launch-button" onClick={() => setShowForm(true)}>Start readiness check <ArrowRight /></button>}</article>{showForm && <ReadinessForm projection={projection} close={() => setShowForm(false)} complete={async () => { setShowForm(false); await refresh(); }} />}<section aria-labelledby="patient-work-title"><div className="launch-section-heading"><div><p className="launch-section-label">Owned work</p><h2 id="patient-work-title">{unresolved.length ? `${unresolved.length} current dependencies` : 'No unresolved dependencies'}</h2></div></div>{projection.blockers.length ? <div className="launch-list">{projection.blockers.map((blocker) => <article className="launch-work-row" key={blocker.barrier_id}><span className={`launch-status-dot launch-status-dot--${blocker.status}`} /><div><h3>{blocker.label}</h3><p>Owner: {humanize(blocker.owner_role)} · Due {formatDateTime(blocker.due_at)}</p></div><span className="launch-chip">{humanize(blocker.status)}</span></article>)}</div> : <EmptyState text="Your readiness check has not created any work yet." />}</section><PatientTransport transport={projection.transport} /></div>;
};

const ReadinessForm: React.FC<{ projection: PatientProjection; close: () => void; complete: () => Promise<void> }> = ({ projection, close, complete }) => {
  const dialogRef = useRef<HTMLFormElement>(null);
  const [transport, setTransport] = useState<'confirmed' | 'needs_help' | 'unknown'>('unknown');
  const [concern, setConcern] = useState('');
  const [callback, setCallback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useDialogFocus(true, dialogRef, close);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    if (concern.length > 2000) { setError('Clinical concern must be 2,000 characters or fewer.'); return; }
    setSubmitting(true);
    try {
      await finalsApi.submitReadiness({ scenario_id: FINALS_SCENARIO_ID, actor_role: 'patient', idempotency_key: newIdempotencyKey('readiness'), expected_aggregate_version: projection.scenario_version, channel: 'web', transport_status: transport, clinical_concern_verbatim: concern.trim() || null, callback_requested: callback });
      await complete();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The readiness check was not submitted.'); }
    finally { setSubmitting(false); }
  };
  return <div className="launch-dialog-backdrop" role="presentation"><form ref={dialogRef} className="launch-dialog" role="dialog" aria-modal="true" aria-labelledby="readiness-title" onSubmit={submit}><div className="launch-dialog__header"><div><p className="launch-section-label">T−3 readiness check</p><h2 id="readiness-title">Tell your team what could affect tomorrow.</h2></div><button type="button" onClick={close} aria-label="Close readiness check"><X /></button></div><div className="launch-dialog__body">{error && <div className="launch-inline-error" role="alert"><TriangleAlert /> {error}</div>}<fieldset><legend>Is your ride confirmed?</legend><div className="launch-choice-grid">{([['confirmed', 'Yes, my ride is confirmed'], ['needs_help', 'No, I need ride help'], ['unknown', 'I am not sure']] as const).map(([value, label]) => <label key={value} className={transport === value ? 'is-selected' : ''}><input type="radio" name="transport" value={value} checked={transport === value} onChange={() => setTransport(value)} /><span>{label}</span></label>)}</div></fieldset><label className="launch-field"><span>Clinical concern in your own words <small>(optional, human review)</small></span><textarea value={concern} onChange={(event) => setConcern(event.target.value)} rows={5} maxLength={2000} placeholder="For example: I have mild tingling in my fingers and would like to speak with the nurse." /><small>{concern.length}/2,000 · OncoReady does not diagnose, triage, or clear treatment.</small></label><label className="launch-check"><input type="checkbox" checked={callback} onChange={(event) => setCallback(event.target.checked)} /><span>Please have a person call me.</span></label></div><div className="launch-dialog__actions"><button type="button" className="launch-button launch-button--secondary" onClick={close}>Cancel</button><button className="launch-button" disabled={submitting}>{submitting ? 'Sending check-in…' : 'Send my check-in'}</button></div></form></div>;
};

const PatientTransport: React.FC<{ transport: PatientProjection['transport'] }> = ({ transport }) => <section className="launch-panel" aria-labelledby="patient-ride-title"><div className="launch-section-heading"><div><p className="launch-section-label">Current ride plan · Version {transport.plan_version}</p><h2 id="patient-ride-title">{transport.provider_display_name}</h2></div><span className={`launch-chip ${transport.status === 'completed' || transport.status === 'patient_acknowledged' ? 'launch-chip--success' : isTransportFailure(transport.status) ? 'launch-chip--danger' : 'launch-chip--warning'}`}>{humanize(transport.status)}</span></div><div className="launch-plan-grid"><PlanLeg title="Outbound" window={transport.pickup_window} /><PlanLeg title="Return" window={transport.return_window} /></div>{transport.driver_alias || transport.vehicle_description ? <p className="launch-driver"><CarFront /> {transport.driver_alias ?? 'Driver pending'} · {transport.vehicle_description ?? 'Vehicle pending'}</p> : null}{transport.acknowledgment_required && <div className="launch-state launch-state--warning"><Clock3 /><div><h3>Acknowledgment required</h3><p>The complete current plan is ready to review. This action will become available when its governed command identity is included in the patient projection.</p></div></div>}</section>;

const PlanLeg: React.FC<{ title: string; window?: ApiSchemas['TimeWindow'] }> = ({ title, window }) => <div className="launch-plan-leg"><Route /><div><p className="launch-kicker">{title}</p><strong>{window ? formatDateTime(window.starts_at) : 'Plan pending'}</strong><small>{window ? `Window ends ${formatDateTime(window.ends_at)}` : 'No confirmed window yet'}</small></div></div>;

const CaregiverWorkspace: React.FC<{ projection: CaregiverProjection }> = ({ projection }) => {
  if (!projection.permission.transport_logistics_allowed || !('transport' in projection)) return <div className="launch-stack"><TreatmentCard treatment={projection.treatment} /><div className="launch-state launch-state--privacy"><LockKeyhole /><h2>No logistics shared</h2><p>Transportation permission is not active. No prior ride details are retained or displayed in this workspace.</p></div></div>;
  const transport = projection.transport;
  return <div className="launch-stack"><div className="launch-privacy-banner"><ShieldCheck /><div><strong>Logistics only</strong><p>This workspace contains authorized appointment and transportation details. Clinical text, nurse notes, internal work, model output, and evidence are not included.</p></div></div><TreatmentCard treatment={projection.treatment} /><section className="launch-panel"><div className="launch-section-heading"><div><p className="launch-section-label">Shared with {projection.caregiver.display_name}</p><h2>Current transportation plan</h2></div><span className="launch-chip">{humanize(transport.status)}</span></div><div className="launch-plan-grid"><PlanLeg title="Pickup" window={transport.pickup_window} /><PlanLeg title="Return" window={transport.return_window} /></div><p className="launch-driver"><CarFront /> {transport.provider_display_name} · {transport.driver_alias ?? 'Driver pending'} · {transport.vehicle_description ?? 'Vehicle pending'}</p><p className="launch-muted">Patient acknowledgment: {humanize(transport.acknowledgment_status)}</p></section></div>;
};

const StaffWorkspace: React.FC<{ projection: StaffProjection; refresh: () => void }> = ({ projection, refresh }) => {
  const [tab, setTab] = useState<'work' | 'communications' | 'timeline' | 'evidence'>('work');
  const tabs = [['work', 'Owned work'], ['communications', 'SMS & voice'], ['timeline', 'Causal timeline'], ['evidence', 'Evidence']] as const;
  return <div className="launch-stack"><TreatmentCard treatment={projection.treatment} /><div className="launch-tabs" role="tablist" aria-label="Staff workspace sections">{tabs.map(([value, label]) => <button key={value} id={`staff-tab-${value}`} aria-controls={`staff-panel-${value}`} role="tab" aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={(event) => { const index = tabs.findIndex(([candidate]) => candidate === tab); const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0; if (!direction) return; event.preventDefault(); const next = tabs[(index + direction + tabs.length) % tabs.length][0]; setTab(next); window.requestAnimationFrame(() => document.getElementById(`staff-tab-${next}`)?.focus()); }}>{label}</button>)}</div><div id={`staff-panel-${tab}`} role="tabpanel" aria-labelledby={`staff-tab-${tab}`}>{tab === 'work' && <StaffWork projection={projection} refresh={refresh} />}{tab === 'communications' && <CommunicationsPanel communications={projection.communications} refresh={refresh} />}{tab === 'timeline' && <Timeline events={projection.timeline} />}{tab === 'evidence' && <EvidencePanels scenarioVersion={projection.scenario_version} />}</div></div>;
};

const StaffWork: React.FC<{ projection: StaffProjection; refresh: () => void }> = ({ projection, refresh }) => {
  const [working, setWorking] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const command = async (item: StaffProjection['work_items'][number]) => {
    const action = item.status === 'open' || item.status === 'assigned' ? 'acknowledge' : item.status === 'acknowledged' || item.status === 'accepted' ? 'record_action' : 'close';
    setWorking(item.work_item_id); setMessage(null);
    try { await finalsApi.commandWorkItem(item.work_item_id, { scenario_id: FINALS_SCENARIO_ID, actor_role: 'staff', idempotency_key: newIdempotencyKey(`work-${action}`), expected_aggregate_version: item.aggregate_version, action, note: action === 'record_action' ? 'Human review/action recorded in the continuity workspace.' : null, closure_evidence: action === 'close' ? item.closure_evidence ?? 'Required human work completed and current closure evidence reviewed.' : null }); await refresh(); setMessage('Current work projection refreshed.'); }
    catch (cause) { setMessage(cause instanceof ApiProblem && cause.code === 'version_conflict' ? 'This work changed elsewhere. Refresh the current state before acting.' : cause instanceof Error ? cause.message : 'The command was not accepted.'); }
    finally { setWorking(null); }
  };
  return <div className="launch-stack">{message && <div className="launch-inline-status" role="status">{message}</div>}<section><div className="launch-section-heading"><div><p className="launch-section-label">Human-owned dependencies</p><h2>{projection.work_items.length} work items</h2></div></div>{projection.work_items.length ? <div className="launch-list">{projection.work_items.map((item) => <article className="launch-work-card" key={item.work_item_id}><div className="launch-work-card__top"><span className="launch-icon"><WorkIcon type={item.work_item_type} /></span><div><h3>{humanize(item.work_item_type)}</h3><p>Owner: {item.owner_display_name ?? humanize(item.owner_role)}</p></div><span className="launch-chip">{humanize(item.status)}</span></div><dl><div><dt>Due</dt><dd>{formatDateTime(item.due_at)}</dd></div><div><dt>Next action</dt><dd>{item.next_action ?? 'Review current closure evidence'}</dd></div>{item.closure_evidence && <div><dt>Closure evidence</dt><dd>{item.closure_evidence}</dd></div>}</dl>{item.status !== 'closed' && <button className="launch-button launch-button--small" onClick={() => command(item)} disabled={working === item.work_item_id}>{working === item.work_item_id ? 'Applying guarded command…' : item.status === 'open' || item.status === 'assigned' ? 'Acknowledge ownership' : item.status === 'acknowledged' || item.status === 'accepted' ? 'Record human action' : 'Close with evidence'}</button>}</article>)}</div> : <EmptyState text="No human-owned work is present in the current projection." />}</section><StaffTransport transport={projection.transport} refresh={refresh} /></div>;
};

const WorkIcon: React.FC<{ type: StaffProjection['work_items'][number]['work_item_type'] }> = ({ type }) => type === 'clinical_review' ? <Stethoscope /> : type === 'transport_navigation' ? <CarFront /> : type === 'human_callback' ? <PhoneCall /> : <CalendarDays />;

const ProviderTruth: React.FC<{ label: string; status: string; provenance: string; occurredAt?: string; reconciliation: Reconciliation; refresh: () => void }> = ({ label, status, provenance, occurredAt, reconciliation, refresh }) => {
  const uncertain = reconciliation.state === 'outcome_unknown' || reconciliation.state === 'reconciliation_required' || reconciliation.state === 'manual_recovery_required' || status === 'outcome_unknown';
  return <article className={`launch-provider ${uncertain ? 'launch-provider--uncertain' : ''}`}><div><p className="launch-kicker">{label}</p><h3>{humanize(status)}</h3><p>{occurredAt ? formatDateTime(occurredAt) : 'No definitive provider time yet'} · {provenance === 'provider_callback' ? 'Verified provider callback' : 'Deterministic replay'}</p></div><div className="launch-provider__evidence"><span className="launch-chip">{humanize(reconciliation.state)}</span><small>Attempt: {reconciliation.attempt_reference ?? 'Not available'}</small><small>Permitted recovery: {humanize(reconciliation.permitted_recovery)}</small></div>{uncertain && <div className="launch-provider__recovery"><TriangleAlert /><p>Outcome not confirmed. Blind resend is disabled.</p>{reconciliation.permitted_recovery === 'refresh_status' || reconciliation.permitted_recovery === 'await_callback' || reconciliation.permitted_recovery === 'reconcile_provider' ? <button className="launch-button launch-button--small" onClick={refresh}>Refresh status</button> : <span>Follow the named manual recovery path.</span>}</div>}</article>;
};

const StaffTransport: React.FC<{ transport: StaffProjection['transport']; refresh: () => void }> = ({ transport, refresh }) => <section><div className="launch-section-heading"><div><p className="launch-section-label">CareLink Partner Dispatch</p><h2>Transportation continuity</h2></div><span className={`launch-chip ${isTransportFailure(transport.status) ? 'launch-chip--danger' : ''}`}>{humanize(transport.status)}</span></div><div className="launch-panel"><TransportRail status={transport.status} /><div className="launch-fact-grid"><Fact label="Eligibility" value={humanize(transport.eligibility)} /><Fact label="Outbound plan" value={transport.outbound_plan_complete ? 'Complete' : 'Incomplete'} /><Fact label="Return plan" value={transport.return_plan_complete ? 'Complete' : 'Incomplete'} /><Fact label="Patient acknowledgment" value={transport.acknowledgment_required ? 'Required' : 'Not required'} /></div>{transport.failure_reason && <div className="launch-inline-error"><TriangleAlert /> {transport.failure_reason}</div>}<ProviderTruth label="Transportation provider attempt" status={transport.status} provenance={transport.reconciliation.provenance} occurredAt={transport.reconciliation.last_attempt_at ?? undefined} reconciliation={transport.reconciliation} refresh={refresh} /></div></section>;

const Timeline: React.FC<{ events: StaffProjection['timeline'] }> = ({ events }) => <section aria-labelledby="timeline-title"><div className="launch-section-heading"><div><p className="launch-section-label">Append-only causal evidence</p><h2 id="timeline-title">Event timeline</h2></div><span className="launch-chip">{events.length} events</span></div>{events.length ? <ol className="launch-timeline">{events.map((event) => <li key={event.event_id}><span className="launch-timeline__node" /><article><div><strong>{humanize(event.event_type)}</strong><time>{formatDateTime(event.occurred_at)}</time></div><p>{humanize(event.actor.role)} · Version {event.aggregate_version} · {humanize(event.provenance)}</p><details><summary>Event identity</summary><dl><div><dt>Event</dt><dd>{event.event_id}</dd></div><div><dt>Correlation</dt><dd>{event.correlation_id}</dd></div><div><dt>Causation</dt><dd>{event.causation_id ?? 'Root event'}</dd></div></dl></details></article></li>)}</ol> : <EmptyState text="No causal events match this view." />}</section>;

const EvidencePanels: React.FC<{ scenarioVersion: number }> = ({ scenarioVersion }) => {
  const [metrics, setMetrics] = useState<MetricsEvidence | null>(null); const [fhir, setFhir] = useState<FhirEvidence | null>(null); const [priority, setPriority] = useState<PriorityEvidence | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const controller = new AbortController(); Promise.all([finalsApi.metrics(controller.signal), finalsApi.fhir(controller.signal), finalsApi.priority(controller.signal)]).then(([m, f, p]) => { setMetrics(m); setFhir(f); setPriority(p); }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Evidence unavailable.')).finally(() => setLoading(false)); return () => controller.abort(); }, []);
  if (loading) return <div className="launch-state" aria-busy="true"><Loader2 className="launch-spin" /><h2>Loading event-derived evidence</h2></div>;
  if (error || !metrics || !fhir || !priority) return <div className="launch-state launch-state--error" role="alert"><AlertCircle /><h2>Evidence unavailable</h2><p>{error ?? 'Required evidence was not returned.'}</p></div>;
  const rawPriority = priority as unknown as { status: string; reason?: string; calibrated_probability?: number; model_version?: string; feature_schema_version?: string; contributors?: Array<{ feature: string; direction: string; value: unknown }> };
  const validated = fhir.status === 'validated' && fhir.validator.passed;
  return <section className="launch-evidence" aria-labelledby="evidence-title"><div className="launch-section-heading"><div><p className="launch-section-label">Same causal history</p><h2 id="evidence-title">Operational and technical evidence</h2></div><span className="launch-chip">Projection version {scenarioVersion}</span></div><div className="launch-metrics"><Metric label="Lead time" value={`${metrics.lead_time_hours}h`} /><Metric label="Current blockers" value={String(metrics.unresolved_blockers.current)} /><Metric label="Contact attempts" value={String(metrics.contact_attempts)} /><Metric label="Time to closure" value={metrics.time_to_closure_minutes == null ? 'Not yet available' : `${metrics.time_to_closure_minutes} min`} /></div><div className="launch-evidence-grid"><article className="launch-panel"><div className="launch-evidence-heading"><FileCheck2 /><div><p className="launch-kicker">FHIR R4 artifact</p><h3>{validated ? 'Validated' : fhir.status === 'invalid' ? 'Not validated' : 'Generated · validation pending'}</h3></div><span className={`launch-chip ${validated ? 'launch-chip--success' : fhir.status === 'invalid' ? 'launch-chip--danger' : 'launch-chip--warning'}`}>{validated ? 'Exact artifact passed' : humanize(fhir.status)}</span></div><p>Source event version {fhir.source_event_version}. Validator: {fhir.validator.name} {fhir.validator.version}.</p><p className="launch-muted">Standards-shaped evidence only. This does not imply Epic/Ochsner connectivity or writeback.</p><details><summary>Inspect validator report</summary><ul>{fhir.report.map((item, index) => <li key={index}><strong>{humanize(item.severity)}:</strong> {item.message}</li>)}</ul></details></article><article className="launch-panel"><div className="launch-evidence-heading"><Database /><div><p className="launch-kicker">Supportive outreach ordering</p><h3>{rawPriority.status.toLowerCase().includes('unavailable') ? 'Score unavailable' : `${Math.round((rawPriority.calibrated_probability ?? 0) * 100)}% calibrated priority`}</h3></div></div>{rawPriority.status.toLowerCase().includes('unavailable') ? <div className="launch-state launch-state--warning"><CircleHelp /><p>{humanize(rawPriority.reason)}. Deterministic cadence and explicit-barrier routing continue.</p></div> : <><p>Model {rawPriority.model_version} · Schema {rawPriority.feature_schema_version}</p><ul className="launch-contributors">{rawPriority.contributors?.map((item) => <li key={item.feature}><span>{humanize(item.feature)}</span><strong>{humanize(item.direction)}</strong></li>)}</ul></>}<p className="launch-muted">This score cannot diagnose, determine eligibility, clear treatment, cancel, or reschedule.</p></article></div></section>;
};

const TransportWorkspace: React.FC<{ projection: TransportProjection; refresh: () => void }> = ({ projection, refresh }) => {
  const request = projection.request; const [working, setWorking] = useState(false); const [message, setMessage] = useState<string | null>(null);
  const next = nextTransportAction(request.status, request.reconciliation.permitted_recovery);
  const act = async () => { if (!next?.action) { refresh(); return; } setWorking(true); setMessage(null); try { await finalsApi.commandTransport(request.transport_request_id, { scenario_id: FINALS_SCENARIO_ID, actor_role: 'transport_coordinator', idempotency_key: newIdempotencyKey(`transport-${next.action}`), expected_aggregate_version: request.aggregate_version, action: next.action, ...(next.action === 'review_eligibility' ? { eligible: true, service_area_confirmed: true, operating_window_confirmed: true, outbound_plan_complete: true, return_plan_complete: true } : {}), ...(next.action === 'assign_driver' ? { driver_alias: 'CareLink assigned driver', vehicle_description: 'CareLink accessible vehicle' } : {}) }); await refresh(); setMessage('Transportation projection refreshed.'); } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'The transport command was not accepted.'); } finally { setWorking(false); } };
  return <div className="launch-stack"><TreatmentCard treatment={projection.treatment} />{message && <div className="launch-inline-status" role="status">{message}</div>}<section className="launch-panel"><div className="launch-section-heading"><div><p className="launch-section-label">CareLink Partner Dispatch</p><h2>Request {request.transport_request_id.slice(0, 8)}</h2></div><span className={`launch-chip ${isTransportFailure(request.status) ? 'launch-chip--danger' : ''}`}>{humanize(request.status)}</span></div><TransportRail status={request.status} /><div className="launch-fact-grid"><Fact label="Notice cutoff" value={formatDateTime(request.notice_cutoff)} /><Fact label="Funding" value={humanize(request.funding_path)} /><Fact label="Service area" value={request.service_area} /><Fact label="Permission" value={request.notification_permission ? 'Patient notification allowed' : 'Not granted'} /><Fact label="Wheelchair" value={request.mobility.wheelchair ? 'Required' : 'Not required'} /><Fact label="Transfer assistance" value={request.mobility.transfer_assistance ? 'Required' : 'Not required'} /></div><div className="launch-plan-grid"><PlanLeg title="Outbound" window={request.outbound_plan.window} /><PlanLeg title="Return" window={request.return_plan.window} /></div><ProviderTruth label="CareLink provider attempt" status={request.status} provenance={request.reconciliation.provenance} occurredAt={request.reconciliation.last_attempt_at ?? undefined} reconciliation={request.reconciliation} refresh={refresh} />{next && <div className="launch-next-command"><div><p className="launch-kicker">Permitted next action</p><h3>{next.label}</h3><p>{next.description}</p></div><button className="launch-button" disabled={working} onClick={act}>{working ? 'Applying guarded command…' : next.button}</button></div>}</section><section aria-labelledby="provider-registry-title"><div className="launch-section-heading"><div><p className="launch-section-label">Provider registry</p><h2 id="provider-registry-title">One active fulfillment path</h2></div></div><div className="launch-provider-registry"><article><CheckCircle2 /><div><h3>CareLink Partner Dispatch</h3><p>Active controlled provider</p></div><span className="launch-chip launch-chip--success">Active</span></article><article aria-disabled="true"><LockKeyhole /><div><h3>Uber Health</h3><p>Planned adapter · no credentials or network actions</p></div><span className="launch-chip">Disabled</span></article><article aria-disabled="true"><LockKeyhole /><div><h3>Lyft Concierge</h3><p>Planned adapter · no credentials or network actions</p></div><span className="launch-chip">Disabled</span></article></div></section></div>;
};

const nextTransportAction = (status: TransportStatus, recovery: Reconciliation['permitted_recovery']): { label: string; description: string; button: string; action?: ApiSchemas['TransportCommand']['action'] } | null => {
  if (status === 'outcome_unknown') {
    if (recovery === 'activate_backup') return { label: 'Activate the approved backup', description: 'The uncertain original attempt will not be resent.', button: 'Activate backup', action: 'activate_backup' };
    if (recovery === 'escalate_manually') return { label: 'Escalate to navigator', description: 'Manual recovery is the only permitted path.', button: 'Escalate manually', action: 'escalate_to_navigator' };
    return { label: humanize(recovery), description: 'Refresh or reconcile the provider outcome. Blind resend is disabled.', button: 'Refresh current status' };
  }
  const map: Partial<Record<TransportStatus, [string, ApiSchemas['TransportCommand']['action']]>> = {
    need_detected: ['Review eligibility and complete both trip legs', 'review_eligibility'], eligibility_reviewed: ['Mark request ready', 'mark_request_ready'], request_ready: ['Send controlled offer', 'offer'], offered: ['Record provider acceptance', 'accept'], accepted: ['Assign allowlisted driver', 'assign_driver'], driver_assigned: ['Notify patient', 'notify_patient'], patient_notified: ['Record patient acknowledgment', 'acknowledge_patient'], patient_acknowledged: ['Mark en route', 'mark_en_route'], en_route: ['Record arrival', 'arrive'], arrived: ['Record pickup', 'pick_up'], picked_up: ['Mark return pending', 'mark_return_pending'], return_pending: ['Complete both-leg fulfillment', 'complete'], provider_unavailable: ['Activate approved backup', 'activate_backup'], backup_required: ['Activate approved backup', 'activate_backup'], backup_activated: ['Notify patient of backup plan', 'notify_patient'], stale_assignment: ['Escalate stale assignment', 'escalate_to_navigator'], declined: ['Activate approved backup', 'activate_backup'], cancelled: ['Escalate cancellation', 'escalate_to_navigator'],
  };
  const match = map[status];
  return match ? { label: match[0], description: 'This guarded command advances only the current allowed lifecycle transition.', button: match[0], action: match[1] } : null;
};

const TransportRail: React.FC<{ status: TransportStatus }> = ({ status }) => {
  const current = transportOrder.indexOf(status); const exceptional = current === -1;
  return <ol className="launch-lifecycle" aria-label="Transportation lifecycle">{transportOrder.map((step, index) => <li key={step} className={current >= index ? 'is-complete' : current + 1 === index ? 'is-next' : ''}><span>{current >= index ? <Check /> : index + 1}</span><small>{humanize(step)}</small></li>)}{exceptional && <li className="is-exception"><span><TriangleAlert /></span><small>{humanize(status)}</small></li>}</ol>;
};

const Fact: React.FC<{ label: string; value: string }> = ({ label, value }) => <div><dt>{label}</dt><dd>{value}</dd></div>;
const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => <article><p>{label}</p><strong>{value}</strong></article>;
const EmptyState: React.FC<{ text: string }> = ({ text }) => <div className="launch-state"><ClipboardCheck /><p>{text}</p></div>;
