---
name: ecch-guide
description: Guide users through ECC-H's current agents, skills, commands, hooks, rules, hook profiles, and per-project setup by reading the live repository surface before answering. Use when someone asks what ECC-H includes, which part to reach for, or how to set it up on a project.
metadata:
  origin: ECC-derived
  upstream: skills/ecc-guide
---

# ECC-H Guide

Use this skill when a user needs help understanding, navigating, installing, or
choosing parts of ECC-H.

## When To Use

Use this skill when the user:

- asks what ECC-H includes
- wants help finding a skill, command, agent, hook, rule, or hook profile
- is new to the repository and needs a guided path
- asks "how do I do X with ECC-H?"
- asks which components fit a project
- needs a lightweight explanation of how commands, skills, agents, hooks, and
  rules relate
- is confused by install paths, per-project setup, or the hook profiles

## Core Principle

**Answer from current files, not memory.** Counts and catalogs go stale the first
time someone adds a skill. Inspect before giving a concrete answer:

```bash
find skills -maxdepth 2 -name SKILL.md | sort
find commands -maxdepth 1 -name '*.md' | sort
find agents -maxdepth 1 -name '*.md' | sort
node -e "const d=require('./hooks/hooks.json').hooks;for(const k of Object.keys(d))console.log(k, d[k].map(h=>h.id).join(', '))"
```

Use the smallest set of reads that answers the question.

## Repository Map

- `README.md` — what ECC-H is and how it differs from upstream ECC
- `SETUP.md` — one-time install, then the per-project `/ecch-init` flow
- `ATTRIBUTION.md` — what is ported from ECC and what is original
- `skills/*/SKILL.md` — workflows and domain playbooks
- `agents/*.md` — delegated subagent role prompts
- `commands/*.md` — slash commands
- `rules/common/` + `rules/{typescript,react,python,web}/` — always-follow guidelines
- `hooks/hooks.json`, `hooks/codex-hooks.json`, `scripts/hooks/` — hook wiring and behavior
- `scripts/lib/` — detection, gate, state, memory, instinct-reading libraries
- `templates/` — what `/ecch-init` writes into a project
- `.claude-plugin/`, `.codex-plugin/`, `.codex/` — harness manifests

## The one thing to explain first

ECC-H's centre is the **`ship-pipeline` size classifier**. Everything else keys
off it:

| Tier | Phases that run | Test policy |
|---|---|---|
| trivial | 4 → 5 → 6 | assert only |
| small | (1 light) → 4 → 5 → 6 | `smoke-test` |
| standard | 1 → 2 → 4 → 5 → 6 | `tdd-workflow` |
| large | 1 → 2 → (3) → 4 → 5 → 6 → 7 | `tdd-workflow` + `e2e-testing` |

A security trigger or a public contract forces at least **standard**. That is why
ECC-H can be fast without being sloppy: the ceremony scales to the blast radius,
and the escalation rule means it never scales down on the things that matter.

The two human gates — after Plan, before Commit — always apply.

## Where to start, by question

| The user asks | Point them at |
|---|---|
| "set this up on my project" | `/ecch-init`, then `SETUP.md` |
| "start a new project from nothing" | `/ship-mvp` (`ship-build-mvp`) |
| "add a feature" | `/ship` (routes to the right `ship-*` skill) |
| "it's broken" | `/ship-fix`, or `debug-fast` after three failed attempts |
| "is this ready to demo?" | `/demo`, then `/harden` |
| "did I break anything?" | `/gate`, then `/review` |
| "the build fails" | `/fix` or the `build-error-resolver` agent |
| "what did we decide last time?" | `session-memory`, `.ecch/memory/` |
| "what has it learned?" | `/instinct-status` |
| "which library/API do I use?" | `find-docs` (ctx7) |
| "should we even build this?" | `product-lens`, then `council` if it is a real fork |

## Hook profiles

Set `hookProfile` in `.ecch/config.json`, or `ECCH_HOOK_PROFILE` in the environment.

| Profile | Adds | Use when |
|---|---|---|
| `minimal` | session start, Bash guard, config protection, edit tracking, Stop gate | You want safety and the gate, nothing else |
| `standard` (default) | + state, checkpoints, observations, learning, compaction | Normal work |
| `strict` | + GateGuard fact-forcing on high-fan-in files and destructive commands | Unfamiliar or fragile codebase |

`hooksEnabled: false` turns all of them off.

## Response Style

Lead with the answer, then give the next action. Most users do not need a catalog
dump.

Good first response shape:

1. what to use
2. the exact command to run
3. one line on what happens next

Bad shape: listing every skill in the repository and asking the user to choose.

## Relationship to upstream ECC

ECC-H is a subset and re-tuning of [affaan-m/ECC](https://github.com/affaan-m/ECC),
MIT-licensed. If someone asks for something ECC-H does not ship — a language
reviewer for Go, the orchestration/worktree runtime, the domain skill packs —
the honest answer is that upstream ECC has it and ECC-H deliberately does not.
Point them at the upstream repository rather than improvising a replacement.

Do not claim ECC-H has a component without checking the file first.
