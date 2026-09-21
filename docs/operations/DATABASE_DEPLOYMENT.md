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

### RAIL-001 isolated test database

Use a dedicated PostgreSQL database whose name contains a distinct `test` or
`testing` token. The integration guard rejects an absent URL, a non-PostgreSQL
URL, a URL equal to `DATABASE_URL`, or an ambiguous database name before any
migration or cleanup runs.

```bash
createdb oncoready_rail_001_test
python3 -m venv backend/.venv
backend/.venv/bin/pip install -e './backend[test]'
TEST_DATABASE_URL='postgresql+psycopg://localhost/oncoready_rail_001_test' \
  backend/.venv/bin/pytest -c backend/pyproject.toml -m integration tests/backend -q
```

The integration suite applies Alembic head to the isolated database and proves
exact-revision readiness, write/restart/read persistence, deterministic reset,
and preservation of an unrelated proof row.

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

### RAIL-001 Railway release gate

The `api` service uses `/backend` as its service root. Its reviewed Railway
configuration runs this pre-deploy command inside the built image:

```bash
alembic -c alembic/alembic.ini upgrade head
```

Required service variables are `DATABASE_URL` (referencing the private
PostgreSQL service), `OPERATOR_TOKEN`, `CORS_ORIGINS`, `RESET_ENABLED`,
`APPLICATION_VERSION`, and `BUILD_ID`. The browser receives only
`VITE_API_ORIGIN`; it never receives the operator token or database URL.

After Railway reports `SUCCESS`, verify in order:

1. `GET /health` returns `200` independently of PostgreSQL.
2. `GET /ready` returns `200` with database `ready` and migration `current`.
3. `GET /version` identifies the submitted build without secret values.
4. The operator-protected proof update survives an API restart and remains
   visible through the public proof read and a browser refresh.
5. Operator reset restores the stable seed and leaves an unrelated row intact.
6. PostgreSQL has no public TCP proxy; API-to-database traffic uses the Railway
   private `DATABASE_URL` reference.

Do not report the deployment live from command exit status alone. Confirm the
submitted web and API deployment IDs each reached Railway `SUCCESS`, then run
the HTTP, CORS, migration, persistence, restart, and SPA deep-link checks.

## Production Promotion

Production remains a separate, human-approved target.

- Promote the same reviewed migration history; do not make dashboard-only schema changes.
- Back up and rehearse destructive or irreversible migrations before approval.
- Keep production credentials separate from non-production credentials.
- Apply production migrations only after the feature revision, rollback/forward plan, verification evidence, security evidence when required, and human release approval are complete.
- Production Epic configuration, PHI governance, retention, incident response, and customer change-control are separate prerequisites and are not authorized by the finals environment.
