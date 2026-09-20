# OncoReady System Architecture

## System summary

OncoReady is a treatment-continuity orchestration product. It identifies a recoverable threat before oncology treatment, creates separately owned clinical and practical work, coordinates communication and transportation recovery, and proves whether the complete continuity plan closed.

The completed CORE-001 experience used one React application, a deterministic reducer, synthetic fixtures, and browser persistence. LAUNCH-001 retains that presentation foundation but changes the launch authority: browser state is no longer the business record. TypeScript Vercel Node.js Functions validate commands, enforce workflow policy, append immutable events, produce role-filtered projections, handle provider webhooks, and coordinate bounded external actions against Supabase PostgreSQL.

The launch environment is deliberately finals-scoped. It supports controlled illustrative data and working integrations; it is not production identity, PHI, hospital connectivity, clinical validation, or a claim of production scale.

## Architecture principles

- Optimize for the complete early-signal-to-acknowledged-plan journey and its deterministic recovery path.
- Keep one causal append-only event history as the durable source for projections, metrics, evidence, and external-action state.
- Accept state changes only through server-side commands with validation, actor/action policy, expected aggregate version, and idempotency.
- Preserve original patient words and human clinical authority. ML may order supportive outreach but cannot route, downgrade, diagnose, clear, cancel, or close treatment work.
- Derive each role's response on the server and minimize before serialization; hiding fields in React is not authorization or privacy enforcement.
- Treat provider initiation, callback receipt, patient notification, patient acknowledgment, and closure as distinct facts.
- Make stateless function concurrency safe through PostgreSQL transactions, constraints, locks, durable claims, and leases.
- Use PostgreSQL for persistence, scheduling, outbox, locking, and deduplication without Redis, Kafka, Celery, microservices, or a continuously running worker.
- Make external failure visible and recoverable; never silently replace a failed live action with fabricated success.

## Runtime topology

```text
React + TypeScript + Vite on Vercel
public, access, patient, caregiver, staff, transport
             │
             │ generated OpenAPI client over HTTPS
             ▼
TypeScript Vercel Node.js Functions
  ├─ command/query functions and role/action policy
  ├─ Twilio, ElevenLabs, and CareLink webhook functions
  ├─ provider initiation adapters
  ├─ metrics and FHIR evidence functions
  └─ versioned ML inference/explanation function
             │
             │ pooled transactional connection
             ▼
Supabase PostgreSQL
  ├─ append-only workflow events
  ├─ current role/evidence projections
  ├─ scheduled actions + transactional outbox
  ├─ idempotency keys + callback receipts + leases
  └─ Supabase Cron + pg_net
             ▲
             │ HTTPS every minute; bearer-authenticated
             │
GET /api/v1/operations/tick on Vercel Hobby
```

There is one shared TypeScript domain/application package, not a set of services. Each function is short-lived and stateless between invocations. Supabase Cron is only the wake-up trigger: the protected endpoint attempts a PostgreSQL advisory lock and claims bounded due work, so concurrent or retried HTTP invocations exit or resume from durable state rather than becoming parallel scheduler authority.

## Components and responsibilities

### Frontend

**Technology:** React + TypeScript + Vite, deployed on Vercel using the established design system.

Responsibilities:

- public product story and centrally configured pricing without a patient record preview;
- local branded role entry and `/access`, `/patient`, `/caregiver`, `/staff`, and `/transport` routes;
- generated OpenAPI client and generated boundary types;
- role-appropriate loading, conflict, validation, provider-pending, degraded, retry, empty, success, and reset states;
- Treatment Readiness Graph, causal timeline, role workspaces, communication/transport evidence, FHIR report, and staff-only priority explanation;
- presentation-only state such as open panels, focus, and reduced-motion preference.

The frontend does not own workflow transitions, role authorization, caregiver filtering, provider success, or durable event state. The existing reducer/local storage cannot remain a competing launch authority.

### Vercel function boundary

**Technology:** TypeScript Vercel Node.js Functions with contract-aligned schemas and shared domain/application modules.

Responsibilities:

- validate request bodies, headers, size, scenario, actor role, action, idempotency key, and expected aggregate version;
- expose command/query/webhook operations defined only by `contracts/openapi.yaml`;
- map domain failures to stable contract errors without leaking internal exceptions;
- verify provider webhooks against the exact raw request before parsing or acting;
- return role-filtered projections rather than unrestricted aggregate state;
- enforce restrictive CORS and bounded route-level rate limiting;
- acquire a bounded pooled Supabase PostgreSQL connection and finish transaction/request work inside function duration limits.

Handlers stay thin. Workflow, projection, provider, FHIR, and ML behavior belongs in shared modules. Functions cannot rely on in-memory locks, local files written at runtime, timers, background work after the response, sticky sessions, or warm-instance state.

### Workflow and projection modules

Responsibilities:

- calculate T−7/T−3/T−1 cadence, business-day transport cutoffs, owners, SLAs, escalation, appointment-change invalidation, and closure requirements;
- preserve patient verbatim input as inert data and split clinical, transportation, and callback work deterministically;
- enforce allowed transitions and expected aggregate versions;
- append events and update affected projections/schedules/outbox rows in one transaction;
- build separate patient, staff, caregiver, transport, graph, timeline, metrics, and evidence projections;
- rebuild or verify projections from ordered event history.

Caregiver and transport projections are explicit allowlists, not broad objects with client-side field hiding.

### Persistence

**Technology:** Supabase PostgreSQL with timestamped Git-tracked SQL migrations and a Vercel-compatible pooled transaction connection.

Required data classes:

- scenario and treatment configuration;
- immutable `workflow_events` with per-aggregate monotonic versioning;
- current work-item, communication, transport, caregiver, metric, scheduler, and evidence projections;
- scheduled actions and transactional outbox;
- idempotency records, provider attempts, callback receipts, claim leases, and retry state;
- deterministic finals seed and safe reset support;
- ML artifact/evaluation metadata, not arbitrary uploaded executable artifacts.

Database constraints enforce unique idempotency/callback identifiers, aggregate ordering, the configured provider/scenario, and required closure evidence. Indexes are limited to aggregate replay, primary projection reads, due work/outbox claims, and callback/idempotency lookup. Schema changes are migrations; dashboard edits or direct tool mutations are never the only record.

### Supabase Cron trigger and outbox tick

Supabase Cron (`pg_cron`) runs once per minute and uses `pg_net` to invoke the existing Vercel `GET /api/v1/operations/tick?max_items=25` endpoint. Each invocation:

1. sends `Authorization: Bearer <secret>` over HTTPS and the Vercel function verifies the bearer value plus external-action configuration;
2. attempts a scenario-specific PostgreSQL advisory lock;
3. atomically claims a bounded batch of due scheduled/outbox rows with row locking and a lease;
4. records dispatch intent/attempt before crossing a provider boundary;
5. invokes only enabled adapters with fixed targets and stable action identifiers;
6. records a definitive result through the same command/event boundary, then releases/completes the claim;
7. exits before the function duration budget rather than opening a long poll or background loop.

Only one tick holds scheduler authority at a time, even if Supabase Cron, `pg_net`, an operator, or the network retries or overlaps invocations. Stale leases are recoverable. If a function fails after a provider may have accepted an action but before local confirmation, that action enters `outcome_unknown`: the adapter reconciles through a provider identifier/callback when supported, otherwise it requires manual recovery. It is never blindly resent merely because a lease expired.

This tick replaces a continuously running worker. Vercel Hobby hosts the frontend and functions; it has no schedule configured. The human project operator owns one generated opaque secret and stores the identical value in two approved locations: Vercel's server-only `CRON_SECRET` for verification and Supabase Vault as `oncoready_cron_secret` for invocation. The canonical tick URL is stored in Vault as `oncoready_tick_url` so no secret or environment-specific origin is committed. The database specialist owns a timestamped migration that enables `pg_cron`/`pg_net`, defines a least-privilege invoker that reads only those named Vault entries, and installs the named one-minute job; the operator provisions/rotates Vault values and activates or pauses the job after preflight. The job, invoker, or logs must not print the authorization header.

The Supabase Free project contains controlled illustrative data only. Its 500 MB limit is sufficient for the bounded finals scenario, but growth is checked during preflight and event/provider evidence retention remains deliberately bounded. The plan may pause after inactivity and supplies no automated backups. Git-tracked migrations plus deterministic seed/reset are therefore the recovery authority, not dashboard state. Before rehearsal, verification, or review, preflight must confirm the project is active, migrations and projections are current, both Vault entries resolve, the named Cron job is active at one-minute cadence, the latest `pg_net` response is successful, and an authenticated tick reaches the current canonical Vercel origin. After any pause, resume the project, wait for database health, rerun those checks and deterministic reset/seed verification, then enable external actions.

### Provider adapters and webhooks

- **Twilio messaging:** server-only send to the allowlisted team number; official raw-request signature validation for inbound/status webhooks; consent, STOP/HELP, delivery, retry, and order handling.
- **ElevenLabs through Twilio:** one bounded, consented call; HMAC-authenticated post-call/failure webhooks; allowlisted structured outcomes only; transcript/audio retention off by default.
- **CareLink Partner Dispatch:** only active transport adapter; fixed provider boundary for eligibility, outbound/return planning, offer, assignment, notification, acknowledgment, failure, backup, escalation, and completion.
- **Planned providers:** Uber Health and Lyft Concierge may be represented only as disabled registry metadata. They have no finals credentials, network actions, webhooks, or active status.

Adapters translate vendor-specific requests/outcomes to governed commands/events. They do not own workflow policy or close dependencies directly.

### Evidence and offline/runtime ML split

- Operational metrics are deterministic projections of workflow events.
- TypeScript generates the FHIR R4 bundle from the controlled scenario. A pinned official validator runs in verification/freeze tooling outside the request path and produces an inspectable report bound to the exact bundle content hash. Runtime displays `Validated` only when the current bundle hash has a passing report; otherwise it displays pending/failed/unavailable.
- Offline Python owns training data generation, patient-separated chronological partitions, LightGBM training, sigmoid calibration, SHAP evaluation, leakage/subgroup/acceptance tests, and export.
- The immutable export contains a format/version identifier, tree ensemble, calibrator coefficients, ordered feature schema, missing-value semantics, explanation/background metadata, generator seed, training timestamp, evaluation manifest/hash, and Python golden vectors.
- TypeScript runtime validates the full artifact set, computes raw margin, calibrated probability, and the approved SHAP-compatible explanation, then checks version/schema compatibility. Python/TypeScript parity fixtures define numeric tolerances.
- Missing, stale, malformed, parity-failing, or schema-incompatible artifacts produce `Score unavailable`; universal cadence and deterministic routing continue.

The runtime never executes arbitrary Python, loads a pickle, accepts a user-supplied model, or retrains inside a Vercel Function.

## Domain and event model

```text
Scenario
  └─ TreatmentEncounter
       ├─ SignalSnapshot (T−7 / T−3 / T−1)
       ├─ ReadinessSubmission
       │    ├─ ClinicalWorkItem
       │    ├─ TransportationWorkItem → TransportRequest
       │    └─ CallbackWorkItem
       ├─ CaregiverGrant
       ├─ CommunicationAttempt
       └─ EvidenceProjection

Command
  → validate policy + expected version + idempotency
  → append typed event(s)
  → update projection(s), scheduled action(s), outbox row(s)
  → commit atomically
```

Each event carries the governed envelope: event/schema identity, aggregate identity/type/version, event type and typed payload, occurred/received timestamps, actor/provenance, correlation and causation identifiers, and idempotency identity where applicable.

Key invariants:

- events are appended, never updated or deleted during normal operation;
- aggregate versions are monotonic and stale commands conflict rather than overwrite;
- one idempotency key maps to one semantic result;
- provider receipt is not provider success, assignment is not patient notification, and notification is not acknowledgment;
- clinical and transport work have independent owners, deadlines, dispositions, and closure evidence;
- transport cannot close until the current outbound/return plan is confirmed and Maria acknowledges it;
- appointment or provider failure invalidates stale dependent closure;
- caregiver projection contains only explicitly granted transport logistics;
- ML state cannot create, suppress, prioritize over an explicit barrier, or close work.

## Primary data flows

### Readiness and closure

```text
Maria submits readiness response
  → function validates scenario/actor/version/idempotency
  → domain module preserves verbatim text and emits separate work events
  → transaction commits events + role projections + schedule/outbox
  → staff/transport/patient views read role-filtered projections
  → human/provider commands append further events
  → Maria acknowledges the complete current plan
  → closure guards project continuity plan confirmed
```

### External action and webhook

```text
approved command/event
  → transactional outbox row
  → protected cron tick claims row
  → allowlist + kill-switch + provider config check
  → provider request with stable action identity
  → attempt/provider receipt event
  → signed webhook verified on raw request
  → webhook deduplicated and translated to domain command/event
  → affected projections update
```

An initiation error, timeout, invalid webhook, undelivered message, no-answer call, decline, cancellation, or provider outage records failure/pending/unknown state and triggers only the approved retry/manual fallback. It never records a successful provider outcome.

### Deterministic reset

Reset is a controlled scenario operation. It authenticates the scenario action, disables external-action creation for the reset transaction, restores the fixed seed and projections, invalidates finals scheduler/outbox/idempotency/webhook state as defined by the contract and migrations, and records technical reset evidence separately when needed. Reset cannot send SMS, start a call, or create a transport request.

## Interface authority

For LAUNCH-001, formal contracts are mandatory:

- `contracts/openapi.yaml` is authoritative for HTTP paths, operation identifiers, command/query/webhook shapes, shared schemas, errors, version conflicts, and idempotency semantics.
- Registered `contracts/events/*.schema.json` files are authoritative for the workflow event envelope and payloads.
- `.ai/tasks/LAUNCH-001/task.json` identifies the exact governed contract files.

Architecture prose and implementation may explain or consume these contracts but cannot redefine wire shapes. Frontend uses generated client/types; function handlers validate at the boundary; migrations may add internal projection fields without changing public event meaning. A mismatch requires `CONTRACT_CHANGE_REQUIRED` and orchestrator-controlled reconciliation before dependent work continues.

## Trust boundaries and controls

| Boundary | Material risk | Required control |
|---|---|---|
| Public browser → Vercel Functions | Forged role/action, injection, oversized/rapid requests, stale writes | Controlled scenario token, actor/action allowlist, schema validation, parameterized queries, size/rate limits, CORS, expected versions, idempotency |
| Local role entry → role projection | Branded buttons mistaken for authentication; overbroad data returned | Finals fixture data only, no production/real PHI, server-selected allowlisted projections, truthful product/presenter boundary |
| Patient free text → staff rendering/logs | Script injection or unnecessary sensitive logging | Treat as inert text, no raw HTML, bounded length, preserve verbatim for human review, redact/minimize logs |
| Patient/staff state → caregiver/transport | Clinical or internal detail leakage | Server-side explicit allowlists; negative tests across response, DOM, accessibility, search, export, outbound content, and logs |
| Vercel Functions → Supabase | Connection exhaustion, overprivileged SQL, partial state | Supported pooler, strict connection/time budgets, least-privilege credentials, parameterized SQL, transactions, constraints |
| Supabase Cron/`pg_net` → Vercel tick | Vault exposure, forged invocation, overlap, retry, stale origin, or cadence drift | Named Vault entries, bearer authentication, least-privilege invoker, HTTPS canonical origin, PostgreSQL advisory lock, durable claims/leases, bounded batches, cadence/response preflight |
| Functions → Twilio/ElevenLabs/CareLink | Consequential action to arbitrary target; duplicate/uncertain send | Server-only credentials, fixed recipient/provider/pickup/destination, consent, kill switches, stable action identity, reconcile-before-retry |
| Provider webhook → domain | Forged, replayed, duplicate, or out-of-order outcome | Official raw-request signature/HMAC verification before parse, receipt uniqueness, replay policy, transition/version guard |
| Reset/reseed → persistence/outbox | Destructive misuse or external action during reset | Controlled finals token/action, bounded scenario transaction, external actions disabled, deterministic proof, no production target |
| ML/FHIR artifact → product claim | Cross-language mismatch, leakage, stale evidence, false clinical/interoperability claim | Immutable version/hash manifest, Python/TypeScript golden vectors, held-out/leakage gates, safe-unavailable state, exact-hash validator evidence |
| Secrets/logging → repository/operator | Credential exposure | Vercel server-only environment plus Supabase Vault for the shared tick secret, ignored local env, presence checks without values, redacted logs/reports/screenshots |

The task is HIGH risk because it performs external communication/transport actions and exposes public webhooks, cron, reset, and role-dependent boundaries in a clinical context. A dedicated security review is mandatory on the exact verified integrated commit.

## Failure modes and recovery

| Failure | Product behavior | Recovery/evidence |
|---|---|---|
| Function/database unavailable | No optimistic success; retain only a clearly unsent draft when safe | Retry after health restoration; transaction evidence proves whether command committed |
| Stale aggregate version | Show conflict/refresh state; do not overwrite | Reload projection and submit a still-valid explicit command with a new idempotency key |
| Duplicate command/webhook | Return prior semantic result; append no duplicate business event | Idempotency/webhook receipt lookup |
| Out-of-order webhook | Keep current valid state; record/ignore or park per contract | Later valid webhook or manual reconciliation; no state regression |
| Overlapping/retried cron | Non-lock holder exits; claimed work remains durable | Advisory lock plus row claim/lease evidence |
| Tick dies before provider call | No provider effect; lease becomes eligible for bounded retry | Durable dispatch intent and attempt state |
| Tick dies after possible provider acceptance | Show outcome unknown; do not blindly resend | Provider identifier/webhook reconciliation or manual recovery |
| SMS undelivered/STOP | Barrier remains unresolved; no prohibited follow-up SMS | Approved voice/manual path, respecting opt-out |
| Voice no-answer/provider error | Callback need remains open | Manual callback or deterministic replay state; no fabricated answer |
| CareLink decline/cancel/unavailable/stale/return pending | Transport blocker reopens/remains at risk | One controlled backup activation or navigator escalation |
| Appointment changes | Old cutoff, transport assignment, and closure evidence become stale | Recompute dependent work and require current plan acknowledgment |
| FHIR validator fails/unavailable/hash mismatch | Do not show `Validated` | Preserve report/failure and validate exact current artifact |
| Model artifact missing/stale/incompatible/parity-failing | Show `Score unavailable`, never low risk | Deterministic cadence/routing continues; repair immutable artifact set |
| Network disabled | No live-success claim | Deterministic/manual recovery journey remains complete and distinguishable |
| Reset interrupted | Scenario is not reported ready until seed/projections verify | Transactional reset or rerun to known state; never dispatch external work |

## Infrastructure and deployment boundary

The minimum launch environment contains:

- one Vercel project serving the React/Vite build and Node.js Functions with deep-link rewrites;
- one Supabase Free development/finals PostgreSQL project containing controlled illustrative data only, with the accepted 500 MB, possible inactivity-pause, and no-automated-backup constraints;
- one protected Supabase Cron job using `pg_net` to invoke the bounded Vercel tick once per minute;
- public HTTPS Twilio, ElevenLabs, and CareLink webhook functions;
- server-only Vercel environment variables for the scenario token, cron secret, allowed origins, pooled database connection, provider credentials, fixed recipient/location/provider, limits, and kill switches;
- a pinned FHIR validator in verification/freeze tooling and a fixed versioned ML runtime artifact set.

Do not introduce FastAPI, a second application service, containers, IaC, Redis, Kafka, Celery, service mesh, microservices, or a production observability platform unless a separately approved requirement earns them. Human-controlled production deployment and any real-data environment remain outside LAUNCH-001.

## Migration from the CORE frontend authority

1. Freeze the governed HTTP/event contracts and generate frontend boundary client/types.
2. Add migrations, deterministic seed/reset, event append, projections, scheduled actions, outbox, idempotency/webhook receipts, and claim leases.
3. Implement shared TypeScript domain modules and Vercel command/query/webhook/cron functions against those contracts.
4. Introduce a frontend API state adapter and route shell; move one acceptance path at a time from reducer commands to API commands.
5. Remove local storage/reducer state as launch authority once every role projection and reset path is API-backed. Browser storage may retain only non-sensitive presentation preferences or an explicitly unsent draft.
6. Verify projection consistency, cron overlap/recovery, deterministic reset, and no-external-action reset before enabling provider kill switches.

No production-data backfill is required. Existing CORE-001 browser data is synthetic and is not migrated into PostgreSQL; the fixed launch seed replaces it.

## Accessibility, performance, and presentation constraints

- Preserve semantic structure, full keyboard operation, visible focus, large targets, sufficient contrast, and text/icon cues so state is never color-only.
- Reduced motion preserves all workflow meaning without interaction-blocking animation.
- Patient/access surfaces work at mobile widths; staff/transport evidence surfaces remain usable on presentation laptops.
- Polling/refetch is bounded and visibility-aware; provider-pending UI cannot block navigation or duplicate commands.
- Keep function bundles and dependencies narrow, avoid per-request ML training/validator startup, and bound DB connections, query count, claim batch, payload size, and runtime.
- The frontend specialist owns exact layout, typography, color, motion, and component treatment through the design gate.
- The public surface contains no patient record and makes no production-auth, hospital-connectivity, FHIR-writeback, clinical-validation, compliance, or autonomous-decision claim.

## Observability and evidence

The append-only event history, provider attempt/webhook records, outbox state, cron tick/lease evidence, projection-version checks, FHIR validator report, and ML artifact/evaluation manifest are primary evidence.

Use structured logs with correlation/event/aggregate identifiers, function/route/provider status classes, latency, retry count, cold-start/tick batch context, and redacted error detail. Do not log secrets, authorization values, full patient free text, unnecessary phone/location data, voice transcripts, or audio. Preflight reports configuration presence and webhook reachability without values.

Required health/preflight evidence includes Vercel deployment/rewrites, active Supabase project status, connectivity/migration state/pool behavior, database size below the Free-plan limit, named Vault-entry presence without values, Supabase Cron job/cadence and latest `pg_net` response, tick authentication at the canonical origin, webhook origin, adapter enabled/disabled and kill-switch state, pinned FHIR validator availability, and ML artifact compatibility. A green health check is not provider-success evidence; only governed outcomes are.

## Verification architecture

LAUNCH-001 uses FULL independent testing because durable state, privacy projections, serverless concurrency, external actions, webhooks, interoperability evidence, and cross-language ML artifacts cross multiple trust boundaries.

Verification covers contract/schema validation and generated-client freshness; deterministic database reset/seed and constraints; event ordering, concurrency, idempotency, projection rebuild/consistency; cron authentication/overlap/lease/outbox recovery; raw-body webhook authentication/replay/order; provider allowlists/kill switches; CareLink failure and backup; reset with zero external actions; the complete cross-role browser journey; caregiver negative disclosure; responsive/keyboard/reduced-motion behavior; exact-hash pinned FHIR validation; ML reproducibility/leakage/calibration and Python/TypeScript parity/fallback; Vercel production routing/build; and network-disabled recovery.

After integration, independent FULL testing runs first. Repository verification binds evidence to the integrated commit. The required focused security review then approves that exact verified commit before final product/engineering review.

## Deliberate non-goals

- No production auth/authorization or real-data tenancy is inferred from the finals scenario token and actor/action policy.
- No autonomous clinical or treatment decision is permitted.
- No active Uber Health or Lyft Concierge integration exists.
- No valid FHIR bundle is represented as Epic/Ochsner connectivity.
- No project-controlled model is represented as clinically validated, causal, or an eligibility decision.
- No persistent server, distributed worker, event-sourcing framework, broker, cache, microservice split, or speculative scale layer is added.
