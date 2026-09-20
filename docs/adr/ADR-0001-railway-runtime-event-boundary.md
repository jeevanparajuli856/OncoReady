# ADR-0001 — Railway Runtime, PostgreSQL Event Boundary, and Durable Outbox Poller

## Status

Accepted; Railway hosting adopted and public-demo trust boundary amended as of 2026-09-20

## Context

LAUNCH-001 must make the cross-role treatment-continuity journey durable while adding scheduled outreach, independently implemented frontend/backend/database components, signed provider callbacks, bounded SMS/voice actions, transportation recovery, event-derived metrics, FHIR evidence, and versioned ML inference.

Browser-local state cannot safely coordinate roles, enforce caregiver minimization, deduplicate callbacks, or recover uncertain provider actions. The human-approved hosting decision is to use Railway as the sole host for frontend, backend, and PostgreSQL. Railway keeps these resources in one project and private network, and its continuously running application service allows scheduling to be simplified without database-originated HTTP calls.

The Railway `web` service is a separately deployed public static origin. Its JavaScript cannot hold the global scenario token required by the initial OpenAPI contract: any build-time variable or bundled header is recoverable by an anonymous visitor. The approved local role gateway also intentionally collects no credentials, so it cannot mint an authenticated user session. The trust boundary must distinguish safe public synthetic behavior from consequential operator/provider behavior.

## Decision

Adopt a Railway `web` -> Railway `api` -> Railway `Postgres` boundary:

1. React + TypeScript + Vite remains the presentation layer and consumes generated types/client from the governed OpenAPI contract. It is deployed as the Railway `web` service and owns presentation state only.
2. A continuously running Node.js/TypeScript process is the authoritative command, policy, projection, callback, provider-adapter, evidence, and ML-inference boundary. It is deployed as the Railway `api` service and listens on `0.0.0.0:$PORT`.
3. Railway PostgreSQL stores the append-only event stream plus read projections, scheduled actions, transactional outbox, idempotency records, callback receipts, provider attempts, claims, and leases. The API connects over Railway private networking through a `DATABASE_URL` reference.
4. Every accepted command appends events and updates affected projections, schedules, and outbox rows in one transaction with expected-version and idempotency guards.
5. The API includes a lightweight poller. Each cycle uses database time, a transaction-scoped PostgreSQL advisory lock, bounded `FOR UPDATE SKIP LOCKED` claims, tokens, and leases. The timer wakes work but owns no durable schedule.
6. Network calls occur only after dispatch intent/provider-attempt state commits. A possibly accepted but unconfirmed action becomes `outcome_unknown` and is reconciled before retry; lease expiry alone never authorizes a blind resend.
7. `GET /api/v1/operations/tick` remains bearer-protected and invokes the same bounded cycle for operator/preflight use. It is not the normal scheduler. No hosted cron or database-originated HTTP callback is required.
8. Twilio, ElevenLabs-through-Twilio, and CareLink remain narrow server-only adapters controlled by fixed allowlists and kill switches. Provider success requires an authenticated callback or explicitly labeled deterministic replay.
9. Reset is a scenario-scoped reseed that cannot enqueue or perform external actions.
10. LightGBM training/calibration/SHAP remains offline Python; the TypeScript runtime accepts only reviewed immutable artifacts and returns `Score unavailable` on incompatibility.
11. Do not add Redis, Kafka, Celery, a general workflow engine, microservices, a separate scheduler service, or a separate event-store product for LAUNCH-001.
12. Do not send a shared scenario/operator secret to the browser. `VITE_API_BASE_URL` is the frontend's only deployment variable.
13. Replace global scenario-token security with route-level classes. Finals projections/evidence plus readiness, work-item, and CareLink demo commands are public only for the compiled-in synthetic scenario. Reset and SMS/voice initiation require `X-OncoReady-Operator-Token`; callbacks retain official provider signatures; manual tick retains `CRON_SECRET`.
14. A public demo command may append database events/projections and internal workflow state, but cannot create or authorize provider outbox work. External dispatch is accepted only from an operator-authenticated communication command and remains bounded by target allowlists, kill switches, idempotency, and rate limits.
15. Treat the request `actor_role` as unverified demo provenance. Server route/resource/action/state policy, not the claimed role alone, determines whether a synthetic transition is permitted. Because no production identity exists, the public database contains illustrative data only.
16. Keep `ONCOREADY_PUBLIC_DEMO_ENABLED` false by default and fail closed. Use server-only `ONCOREADY_OPERATOR_TOKEN`; retire `ONCOREADY_SCENARIO_TOKEN` after the contract and implementation migrate.

The governed HTTP/event schemas remain authoritative. This amendment requires an orchestrator/contract-specialist OpenAPI update: remove global `FinalsScenarioToken`, add operation-level public and `OperatorControlToken` security, constrain command `scenario_id` to the finals UUID, and align response errors/rate limits with each trust class. Paths, methods, receipts, callback envelopes, expected-version/idempotency behavior, and event meanings remain unchanged.

## Alternatives considered

### Keep browser reducer/local storage as authority

Rejected. It cannot reliably enforce role minimization, signed callbacks, external-action idempotency, durable scheduling, or event-derived evidence across roles and refreshes.

### Keep the prior split-hosting topology

Rejected by the human hosting decision. It would preserve unused platform-specific deployment paths and a database-originated HTTP callback loop when Railway can host the long-running API and database together.

### FastAPI backend on Railway

Allowed by the human and technically compatible with Railway, but rejected for LAUNCH-001. The governed contracts, existing TypeScript implementation direction, shared boundary tooling, provider/domain work, and frontend client are already aligned around Node.js/TypeScript. Rewriting the slice in Python would consume the launch window and add cross-language runtime work without improving the primary journey. FastAPI remains a valid future choice if a separately approved requirement justifies migration.

### Embed the scenario token in the static frontend

Rejected. A Vite variable, generated-client constant, source map, request header, browser storage value, or runtime configuration object is public to the visitor. Obscuring or rotating that value does not turn it into authorization.

### Use CORS or Origin as authentication

Rejected. Exact CORS is useful browser isolation and remains required, but non-browser clients can omit or forge `Origin`. Safety must come from a fixed synthetic data scope and a hard denial of public external effects.

### Add a web BFF solely to inject the secret

Rejected for this slice. The approved frontend is a Railway static service and the long-running API already owns the trust boundary. A second server solely to forward anonymous requests with a shared credential would add infrastructure without identifying users or improving authorization.

### Add production identity before launch

Deferred. Real identity would enable confidential per-user authorization, but OAuth/session management is explicitly out of scope and unnecessary for one public illustrative scenario. It becomes required before protected or real patient data is introduced.

### Allow anonymous callers to queue fixed-recipient SMS or voice

Rejected. Even with one allowlisted number, anonymous initiation can create harassment, cost, consent, and reputation risk. Provider initiation remains operator-authenticated and off until the dedicated provider-activation phase.

### Railway Cron calling the tick endpoint

Rejected for the required sub-five-minute wake-up cadence and because a network scheduler is unnecessary. The database-backed poller recovers from restart and the protected tick remains available for controlled manual/preflight use.

### Separate worker service

Deferred. One API replica and one bounded internal poller are adequate for the controlled launch. A dedicated worker would add another deployable service without changing the durable coordination model. It can be introduced later behind the same database claims if observed load requires it.

### Direct provider calls inside user-facing command transactions

Rejected. Holding a transaction across provider latency or calling before durable intent creates ambiguous failure windows. The transactional outbox separates committed intent from delivery.

### CRUD tables as the only business record

Rejected. Current-state rows alone obscure causality, ownership, retries, invalidation, acknowledgment, and closure evidence. Projections remain practical read models, while append-only events remain the explainable record.

### Redis, managed queue, or workflow engine

Rejected for this slice. PostgreSQL uniqueness, advisory/row locks, bounded claims, leases, and stable action identities satisfy the controlled workload without another dependency.

## Consequences

### Positive

- Frontend, backend, and database share one Railway project and operational context.
- Private Railway networking keeps database traffic off the public internet.
- A long-running process removes the need for a database HTTP extension, hosted cron callback, or a scheduler secret stored in two platforms.
- PostgreSQL events, claims, leases, and outbox state remain authoritative across restart and overlap.
- The existing protected tick contract remains usable without defining a new scheduling interface.
- Expected versions, idempotency, callback receipts, and stable provider identities remain independently testable.
- The static frontend can complete the synthetic cross-role journey without receiving or leaking a shared server secret.
- The public effect ceiling is testable: anonymous traffic cannot reset the scenario or cause SMS/voice/provider dispatch.

### Negative

- The API must stay awake for due work; sleeping/serverless mode is incompatible with the scheduler.
- Process lifecycle, restart behavior, scheduler heartbeat, stale leases, and database pool size become explicit operational concerns.
- The prior platform-specific migration path and deployment configuration are stale and require governed cleanup.
- The frontend and API need separate public domains and exact CORS/callback-origin configuration.
- Provider uncertain-outcome handling still requires reconciliation or manual recovery.
- Anonymous visitors can inspect all synthetic role/evidence endpoints and can alter shared demo state through allowlisted transitions; the environment cannot contain confidential data and needs rate limits plus operator reset/recovery.

### Security implications

- Provider/database credentials live only in Railway server variables; no secret may be compiled into the Vite bundle.
- `ONCOREADY_OPERATOR_TOKEN` protects reset and provider initiation and is never supplied to the browser. `CRON_SECRET` remains limited to manual scheduler control.
- Public demo commands are fixed-scenario and database-local; they cannot authorize provider outbox work. Exact CORS is defense-in-depth, not authentication.
- PostgreSQL stays private. The API uses a least-privilege connection and bounded pool.
- The manual tick requires an opaque bearer secret but does not serve as scheduler authority.
- Twilio and ElevenLabs callbacks are authenticated against exact raw input before parsing; receipts and domain versions prevent replay/regression.
- Local role entry remains non-production identity, so only controlled illustrative data is permitted.
- Fixed recipient/provider/location/script values, consent, kill switches, and rate limits bound external effects.
- HIGH-risk independent security review remains mandatory.

### Operational implications

- Use one Railway project/environment with `web`, `api`, and private `Postgres` services.
- Compile only `VITE_API_BASE_URL` into `web`; configure `ONCOREADY_PUBLIC_DEMO_ENABLED`, `ONCOREADY_OPERATOR_TOKEN`, origins, provider controls, and all secrets only on `api`.
- Keep the API at one replica for launch, sleeping disabled, health checked, and restart-enabled; database claims retain correctness if topology changes.
- Run vendor-neutral migrations as a reviewed pre-deploy/release step with a migration lock.
- Preflight must verify both deployments, public domains, exact CORS/callback URLs, private database reference, migration state, scheduler heartbeat, stale claims, provider switches, and signed webhook reachability.
- Complete ML, backend, frontend, Railway, route-policy, and no-secret-bundle verification with every external-action switch false before configuring Twilio or ElevenLabs. Provider credentials and live activation are a later, separately preflighted phase.
- Remove the retired HTTP scheduler migration from the Railway target. Do not install a database-extension scheduler or cross-platform secret dependency.
- Migrations plus deterministic seed/reset remain the recovery authority; production-grade backup/HA is a later risk-based decision.
