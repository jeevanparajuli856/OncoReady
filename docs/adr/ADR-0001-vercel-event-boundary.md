# ADR-0001 — Vercel Function Event Boundary and Idempotent Supabase Cron Tick

## Status

Accepted; scheduler amended 2026-09-20

## Context

CORE-001 proved the treatment-readiness journey inside one React application using a deterministic reducer, synthetic fixtures, and browser persistence. LAUNCH-001 must make the same cross-role journey durable and inspectable while adding scheduled outreach, independently implemented frontend/backend/database components, signed provider webhooks, consequential SMS/voice/transport actions, event-derived metrics, FHIR evidence, and versioned ML inference.

Keeping browser state authoritative would allow role views to drift, expose privacy filtering to client manipulation, lose provider/webhook state across refresh, and make external-action idempotency and audit evidence unreliable. A continuously running server/worker or distributed broker would add a separate deployment shape when the product is already deployed on Vercel. Stateless functions, however, require explicit handling for concurrency, duration, connection use, cron overlap, and the failure window around external calls.

## Decision

Adopt a React → TypeScript Vercel Node.js Functions → Supabase PostgreSQL launch boundary:

1. React + TypeScript + Vite remains the presentation layer and consumes a client/types generated from the governed OpenAPI contract. It owns presentation state only.
2. TypeScript Vercel Node.js Functions are the authoritative command, policy, projection, webhook, provider-adapter, FHIR, and ML-inference boundary. They enforce scenario/actor/action policy, input validation, expected aggregate versions, idempotency, and role-filtered serialization.
3. Supabase PostgreSQL stores an append-only workflow event stream as the durable business record plus rebuildable/read-optimized projections, scheduled actions, a transactional outbox, webhook receipts, claim leases, provider attempts, and idempotency records.
4. A command appends event(s) and updates affected projections, schedules, and outbox rows in one database transaction through a Vercel-compatible pooled connection.
5. Supabase Cron (`pg_cron`) uses `pg_net` once per minute to call the existing authenticated, bounded, idempotent Vercel `GET /api/v1/operations/tick` endpoint. Vercel Hobby hosts the application and does not own the schedule. A PostgreSQL advisory lock permits one active tick authority; durable row claims and leases protect retries and recovery.
6. The tick records dispatch intent before an external call and records the definitive outcome through the same event boundary. If execution stops after possible provider acceptance, the state becomes outcome-unknown and must be reconciled or handled manually rather than blindly resent.
7. Provider-specific behavior is isolated behind narrow adapters/webhook functions. Twilio messaging, ElevenLabs-through-Twilio voice, and CareLink Partner Dispatch are enabled only by server configuration. Uber Health and Lyft Concierge remain disabled planned adapters with no credentials or network behavior.
8. Every live external state shown in the product requires a corresponding authenticated provider outcome. Deterministic replay/manual recovery may preserve the journey when a provider fails, but cannot emit or present a live-provider success.
9. Reset is a scenario-scoped deterministic reseed that cannot enqueue or perform an external action.
10. LightGBM training, sigmoid calibration, SHAP evaluation, and leakage/subgroup tests run offline in Python. A reviewed immutable artifact export supplies trees, calibrator, feature schema, explanation metadata, manifest/hash, and golden vectors to TypeScript runtime inference/explanation. Any incompatibility returns `Score unavailable`.
11. Do not add FastAPI, a continuously running worker, Redis, Kafka, Celery, a general workflow engine, microservices, or a separate event-store product for LAUNCH-001.

The governed interfaces are `contracts/openapi.yaml` and the LAUNCH-001 event JSON schemas registered in the task. Architecture prose and implementation cannot silently redefine them.

The tick keeps the contract's bearer authentication. The human project operator owns and rotates one opaque value stored as Vercel's server-only `CRON_SECRET` and the Supabase Vault entry `oncoready_cron_secret`; the canonical endpoint URL is stored separately as `oncoready_tick_url`. A timestamped database migration enables `pg_cron`/`pg_net`, defines the restricted Vault-backed invoker, and installs the named one-minute job without embedding either value. Missing Vault values, a paused database, a stale origin, a disabled job, or a non-successful invocation fails preflight.

## Alternatives considered

### Continue with the browser reducer and local storage

Rejected for launch. It cannot safely enforce role-specific data minimization, coordinate independent implementations, authenticate public webhooks, durably deduplicate consequential actions, or provide server-derived audit/evidence state.

### FastAPI plus a continuously running worker

Rejected for LAUNCH-001 after the deployment decision. It would require a second runtime platform and operational path alongside the established Vercel product. The selected function architecture keeps frontend and backend deployment together while preserving a governed HTTP boundary.

### CRUD tables as the only business record

Rejected. Current-state rows alone would obscure causal ownership, webhooks, retries, invalidation, acknowledgment, and closure evidence. Current projections are used for practical reads, but the append-only event history remains the explainable record.

### Supabase access directly from the browser

Rejected. Direct browser access would blur the workflow/provider trust boundary and risk relying on client-side role enforcement. Supabase is PostgreSQL persistence, not a replacement for the server command boundary.

### A long-running loop inside a Vercel Function

Rejected. Function instances are ephemeral and duration-bounded. A short authenticated cron tick with database-owned state is deterministic, observable, and retryable.

### Vercel Cron on a paid plan

Rejected after human cost review. The application does not otherwise require Vercel Pro, and Supabase is already the durable workflow authority. Supabase Cron can provide the required one-minute HTTPS trigger without changing the Vercel endpoint or adding another cloud account.

### Google Cloud Scheduler

Rejected for this slice despite available credits. It would add billing, IAM/service-account configuration, and another operational trust boundary while Supabase Cron already satisfies the cadence next to the authoritative durable work.

### Redis/Celery or a managed queue

Rejected for this controlled deployment. PostgreSQL scheduled/outbox tables, advisory/row locks, uniqueness, leases, and a protected cron tick satisfy cadence and delivery without another operational dependency.

### Kafka/event broker and microservices

Rejected. The finals scope has one controlled scenario and one shared domain ownership boundary. Distributed services and broker operations would add failure modes, contract surface, and observability demands without a product benefit.

### Direct provider calls in user-facing command functions

Rejected for scheduled/consequential work. Coupling durable state to provider latency makes retries ambiguous and risks committed workflow state without reliable intent evidence. The transactional outbox and cron tick separate durable intent from delivery.

### Python inference in a runtime function

Rejected. A second runtime and Python-specific serialized model would complicate the Vercel deployment and can introduce unsafe/incompatible artifact loading. Offline Python remains authoritative for training/evaluation; a versioned portable export plus parity fixtures governs TypeScript runtime use.

## Consequences

### Positive

- Every role view, graph, timeline, metric, provider state, and evidence artifact can trace to one durable causal history.
- Backend policy and server-side projections protect caregiver minimization and consequential actions from client manipulation.
- Frontend and functions share TypeScript boundary tooling while OpenAPI remains the stable cross-component authority.
- Expected versions, idempotency, webhook receipts, database locks/leases, and provider action identities make duplicate/replayed/out-of-order work testable.
- The outbox prevents a database commit from silently losing its corresponding provider intent.
- One Vercel Hobby project, one Supabase Free database/Cron authority, and one bounded tick keep the deployment understandable within the launch window without a paid Vercel scheduler.
- Offline Python retains mature LightGBM/SHAP tooling while TypeScript runtime remains deterministic and independently parity-tested.
- Deterministic reset and recovery preserve finals reliability without pretending a failed network action succeeded.

### Negative

- Event/projection consistency, artifact export/parity, idempotency, outbox recovery, cron overlap, lease recovery, and webhook ordering require more implementation and test depth than the CORE reducer.
- Serverless duration, cold starts, connection budgets, Supabase Cron/`pg_net` cadence, Vault configuration, and Free-plan availability become explicit operational constraints.
- Supabase Free is limited to 500 MB, may pause after inactivity, and has no automated backups; controlled illustrative data, bounded retention, migration/seed recovery, and rehearsal preflight are mandatory.
- There is an unavoidable uncertain-outcome window around providers that do not support native idempotency/reconciliation; automatic blind resend is forbidden, so manual recovery may be required.
- The frontend must migrate away from direct reducer/local-storage mutations and handle network, conflict, pending, degraded, and outcome-unknown states.
- Local role entry is still not production authentication, so the environment must remain restricted to controlled illustrative data.
- Contract or ML export changes require orchestrator-controlled regeneration and cross-component verification.

### Security implications

- Provider and database credentials remain in server-only Vercel environment configuration; the shared tick secret additionally exists only in Supabase Vault. Fixed recipient, provider, pickup, destination, script, origins, limits, and kill switches bound external effects.
- The tick endpoint requires an exact bearer secret before it can claim work. The operator owns rotation across Vercel and Vault; database advisory locks and leases are safety controls, not authentication substitutes.
- Twilio and ElevenLabs webhooks are authenticated against raw requests before parsing; receipts and domain versions prevent replay or regression.
- Role/action policy and role-filtered allowlist projections are server enforced, but they do not make the branded role gateway production identity.
- Reset is scenario-scoped, externally inert, and unavailable against production systems.
- Patient text remains inert and excluded from unnecessary logs. Voice transcripts/audio are not retained by default.
- Runtime ML artifacts are fixed, hash-verified data; arbitrary upload, pickle loading, dynamic code, and runtime training are forbidden.
- HIGH-risk independent security review is mandatory before final review.

### Operational implications

- The finals environment runs one named Supabase Cron job at the approved one-minute cadence. Preflight must verify the Free project is active, the migrated job and Vault-backed URL/secret are present, authentication reaches the canonical Vercel Hobby origin, and the latest `pg_net` invocation succeeded before the journey is considered ready. After an inactivity pause, the operator resumes the project and reruns database, seed/projection, Vault, Cron, and tick checks before enabling external actions.
- Functions use a supported Supabase pooled connection and strict transaction/query/runtime budgets; in-memory coordination and post-response background work are invalid.
- Database migrations, seed/reset, projection consistency, cron overlap/lease/outbox recovery, adapter preflight, webhook reachability, exact-hash FHIR validation, and Python/TypeScript ML parity become required verification evidence.
- Provider/network failure produces unresolved, degraded, or outcome-unknown state and an approved reconciliation/manual path. Operators must not repair the journey by directly editing projections.
- FastAPI, Redis, Kafka, Celery, microservices, and distributed leadership remain deferred until a separately approved requirement justifies a new ADR.
