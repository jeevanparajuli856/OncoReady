# OncoReady API

The FastAPI service provides the RAIL-001 PostgreSQL foundation. Its current
surface is intentionally limited to liveness, readiness, build evidence, and a
synthetic persistence proof. Workspace, Epic, and workflow APIs arrive in later
slices.

## Runtime configuration

Server-only variables:

- `DATABASE_URL` — PostgreSQL connection URL.
- `OPERATOR_TOKEN` — bearer token for proof mutation and reset.
- `CORS_ORIGINS` — comma-separated exact web origins; wildcards are rejected.
- `RESET_ENABLED` — must be `true` before the operator reset can run.
- `APPLICATION_VERSION` and `BUILD_ID` — non-secret `/version` evidence.
- `MAX_REQUEST_BODY_BYTES`, `DATABASE_CHECK_TIMEOUT_SECONDS`, `LOG_LEVEL`, and
  Railway-provided `PORT` — optional bounded runtime controls.

The API never applies migrations at startup. Apply the reviewed migration as a
deliberate release step from the repository root:

```bash
DATABASE_URL='postgresql+psycopg://...' \
  backend/.venv/bin/alembic -c backend/alembic/alembic.ini upgrade head
```

Install and run locally:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -e './backend[test]'
backend/.venv/bin/uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```

Run the fast suite and the separately gated PostgreSQL suite:

```bash
backend/.venv/bin/pytest -c backend/pyproject.toml -m 'not integration' tests/backend
TEST_DATABASE_URL='postgresql+psycopg://localhost/oncoready_test' \
  backend/.venv/bin/pytest -c backend/pyproject.toml -m integration tests/backend
```

The integration guard refuses an absent URL, a URL equal to `DATABASE_URL`, a
non-PostgreSQL URL, or a database name without a distinct `test`/`testing`
token before any migration or cleanup runs.
