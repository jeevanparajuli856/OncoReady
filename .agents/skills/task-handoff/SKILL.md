---
name: task-handoff
description: Produce or consume structured handoff reports between Codex specialists, reviewers, and the orchestrator.
---

# Task Handoff Workflow

## Producer

1. Do not modify `task.json` unless you are the orchestrator.
2. Write only the report/artifact assigned to your role.
3. Include status, summary, changed files/evidence, applicable interfaces/constraints, blockers, and notes for the next agent.
4. Keep handoffs concise; do not duplicate large source documents.
5. Never rely on chat as the durable handoff when a task report exists.

## Consumer

Read task state, prior reports, current authoritative artifacts, and repository state. Do not assume a specialist was required merely because its template report exists; architecture execution controls decide conditional work.

## Frontend design handoff

When `architecture-report.json.impacts.frontend_design_required=true`:

### Frontend specialist → orchestrator
The Codex frontend specialist writes `frontend-design-report.json` as `DESIGN_READY`, scope-checks, and commits the design-only handoff on `agent/<TASK-ID>-frontend` before production frontend coding.

### Orchestrator compatibility review
The Codex orchestrator reads the committed design report from the frontend worker branch and computes:

```bash
python scripts/agentctl.py frontend design-digest <TASK-ID> --ref agent/<TASK-ID>-frontend
```

The orchestrator records it in `frontend-design-review.json.reviewed_design_sha256` and may request changes only for concrete conflicts involving requirements, architecture/contracts, security, accessibility, performance, scope, or explicit human/brand/existing-design-system constraints.

The orchestrator must not reject/rewrite the frontend specialist's aesthetic choices merely because it prefers different colors, typography, layout, radius, shadows, or motion.

### Orchestrator → frontend specialist
The frontend specialist syncs the feature-branch review and runs:

```bash
python scripts/agentctl.py worktree sync <TASK-ID> frontend
python scripts/agentctl.py frontend design-gate <TASK-ID>
```

Any design-report change after approval requires a new compatibility review.

### Frontend specialist → orchestrator integration
The frontend specialist writes `frontend-report.json`; the orchestrator integrates the branch without a second aesthetic implementation pass.

## Conditional specialist handoff

- tester handoff is required only for TARGETED/FULL test depth
- security handoff is required only when `security_review_required=true`
- unused conditional reports may remain in template state

## Blocker types

- `CONTRACT_CHANGE_REQUIRED`
- `ARCHITECTURE_DECISION_REQUIRED`
- `FRONTEND_DESIGN_CHANGE_REQUIRED`
- `DESIGN_SYSTEM_CHANGE_REQUIRED`
- `SECURITY_REVIEW_REQUIRED`
- `DEPENDENCY_BLOCKED`
- `TEST_FAILURE`
