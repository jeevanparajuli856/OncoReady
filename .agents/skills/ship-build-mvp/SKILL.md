---
name: ship-build-mvp
description: Bootstrap a working MVP from a design doc, a PROJECT.md brief, or a one-line idea — plan thin vertical slices, scaffold the first end-to-end path, then implement, review, gated-commit, and verify it live. Use when nothing runs yet and the goal is a demoable slice, not a finished product.
metadata:
  origin: ECC-derived
  upstream: skills/orch-build-mvp
---

# ship-build-mvp

Actor · action · target: **ship · build · mvp**. Thin wrapper over the shared
engine in [`ship-pipeline`](../ship-pipeline/SKILL.md).

## When to Use

- Nothing runs yet, and the goal is the **first end-to-end path**.
- The input is a `PROJECT.md` brief, a design/spec doc (SDD, PRD), or a one-line
  idea. Takes an optional doc path, e.g. `docs/SDD-v0.6.md`.
- Day one of a hackathon, or hour one of a new side project.

Do not use it once the app already boots — that is `ship-add-feature`.

## Operation settings

- **Default size floor:** large — this is the full pipeline including Scaffold.
- **Phase mask:** 0 (read the brief) → 1 → 2 (heavy) → 3 (scaffold) → 4 → 5 → 6 → 7.
- **First move (phase 0 → 2):** read `PROJECT.md` (and the spec doc if given);
  extract scope, locked stack, non-goals, and the demo path; order the work into
  **thin vertical slices** — one end-to-end path first, not all-models-then-all-views.
  Phase 3 stands up that first slice.

## Vertical slices, not layers

This is the whole discipline of the skill. A slice is demoable on its own:

```
GOOD  slice 1: upload one receipt → parse it → show one row in a table
      slice 2: totals by category → bar chart
      slice 3: auth so rows belong to a user

BAD   step 1: all database models
      step 2: all API routes
      step 3: all UI
```

The layered version has nothing to show until the very end, which is exactly the
wrong risk profile for a deadline. The sliced version is demoable after slice 1
and every slice after it.

## How It Works

1. **Read the brief.** `PROJECT.md` first: idea, goal and deadline, demo path,
   locked stack, non-goals. If a spec doc was supplied, read it too and note any
   place it contradicts the brief — the brief wins, or ask.
2. **Slice it.** Order the feature list into vertical slices, thinnest first.
   Slice 1 must be the shortest complete path through the demo.
3. **Draw the cut-line.** Mark each slice MUST-DEMO / NICE / CUT against the
   deadline. If everything is MUST-DEMO, the scope is wrong — say so now, not on
   the last night. → **GATE 1: present the slice plan and cut-line; wait.**
4. **Scaffold slice 1** (phase 3). Stand up the real end-to-end path with stub
   data if needed. Stop when it runs.
5. **Implement the remaining MUST-DEMO slices** (phase 4) at the tier each one
   earns. Most slices land at standard. Anything touching auth, payments, user
   input, or the database is at least standard by the escalation rule and gets
   full TDD.
6. **Review** (phase 5) — `code-reviewer`, plus `security-reviewer` on any slice
   that trips a security trigger.
7. **Commit each slice separately** as `feat:` (phase 6). → **GATE 2.**
8. **Verify live** (phase 7) — the `browser-qa` skill walks the demo path after each slice
   lands. A slice that does not survive a real click-through is not done.

## Setting up the project first

If the repo has no `PROJECT.md` yet, run `/ecch-init` before this skill. The brief
is this skill's primary input; running without one means guessing at scope,
which is how MVPs grow a login page nobody asked for.

## Example

```
/ship-mvp docs/SDD-v0.6.md

→ read brief + SDD → 6 vertical slices, cut-line: 3 MUST-DEMO / 2 NICE / 1 CUT
  [GATE 1: approve]
→ scaffold slice 1 (upload → parse → table row), app boots
→ slice 2, slice 3 at standard tier with TDD
→ code-reviewer + security-reviewer (slice 3 touches uploads)
→ commit feat: per slice  [GATE 2: confirm]
→ browser-qa walks the demo path → clean
```

## Verification

- Slice 1 was demoable on its own before slice 2 started
- The cut-line was stated and the CUT items are recorded in `PROJECT.md` non-goals
- Nothing outside MUST-DEMO was built while a MUST-DEMO slice was still open
- Each slice is its own commit
- The demo path runs live at the end, not just in tests
