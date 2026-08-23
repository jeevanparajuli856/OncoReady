# Git Standards

## Branches

Feature:
`feature/<TASK-ID>-short-name`

Parallel workers:
- `agent/<TASK-ID>-backend`
- `agent/<TASK-ID>-frontend`

## Rules

- never implement directly on main/master
- prepare with `python scripts/agentctl.py git prepare <TASK-ID>`
- commit planning/architecture/required contracts before implementation worktrees
- implementation worktrees require committed `IMPLEMENTATION` or later state
- keep commits focused and reviewable
- do not force-push shared branches without explicit approval
- worker branches pass role scope checks before handoff
- verification, required security review, and final review reference the exact integrated revision
- worktrees are optional; use them only when parallelism saves time
