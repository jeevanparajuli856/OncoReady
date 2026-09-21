---
description: Bootstrap a working MVP from the project brief or a design doc — plan thin vertical slices, scaffold the first end-to-end path, then build, review, commit, and verify it live.
argument-hint: "[path/to/spec.md]"
metadata:
  origin: ECC-H
---

# /ship-mvp

Day one. Nothing runs yet and the goal is the first end-to-end path.

## Usage

```
/ship-mvp                    # from PROJECT.md
/ship-mvp docs/SDD-v0.6.md   # from a design doc as well
```

## What it does

Invokes the `ship-build-mvp` skill, which runs `ship-pipeline` at large tier with
the Scaffold phase enabled:

1. Read `PROJECT.md` — idea, goal, deadline, demo path, locked stack, non-goals
2. Order the work into **thin vertical slices**, thinnest first
3. Draw the MUST-DEMO / NICE / CUT cut-line against the deadline → **GATE 1**
4. Scaffold slice 1 until the app actually boots
5. Build the remaining MUST-DEMO slices at the tier each one earns
6. Review, then commit each slice separately → **GATE 2**
7. Walk the demo path live with `browser-qa`

## Prerequisite

Run `/ecch-init` first. The brief is this command's primary input — without it,
scope is a guess.

## The one rule

Slice vertically, not in layers. Slice 1 is the shortest complete path through
the demo, end to end, even with stub data. A plan that builds all the models,
then all the routes, then all the UI has nothing to show until the last hour,
which is the wrong risk to take against a deadline.
