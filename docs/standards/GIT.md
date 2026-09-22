# Git Standards

## Branches

Default feature:
`feature/<TASK-ID>-short-name`

Default parallel workers:
- `agent/<TASK-ID>-backend`
- `agent/<TASK-ID>-frontend`

For the human-approved two-day demo, use one `feature/two-day-demo` branch across both sprint days and all seven remaining tasks. The shared-branch exception in [AGENTS.md](../../AGENTS.md#12-gitworktrees) takes precedence: sequential scoped handoffs, task-specific commits/reports, explicit pre-handoff scope-check bases, and one final human-approved merge. Keep the existing planning changes when preparing that branch. Do not invoke per-task branch/worktree helpers for this mode.

## Rules

- never implement directly on main/master
- normally prepare with `python scripts/agentctl.py git prepare <TASK-ID>`; shared demo work follows the section 12 exception instead
- commit planning/architecture/required contracts before implementation worktrees
- implementation worktrees require committed `IMPLEMENTATION` or later state
- keep commits focused and reviewable
- do not force-push shared branches without explicit approval
- worker branches pass role scope checks before handoff
- verification, required security review, and final review reference the exact integrated revision
- worktrees are optional; use them only when parallelism saves time
