# OncoReady System Architecture

## Status and Scope

This document defines the approved launch architecture. The repository currently contains the established React/Vite interface; `RAIL-001` begins the transition to the target FastAPI/PostgreSQL platform. Later task architecture reports define only the contracts, migrations, tests, and security controls needed by their slice and must not contradict this document.

The target serves one polished, deterministic treatment-continuity journey centered on Camila Lopez, a non-production Epic Sandbox test patient. Epic supplies read-only clinical context to authorized staff. OncoReady owns readiness detection, outreach, work assignment, transportation coordination, caregiver permissions, metrics, and closure.

## Architecture Principles

- Preserve the current OncoReady UI and [`DESIGN_SYSTEM.md`](../design/DESIGN_SYSTEM.md) exactly as the human-approved visual baseline.
- Build vertical slices that produce a complete user outcome across UI, API, and persistence.
- Keep Epic clinical context and OncoReady workflow state separate, provenance-preserving sources.
- Make consequential workflow transitions deterministic, server-authorized, durable, idempotent, and auditable.
- Keep clinical authority with humans; model output cannot interpret symptoms, assign clinical urgency, change treatment, or close clinical work.
- Expose each role only to its minimum necessary projection.
- Treat live, snapshot fallback, synthetic fixture, controlled replay, provider-ready, and verified external states as different states.
- Keep the finals topology small: one web service, one API service, and one PostgreSQL service.

## Human-Approved Visual Constraint

The architecture treats the existing visual system as a compatibility contract.

- Existing palette/token values, typography, spacing, geometry, shadows, borders, icons, logos, navigation, theme behavior, component character, motion, layout character, and responsive behavior are locked.
- New Epic, access, staff, transportation, caregiver, patient, evidence, and failure-state UI must reuse existing runtime tokens and primitives.
- `frontend_design_required=true` permits feature composition inside the current system; it does not permit a new aesthetic direction or a restyle of existing pages.
- A frontend implementation is incompatible if matching before/after screenshots show unapproved visual drift, even when functional tests pass.
- Any proposed global visual change requires explicit human approval before implementation and a new design digest/review.

## Target Topology

```text
Browser
  │
  ├── HTTPS ──> Railway web
  │                React + TypeScript + Vite
  │                locked OncoReady visual system
  │                │
  │                └── HTTPS JSON API
  │
  └────────────> Railway API
                   Python + FastAPI
                   │
                   ├── session and role authorization
                   ├── workflow command/state services
                   ├── Epic SMART/FHIR read adapter ── HTTPS ──> Epic Sandbox
                   ├── clinical-context normalization and snapshot service
                   ├── CareLink Partner Dispatch adapter (active)
                   ├── SMS/voice adapters (provider-ready)
                   ├── Uber Health adapter boundary (provider-ready)
                   ├── metrics + OncoReady FHIR export
                   ├── LightGBM inference + SHAP evidence
                   └── private Railway network
                               │
                               ▼
                        Railway PostgreSQL
```

No Redis, Kafka, queue service, separate scheduler service, container orchestration layer, or microservice split is approved for the finals build. The API service may run the bounded T−7/T−2/T−1 scheduling policy until measured behavior justifies a separate worker.

## Components

### Web application

**Technology:** React + TypeScript + Vite

Responsibilities:

- public continuity story, pricing, and workspace access;
- patient, caregiver, staff, and transportation workspaces;
- Treatment Readiness Graph, queue, case workspace, metrics, source provenance, and audit timeline;
- complete loading, empty, error, disabled, success, live, fallback, and unavailable presentation;
- typed consumption of approved backend contracts;
- responsive, keyboard-complete, accessible, reduced-motion-aware behavior;
- preservation of the approved design system without global restyling.

The browser never receives Epic access tokens, refresh tokens, confidential-client material, database credentials, provider secrets, or a user-selectable role/destination grant.

### API service

**Technology:** Python 3 + FastAPI

Responsibilities:

- create and validate server-managed OncoReady sessions;
- resolve center, identity, role, and authorized workspace server-side;
- validate commands and enforce workflow transitions;
- persist append-only events and update current-state projections transactionally;
- authorize Epic connection setup, refresh expiring access, fetch enabled R4 resources, normalize them, and publish atomic snapshots;
- route exact patient text into separately owned clinical and practical work without model interpretation;
- orchestrate provider modes, outbox/idempotency, callback normalization, and kill switches;
- compute metrics and generate the validated OncoReady FHIR evidence artifact;
- load versioned model artifacts and produce calibrated priority plus SHAP evidence;
- provide process health and dependency readiness evidence.

Route names and payload schemas become authoritative only through task-declared contracts. Frontend and backend workers must not invent endpoints independently.

### PostgreSQL

**Technology:** Railway PostgreSQL with Alembic migrations under `backend/alembic/versions`

Responsibilities:

- server sessions and center membership;
- encrypted Epic authorization material or protected credential references;
- normalized, versioned Epic clinical-context snapshots and provenance;
- append-only workflow events, command idempotency, and outbox records;
- current-state projections for treatment, work, transport, caregiver, metrics, and audit views;
- provider configuration/activation state;
- model artifact metadata and evaluation manifests;
- pending/non-privileged access requests when email sign-up is implemented.

Database changes require Git-tracked Alembic migrations, constraints for domain integrity, reviewable rollback/forward handling, and development-environment verification before release.

### External systems

| System | Mode | Architectural boundary |
|---|---|---|
| Epic Sandbox | Active read-only target | Staff-only clinical context for Camila through enabled R4 Read/Search APIs; no writeback |
| CareLink Partner Dispatch | Active controlled provider | Persisted local-provider dispatch and recovery through normalized events |
| SMS / voice | Provider-ready | Internal planned/replay events only until separately activated and callback-verified |
| Uber Health | Provider-ready | No quote, request, assignment, driver, ETA, or completion claim without verified provider interaction |
| Google / Microsoft / Apple | Seeded access presentation | Server resolves controlled identity/workspace; external OAuth deferred |
| Ochsner | Not connected | No access, configuration, endorsement, partnership, or production claim |

## Domain and Ownership Model

```text
EpicClinicalContextSnapshot (read-only, provenance preserved)
  ├── Patient
  ├── Appointment / Encounter
  ├── Condition / Observation / DiagnosticReport
  ├── MedicationRequest
  ├── CarePlan / RequestGroup
  ├── Procedure
  └── Practitioner / Location

OncoReadyTreatmentCase
  ├── TreatmentEvent
  ├── ReadinessSignalSnapshot[]
  ├── CaregiverPermission
  ├── OutreachAttempt[]
  ├── PatientResponse (verbatim)
  ├── ClinicalWorkItem
  └── TransportationWorkItem
       └── TransportRequest / Assignment / ReturnPlan / Recovery

WorkflowEvent[]
  ├── StaffQueueProjection
  ├── StaffCaseProjection
  ├── TransportProjection
  ├── PatientProjection
  ├── CaregiverAllowlistedProjection
  ├── ReadinessGraphProjection
  ├── MetricsProjection
  └── AuditTimelineProjection
```

The deterministic scenario clock and OncoReady treatment date remain distinct from actual Epic source dates and retrieval timestamps. An inventory-verified link may associate an Epic appointment; no generated future date may be attributed to Epic.

Epic resources are not OncoReady workflow events. A normalized snapshot can inform the staff view and identify the treatment context, but OncoReady owns outreach, barrier, ownership, transportation, permission, acknowledgment, and closure events.

## Workflow State

```text
detected → outreach_planned → response_received → department_received
         → owner_assigned → needs_information / accepted
         → action_recorded → patient_informed
         → patient_acknowledged → closed

SLA_missed → escalated
appointment_changed → cutoff and dependent work recomputed or reopened
provider_failed → backup_required → reassigned or escalated
```

Clinical and transportation work have different owners, deadlines, projections, and closure rules. `Continuity plan confirmed` requires the approved human-owned clinical disposition, a complete current transportation plan, and patient acknowledgment; it does not prove medical clearance or attendance. Patient acknowledgment is a distinct authorized command and does not grant dispatch permissions. Invalid or out-of-order transitions are rejected. Duplicate commands/events are idempotent. A provider request, acceptance, assignment, patient notification, patient acknowledgment, arrival, completion, cancellation, decline, and backup requirement remain distinct events.

## Primary Data Flow

```text
Private presenter setup
  → standalone Epic Sandbox authorization
  → server stores protected refresh/authorization state when available
  → API fetches Camila's enabled R4 resources
  → validation + normalization + atomic snapshot publication

Recorded user journey
  → OncoReady controlled access creates a server session
  → staff opens Camila and receives authorized clinical context + source state
  → readiness engine shows T−7/T−2/T−1 signals and outreach priority
  → Camila's verbatim reply creates separate clinical and transport work
  → nurse acknowledges the clinical thread
  → navigation/CareLink assigns outbound, return, and backup transport
  → Ana receives the allowlisted transportation projection only
  → Camila acknowledges the recovered plan
  → graph, timeline, metrics, and FHIR evidence resolve from workflow events
```

If an Epic refresh fails, the API must not blend partial new data with old fields under a live label. It either atomically publishes a complete successful snapshot or serves the last complete snapshot as `Snapshot fallback` with its original synchronization time. If no snapshot exists, the state is `Unavailable`.

## Epic SMART/FHIR Boundary

### Launch and credential lifecycle

- Use the registered Non-PRD client ID and exact HTTPS redirect URI.
- Use standalone SMART on FHIR for Sandbox testing; a customer-configured embedded EHR launch is deferred.
- Keep Epic authorization separate from ordinary OncoReady workspace access.
- Complete the Epic login/consent step through a non-public presenter setup before recording.
- Use a server-backed confidential client and refresh tokens when the Epic app registration and Sandbox authorization support them.
- Treat access and refresh tokens as expiring credentials; if refresh is unavailable or expired, require private reauthorization during preflight.
- Validate OAuth state and nonce, issuer, redirect URI, granted scopes, expiry, and callback transaction binding.
- Encrypt persisted authorization material with a server-held key or approved secret facility; redact credentials from logs, errors, reports, browser output, and audit payloads.

### Enabled read surface

- Patient demographics
- Appointment
- Encounter patient chart
- Condition problems
- Observation labs
- MedicationRequest signed medication orders
- CarePlan oncology
- RequestGroup oncology plan day
- Location organizational directory
- Practitioner organizational directory
- DiagnosticReport results
- Procedure patient-reported surgical history
- Procedure surgeries

Only the enabled R4 `.Read` and `.Search` interactions are in scope. No create/update/patch/delete capability is approved.

### Normalization and provenance

Each mapped item retains resource type, resource ID, non-secret source identity, retrieval time, transformation version, and live/fallback snapshot identity. Unsupported extensions can be ignored safely but must not cause one resource type to be mistaken for another. The compact UI shows only actual returned data and does not infer diagnosis, urgency, medical clearance, or treatment recommendations.

## Interface and Contract Boundaries

Formal task contracts are required where independently implemented components meet:

- web ↔ API sessions and workspace access;
- web ↔ API Epic clinical-context projection and source states;
- web ↔ API workflow commands and role-specific projections;
- API ↔ CareLink/provider normalized transport commands/events;
- API ↔ generated FHIR evidence artifact;
- API ↔ model artifact feature schema and inference result.

`contracts/openapi.yaml` becomes authoritative only for endpoints declared by the relevant task. Internal module types remain implementation details. Contract changes require orchestrator-controlled task scope and validation before `BUILD_READY`.

## Trust Boundaries and Security Architecture

- **Browser → API:** validate all inputs; enforce session, role, center, object access, command permissions, CSRF protection where cookie sessions mutate state, bounded request sizes, and rate limits.
- **Epic OAuth callback → API:** reject state/nonce, issuer, redirect, or transaction mismatch; never log authorization codes or tokens.
- **Epic FHIR → API:** validate response status, content type, resource type, pagination, and mapping; contain upstream failures without partial live publication.
- **Protected credentials → storage:** encrypt sensitive credential material, keep encryption keys outside the database, support rotation/revocation, and never expose secrets to the web service.
- **Patient text → UI/workflow:** render as text only and preserve exact wording for human review.
- **Staff → caregiver/transport:** server-built allowlists prevent clinical or Epic fields from entering lower-privilege projections, search, export, logs, or accessible text.
- **Provider actions → external systems:** require server-side allowlists, idempotency, verified callbacks, kill switches, and explicit activation modes.
- **Model → operations:** deterministic explicit-barrier rules override prediction; malformed/stale models produce `Score unavailable`, never reassurance.
- **Sandbox → production interpretation:** visible provenance and technical documentation prevent Sandbox data or seeded identities from being described as production access.

Epic/access/transport implementation tasks require a focused security review on the exact verified commit. No production or real-patient system is an authorized test target.

## Reliability-Critical Path

```text
private preflight
 → Railway health + migration revision
 → Epic authorize/refresh + Camila inventory + atomic snapshot
 → model artifact + seeded sessions + CareLink reset

recorded path
 → public story → workspace access → staff Camila case
 → Epic context + readiness trajectory → exact reply
 → split work → nurse acknowledgment → CareLink recovery
 → caregiver projection → patient acknowledgment
 → Continuity plan confirmed + provenance + evidence
```

Reliability controls:

- health distinguishes process liveness from database/migration readiness; model status is a separate degraded capability so `Score unavailable` does not take deterministic workflow offline, while release preflight still requires the accepted model artifact;
- deterministic scenario clock and reset/reseed;
- snapshot fallback with explicit timestamp and source state;
- valid transition guards and disabled states;
- outbox/idempotency for consequential provider work;
- network-disabled replay for provider-ready steps;
- complete loading/error/empty/fallback/unavailable UI;
- rehearsed primary and recovery paths;
- recorded backup run for presentation failure.

## Accessibility, Performance, and Visual Compatibility

- Preserve semantic structure, keyboard operation, visible focus, sufficient contrast, 44px patient/public targets, icons plus text, and non-color state meaning.
- Effective reduced motion is the union of the operating-system preference and product control.
- Avoid load waterfalls: render the workspace shell and OncoReady state promptly, then resolve Epic context asynchronously with a bounded source state.
- Limit initial Epic calls to the clinical context required for Camila; cache only through the versioned snapshot boundary.
- Preserve existing scroll-performance, responsive, canvas/map fallback, and layout-stability rules in the design system.
- Matching pre/post screenshots are required for affected desktop and mobile surfaces. An unapproved difference in locked global styling fails review.

## Observability and Audit

- Structured server logs use correlation IDs and redact credentials, tokens, clinical payloads, and patient free text unless a narrowly approved audit requirement says otherwise.
- Audit events record access, workflow mutations, outreach decisions, provider actions, snapshot publication/fallback, model artifact version, and reset/reseed without storing secrets.
- Metrics derive from underlying workflow events and distinguish controlled replay from verified external-provider events.
- Epic source evidence shows mode, last successful synchronization, mapped resource counts/types, and non-secret source references.
- Health/readiness, migration revision, model version, provider modes, and Epic connection state are inspectable during private preflight.

## Deployment and Migration Model

- One Railway project contains `web`, `api`, and PostgreSQL services.
- The web and API use explicit root directories and watch paths.
- PostgreSQL is reached over Railway private networking.
- The API binds to Railway's provided port and restricts CORS to configured web/local origins.
- Secrets remain in Railway variables or an approved server-side credential store, never Git.
- Alembic migrations are reviewed and applied deliberately before readiness passes.
- A submitted deployment is not considered live until it reaches success and the post-deploy critical path passes.
- Production deployment, production Epic configuration, and real external-provider activation remain separate human-approved operations.

## Deferred Production Architecture

- Customer-specific Epic Non-PRD/production installation and embedded EHR launch.
- Real enterprise identity, center membership, provisioning, and account recovery.
- Production PHI governance, retention, consent, audit policy, incident response, and clinical protocol ownership.
- Activated Twilio, ElevenLabs, Uber Health, or other vendor execution.
- Queue/worker infrastructure, high availability, disaster recovery, and scale hardening based on measured requirements.
- Any EHR writeback or broader clinical workflow requires a new approved architecture, formal contract, risk review, and customer participation.
