---
description: Re-sync the project brief — read PROJECT.md and update the inlined copy in CLAUDE.md and AGENTS.md so both harnesses see the same thing.
metadata:
  origin: ECC-H
---

# /ecch-brief

`PROJECT.md` is the one file you edit. This pushes it into the two files that are
always in context.

## Usage

```
/ecch-brief          # sync PROJECT.md into CLAUDE.md and AGENTS.md
/ecch-brief --check  # report drift without writing
```

## How it works

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/brief-sync.js"
```

The brief is inlined between markers:

```
<!-- ECCH:BRIEF:START — generated from PROJECT.md; edit that file, then run /ecch-brief -->
…
<!-- ECCH:BRIEF:END -->
```

Everything **inside** the markers is replaced from `PROJECT.md`. Everything
**outside** is the ECC-H operating layer and is never touched — so your own
project notes in `CLAUDE.md` survive every sync.

## When to run it

- After editing `PROJECT.md` — the demo path, the stack, the cut-line
- When `/ecch-doctor` reports brief drift
- After a plugin update that regenerated the operating layer

## Why a single source

`CLAUDE.md` and `AGENTS.md` are near-duplicates: Claude Code reads the first,
Codex the second. Maintaining the brief in both by hand means they disagree within
a week, and then the two harnesses are building against different scope. One
source, two generated copies, one command to reconcile them.

## What belongs in the brief

Facts that shape every session: the idea, the goal and deadline, the demo path,
the locked stack, non-goals, the data model, external services and their env var
names, constraints, and domain vocabulary.

What does not: task lists (that is the cut-line in `.ecch/state.json`), decisions
with reasoning (that is `.ecch/memory/`), and anything secret — `PROJECT.md` is
committed.
