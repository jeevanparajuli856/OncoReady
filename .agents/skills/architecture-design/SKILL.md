---
name: architecture-design
description: Produce minimum sufficient task architecture plus machine-readable component, contract, test-depth, security-risk, and frontend-design controls for rapid product delivery.
---

# Architecture Design Workflow

1. Read project/task source-of-truth, relevant ADRs/standards/contracts, and existing code.
2. Design only what this vertical slice requires.
3. Identify data flow, component boundaries, trust boundaries, external dependencies, failure modes, and migration impact.
4. Reuse existing architecture unless a real requirement justifies change.
5. Do not silently introduce project-wide technology or infrastructure.
6. Create an ADR only for a meaningful long-lived decision.
7. Complete `architecture-report.json`.

## Architecture restraint

Do not add a database, cache, queue, microservice, container platform, IaC layer, auth system, or other infrastructure solely to make the repository look more sophisticated. Technology must support product behavior, data persistence, deployment, integration, or a deliberate technical objective.

## Frontend design boundary

Architecture owns what the frontend must accomplish and constraints it must respect, not aesthetics.

Architecture may define required routes/workflows/capabilities, data/interface dependencies, trust boundaries, accessibility/performance targets, and supported platforms.

Unless already authoritative from human/brand/design-system requirements, do not prescribe exact palette, fonts, decorative layout treatment, radius/shadows, animation style/easing/timing, iconography, or visual treatment. Those decisions belong to the Codex frontend specialist.

Set `impacts.frontend_design_required=true` when the task introduces/materially changes visible experience: new page/workflow, landing/dashboard/navigation, major component/pattern, design-system establishment/extension, or meaningful motion/interaction concept. Set false for wiring/refactors/bugs/copy changes that should follow established patterns.

## Machine-readable impacts

Before `COMPLETE`, set every field true/false:
- `database`
- `backend`
- `frontend`
- `frontend_design_required`
- `infrastructure`

If `frontend=false`, `frontend_design_required` must be false.

## Machine-readable execution controls

Before `COMPLETE`, set:

### `contract_required`
True only when a stable interface must be created/changed between independently implemented components or an external schema/API needs explicit contract treatment. False for local implementation details.

### `test_depth`
- `NONE` — trivial/non-behavioral
- `SMOKE` — build/lint/typecheck/basic journey checks are enough
- `TARGETED` — independent tests for meaningful logic/integration/critical journey
- `FULL` — broader regression/release-level testing justified by complexity/risk

### `security_risk`
- `LOW` — public/synthetic/non-sensitive data, no meaningful auth/privileged boundary
- `STANDARD` — auth, persisted user data, uploads, meaningful external APIs/actions, or authorization boundaries
- `HIGH` — sensitive/regulated data, payments, privileged/destructive operations, high-consequence actions, or unusually dangerous input/tool boundaries

### `security_review_required`
False for ordinary LOW-risk slices unless there is a concrete reason. True for HIGH risk. Normally true for STANDARD risk when authorization, sensitive persistence, uploads, or consequential actions are changed.

Security baseline rules from `AGENTS.md` apply regardless of this flag.
