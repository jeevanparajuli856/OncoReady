---
name: task-orchestration
description: Orchestrate a rapid product slice through lightweight planning, Codex-owned development, conditional contracts/tests/security, frontend design authority, integration, verification, final review, and merge.
---

# Task Orchestration

Use `python scripts/agentctl.py ...` for deterministic lifecycle operations.

## 1. Create, branch, plan

```bash
python scripts/agentctl.py task create <TASK-ID> "<TITLE>"
python scripts/agentctl.py git prepare <TASK-ID>
python scripts/agentctl.py task advance <TASK-ID>
```

This moves `PROPOSED → PLANNING`.

Keep the task as a vertical product slice whenever practical: the task should produce a visible end-to-end outcome rather than splitting DB/API/UI into separate process-heavy tasks.

## 2. Architecture → BUILD_READY

Spawn architect. It must complete:

`impacts`:
- database
- backend
- frontend
- frontend_design_required
- infrastructure

`execution`:
- contract_required
- test_depth
- security_risk
- security_review_required

If `contract_required=true`, update task contracts and the relevant contract artifacts before advancing.

Then:

```bash
python scripts/agentctl.py task advance <TASK-ID>
```

The gate validates architecture and validates contracts only when required, then moves to `BUILD_READY`.

Commit planning/architecture/required contracts before implementation worktrees.

Then:

```bash
python scripts/agentctl.py task advance <TASK-ID>
```

moves to `IMPLEMENTATION`. Commit that task state before creating worker worktrees so every worker starts from authoritative `IMPLEMENTATION` state.

## 3. Spawn only required implementation workers

Read `architecture-report.json.impacts`.

- database=true → database specialist
- backend=true → backend specialist
- frontend=true → Codex frontend specialist

Do not spawn specialists for false impacts.

Use parallel worktrees only when they save time:

```bash
python scripts/agentctl.py worktree create <TASK-ID> backend
python scripts/agentctl.py worktree create <TASK-ID> frontend
```

### Frontend without design Phase A

When `frontend_design_required=false`, ask the Codex frontend specialist to implement using the established design system/patterns.

### Frontend with design Phase A

When `frontend_design_required=true`:

1. The Codex frontend specialist performs design Phase A only in the frontend worktree.
2. The frontend specialist writes/commits `frontend-design-report.json` as `DESIGN_READY` without production frontend coding.
3. The Codex orchestrator computes the committed report digest:

```bash
python scripts/agentctl.py frontend design-digest <TASK-ID> --ref agent/<TASK-ID>-frontend
```

4. The orchestrator writes that digest into `frontend-design-review.json.reviewed_design_sha256` and reviews compatibility only: requirements, architecture/interfaces, security, accessibility, performance, scope, explicit human/brand/design-system constraints.
5. The orchestrator may not reject the design merely due to aesthetic preference.
6. Once APPROVED, the frontend specialist syncs and verifies:

```bash
python scripts/agentctl.py worktree sync <TASK-ID> frontend
python scripts/agentctl.py frontend design-gate <TASK-ID>
```

7. The frontend specialist implements the approved experience in the same frontend branch/worktree and writes `frontend-report.json`.
8. If the design report changes after approval, repeat compatibility review.

The Codex orchestrator integrates the frontend branch; it does not perform a second aesthetic implementation pass.

After required implementation reports are COMPLETE:

```bash
python scripts/agentctl.py task advance <TASK-ID>
```

moves to `INTEGRATION`.

## 4. Integration, selected testing, verification

Integrate worker branches and resolve conflicts deliberately.

Read `execution.test_depth`:
- NONE / SMOKE → no independent tester; use worker checks + repository verification
- TARGETED / FULL → spawn tester and require passing `test-report.json`

Commit the integrated revision and run:

```bash
python scripts/agentctl.py verify <TASK-ID>
```

Verification evidence is tied to the current commit. Any meaningful source/requirement/architecture/contract/design/test change makes downstream evidence stale.

## 5. Conditional security review while still INTEGRATION

If `execution.security_review_required=true`, spawn the security specialist on the exact verified integrated commit. It writes `security-report.json` with `reviewed_commit` and must APPROVE before task advance.

If false, do not spawn a security specialist. Baseline repository safety checks still run in verification.

Then:

```bash
python scripts/agentctl.py task advance <TASK-ID>
```

moves `INTEGRATION → REVIEW` only when required testing, verification, and any required security review pass.

## 6. Final review

Spawn reviewer. It should evaluate the actual product slice rather than demand unrelated production hardening.

Review:
- acceptance criteria
- primary user/demo journey
- real end-to-end behavior vs placeholders/fakes
- architecture/interface compatibility
- frontend design consistency when applicable
- technical credibility and maintainability proportional to scope
- selected test evidence
- current verification
- security report only when required
- final diff

Reviewer writes `review-report.json` with exact `reviewed_commit`.

## 7. Merge and DONE

Human reviews/merges the feature branch or PR.

After merge:

```bash
python scripts/agentctl.py task advance <TASK-ID> --merged
```

The final gate rechecks current verification, required security evidence, and final review, then moves `REVIEW → DONE`.

## Blockers

Use concrete categories such as:
- CONTRACT_CHANGE_REQUIRED
- ARCHITECTURE_DECISION_REQUIRED
- FRONTEND_DESIGN_CHANGE_REQUIRED
- DESIGN_SYSTEM_CHANGE_REQUIRED
- DATABASE_ACCESS_REQUIRED
- MIGRATION_CONFLICT
- DEPENDENCY_BLOCKED
- TEST_FAILURE
- SECURITY_REVIEW_REQUIRED
- PERMISSION_BOUNDARY_REQUIRED

Workers use the deterministic response format from `AGENTS.md`.
