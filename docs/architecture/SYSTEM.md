# OncoReady System Architecture

## System summary

OncoReady is a treatment-continuity orchestration product. It identifies recoverable threats before oncology treatment, assigns clinical and practical work to the right humans, coordinates bounded communication and transportation recovery, and proves whether the complete continuity plan closed.

The completed CORE-001 experience used a React application, deterministic reducer, synthetic fixtures, and browser persistence. LAUNCH-001 retains that presentation foundation but moves workflow authority to a long-running TypeScript service and Railway PostgreSQL. Browser state is presentation-only; the server validates commands, enforces policy, appends immutable events, builds role-minimized projections, handles provider callbacks, and coordinates scheduled external actions.

The launch environment contains controlled illustrative data only. It is not production identity, PHI, hospital connectivity, clinical validation, or a claim of production scale.

## Architecture principles

- Optimize for the complete early-signal-to-acknowledged-plan journey and its deterministic recovery path.
- Keep one append-only event history as the durable source for projections, metrics, evidence, and external-action state.
- Accept changes only through server-side commands with input validation, actor/action policy, expected aggregate versions, and idempotency.
- Preserve patient words and human clinical authority. ML may support outreach ordering but cannot diagnose, triage, clear, cancel, or close treatment work.
- Build role projections on the server and minimize them before serialization; hiding fields in React is not privacy enforcement.
- Treat queued, attempted, provider-accepted, callback-confirmed, patient-notified, patient-acknowledged, and closed as different facts.
- Keep scheduling durable in PostgreSQL. A process timer wakes work; it is never the source of truth.
- Make provider failure and uncertain outcomes visible and recoverable; never turn an unavailable integration into fabricated success.
- Keep the launch topology to one Railway project, two application services, and one PostgreSQL service. Do not add Redis, Kafka, Celery, a workflow platform, or microservices.

## Runtime topology

```text
Public browser
    |
    | HTTPS
    v
Railway `web` service
React + TypeScript + Vite static application
    |
    | generated OpenAPI client over the public API origin
    v
Railway `api` service (long-running Node.js/TypeScript process)
    |- command/query routes and role/action policy
    |- Twilio and ElevenLabs callback routes
    |- provider adapters and CareLink workflow
    |- metrics, FHIR, and ML inference
    `- bounded scheduler/outbox poller
    |
    | private Railway network; DATABASE_URL reference
    v
Railway PostgreSQL
    |- append-only workflow events
    |- role/evidence projections
    |- scheduled actions and transactional outbox
    |- idempotency and callback receipts
    `- provider attempts, claims, leases, and scheduler state
```

The Railway project has a dedicated controlled launch environment and three named services: `web`, `api`, and `Postgres`. Both application services may have public HTTPS domains. PostgreSQL stays private and is reachable only from the API through a Railway reference variable such as `${{Postgres.DATABASE_URL}}`.

## Components and responsibilities

### Web service

**Technology:** React + TypeScript + Vite, deployed as a Railway static service from `frontend/`.

Responsibilities:

- public story and centrally configured pilot pricing without patient records on the public route;
- local role entry and `/access`, `/patient`, `/caregiver`, `/staff`, and `/transport` routes;
- generated OpenAPI client and generated boundary types;
- loading, conflict, validation, provider-pending, degraded, retry, empty, success, and post-reset presentation;
- Treatment Readiness Graph, event timeline, role workspaces, communication and transportation evidence, FHIR evidence, and staff-only priority explanation;
- presentation-only state such as focus, open panels, and reduced-motion preference.

`VITE_API_BASE_URL` contains the public `api` domain and is the only public cross-service address compiled into the frontend. No database or provider secret may use the `VITE_` prefix.

The browser sends no scenario, operator, provider, scheduler, or database credential. The branded role choice selects a synthetic projection and permitted demo interaction; it is not authentication and cannot protect confidential data between anonymous visitors. The launch database therefore contains controlled illustrative data only.

The frontend does not own workflow transitions, role authorization, caregiver filtering, provider success, scheduled work, or durable event state. The current reducer/local storage cannot remain a second launch authority.

### API service

**Technology:** a continuously running Node.js/TypeScript HTTP process on Railway, listening on `0.0.0.0:$PORT`.

Responsibilities:

- implement the paths and schemas in `contracts/openapi.yaml`;
- validate bodies, headers, sizes, scenario, actor role, action, idempotency key, and expected aggregate version;
- map domain failures to stable contract errors without leaking internal exceptions;
- verify Twilio and ElevenLabs signatures against the exact raw request body and canonical public URL before parsing or acting;
- return role-filtered projections rather than unrestricted aggregate state;
- enforce restrictive CORS, bounded rate limits, and fixed allowlists for consequential actions;
- run the bounded PostgreSQL-backed scheduler/outbox cycle;
- expose liveness/readiness diagnostics that do not reveal secrets or sensitive payloads.

Handlers remain thin. Workflow rules, projections, provider translations, evidence generation, and ML behavior belong in shared TypeScript application/domain modules. The service cannot use process memory as durable coordination and cannot rely on local runtime files surviving a redeploy.

The controlled launch starts with one API replica, sleeping disabled, and an automatic restart policy. Database claims and leases still make the scheduler safe if a restart overlaps, an operator invokes the tick endpoint, or a later deployment increases replicas.

### Controlled public demo boundary

The static `web` service cannot keep a shared secret. Embedding `ONCOREADY_SCENARIO_TOKEN` in JavaScript, a `VITE_` variable, local storage, a source map, or a generated client would publish it. CORS also cannot authenticate a caller: it constrains conforming browsers, not scripts or direct HTTP clients.

The API therefore uses operation-level trust classes:

| Class | Operations | Authentication | Consequence ceiling |
|---|---|---|---|
| Public synthetic read | finals role projection; metrics, FHIR, and priority evidence | None | Read fixed illustrative data only |
| Public synthetic mutation | readiness; work-item commands; CareLink request/commands | None | Append fixed-scenario database events/projections only; never authorize provider outbox work |
| Operator control | deterministic reset; queue SMS; queue voice | `X-OncoReady-Operator-Token` | Fixed-scenario reset or one fixed-recipient external intent, still subject to kill switches and allowlists |
| Provider callback | Twilio and ElevenLabs callback routes | Official provider signature over exact raw request | Record an allowlisted provider outcome only |
| Scheduler control | manual operations tick | `Authorization: Bearer <CRON_SECRET>` | Run the same bounded durable-work cycle as the internal poller |

`ONCOREADY_PUBLIC_DEMO_ENABLED` defaults false. When true, public routes are available only for the compiled-in finals scenario. Public requests may not select a scenario, phone number, provider, pickup/destination, script, model, or artifact. The request `scenario_id` remains in the command contract for event/idempotency consistency but must equal the finals UUID; `actor_role` is unverified demo provenance, not authorization. The server enforces route, aggregate type, current state, actor/action combination, expected version, idempotency, body size, and a per-origin/IP/operation rate limit.

Public mutation execution has a hard effect boundary: it may update PostgreSQL demo events, projections, internal SLA state, and idempotency receipts, but it cannot create or authorize an SMS/voice provider outbox row. Provider dispatch requires an operator-authenticated communication command recorded as the authorization source. Reset is also operator-only and is invoked with an operator script or direct API call before a rehearsal, never from the public bundle.

Exact CORS remains required for browser isolation and configuration hygiene, but denial of arbitrary scenarios/targets and denial of external effects are the security controls. Rate limiting and deterministic operator reset limit public-state vandalism; they are not represented as user authentication.

### Workflow and projection modules

Responsibilities:

- calculate T-7/T-3/T-1 outreach, business-day transportation cutoffs, owners, SLAs, escalation, appointment-change invalidation, and closure requirements;
- preserve patient text as inert data and split clinical, transportation, and callback work deterministically;
- enforce allowed transitions and expected aggregate versions;
- append governed events and update projections, schedules, and outbox rows in one database transaction;
- build patient, staff, caregiver, transport, graph, timeline, metrics, and evidence projections;
- rebuild or verify projections from ordered events.

Caregiver and transportation projections are explicit allowlists, not broad objects filtered by the client.

### Railway PostgreSQL

**Technology:** Railway-managed PostgreSQL with Git-tracked, vendor-neutral SQL migrations under the database implementation path approved by the orchestrator.

Required data classes:

- scenario and treatment configuration;
- immutable `workflow_events` with monotonic per-aggregate versions;
- work-item, communication, transportation, caregiver, metrics, scheduler, and evidence projections;
- scheduled actions and transactional outbox;
- idempotency records, provider attempts, callback receipts, claim tokens, leases, and retry state;
- deterministic launch seed and safe reset support;
- ML artifact/evaluation metadata, not arbitrary executable uploads.

Database constraints enforce aggregate ordering, unique idempotency/callback identities, fixed provider/scenario values, and closure evidence. Indexes are limited to aggregate replay, primary projection reads, due-work claims, and callback/idempotency lookup.

The API receives `DATABASE_URL` as a Railway reference to the private Postgres service. The browser never receives a database URL. A small application pool is sufficient for the initial single API replica; PgBouncer, HA, and public database networking are deferred until measured need or a separate reliability requirement justifies them.

Migrations run as a reviewed pre-deploy step or explicit release command using an advisory migration lock and a migration history table. Dashboard edits are never the only schema record. The retired platform-specific HTTP scheduler migration is not part of the Railway target and must not be applied there.

### Database-backed scheduler and outbox

The API process contains a lightweight poller. The timer only wakes the following bounded database operation; PostgreSQL owns due time, claims, retry state, and recovery:

1. On startup, wait for database readiness and current migrations before enabling the poller.
2. At a short fixed interval, use database time and attempt a transaction-scoped advisory lock for the launch scheduler.
3. Claim a bounded set of due `scheduled_actions` and `outbox` rows with `FOR UPDATE SKIP LOCKED`, a unique claim token, owner, attempt count, and lease expiry.
4. Commit dispatch intent and a provider-attempt record before crossing the provider boundary; do not hold a database transaction open during network I/O.
5. Invoke only enabled adapters with fixed targets and stable action identities.
6. Record a definitive result through the same command/event boundary. A timeout after possible provider acceptance becomes `outcome_unknown`.
7. Reconcile an unknown outcome through provider identity or signed callback when available; otherwise require manual recovery. Never resend merely because a lease expired.
8. Reclaim only work whose lease expired before a provider call or whose retry policy explicitly permits another attempt.

The advisory lock serializes claim cycles; durable row claims and provider action identities protect delivery after the claim transaction ends. Restarts are safe because due work remains in PostgreSQL and the next process catches up from database time.

`GET /api/v1/operations/tick?max_items=25` remains contractually available with opaque bearer authentication. On Railway it invokes the same bounded cycle for controlled operator/preflight use. It is not the normal schedule and no hosted cron or database-originated HTTP caller is required. `CRON_SECRET` is retained as the server-only compatibility name for that protected endpoint.

### Provider adapters and callbacks

- **Twilio messaging:** send only to the allowlisted team number; validate `X-Twilio-Signature` on the raw form request and exact external URL; handle consent, STOP/HELP, delivery, duplicate, retry, and ordering behavior.
- **ElevenLabs through Twilio:** initiate one bounded consented call; validate `ElevenLabs-Signature` on the raw body; accept only approved structured outcomes; keep transcript/audio retention disabled or minimized.
- **CareLink Partner Dispatch:** the product's persisted coordinator workflow for the fixed illustrative provider, with eligibility, outbound/return planning, offer, assignment, notification, acknowledgment, failure, backup, escalation, and completion.
- **Planned providers:** Uber Health and Lyft Concierge remain disabled metadata with no credentials, requests, callbacks, or active status.

Adapters translate provider payloads into governed domain commands/events. They cannot own workflow policy or close a dependency directly.

### Evidence and ML

- Operational metrics are projections of workflow events.
- TypeScript generates the FHIR R4 bundle. A pinned validator runs outside the request path and creates a report bound to the exact bundle hash. Runtime shows `Validated` only for an exact passing match.
- Offline Python owns LightGBM training, sigmoid calibration, SHAP evaluation, leakage/subgroup checks, and immutable export.
- TypeScript validates the artifact version/schema/hash and must match Python golden vectors. Missing, stale, malformed, or parity-failing artifacts produce `Score unavailable` while deterministic routing continues.
- Runtime code never executes arbitrary Python, loads pickle files, accepts uploaded models, or retrains inside the API service.

## Domain and event model

```text
Scenario
  `- TreatmentEncounter
       |- SignalSnapshot (T-7 / T-3 / T-1)
       |- ReadinessSubmission
       |    |- ClinicalWorkItem
       |    |- TransportationWorkItem -> TransportRequest
       |    `- CallbackWorkItem
       |- CaregiverGrant
       |- CommunicationAttempt
       `- EvidenceProjection

Command
  -> validate policy + expected version + idempotency
  -> append typed event(s)
  -> update projection(s), scheduled action(s), outbox row(s)
  -> commit atomically
```

Every event uses the governed envelope: event/schema identity, aggregate identity/type/version, event type and payload, occurred/recorded timestamps, actor/provenance, correlation/causation identifiers, and idempotency identity where applicable.

Key invariants:

- events append and never mutate during normal operation;
- stale aggregate versions conflict rather than overwrite;
- one idempotency key maps to one semantic result;
- provider receipt is not provider success, assignment is not notification, and notification is not acknowledgment;
- clinical and transportation work have independent owners, deadlines, dispositions, and closure evidence;
- transport closes only after the complete current outbound/return plan is acknowledged by Maria;
- appointment/provider failure invalidates stale dependent closure;
- caregiver output contains only explicitly granted transport logistics;
- ML state cannot create, suppress, or close work and cannot outrank an explicit barrier.

## Primary data flows

### Readiness and closure

```text
Maria submits readiness response
  -> API validates scenario/actor/version/idempotency
  -> domain preserves verbatim text and emits separate work events
  -> transaction commits events + projections + schedules/outbox
  -> staff/transport/patient read role-filtered projections
  -> human/provider commands append further events
  -> Maria acknowledges the complete current plan
  -> closure guards project continuity plan confirmed
```

### Scheduled external action

```text
approved command/event
  -> transactional outbox row
  -> internal poller claims bounded due work
  -> allowlist + kill-switch + provider configuration check
  -> provider attempt recorded with stable action identity
  -> provider request
  -> signed callback verified and deduplicated
  -> domain event + affected projections update
```

Initiation error, timeout, invalid callback, undelivered message, no-answer call, decline, cancellation, or provider outage remains failed, pending, or unknown and triggers only the approved fallback. It never records provider success.

### Deterministic reset

Reset is scenario-scoped and operator-authenticated. It is not callable by the public static application. It validates the privileged controlled action, suppresses all external-action creation, restores the fixed seed and projections, clears/reinitializes only governed launch scheduler/outbox/idempotency/callback state, and records technical reset evidence where required. Reset cannot send SMS, place a call, or create a transportation request.

## Interface authority and contract blockers

For LAUNCH-001, contracts remain mandatory:

- `contracts/openapi.yaml` is authoritative for HTTP paths, operation identifiers, request/response schemas, errors, expected-version conflicts, and idempotency semantics.
- `contracts/events/*.schema.json` is authoritative for workflow event envelopes and payloads.
- `.ai/tasks/LAUNCH-001/task.json` identifies the governed contract files.

The separate Railway static origin makes the current global scenario-token requirement undeployable without publishing a server secret. This is `CONTRACT_CHANGE_REQUIRED`; a contract specialist/orchestrator must reconcile `contracts/openapi.yaml` before frontend API integration. Architecture does not silently redefine the wire boundary.

Required OpenAPI delta:

1. Remove global `FinalsScenarioToken` security and its `X-OncoReady-Scenario-Token` scheme.
2. Add `OperatorControlToken`, an API-key header named `X-OncoReady-Operator-Token`.
3. Set `security: []` explicitly on finals projection; readiness; work-item commands; CareLink request/commands; metrics; FHIR; and priority operations. Their descriptions must say fixed illustrative scenario and, for mutations, database-only demo effect.
4. Require `OperatorControlToken` only on reset, queue-SMS, and queue-voice operations. Retain `CronSecret` only on manual tick and the official signature header contracts on provider callbacks.
5. Add a `FinalsScenarioId` string schema with `const: 11111111-1111-4111-8111-111111111111`, and reference it from command `scenario_id`. Keep `actor_role` but describe it as claimed demo provenance; narrow readiness to `patient`, reset/communications to `staff`, create-transport to `staff | transport_coordinator`, and keep action-specific role checks for work-item/transport commands.
6. Constrain the public readiness command to `channel: web`; SMS/voice evidence enters only through authenticated provider callbacks. Remove server-owned plan fields from the public create-transport request body except `work_item_id`; the server derives arrival window, cutoff, funding, service area, mobility, outbound/return plan, and notification permission from the fixed seed/current projection.
7. Remove `401` from anonymous demo operations, retain `403` for fixed-scenario/action policy, and declare `429` consistently on every public mutation. Operator operations retain `401`, `403`, version/idempotency errors, and rate limiting.
8. Preserve all paths, methods, command receipts, expected-version/idempotency behavior, callback envelopes, and event schemas. No event-contract change is required.

Backend contract implementation must apply authorization before body-driven behavior, derive the finals scenario server-side, reject a nonmatching body value, apply the route/resource/action matrix, and make public commands incapable of producing provider outbox authorization. Frontend contract implementation must generate a client with no operator-token parameter, call only public operations, keep operator controls out of the public journey, and use `VITE_API_BASE_URL` as its only deployment value.

## Trust boundaries and controls

| Boundary | Material risk | Required control |
|---|---|---|
| Browser -> public demo API | Forged role/action, state vandalism, injection, oversized/rapid requests, stale writes | Fixed scenario, database-only effect ceiling, route/resource/action allowlists, schema validation, parameterized SQL, size/rate limits, exact CORS, versions, idempotency |
| Local role entry -> role projection | Branded buttons mistaken for identity or confidentiality; overbroad response | Illustrative data only, no PHI, server allowlist projections, truthful presentation boundary; role is unverified demo context |
| Operator -> reset/provider initiation | Leaked credential, destructive reset, SMS/voice abuse | Server-only operator token, no browser exposure, fixed target, bounded rate, kill switches, auditable authorization source |
| Patient text -> staff/logs | Script injection or unnecessary sensitive logging | Inert rendering, no raw HTML, length bounds, verbatim human review, minimized/redacted logs |
| Patient/staff -> caregiver/transport | Clinical/internal/model leakage | Separate server schemas plus negative API/DOM/accessibility/search/export/log tests |
| API -> Railway PostgreSQL | Overprivilege, partial state, connection exhaustion | Private `DATABASE_URL`, least privilege, small pool, transactions, constraints, parameterized queries |
| Scheduler loop -> providers | Duplicate, arbitrary, or uncertain consequential action | DB advisory lock, bounded claims/leases, fixed targets, kill switches, stable identity, reconcile-before-retry |
| Provider callback -> domain | Forged, replayed, duplicate, or out-of-order outcome | Official raw signature/HMAC verification, receipt uniqueness, replay policy, transition/version guards |
| Reset -> database/outbox | Destructive misuse or external action during reset | Operator-only scenario-scoped privilege, fixed seed, external effects suppressed, no production target |
| ML/FHIR artifact -> claim | Stale or mismatched evidence; false clinical/interoperability claim | Immutable hash/version, parity tests, safe-unavailable state, exact-hash validator report |
| Railway variables/logs -> operator/repository | Credential exposure | Server-only sealed variables, no `VITE_` secrets, ignored local env, redaction, presence-only checks |

The task remains **HIGH** risk because it exposes signed webhooks, privileged reset/tick operations, role-dependent projections, and real bounded communication actions in a clinical context. Independent security review remains mandatory on the exact verified commit.

## Failure modes and recovery

| Failure | Product behavior | Recovery/evidence |
|---|---|---|
| API/database unavailable | No optimistic success | Restore health; transaction evidence proves whether a command committed |
| API process restarts | Due work remains durable | Railway restart plus database-time catch-up and stale-lease recovery |
| Stale aggregate version | Show conflict; do not overwrite | Reload projection and issue a still-valid command with a new idempotency key |
| Duplicate command/callback | Replay prior semantic result; no duplicate event | Idempotency or callback-receipt lookup |
| Overlapping poll/manual tick | Claims remain single-owner | Advisory lock plus `SKIP LOCKED`, tokens, and leases |
| Process dies before provider call | No provider effect | Expired pre-call claim may retry within policy |
| Process dies after possible acceptance | Show `outcome_unknown`; do not resend | Provider identity/callback reconciliation or manual recovery |
| SMS undelivered/STOP | Barrier unresolved; prohibited SMS stops | Approved voice/manual path respecting opt-out |
| Voice no-answer/provider error | Callback need remains open | Human callback or disclosed replay; no fabricated answer |
| Transport decline/cancel/stale/return pending | Transportation remains at risk | One bounded backup or navigator escalation |
| Appointment changes | Prior plan/closure becomes stale | Recompute work and require current acknowledgment |
| FHIR validation unavailable/mismatch | Do not show `Validated` | Preserve failure and validate exact current bundle |
| ML artifact unavailable/mismatch | Show `Score unavailable` | Deterministic cadence continues |
| Railway deployment/provider outage | No live-success claim | Restore/redeploy and use truthful manual recovery |

## Deployment boundary

Minimum launch infrastructure:

- one Railway project with an explicitly selected controlled environment;
- `web` service from the Vite frontend with SPA deep-link fallback and a public HTTPS domain;
- `api` service from the repository root so it can use `api/`, `packages/`, contracts, database migrations, and ML artifacts; it has a public HTTPS domain, `/health` check, one replica, sleeping disabled, and restart-on-failure/always behavior;
- private Railway `Postgres` service; no browser access and no public TCP proxy for normal operation;
- server-only Railway variables for database reference, operator/tick tokens, exact origins, provider credentials, fixed recipient/location/provider values, rate limits, and kill switches, plus a non-secret fail-closed public-demo enablement flag;
- no legacy hosting resource, database-extension scheduler, Railway Cron, cache, queue, or second backend runtime.

Provider callbacks must use the stable public API origin. Changing that origin requires updating Twilio and ElevenLabs settings and re-running exact-URL signature tests before actions are enabled.

## Implementation sequence

1. Orchestrator reconciles `docs/PROJECT.md`, `.ai/project.json`, `docs/features/LAUNCH-001.md`, task acceptance/scope, roadmap/sprint references, OpenAPI server metadata, and deployment verification to Railway.
2. Database specialist ports the portable workflow schema/seed to the approved vendor-neutral migration path and removes the retired HTTP scheduler migration from the target sequence.
3. Contract specialist/orchestrator replaces global scenario-token security with the operation-level public-demo/operator/provider/scheduler scheme above and validates the generated boundary.
4. Backend specialist implements the long-running API process, route-class security, public database-only effect ceiling, shared domain modules, private PostgreSQL access, internal poller, protected manual tick, raw callback verification, and `/health` behavior against governed contracts.
5. Frontend specialist completes the existing design gate and migrates browser authority to the generated public client using the Railway API origin, without any server secret.
6. Integrate one vertical path before enabling providers: operator reset -> public readiness -> split work -> projections -> acknowledgment -> evidence; initiate any provider outreach separately through an operator-authenticated action.
7. Enable Twilio and ElevenLabs separately only after signed callback, allowlist, idempotency, public-no-external-effect, and failure-path checks pass.
8. Run FULL independent tests, exact-commit verification, focused HIGH-risk security review, final review, and controlled rehearsals.

## Verification expectations

Verification covers contract/schema validation and generated-client freshness; proof that the browser bundle contains no operator token; anonymous fixed-scenario reads and allowlisted database-only mutations; rejection of arbitrary scenarios/actions and public external effects; operator authentication for reset/provider initiation; vendor-neutral migration reset/seed and constraints; event ordering, concurrency, idempotency, projection consistency; scheduler restart/overlap/lease/outbox recovery; raw-body callback authentication/replay/order; fixed provider targets and kill switches; CareLink failure/backup; reset with zero effects; complete cross-role browser journey; caregiver negative disclosure; responsive/keyboard/reduced-motion behavior; exact-hash FHIR validation; ML reproducibility/parity/fallback; Railway web/API routing, SPA deep links, health/restart behavior, private database wiring, and network-disabled recovery.

Required preflight evidence includes the exact Railway project/environment/service IDs, successful `web` and `api` deployments, public domains, private `DATABASE_URL` reference, current migrations, bounded database pool, fresh scheduler heartbeat with no stuck claims, callback origins, provider switches/allowlists, FHIR validator availability, and ML artifact compatibility. A green service health check is not provider-success evidence; only authenticated governed outcomes are.
