# OncoReady

OncoReady is a treatment-readiness and continuity product: it connects captured clinical context with human-owned work on the practical barriers to an upcoming cancer treatment. The deployed demonstration uses one controlled patient story, saved Epic Sandbox data, synthetic-data model outputs and fictional CareLink activity. A separately protected adapter placed one verified test call; the SMS test was undelivered.

**Start here:** [current product scope](docs/PROJECT.md) · [sprint closeout](docs/SPRINT_CLOSEOUT.md) · [seven-minute demo script](docs/operations/SEVEN_MINUTE_PRODUCT_DEMO.md). The development sprint is closed; the stage call, SMS delivery and presentation media still have explicit gates.

## Run locally

Use an isolated local PostgreSQL database. The live outreach actions also require server-side operator/provider settings and must never be exercised with production credentials during ordinary local testing.

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -e './backend[test]'
DATABASE_URL='postgresql+psycopg://localhost/oncoready_local' \
  backend/.venv/bin/alembic -c backend/alembic/alembic.ini upgrade head
DATABASE_URL='postgresql+psycopg://localhost/oncoready_local' \
OPERATOR_TOKEN='replace-with-a-local-random-token' \
CORS_ORIGINS='http://localhost:5173' \
  backend/.venv/bin/uvicorn app.main:app --app-dir backend --reload --port 8000
```

In another terminal:

```bash
cd frontend
npm ci
VITE_API_ORIGIN=http://localhost:8000 npm run dev
```

Focused checks: `npm run build`, `npm run test:smoke`, and `npm run test:e2e` from `frontend/`; backend tests use `backend/.venv/bin/pytest -c backend/pyproject.toml -m 'not integration' tests/backend`. PostgreSQL integration tests require an isolated `TEST_DATABASE_URL`.

## Sources and boundaries

- [Architecture](docs/architecture/SYSTEM.md), [locked visual system](docs/design/DESIGN_SYSTEM.md), feature specifications in `docs/features/`, and task evidence in `.ai/tasks/` are retained for their distinct roles.
- [Live provider evidence](docs/operations/OUTREACH-001-LIVE-EVIDENCE.md) records completed voice and undelivered SMS separately. Do not present a submitted message as received.
- No production Epic connection, real ride dispatch, clinical validation, customer deployment or measured patient outcome is claimed. Local prepared personas are not authorization for live provider actions.
- Never commit `.env` files, provider keys, real phone numbers or actual patient data.
