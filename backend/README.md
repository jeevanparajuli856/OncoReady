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

## Protected live outreach

The private page at `/operator/live` requires the existing `OPERATOR_TOKEN`.
The server must also have `DATABASE_URL`, `OUTREACH_ENABLED=true`,
`OUTREACH_CONSENT_CONFIRMED=true`, an E.164 `OUTREACH_RECIPIENT`,
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`,
`ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID`, and
`ELEVENLABS_PHONE_NUMBER_ID`. Keep these values server-side only.

Run the Alembic migration before enabling outreach. SMS keeps its one-shot arm.
Calls use separate windows: open one call window for `OUTREACH_ARM_MINUTES`
(default 30), place one call, wait for Twilio to report a final status, then
deliberately open another window if needed. Each window records an explicit
test/demo purpose and current recipient consent confirmation. At most `OUTREACH_DAILY_CALL_LIMIT`
calls (default 4) can be attempted per UTC day. Every attempt is reserved before
provider submission and survives scenario reset. An ambiguous submission stays
`unknown` and blocks another call until resolved. Status reads poll Twilio for
actual message/call state; `sent` is not
SMS delivery, and `completed` is not patient acknowledgment. The ElevenLabs
agent must have a verified Twilio phone number and a 60-second maximum call
duration. The presenter verifies audible speech on the consenting phone.

**In-app demo calling (OUTREACH-002).** `GET`/`POST /api/v1/outreach/demo-call` backs the Care Navigator's **Call Camila** button. It needs **no operator token**, so it is off unless `DEMO_CALL_BUTTON=true`. Turn it on only for a presentation day with fresh recipient consent, then turn it off (the button then reads "Calling is paused") and revoke the operator token. While on, every outreach requirement above still applies. Each click opens its own `demo` call window and places one call to the fixed `OUTREACH_RECIPIENT`. A second call is refused until the previous one reaches a final status, and the daily limit still caps attempts. Responses carry call status only.

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
