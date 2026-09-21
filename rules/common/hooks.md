# Hooks System

> Derived from ECC `rules/common/hooks.md`, extended with ECC-H's hook profiles.

## Hook events used by ECC-H

- **SessionStart** — load project state, brief, stack, and instincts
- **PreToolUse** — safety guards before Bash and before file writes
- **PostToolUse** — track which files changed this turn (no work in the hot path)
- **Stop** — batch format + typecheck the changed files, persist state, capture learning
- **PreCompact** — save state before the context window is compacted

## Hook profiles

Set via the plugin's `hook_profile` user config. Invalid values fall back to `standard`.

| Profile | What runs | Use when |
|---------|-----------|----------|
| `minimal` | session start, Bash guard, config protection, edit tracking, Stop gate | You want safety and the quality gate, nothing else |
| `standard` (default) | minimal + state persistence, observation capture, learning, pre-compact save | Normal work |
| `strict` | standard + GateGuard fact-forcing on destructive Bash and high-fan-in files | Unfamiliar or fragile codebase |

Disable all hooks with `hooks_enabled: false`.

## What hooks may and may not do

- A hook may **warn** freely. Warnings cost nothing and are ignorable.
- A hook may **block** only for safety (destructive commands, secrets, weakened configs)
  or for a failing quality gate. Blocking for style is not acceptable.
- A hook must never make a network call, and must never take more than a couple of
  seconds. Hook latency is paid on every single turn.
- Hooks are zero-dependency Node and must run on Windows, macOS, and Linux.

## Auto-accept permissions

Use with caution:

- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use the dangerously-skip-permissions flag
- Configure `permissions.allow` in `.claude/settings.json` instead

## Todo tracking

Track progress on multi-step work. A visible task list reveals out-of-order steps, missing
items, wrong granularity, and misinterpreted requirements while they are still cheap to fix.
