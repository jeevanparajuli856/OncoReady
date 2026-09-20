# OncoReady Two-Day Launch Sprint

**Status:** Approved implementation handoff  
**Sprint task:** `LAUNCH-001 — Finals Treatment Continuity Launch`  
**Build window:** Two eight-hour engineering days  
**Finalization window:** One protected day for repair, rehearsal, recording, and submission  
**Team:** Three implementation engineers plus orchestrator-controlled testing, security, and review gates  
**Primary inputs:** [`LAUNCH_ROADMAP.md`](./LAUNCH_ROADMAP.md), [`TRANSPORTATION_RESEARCH_AND_FINALS_DECISION.md`](./TRANSPORTATION_RESEARCH_AND_FINALS_DECISION.md), [`PROJECT.md`](./PROJECT.md), and [`architecture/SYSTEM.md`](./architecture/SYSTEM.md)

## 1. Sprint outcome

Deliver the complete competition journey as one executable `LAUNCH-001` task containing seven ordered capability milestones:

1. LAND — public launch page, pricing, and role-entry gateway;
2. FLOW — durable early warning, department ownership, deadlines, and closure;
3. SMS — Twilio readiness messaging;
4. VOICE — ElevenLabs fallback through Twilio;
5. RIDE — CareLink Partner Dispatch and transportation recovery;
6. EVIDENCE — event-derived metrics and validated FHIR R4 artifact;
7. ML — calibrated LightGBM supportive-outreach score and SHAP explanation.

The task is complete only when the integrated journey works, required live statuses are backed by verified callbacks, deterministic recovery remains available, verification and required reviews pass on the current commit, and the final recorded presentation can be repeated reliably.

Unavailable credentials, failed callbacks, invalid FHIR output, incompatible ML artifacts, security findings, or broken acceptance criteria block completion. They must never be converted into fake product success.

## 2. Fixed product decisions

- The active finals transportation path is the controlled CareLink Partner Dispatch workflow.
- Uber Health and Lyft Concierge remain disabled, non-interactive planned adapters. They receive no finals credentials and never appear as Maria's assigned provider or in active-trip status.
- OncoReady is a treatment-continuity orchestration layer, not a ride-booking product or fleet operator.
- Transportation readiness includes the authorization cutoff, eligibility/funding path, service area, mobility or escort needs, outbound travel, uncertain treatment duration, safe return travel, dispatch recovery, and patient acknowledgment.
- A driver assignment does not close the transportation blocker. Maria's acknowledgment is required.
- The branded access choices are local role-entry controls, not OAuth, authentication, or identity verification.
- The case uses controlled illustrative data. No real PHI, production hospital access, or production credentials are permitted.
- FHIR validation does not imply an Epic or Ochsner connection.
- The LightGBM result is used only to order supportive outreach. It never diagnoses, triages, determines eligibility, modifies treatment, or autonomously cancels or reschedules an appointment.
- The existing `100.4°F` fixture must be replaced with a clearly non-urgent concern. Generic acknowledgment must never turn an unresolved urgent symptom into `Ready`.

## 3. Contract authority and change control

### Authoritative contract

When `LAUNCH-001.execution.contract_required=true`, the only authoritative cross-component interface definitions are:

- `contracts/openapi.yaml` for HTTP commands, queries, callbacks, errors, and shared schemas;
- `contracts/events/*.schema.json` for workflow event envelopes and event payloads;
- the `contracts` list in `.ai/tasks/LAUNCH-001/task.json`, which identifies the contract artifacts governed by the task.

This sprint document, feature specifications, architecture reports, implementation code, fixtures, and tests may explain or consume the contract, but must not redefine its wire shapes. If prose conflicts with a governed contract, implementation stops with `CONTRACT_CHANGE_REQUIRED` and the orchestrator reconciles the source of truth.

### Contract invariants

- Frontend agents must use generated TypeScript types and the generated API client; they must not hand-create endpoint or event interfaces.
- Backend boundary models must implement the OpenAPI schemas exactly and validate every external payload.
- Database projections may add internal fields but cannot silently change public event meaning or wire format.
- Mocks, deterministic replay fixtures, and tests must be generated from or validated against the governed schemas.
- Event names, endpoint paths, enum values, required fields, error shapes, and idempotency behavior cannot be changed independently by a worker.
- Breaking contract changes are forbidden during the two-day implementation window unless the current contract makes an acceptance criterion impossible or unsafe.

### Contract-change procedure

1. The affected worker reports `CONTRACT_CHANGE_REQUIRED` and stops dependent implementation.
2. The orchestrator records the proposed behavior change and checks it against the feature, architecture, privacy, and transportation decisions.
3. The API contract owner updates the governed artifact and its validation tests.
4. Contract validation must pass and the revision must be committed.
5. Backend and frontend worktrees sync to the exact contract commit and regenerate their boundary types.
6. Dependent tests, verification, security evidence, and review evidence are rerun or invalidated as required.

No contract change is complete through chat agreement alone.

## 4. Pre-sprint source-of-truth preparation

Complete this work before starting the Day 1 implementation clock:

- Reconcile `PROJECT.md`, `architecture/SYSTEM.md`, and `.ai/project.json` with the approved launch direction.
- Enable FastAPI backend and Supabase PostgreSQL components and add required backend, database, contract, frontend, FHIR, and ML verification commands.
- Replace browser-local workflow state as the launch authority with persisted workflow events and server-derived role projections.
- Preserve React, TypeScript, Vite, the established design system, deterministic reset, accessibility, and reduced-motion behavior.
- Add one ADR covering the React → FastAPI → PostgreSQL event-state boundary, the single-instance scheduler/outbox worker, provider adapters, deterministic recovery, and the decision not to add Redis, Kafka, Celery, or microservices.
- Create `LAUNCH-001` with database, backend, frontend, infrastructure, and frontend-design impacts enabled.
- Set `contract_required=true`, `test_depth=FULL`, `security_risk=HIGH`, and `security_review_required=true`.
- Record the governed OpenAPI and event-schema files in the task contract list.
- Advance the task through PLANNING and BUILD_READY, commit its architecture and contracts, then advance it to IMPLEMENTATION before creating worker worktrees.
- Leave completed `CORE-001`, `LAND-001`, and `UI-001` tasks unchanged.
- Install the control-plane Python requirements so project validation, task validation, scope checks, and verification can run.

## 5. Minimum launch architecture

### Runtime shape

```text
React + TypeScript role workspaces
        │
        ▼
Generated OpenAPI client
        │
        ▼
Single FastAPI service
        ├── workflow and projection services
        ├── scheduler + transactional outbox poller
        ├── Twilio messaging adapter and signed callbacks
        ├── ElevenLabs/Twilio voice adapter and signed callbacks
        ├── CareLink Partner Dispatch adapter
        ├── FHIR and operational-evidence projection
        └── LightGBM inference and SHAP explanation adapter
        │
        ▼
Supabase PostgreSQL
        ├── append-only workflow events
        ├── current-state projections
        ├── scheduled actions and outbox
        └── idempotency/callback receipts
```

### Runtime decisions

- The frontend uses `/access`, `/patient`, `/caregiver`, `/staff`, and `/transport` routes.
- The backend runs as one controlled finals instance behind the human-provided HTTPS callback domain.
- A database-backed poller claims scheduled/outbox work with row locking and idempotency.
- Supabase is a development/finals environment containing controlled synthetic data only.
- Server configuration fixes the scenario, phone, pickup, destination, provider, origins, rate limits, request-size limits, and external-action kill switches.
- Reset restores the known scenario but never sends an SMS, places a call, or creates a transport request.

## 6. Public API and event interface

### Core endpoints

- `GET /api/v1/scenarios/finals` — return the role-filtered scenario projection.
- `POST /api/v1/scenarios/finals/reset` — perform deterministic reseed without external side effects.
- `POST /api/v1/readiness-submissions` — preserve Maria's response and create separately owned work.
- `POST /api/v1/work-items/{id}/commands` — guarded assignment, acceptance, action, escalation, patient-information, acknowledgment, and closure commands.
- `POST /api/v1/transport/requests` — create the configured idempotent Partner Dispatch request.
- `POST /api/v1/transport/requests/{id}/commands` — eligibility, offer, acceptance, assignment, failure, backup, notification, acknowledgment, and completion commands.
- `POST /api/v1/communications/sms` — server-only allowlisted SMS initiation.
- `POST /api/v1/communications/voice` — server-only allowlisted voice initiation.
- Twilio inbound-message and delivery-status callbacks with official raw-request signature validation.
- ElevenLabs post-call and failure callbacks with HMAC validation.
- `GET /api/v1/evidence/metrics` — metrics derived from workflow events.
- `GET /api/v1/evidence/fhir` — generated bundle, validator state, and inspectable validation report.
- `GET /api/v1/evidence/priority` — versioned supportive-outreach score and explanation or `Score unavailable`.

### Command envelope

Every command includes:

- `scenario_id`;
- `actor_role`;
- `idempotency_key`;
- expected aggregate version;
- typed command payload.

The controlled finals environment uses a server-managed scenario token and actor-role/action allowlists. This is not represented as production authentication.

### Event envelope

Every event includes:

- event ID and schema version;
- aggregate type, aggregate ID, and aggregate version;
- event type and typed payload;
- occurrence and receipt timestamps;
- actor and provenance;
- correlation and causation IDs;
- idempotency key where applicable.

### Transportation lifecycle

```text
need_detected
  → eligibility_reviewed
  → request_ready
  → offered
  → accepted
  → driver_assigned
  → patient_notified
  → patient_acknowledged
  → en_route
  → arrived
  → picked_up
  → completed

offered / accepted / driver_assigned
  → declined / cancelled / provider_unavailable / stale_assignment / return_pending
  → backup_required
  → backup_activated or escalated_to_navigator
```

Required transport data includes the treatment arrival window, business-day cutoff, funding/eligibility pathway, service area, operating window, pickup and destination, mobility/transfer/wheelchair/escort needs, outbound and return plan, provider and mode, driver/vehicle assignment, notification permissions, acknowledgments, failure reason, backup decision, timestamps, correlation/idempotency identifiers, and closure evidence.

## 7. Persistence plan

Use timestamped Git-tracked migrations for:

- append-only `workflow_events`;
- scenario/treatment, work-item, communication, transport, caregiver, metrics, and scheduler projections;
- transactional outbox;
- scheduled actions;
- processed callback and idempotency records;
- deterministic finals seed and safe reset function.

Database constraints must prevent duplicate idempotency keys, invalid provider selection, arbitrary phone or destination use, and closure without the required evidence. Indexes are limited to event-stream lookup, due scheduled work, outbox delivery, callback deduplication, and primary projection queries.

## 8. Three-engineer ownership

| Engineer or agent | Exclusive ownership | Secondary Day 2 ownership |
|---|---|---|
| Database specialist | Migrations, seed/reset, event store, projections, outbox, idempotency, constraints, indexes | Synthetic ML dataset generator and artifact metadata |
| Backend specialist | FastAPI domain/API, scheduler, Twilio, ElevenLabs, CareLink adapter, webhook verification | FHIR generation/validation and ML inference |
| Frontend specialist | Design Phase A, public/access surfaces, generated-client integration, role workspaces, transport portal | Evidence/ML presentation and finals polish |

The database specialist works on the task feature branch. Backend and frontend use agent worktrees created from the committed IMPLEMENTATION state. Workers do not edit contracts or `task.json`. The orchestrator owns source-of-truth changes, contract changes, lifecycle state, integration, and evidence freshness.

## 9. Day 1 — Working system and external integrations

| Time | Database specialist | Backend specialist | Frontend specialist | Required gate |
|---|---|---|---|---|
| H0–H1 | Link DEV Supabase and create first migration | Validate environment and adapter configuration | Complete frontend design Phase A | Human supplies credentials; contract and design review start |
| H1–H3 | Event store, projections, seed/reset, outbox | FastAPI foundation, scenario/readiness/work-item services | Remove public record; implement pricing and access gateway | Contract and design gates approved |
| H3–H4 | Commit migration foundation; coordinate worktree sync | Contract/domain tests | Route/deep-link shell and API state adapter | Build, migration reset, and contract checks pass |
| H4–H6 | Communication/transport persistence and idempotency | Twilio, ElevenLabs, CareLink commands and callbacks | Patient, staff, caregiver, and transport projections | Maria flow works with deterministic providers |
| H6–H8 | Projection consistency and failure fixtures | Live callback preflight and scheduler | CareLink lifecycle, channel history, failure/backup UI | Live SMS and voice callback proof passes or task is blocked |

### Human credential checklist — due by H1

- Supabase DEV database connection;
- Twilio account, Messaging Service, SMS-capable number, auth token, and allowlisted E.164 phone;
- ElevenLabs key, bounded agent, linked Twilio number, and webhook secret;
- public HTTPS callback base URL;
- server-side secret store or ignored backend environment file;
- `TRANSPORT_PROVIDER=partner_dispatch`;
- fixed pickup/destination, scenario token, CORS origins, and kill-switch configuration;
- approved nonclinical SMS/voice script and test-recipient consent.

Credentials must never be pasted into chat, committed to Git, placed in frontend variables, printed in logs, or captured in screenshots/reports.

## 10. Day 2 — Evidence, ML, integration, and freeze

| Time | Database/ML specialist | Backend/evidence specialist | Frontend specialist | Required gate |
|---|---|---|---|---|
| H0–H2 | Generate fixed-seed longitudinal cohort and separated partitions | Derive metrics and generate FHIR R4 bundle | Wire graph, timeline, metrics, FHIR, and channel evidence | Metrics are event-derived; FHIR validator runs |
| H2–H4 | Train LightGBM, sigmoid calibration, leakage/subgroup tests, artifact manifest | SHAP raw-margin explanations and inference fallback | Staff-only `Why flagged?` view and truth boundaries | Invalid or stale model displays `Score unavailable` |
| H4–H5 | Database/reset verification | Backend integration and provider-failure tests | Responsive, keyboard, reduced-motion, privacy, and degraded states | Worker scope checks and reports complete |
| H5–H6 | Repair blocking failures only | Repair blocking failures only | Repair blocking failures only | Worker branches integrated deliberately |
| H6–H7 | Support independent FULL testing | Support exact-commit verification | Critical-path Playwright and production build | Test and verification reports pass |
| H7–H8 | Support focused security review | Final-review fixes only | Final visual/demo polish only | Security and final review approve; build freezes |

### ML acceptance gates

- fixed generator seed and versioned artifact manifest;
- repeated fictional patients with patient-separated chronological train/calibration/test partitions;
- untouched final test set until model and calibrator selection are frozen;
- explicit rejection of post-cutoff outcomes, future notes, final cancellation reasons, or interventions created after scoring;
- sigmoid calibration fitted only on the calibration partition;
- calibrated Brier score beats the null/prevalence baseline;
- PR-AUC exceeds outcome prevalence;
- top-capacity precision exceeds prevalence;
- subgroup sample counts and performance are reported without unsupported fairness or clinical-validation claims;
- model, calibrator, feature schema, generator seed, training timestamp, and evaluation report ship as one versioned artifact set;
- missing, malformed, stale, or schema-incompatible artifacts return `Score unavailable`, while universal cadence and deterministic routing continue.

## 11. Verification and acceptance

### Required automated verification

- project, task, report-schema, OpenAPI, and event-schema validation;
- generated frontend types are current with the committed OpenAPI contract;
- migration reset, deterministic seed, database constraints, ordering, projection consistency, and idempotency tests;
- FastAPI domain/API tests;
- Twilio/ElevenLabs signature, allowlist, rate/request limit, STOP/HELP, duplicate, retry, and out-of-order callback tests;
- CareLink decline, cancellation, unavailable-provider, stale assignment, return-pending, backup, appointment-change, and acknowledgment tests;
- reset test proving that no external SMS, call, or transport action fires;
- frontend production build and critical-path smoke tests;
- Playwright coverage for public privacy, branded role mapping, deep links, full Maria journey, caregiver data minimization, responsive layouts, keyboard use, and reduced motion;
- official pinned FHIR validator pass before the UI displays `Validated`;
- ML reproducibility, leakage, calibration, subgroup, artifact compatibility, and failure-fallback tests;
- network-disabled recovery without false provider success.

Install the Playwright Chromium runtime before the independent browser test; unavailable required checks fail verification rather than being skipped.

### Critical end-to-end acceptance

1. The public landing page contains no Maria record, MRN, regimen, facility record, graph, or patient workspace preview.
2. Pricing presents `$18,000/year`, `$1,500/month billed annually`, and custom pricing for larger programs from one configuration source.
3. Google opens patient, Microsoft caregiver, Apple staff, and email transportation without a credential prompt or network identity request.
4. Maria's T−3 response creates separate clinical, transportation, and callback work with accountable owners and deadlines.
5. Twilio and ElevenLabs states shown as live are backed by authenticated callbacks.
6. CareLink records eligibility, accommodations, outbound/return plans, offer, assignment, failure, backup, notification, and acknowledgment.
7. Ana receives only patient-authorized transportation logistics; clinical text and nurse details are absent from visual, accessibility, search, export, and outbound output.
8. Maria's acknowledgment closes the transportation dependency; assignment alone does not.
9. The graph, timeline, metrics, and role views remain consistent with the same persisted events.
10. The FHIR report is generated from the scenario and displays `Validated` only after the pinned validator passes.
11. LightGBM and SHAP present supportive-outreach prioritization only and fail safely.
12. Reset restores the exact starting state without external side effects.

### Security and review gates

After the integrated revision is committed:

1. Run the independent FULL tester and require a complete passing `test-report.json`.
2. Run repository verification and bind `verification-report.json` to that commit.
3. Run a focused security specialist on the exact verified commit. Review webhook authentication, secrets, allowlists, scenario-token handling, role/action enforcement, CORS, rate limits, request limits, injection, idempotency, data minimization, logging, reset controls, and external-action kill switches.
4. Advance to REVIEW only after security approval.
5. Run the final reviewer against the exact current commit and require APPROVED before human merge.

Any meaningful implementation, requirement, contract, design, test, or architecture change invalidates downstream evidence and requires the relevant gates to run again.

## 12. Day 3 — Protected freeze, video, and submission

Day 3 contains no planned feature development.

- Run five consecutive complete rehearsals, including one provider/network failure.
- Confirm callback reachability, allowlisted phone, CareLink reset state, scenario clock, FHIR result, and ML artifact version.
- Capture one complete backup run before the final recording.
- Record the seven-minute product video and live voiceover against the frozen revision.
- Give one concise opening disclosure that the case is illustrative and provider interactions run in a controlled environment.
- Keep local truth labels only at material claim points:
  - role controls are local role entry, not identity verification;
  - CareLink is the configured controlled dispatch workflow;
  - Uber Health and Lyft Concierge are planned and not connected;
  - validated FHIR is not Ochsner/Epic integration;
  - ML is project-controlled supportive-outreach prioritization, not clinical prediction.
- Repair only failures that block the recorded journey. Any code change requires affected verification, security, and review evidence to be refreshed.
- After APPROVED final review and human merge, close with `python3 scripts/agentctl.py task advance LAUNCH-001 --merged`.

## 13. Stop condition

The launch sprint is complete when:

- the entire recorded journey works at production visual quality;
- all core states are generated by working code and persisted events;
- external statuses are backed by authenticated provider callbacks or are truthfully shown as deterministic recovery;
- the CareLink failure/recovery and patient-acknowledgment boundary work;
- Uber Health and Lyft Concierge remain planned and disconnected;
- FHIR and ML evidence passes its respective gates;
- FULL testing, exact-commit verification, required security review, and final review pass;
- five rehearsals and the backup recording succeed;
- the human completes the feature merge.

The task remains blocked rather than falsely complete if a required live, contract, validation, security, review, or demonstration gate fails.
