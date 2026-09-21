# OncoReady

OncoReady is a treatment-readiness and continuity platform for oncology patients and care teams. It connects clinical context with the practical and communication barriers that can interrupt an upcoming treatment, assigns each barrier to an accountable owner, and makes closure visible.

## Current Direction

The existing React/Vite product experience is complete enough to serve as the human-approved visual baseline. The approved launch plan adds:

- a Railway-hosted FastAPI service and PostgreSQL database;
- read-only Epic Sandbox clinical context for Camila Lopez through SMART on FHIR;
- durable workflow events, projections, access boundaries, CareLink transportation coordination, metrics, and evidence;
- a calibrated LightGBM/SHAP readiness-priority path;
- deterministic prerecorded reliability with a clearly labeled Epic snapshot fallback.

OncoReady does not claim Ochsner connectivity, an Epic partnership, production Epic access, Epic writeback, clinical validation, HIPAA compliance, or real patient use.

## Visual System Is Locked

The current UI and [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md) are human-approved. Future work must preserve the existing theme, palette, typography, spacing, component styling, icons, logo treatment, navigation, layout character, motion, and responsive behavior. New features extend the existing system; they do not redesign it.

See [`ADR-0003`](docs/adr/ADR-0003-human-approved-visual-lock.md) and the frontend instructions before changing any product surface.

## Run the Existing Frontend

```bash
cd frontend
npm ci
npm run dev
```

Useful checks:

```bash
cd frontend
npm run build
npm run test:smoke
npm run test:e2e
```

The FastAPI/PostgreSQL target is approved but not yet scaffolded; `RAIL-001` owns that implementation. Do not invent backend endpoints before its contract is approved.

## Sources of Truth

- Product purpose, users, scope, and delivery order: [`docs/PROJECT.md`](docs/PROJECT.md)
- Architecture, trust boundaries, and integration shape: [`docs/architecture/SYSTEM.md`](docs/architecture/SYSTEM.md)
- Approved launch plan: [`docs/LAUNCH_ROADMAP.md`](docs/LAUNCH_ROADMAP.md)
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

Feature work follows `PROPOSED → PLANNING → BUILD_READY → IMPLEMENTATION → INTEGRATION → REVIEW → DONE`. Production deployment and real external-provider activation remain deliberate human-approved operations.
