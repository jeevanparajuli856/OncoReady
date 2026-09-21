# Operator quickstart

The repository carries the workflow; the human should not need a giant prompt for every phase.

## Brand-new product

Tell Codex:

```text
This is a brand-new product. Treat my idea as PROJECT INCEPTION.
Follow AGENTS.md and the project-inception skill.
Optimize for a memorable hero journey, real end-to-end functionality, strong technical credibility, exceptional frontend presentation, demo reliability, and rapid delivery.
Keep architecture and backlog small; prefer vertical slices and avoid unnecessary production hardening.
Do not implement or create tasks yet.
Continue automatically unless a material decision genuinely requires me.
```

## Approve first slice

```text
Approve <TASK-ID> as the first implementation slice.
Proceed using AGENTS.md, the task spec, and scripts/agentctl.py. Start with architecture and contracts while the task is PLANNING; do not treat a proposed backlog item as build-ready.
Keep the slice end-to-end and use only the contract/test/security depth architecture actually requires.
Continue automatically until human action is genuinely required.
```

## Lifecycle

```text
PROPOSED → PLANNING → BUILD_READY → IMPLEMENTATION → INTEGRATION → REVIEW → DONE
```

Architecture chooses whether contracts, independent testing, and dedicated security review are required.

## Codex frontend work — design-required task

When `frontend_design_required=true`, Codex starts the frontend specialist in the prepared frontend worktree. The specialist follows `AGENTS.md`, `frontend/AGENTS.md`, the locked `docs/design/DESIGN_SYSTEM.md`, and applicable installed frontend skills, then completes the design-only report before production implementation. For OncoReady, this phase designs the feature inside the approved visual system; it does not authorize a rebrand or restyle.

The Codex orchestrator reviews that report for compatibility, binds approval to its exact digest, and returns the approved handoff to the same frontend worktree. The frontend specialist then uses:

```bash
python scripts/agentctl.py worktree sync <TASK-ID> frontend
python scripts/agentctl.py frontend design-gate <TASK-ID>
```

## Codex frontend work — established design

When `frontend_design_required=false`, Codex starts the frontend specialist to implement with the established locked design system and complete all relevant interaction states. No design-only handoff is required, and no global visual change is permitted.

When the frontend specialist finishes or stops, the Codex orchestrator reads `frontend-report.json`, integrates the worker branch when complete, and continues orchestration.

## After final review and merge

```text
The feature branch/PR for <TASK-ID> is approved and merged. Perform post-merge closure.
```
