# RAIL-001 — Railway web API and PostgreSQL foundation

## User-visible outcome

The existing frontend shell connects to a real API and persistent database from one manageable Railway project; workspace authentication follows in ACCESS-001.

## Product/demo impact

This slice proves the product is no longer a frontend-only state machine. It supplies the deployment, migration, persistence, readiness, and reset foundation every later Camila slice uses.

## In scope

- FastAPI application scaffold, typed configuration, structured redacted logs, correlation IDs, CORS, bounded requests, liveness, and readiness.
- SQLAlchemy/Alembic foundation and the minimum schema needed to prove persistent state and support later migrations.
- One Railway project with `web`, `api`, and private PostgreSQL services, explicit service roots/watch paths, and public web/API domains.
- Deterministic seed/reset infrastructure that can later preserve valid Epic authorization and the last-known-good snapshot.
- Local development wiring and operator documentation.

## Out of scope

- Workspace identity/authorization behavior owned by `ACCESS-001`.
- Epic, workflow, outreach, transportation, model, metrics, or FHIR domain implementation.
- Redis, Kafka, a separate worker/scheduler, Kubernetes, or production high-availability architecture.
- Production customer deployment or real patient data.

## Architecture impact

- Adds the approved FastAPI service and Railway PostgreSQL migration path under `backend/alembic/versions`.
- Adds the web-to-API environment boundary and Railway service configuration.
- Keeps the launch topology to one web service, one API service, and one database.

## Selected foundation design

### API and frontend boundary

- The initial contract contains `GET /health`, `GET /ready`, `GET /version`, `GET /api/v1/foundation/proof`, `PUT /api/v1/foundation/proof`, and `POST /api/v1/operator/reset`.
- `/health` proves only that the API process can serve requests. `/ready` returns success only when required configuration is valid, PostgreSQL responds within the bounded check, and the database's Alembic revision exactly matches the single code head; dependency failure returns `503` without secrets or connection details.
- `/version` exposes only non-secret release/build evidence. The foundation proof read exposes one synthetic, non-patient record so the current frontend can demonstrate server-backed persistence.
- Proof writes and reset are operator/test operations protected by a server-held bearer token and an explicit reset-enabled setting. The browser bundle must never contain that token, database credentials, or another server secret.
- The frontend reads `VITE_API_ORIGIN` as a public build-time origin, uses the contracted read endpoint, and presents loading, connected, and unavailable states by composing the existing runtime components and tokens. This is a compatibility-only functional extension: no global token, established component, navigation, layout, or workflow-state restyling is authorized.
- **Update (LAND-004, September 23, 2026):** the footer status badge that displayed this proof was removed from the web app at the owner's request. The API endpoint, table and backend tests are unchanged; `GET https://api.oncoready.me/api/v1/foundation/proof` still demonstrates persistence directly.

### Persistence, migration, and reset

- The first migration creates only a bounded `foundation_proofs` table with a stable unique proof key, bounded proof value, seed version, and timezone-aware created/updated timestamps. Authentication, Epic, workflow, audit, outbox, model, and provider tables remain owned by later tasks.
- Alembic is the only schema-change path. Deployments run `alembic upgrade head` as a deliberate pre-deploy/release step; the API does not mutate schema at process startup.
- The deterministic seed owns one stable foundation key. Reset/reseed transactionally upserts that key to its canonical value and reports what it changed; it does not truncate a table, recreate a schema, delete unknown rows, or touch future task tables.
- A reset integration test inserts an unrelated proof row, changes the seeded row, runs reset twice, and proves the canonical row is identical while the unrelated row remains unchanged.

### Runtime and deployment controls

- The API uses typed settings, structured JSON logs, generated/validated correlation IDs, bounded request bodies, explicit CORS origins, redaction, and Railway's provided `PORT`. Missing required setting names may be logged, but their values may not be logged.
- CORS is an exact allowlist for the deployed web origin and documented local origins; wildcard origins are forbidden. Browser credentials remain disabled until `ACCESS-001` defines the session contract.
- Railway service roots are `frontend` for `web` and `backend` for `api`; each service watches only its own root. PostgreSQL has no public domain and is supplied to the API through Railway private networking.
- The web build uses the public API origin and a static SPA server that falls back to `index.html` for application routes. The API start command binds `0.0.0.0:$PORT`. A deployment is accepted only after Railway reports `SUCCESS` and post-deploy web, API, readiness, CORS, migration, and persistence checks pass.

### Selected test harness

- Backend tests use `pytest` with FastAPI `TestClient` used as a context manager so application lifespan runs. Pure validation tests may replace dependencies; persistence, readiness, reset, and migration tests must use PostgreSQL rather than SQLite or an in-memory substitute.
- PostgreSQL integration tests use a dedicated disposable database supplied through `TEST_DATABASE_URL`. The harness must fail closed when the variable is absent, equals `DATABASE_URL`, or does not identify an explicitly test-only database; it applies `alembic upgrade head` before testing and may clean up only that validated test target.
- Implementation-owned checks are split into a fast backend/API suite and a PostgreSQL-marked integration/migration suite. Before integration verification, the orchestrator registers their actual runnable commands in `.ai/project.json`; required unavailable or skipped PostgreSQL checks fail.

## Contract impact

Required. Define the initial OpenAPI paths for `/health`, `/ready`, build/version evidence, and a minimal persisted proof/reset boundary. Later tasks extend rather than silently replace it.

## Test depth

TARGETED. Independent tests cover persistence, migration/readiness failure, reset determinism, API restart, CORS, SPA refresh routing, and deployment health.

## Security risk

STANDARD with dedicated review. Material concerns are server-only secrets, database exposure, unsafe reset access, permissive origins, log disclosure, and deployment misconfiguration.

## Dependencies

- `PLAN-002` source-of-truth reconciliation and human-approved roadmap.
- Approved Railway account/tool access is required for deployed acceptance; local verification is not a substitute.

## Planning and verification handoff

`PLAN-002` is an approved documented planning milestone, not a tracked task. `RAIL-001` has no tracked task dependency; reconcile and commit the planning baseline before preparing its feature branch.

During planning, select the actual API test and PostgreSQL migration/integration harness. Before integration verification, the orchestrator must register those runnable commands as required checks in `.ai/project.json` and document isolated test database setup. Later slices extend the checks for their implemented boundaries; do not insert nonexistent placeholder commands now. Database workers own `backend/alembic/**`; backend workers own the application and dependency configuration.

The persisted proof and reset are private operator/test operations until `ACCESS-001` adds normal workspace sessions; no unauthenticated public mutation endpoint is permitted. RAIL reset proves deterministic foundation seed behavior and preserves unrelated data; FLOW/EPIC acceptance later proves the actual Camila workflow/integration records. The local-state frontend remains the recorded baseline until those slices replace it, and RAIL must not describe it as authenticated.

## Acceptance criteria

1. Railway contains exactly one intended `web`, one `api`, and one PostgreSQL service for the finals environment, with database traffic restricted to private networking.
2. The web service serves SPA routes directly on refresh and uses an environment-defined API origin without bundling server secrets.
3. `/health` reports process liveness; `/ready` passes only when PostgreSQL and the required Alembic revision are available.
4. A backend write survives API restart and remains visible after browser refresh.
5. Frontend and backend watch paths avoid rebuilding the unrelated service.
6. Reset/reseed restores the same foundation proof seed without deleting unrelated state; EPIC-001 and FLOW-001 later verify preservation of actual authorization/snapshot records and the complete Camila scenario.
7. Missing required variables or a failed/missing migration prevents readiness and produces actionable redacted logs.
8. A submitted Railway deployment is reported live only after platform status is `SUCCESS` and web/API/database post-deploy checks pass.
9. Required backend and PostgreSQL migration/integration checks are registered in `.ai/project.json`, runnable against the documented test environment, and pass; frontend-only verification cannot close this task.
