# RAIL-001 — Railway web API and PostgreSQL foundation

## User-visible outcome

The public application and authenticated workspace shell run against a real API and persistent database from one manageable Railway project.

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

## Contract impact

Required. Define the initial OpenAPI paths for `/health`, `/ready`, build/version evidence, and a minimal persisted proof/reset boundary. Later tasks extend rather than silently replace it.

## Test depth

TARGETED. Independent tests cover persistence, migration/readiness failure, reset determinism, API restart, CORS, SPA refresh routing, and deployment health.

## Security risk

STANDARD with dedicated review. Material concerns are server-only secrets, database exposure, unsafe reset access, permissive origins, log disclosure, and deployment misconfiguration.

## Dependencies

- `PLAN-002` source-of-truth reconciliation and human-approved roadmap.
- Approved Railway account/tool access is required for deployed acceptance; local verification is not a substitute.

## Acceptance criteria

1. Railway contains exactly one intended `web`, one `api`, and one PostgreSQL service for the finals environment, with database traffic restricted to private networking.
2. The web service serves SPA routes directly on refresh and uses an environment-defined API origin without bundling server secrets.
3. `/health` reports process liveness; `/ready` passes only when PostgreSQL and the required Alembic revision are available.
4. A backend write survives API restart and remains visible after browser refresh.
5. Frontend and backend watch paths avoid rebuilding the unrelated service.
6. Reset/reseed restores the same controlled workflow seed while preserving valid Epic authorization and last-known-good snapshot records by default.
7. Missing required variables or a failed/missing migration prevents readiness and produces actionable redacted logs.
8. A submitted Railway deployment is reported live only after platform status is `SUCCESS` and web/API/database post-deploy checks pass.
