---
name: scope-guard
description: Hold the MUST-DEMO / NICE / CUT cut-line when new work arrives mid-build — classify the new idea against PROJECT.md's goal and non-goals, and say plainly what it displaces. Use when a new feature is suggested while something MUST-DEMO is still open, when scope has grown since the plan, or when the deadline and the task list no longer fit each other.
metadata:
  origin: ECC-H
---

# Scope Guard

The cut-line drawn in Phase 2 of `ship-pipeline` decays the moment building
starts. Good ideas arrive, they are genuinely good, and each one costs less than
the remaining budget — right up until nothing is finished.

This skill is the check that keeps the line real.

## When to Activate

- A new feature is suggested while a MUST-DEMO item is still open
- The task list has grown since Gate 1 without the deadline moving
- Someone says "while we're in here…", "it'd be cool if…", or "quick add"
- Time remaining and work remaining have stopped fitting
- Before the last quarter of the time budget, as a scheduled check

**Do not use it** to refuse work. The user sets scope; this skill makes the
trade-off visible so they can set it deliberately. Related: `product-lens`
pressure-tests *whether* to build something at all; scope-guard handles *when*,
given a deadline and a line already drawn.

## The classification

Every incoming idea gets one of three answers, decided against `PROJECT.md`:

| Class | Test | Response |
|---|---|---|
| **MUST-DEMO** | The demo path in `PROJECT.md` does not work without it | Build it now, ahead of NICE work |
| **NICE** | Real value; the demo survives without it | Queue it. Build only when every MUST-DEMO item is green |
| **CUT** | Contradicts a non-goal, or does not fit the remaining time | Name it, record it, do not build it |

Read the demo path literally. If a step in it cannot be completed without the new
work, it is MUST-DEMO. If you have to argue for why it matters, it is not.

## How It Works

### 1. Classify out loud, in one line

> "Adding OAuth is NICE — the demo path signs in with the magic link, which works.
> It goes behind the receipt-parsing fix."

Never silently absorb new work into the current task. Silent absorption is the
mechanism by which the cut-line stops existing.

### 2. Name what it displaces

Time is fixed, so anything added removes something. Say what:

> "Two hours for OAuth. That is the chart polish and the seed data. The demo
> works without OAuth and looks unfinished without the chart — I would keep the
> chart. Your call."

A trade-off stated as a trade-off gets a real decision. "Sure, I can add that"
gets a nod, and the cost surfaces at 3am.

### 3. Record the decision

- CUT items → the **Non-goals** section of `PROJECT.md`, so they stop being
  reconsidered every session
- NICE items → the queue, in order
- Reclassifications → a `decision` note in `.ecch/memory/` via `session-memory`
  when the reasoning was non-obvious

A CUT item that is not written down comes back within two sessions.

### 4. Escalate when the arithmetic stops working

If MUST-DEMO alone no longer fits the remaining time, that is not a scheduling
problem to absorb quietly:

> "Four MUST-DEMO items left, roughly five hours of work, three hours on the
> clock. One has to move to NICE. Auth is the biggest and the demo can use a
> seeded user — I would move that. Or we cut the export."

Say it as soon as the arithmetic breaks, not when the time runs out. Early it is
a choice; late it is a failure.

## Anti-patterns

| Pattern | Why it fails |
|---|---|
| "It's only a small change" | Small changes are how scope grows; the cost is never the code, it is the debugging |
| Building NICE work while MUST-DEMO is open | The demo breaks and the polish is irrelevant |
| Reopening a CUT item without saying so | The reason it was cut has not changed |
| Absorbing new work into the current task silently | The cut-line stops being a real constraint |
| Refusing the work outright | Scope is the user's call, not yours |

## Verification

- Every new idea got an explicit MUST-DEMO / NICE / CUT call
- What it displaced was named before it was accepted
- CUT items landed in `PROJECT.md` non-goals
- No NICE work started while a MUST-DEMO item was open
- When MUST-DEMO stopped fitting the clock, that was raised immediately
