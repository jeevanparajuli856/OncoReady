# OncoReady

OncoReady is a treatment-readiness and continuity platform for oncology patients and care teams. It connects clinical context with the practical and communication barriers that can interrupt an upcoming treatment, assigns each barrier to an accountable owner, and makes closure visible.

## Current Direction

The current delivery target is a polished, frontend-led demonstration completed in two working days. The approved visual system and completed Railway foundation are reused. The remaining scope is:

- one coherent, clickable patient/staff/caregiver/CareLink journey, including scheduled-message/reply history and a previous-trip dispatch replay;
- actual Epic Sandbox data captured into JSON before playback, with source and capture time;
- a lightweight synthetic-data ML notebook whose exported predictions power Why flagged? and a two-state transportation what-if;
- a visible at-risk-to-confirmed graph, clear ownership/next actions, a patient plan finish and an evidence-linked closing receipt;
- one real SMS and one short live call to a consenting test phone, using a minimal protected server adapter;
- local recording assets, reset checkpoints and a rehearsed fallback.

The seven remaining features are planned, not yet verified implementations. Full backend workflows, enterprise identity, ongoing Epic synchronization, online ML and automatic outreach are deferred. See [the two-day sprint](docs/LAUNCH_SPRINT_PLAN.md).

Existing Railway hosts, confirmed by the human: **web https://app.oncoready.me**, **API https://api.oncoready.me**. Verify current health, origin rules and callbacks during implementation preflight; this documentation update does not establish their live status.

OncoReady does not claim Ochsner connectivity, an Epic partnership, production Epic access, Epic writeback, clinical validation, HIPAA compliance, or real patient use.

## Visual System Is Locked

The current UI and [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md) are human-approved. Future work must preserve the existing theme, palette, typography, spacing, component styling, icons, logo treatment, navigation, layout character, motion, and responsive behavior. New features extend the existing system; they do not redesign it.

See [`ADR-0003`](docs/adr/ADR-0003-human-approved-visual-lock.md) and the frontend instructions before changing any product surface.

## Run Locally

Start PostgreSQL and create an isolated local database, then install and migrate
the API:

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

In another terminal, start the existing frontend:

```bash
cd frontend
npm ci
VITE_API_ORIGIN=http://localhost:8000 npm run dev
```

Useful checks:

```bash
TEST_DATABASE_URL='postgresql+psycopg://localhost/oncoready_rail_001_test' \
  backend/.venv/bin/pytest -c backend/pyproject.toml tests/backend
cd frontend
npm run build
npm run test:smoke
npm run test:e2e
```

The current API surface is intentionally limited to process/dependency health,
build evidence, and a synthetic persistence proof. The revised demo uses prepared persona/scenario state; Epic data is captured
before playback. Only the bounded live communications path needs additional
protected endpoints, to be specified by OUTREACH-001.
[`contracts/openapi.yaml`](contracts/openapi.yaml) is authoritative for the
RAIL-001 boundary.

## Sources of Truth

- Product purpose, users, scope, and delivery order: [`docs/PROJECT.md`](docs/PROJECT.md)
- Architecture, trust boundaries, and integration shape: [`docs/architecture/SYSTEM.md`](docs/architecture/SYSTEM.md)
- Approved launch plan: [`docs/LAUNCH_ROADMAP.md`](docs/LAUNCH_ROADMAP.md)
- Dependency-ordered launch sprint and release gates: [`docs/LAUNCH_SPRINT_PLAN.md`](docs/LAUNCH_SPRINT_PLAN.md)
- Planning audit and coding-agent handoff: [`docs/LAUNCH_REVIEW.md`](docs/LAUNCH_REVIEW.md)
- Real SMS/call activation and acceptance: [`docs/operations/OUTREACH_TEST_DELIVERY.md`](docs/operations/OUTREACH_TEST_DELIVERY.md)
- Recording and live presentation: [`docs/operations/DEMO_RUNBOOK.md`](docs/operations/DEMO_RUNBOOK.md)
- Delegated synthetic scenario and model settings: [`docs/LAUNCH_SCENARIO_SETTINGS.md`](docs/LAUNCH_SCENARIO_SETTINGS.md)
- Locked visual system: [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md)
- Deterministic project configuration: [`.ai/project.json`](.ai/project.json)
- Long-lived decisions: [`docs/adr/`](docs/adr/)
- Agent workflow and ownership: [`AGENTS.md`](AGENTS.md)

## Safety Boundaries

- Use only synthetic/controlled data and Epic-provided Sandbox test data.
- Never commit client secrets, tokens, credentials, private keys, production `.env` files, or real patient data.
- Keep Epic access read-only and staff-only for the approved Camila journey.
- Preserve patient text verbatim for human clinical review; no model controls clinical urgency or treatment decisions.
- Keep caregiver and transportation projections data-minimized.

## Agent Control Plane

```bash
python3 -m pip install -r requirements-agent.txt
python3 scripts/agentctl.py bootstrap
python3 scripts/agentctl.py project validate
```

Feature work follows `PROPOSED → PLANNING → BUILD_READY → IMPLEMENTATION → INTEGRATION → REVIEW → DONE`. Production deployment remains deliberate. The human has selected bounded test-contact SMS/call delivery; implement its configured safety and review gates without asking again whether real delivery is wanted.
