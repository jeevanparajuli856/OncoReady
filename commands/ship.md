---
description: Run the full ECC-H pipeline on one piece of work — classify its size, run the phases that tier earns, and stop at both human gates. The default entry point for building anything.
argument-hint: "<what you want built>"
metadata:
  origin: ECC-H
---

# /ship

The main loop. Give it a piece of work; it classifies the size, picks the right
operation, and runs `ship-pipeline` with the phases that tier actually needs.

## Usage

```
/ship "add a receipts table to the dashboard"
/ship "the upload button does nothing on mobile"
/ship "rename the User model to Account everywhere"
```

## What it does

1. **Route.** Pick the operation from what the work is:

   | The work is | Skill |
   |---|---|
   | a capability that does not exist yet | `ship-add-feature` |
   | broken behavior | `ship-fix-defect` |
   | working behavior that should differ | `ship-change-feature` |
   | same behavior, better structure | `ship-refine-code` |
   | nothing runs yet | `ship-build-mvp` (or use `/ship-mvp`) |

2. **Classify size** with the `ship-pipeline` classifier and **state the tier in
   one line** so the user can override it before any work happens.

3. **Run the phase mask** for that tier. Trivial and small changes go straight to
   implement → review → commit. Standard and large get research and a plan first.

4. **Stop at both gates.** After Plan, and before Commit. Everything between them
   runs without stopping.

## Test policy

Set by the tier, not by the clock:

- trivial / small → `smoke-test`, one happy path after GREEN
- standard / large → `tdd-workflow`, full red-green-refactor
- anything touching a security trigger → forced to standard, so always full TDD

## Say the tier out loud

```
Tier: small — one file, no new dependency, the change is clear from reading it.
Running phases 4 → 5 → 6 with a smoke test. Say "standard" if you want a plan first.
```

Getting this wrong in the cheap direction is the failure mode worth guarding
against. When genuinely torn between two tiers, take the higher one.

## Related

`/plan` runs Phase 2 alone. `/gate` runs the checks. `/check` runs Phase 7
against the live app. `/ship-fix` and `/ship-mvp` skip the routing step.
