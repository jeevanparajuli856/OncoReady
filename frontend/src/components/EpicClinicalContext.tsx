import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CloudDownload,
  FileQuestion,
  FlaskConical,
  LockKeyhole,
  Pill,
  RefreshCw,
  UserRound,
  X,
} from 'lucide-react';
import {
  EPIC_CAPTURE_STATE,
  EpicCaptureState,
  EpicClinicalContext,
  EpicManifestResource,
  formatEpicCaptureTime,
  formatEpicSourceDate,
} from '../data/epicCapture';
import { useDialogFocus } from '../lib/useDialogFocus';

const NOT_PRESENT = 'Not recorded';

const formatAdministrativeSex = (value?: string): string | undefined => value
  ? `${value.charAt(0).toUpperCase()}${value.slice(1)}`
  : undefined;

const MissingValue: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 text-sm text-muted-fg">
    <FileQuestion className="w-4 h-4 text-sun" aria-hidden="true" />
    {NOT_PRESENT}
  </span>
);

const FactTile: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="metric-tile min-w-0">
    <dt className="label-caps text-muted-fg">{label}</dt>
    <dd className="font-heading font-semibold mt-1 break-words">{value ?? <MissingValue />}</dd>
  </div>
);

const ResourceInventory: React.FC<{ resources: EpicManifestResource[] }> = ({ resources }) => {
  const groups = (['Patient', 'MedicationRequest', 'Observation', 'Appointment'] as const).map((resourceType) => ({
    resourceType,
    entries: resources.filter((resource) => resource.resourceType === resourceType),
  }));

  return <div className="space-y-2">
    {groups.map(({ resourceType, entries }) => (
      <details key={resourceType} className="rounded-xl border border-line bg-white">
        <summary className="cursor-pointer px-3 py-2.5 font-heading font-semibold text-sm">
          {resourceType} ({entries.length})
        </summary>
        <ul className="px-3 pb-3 space-y-3">
          {entries.map((resource) => (
            <li key={resource.path} className="rounded-lg bg-muted/60 p-2.5 min-w-0">
              <p className="label-caps">Resource type / ID</p>
              <p className="font-mono text-[11px] break-all mt-1">{resource.resourceType}/{resource.id}</p>
              <p className="label-caps mt-2">SHA-256</p>
              <p className="font-mono text-[10px] break-all mt-1 text-muted-fg">{resource.sha256}</p>
            </li>
          ))}
        </ul>
      </details>
    ))}
  </div>;
};

const EpicSourceDrawer: React.FC<{
  context: EpicClinicalContext;
  isOpen: boolean;
  onClose: () => void;
}> = ({ context, isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useDialogFocus(isOpen, dialogRef, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/55 flex justify-end"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="h-full w-full sm:max-w-lg bg-cream border-l border-line shadow-glass-lg flex flex-col min-w-0"
      >
        <div className="bg-ink text-white p-5 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <img src="/epic-logo.svg" alt="" aria-hidden="true" width="64" height="32" className="h-8 w-16 object-contain object-left bg-white rounded-lg px-1.5" />
            <h2 id={titleId} className="font-heading font-extrabold text-lg mt-3">Epic source details</h2>
            <p id={descriptionId} className="text-xs text-white/70 mt-1">Original resource identifiers and provenance for this reviewed offline capture.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-dialog-initial-focus
            aria-label="Close Epic source details"
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 min-h-0">
          <section aria-labelledby={`${titleId}-capture`} className="card-sticker p-4 space-y-3">
            <h3 id={`${titleId}-capture`} className="font-heading font-bold">Capture provenance</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FactTile label="Source" value={context.sourceLabel} />
              <FactTile label="Environment" value={context.sourceEnvironment} />
              <FactTile label="FHIR version" value={`FHIR ${context.fhirVersion}`} />
              <FactTile label="Mode" value="Read-only" />
              <FactTile label="Retrieved at (UTC)" value={<time dateTime={context.capturedAt} className="font-mono text-xs">{context.capturedAt}</time>} />
              <FactTile label="Capture ID" value={<span className="font-mono text-xs break-all">{context.captureId}</span>} />
            </dl>
          </section>

          <section aria-labelledby={`${titleId}-identity`} className="card-sticker p-4 space-y-3">
            <h3 id={`${titleId}-identity`} className="font-heading font-bold">Patient identity</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FactTile label="Display name" value={context.presentationAlias} />
              <FactTile label="Epic source identity" value={context.sourceIdentity} />
              <FactTile label="Identity match" value={context.identityMatch ? 'Confirmed in Epic Patient' : 'Display name only'} />
              <FactTile label="Selected Patient" value={<span className="font-mono text-xs break-all">Patient/{context.patient.id}</span>} />
            </dl>
          </section>

          <section aria-labelledby={`${titleId}-requests`} className="card-sticker p-4 space-y-3">
            <div>
              <h3 id={`${titleId}-requests`} className="font-heading font-bold">GET-only request evidence</h3>
              <p className="text-xs text-muted-fg mt-1">Redacted paths only. No authorization headers or tokens are stored.</p>
            </div>
            <ul className="space-y-2">
              {context.requests.map((request) => (
                <li key={`${request.resourceType}-${request.redactedPath}`} className="metric-tile text-xs min-w-0">
                  <span className="chip chip-accent mr-2">{request.method}</span>
                  <span className="font-mono break-all">{request.redactedPath}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby={`${titleId}-resources`} className="card-sticker p-4 space-y-3">
            <div>
              <h3 id={`${titleId}-resources`} className="font-heading font-bold">Resource inventory</h3>
              <p className="text-xs text-muted-fg mt-1">Full FHIR resource IDs and record integrity checksums.</p>
            </div>
            <ResourceInventory resources={context.resources} />
          </section>

          <section aria-labelledby={`${titleId}-mapping`} className="card-sticker p-4 space-y-3">
            <h3 id={`${titleId}-mapping`} className="font-heading font-bold">Displayed field provenance</h3>
            {[context.patient.provenance, ...context.medications.map((item) => item.provenance), ...context.labs.map((item) => item.provenance), ...context.appointments.map((item) => item.provenance)].map((provenance) => (
              <div key={`${provenance.resourceType}-${provenance.resourceId}`} className="metric-tile min-w-0">
                <p className="font-mono text-[11px] break-all">{provenance.resourceType}/{provenance.resourceId}</p>
                <p className="text-xs text-muted-fg mt-1 break-words">{provenance.sourcePaths.join(' · ')}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

const CaptureUnavailable: React.FC<{ reason: string; onRetry: () => void; loading: boolean }> = ({ reason, onRetry, loading }) => (
  <section className="card-sticker p-6 text-center space-y-3" role="alert">
    <AlertTriangle className="w-7 h-7 mx-auto text-sun" aria-hidden="true" />
    <h2 className="font-heading font-bold">Epic capture unavailable</h2>
    <p className="text-sm text-muted-fg">The Epic record could not be verified. OncoReady workflow remains available.</p>
    <p className="text-xs text-muted-fg">{reason}</p>
    <button type="button" onClick={onRetry} disabled={loading} className="btn-ghost btn-compact">
      <RefreshCw className="w-4 h-4" aria-hidden="true" />
      {loading ? 'Loading Epic record…' : 'Retry'}
    </button>
  </section>
);

const EmptyFamily: React.FC = () => (
  <div className="metric-tile"><MissingValue /></div>
);

export const EpicClinicalContextPanel: React.FC<{ captureState?: EpicCaptureState }> = ({ captureState = EPIC_CAPTURE_STATE }) => {
  const [currentState, setCurrentState] = useState<EpicCaptureState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setCurrentState(captureState);
  }, [captureState]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const retry = () => {
    setCurrentState(null);
    queueMicrotask(() => setCurrentState(captureState));
  };

  if (!currentState) {
    return <section className="card-sticker p-6" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <CloudDownload className="w-5 h-5 text-accent" aria-hidden="true" />
        <p className="font-heading font-semibold">Loading Epic record…</p>
      </div>
    </section>;
  }

  if (currentState.status === 'unavailable') {
    return <CaptureUnavailable reason={currentState.reason} onRetry={retry} loading={false} />;
  }

  const { context } = currentState;
  return <div className="space-y-5">
    <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="epic-capture-title">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-20 h-12 rounded-xl border border-line bg-white flex items-center justify-center shrink-0">
            <img src="/epic-logo.svg" alt="Epic" width="64" height="32" className="w-16 h-8 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="label-caps">Connected to Hospital Epic Sandbox</p>
            <h2 id="epic-capture-title" className="font-heading font-extrabold text-lg mt-1">Epic FHIR R4 record · read-only</h2>
            <p className="text-sm text-muted-fg mt-1">
              <time dateTime={context.capturedAt}>Retrieved {formatEpicCaptureTime(context.capturedAt)}</time>
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:items-end gap-2">
          <span className="chip"><LockKeyhole className="w-3.5 h-3.5" aria-hidden="true" />Read-only</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-3 border-t border-line">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          className="btn-ghost btn-compact shrink-0"
        >
          View source details
        </button>
      </div>
    </section>

    <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="epic-demographics-title">
      <h3 id="epic-demographics-title" className="font-heading font-bold flex items-center gap-2">
        <UserRound className="w-4 h-4 text-accent" aria-hidden="true" />Patient demographics
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <FactTile label="Epic source name" value={context.patient.name} />
        <FactTile label="Date of birth" value={formatEpicSourceDate(context.patient.birthDate)} />
        <FactTile label="Administrative sex" value={formatAdministrativeSex(context.patient.gender)} />
        <FactTile label="Record status" value={context.patient.active === undefined ? undefined : context.patient.active ? 'Active' : 'Inactive'} />
        <FactTile label="Preferred language" value={context.patient.preferredLanguage} />
      </dl>
    </section>

    <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="epic-medications-title">
      <h3 id="epic-medications-title" className="font-heading font-bold flex items-center gap-2">
        <Pill className="w-4 h-4 text-accent" aria-hidden="true" />Available medications
      </h3>
      {context.medications.length === 0 ? <EmptyFamily /> : <div className="space-y-3">
        {context.medications.map((medication) => (
          <article key={medication.id} className="metric-tile space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-heading font-bold break-words">{medication.display ?? <MissingValue />}</h4>
              {medication.status && <span className="chip chip-accent">{medication.status}</span>}
            </div>
            <p className="text-sm text-muted-fg">{medication.instruction ?? <MissingValue />}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {medication.intent && <div><dt className="label-caps">Intent</dt><dd className="mt-1">{medication.intent}</dd></div>}
              {medication.authoredOn && <div><dt className="label-caps">Authored</dt><dd className="mt-1"><time dateTime={medication.authoredOn}>{formatEpicSourceDate(medication.authoredOn)}</time></dd></div>}
            </dl>
          </article>
        ))}
      </div>}
    </section>

    <section role="region" className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="epic-labs-title">
      <h3 id="epic-labs-title" className="font-heading font-bold flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-accent" aria-hidden="true" />Laboratory results
      </h3>
      {context.labs.length === 0 ? <EmptyFamily /> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {context.labs.map((lab) => (
          <article key={lab.id} className="metric-tile space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-heading font-bold">{lab.name ?? <MissingValue />}</h4>
              <span className="chip">{lab.effectiveAt ? formatEpicSourceDate(lab.effectiveAt) : lab.issuedAt ? formatEpicSourceDate(lab.issuedAt) : 'Date not present'}</span>
            </div>
            <div>
              <p className="label-caps">Result</p>
              <p className="font-mono text-sm mt-1">{lab.value ? `${lab.value}${lab.unit ? ` ${lab.unit}` : ''}` : <MissingValue />}</p>
            </div>
            {lab.referenceRange && <p className="text-xs text-muted-fg"><strong className="text-ink">Reference:</strong> {lab.referenceRange}</p>}
            {lab.interpretation && <p className="text-xs text-muted-fg"><strong className="text-ink">Interpretation:</strong> {lab.interpretation}</p>}
          </article>
        ))}
      </div>}
      {context.labs.length > 0 && context.labs.some((lab) => !lab.referenceRange) && (
        <div className="metric-tile">
          <p className="label-caps mb-1">Reference range on some results</p>
          <MissingValue />
        </div>
      )}
    </section>

    <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="epic-appointments-title">
      <div>
        <h3 id="epic-appointments-title" className="font-heading font-bold flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-accent" aria-hidden="true" />Epic appointment records
        </h3>
        <p className="text-xs text-muted-fg mt-1">Epic appointment records; separate from the OncoReady treatment appointment.</p>
      </div>
      {context.appointments.length === 0 ? <EmptyFamily /> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {context.appointments.map((appointment) => (
          <article key={appointment.id} className="metric-tile space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-heading font-bold">{appointment.service ?? <MissingValue />}</h4>
              {appointment.status && <span className="chip chip-accent">{appointment.status}</span>}
            </div>
            <p className="text-sm">{appointment.start ? <time dateTime={appointment.start}>{formatEpicSourceDate(appointment.start)}</time> : <MissingValue />}</p>
            {appointment.location && <p className="text-xs text-muted-fg">{appointment.location}</p>}
          </article>
        ))}
      </div>}
    </section>

    <EpicSourceDrawer context={context} isOpen={drawerOpen} onClose={closeDrawer} />
  </div>;
};

export const EpicCaptureSummary: React.FC<{ captureState?: EpicCaptureState }> = ({ captureState = EPIC_CAPTURE_STATE }) => {
  if (captureState.status === 'unavailable') {
    return <CaptureUnavailable reason={captureState.reason} onRetry={() => undefined} loading={false} />;
  }
  const { context } = captureState;
  const counts = (['Patient', 'MedicationRequest', 'Observation', 'Appointment'] as const)
    .map((type) => `${type} ${context.resources.filter((resource) => resource.resourceType === type).length}`)
    .join(' · ');
  return <section className="card-sticker p-5 sm:p-6 space-y-5" aria-labelledby="epic-integration-title">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-20 h-12 rounded-xl border border-line bg-white flex items-center justify-center shrink-0">
          <img src="/epic-logo.svg" alt="Epic" width="64" height="32" className="w-16 h-8 object-contain" />
        </div>
        <div>
          <p className="label-caps">Clinical integration</p>
          <h2 id="epic-integration-title" className="font-display text-2xl font-extrabold mt-1">Connected to Hospital Epic Sandbox</h2>
          <p className="text-sm text-muted-fg mt-1"><time dateTime={context.capturedAt}>Retrieved {formatEpicCaptureTime(context.capturedAt)}</time></p>
        </div>
      </div>
      <span className="chip chip-mint"><CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />Read-only</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center text-center">
      {['Hospital Epic Sandbox', 'FHIR R4', 'OncoReady staff context'].map((step, index) => <React.Fragment key={step}>
        <div className="metric-tile font-heading font-bold text-sm">{step}</div>
        {index < 2 && <span className="hidden sm:block text-muted-fg" aria-hidden="true">→</span>}
      </React.Fragment>)}
    </div>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FactTile label="Capture ID" value={<span className="font-mono text-xs break-all">{context.captureId}</span>} />
      <FactTile label="Resource inventory" value={<span className="text-xs">{counts}</span>} />
    </dl>
    <div className="metric-tile flex items-start gap-2 text-sm">
      <LockKeyhole className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
      <p><strong>Read-only.</strong> OncoReady never writes back to Epic, and each record keeps its original retrieval time.</p>
    </div>
  </section>;
};
