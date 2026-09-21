# Database Deployment Model

## Approved Platform

OncoReady uses Railway PostgreSQL for the launch architecture. Schema history is represented by Git-tracked Alembic migrations under `backend/alembic/versions`.

The database stores OncoReady events, projections, sessions, integration state, normalized Epic Sandbox snapshots, provider configuration, audit evidence, and model metadata. It must not contain real patient data or production Epic credentials in the finals environment.

## Development and Test

```text
Database task
  ↓
create a reviewed Alembic revision
  ↓
apply to an isolated development/test PostgreSQL database
  ↓
run migration, constraint, query, rollback/forward, and compatibility checks
  ↓
record the verified revision in database-report.json
```

Requirements:

- use synthetic and Epic Sandbox test data only;
- keep schema and data migrations deterministic and reviewable;
- protect referential and workflow integrity with constraints where appropriate;
- add indexes only for demonstrated access patterns;
- do not store plaintext passwords, access tokens, refresh tokens, client secrets, or encryption keys;
- when encrypted credential material must persist, keep the encryption key outside PostgreSQL in Railway-managed configuration;
- redact credentials and clinical payloads from migration output and logs;
- verify that failed migrations prevent API readiness.

## Railway Finals Environment

```text
reviewed commit
  ↓
Railway API release begins
  ↓
apply pending Alembic migrations deliberately
  ↓
verify current Alembic revision
  ↓
API readiness checks database connectivity + required revision
  ↓
run reset/reseed and the critical path
```

- The API connects through Railway private networking.
- `DATABASE_URL` and encryption keys remain Railway variables and never enter Git, screenshots, reports, or chat.
- Reset/reseed is a non-public operation for the controlled environment.
- Reset/reseed restores OncoReady fixtures and workflow state without deleting a valid Epic authorization or last-known-good Camila snapshot unless the operator explicitly requests a full integration reset.
- A deployment is not reported healthy when a required migration is missing or failed.

## Production Promotion

Production remains a separate, human-approved target.

- Promote the same reviewed migration history; do not make dashboard-only schema changes.
- Back up and rehearse destructive or irreversible migrations before approval.
- Keep production credentials separate from non-production credentials.
- Apply production migrations only after the feature revision, rollback/forward plan, verification evidence, security evidence when required, and human release approval are complete.
- Production Epic configuration, PHI governance, retention, incident response, and customer change-control are separate prerequisites and are not authorized by the finals environment.
