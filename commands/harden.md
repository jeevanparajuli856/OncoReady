---
description: Close the gaps a fast build leaves behind — missing tests on the demo path, unhandled errors, absent loading and empty states, secret hygiene, and env var checks.
argument-hint: "[--demo-path-only]"
metadata:
  origin: ECC-H
---

# /harden

Run this when a feature has stabilized and before `/demo`. Building fast is a
deliberate trade: some checks are deferred. This is where they get paid, in the
order that matters.

## Usage

```
/harden                    # everything below
/harden --demo-path-only   # only code the demo path touches
```

## The order

Work top-down and stop when time runs out — this is sorted by what actually
breaks demos.

### 1. Secrets

Run `/security-scan`. Any real key found in a tracked file must be **rotated**,
not just deleted — it is in the git history. Confirm `.env*` is gitignored and
`.env.example` lists every variable with no real values.

### 2. Environment variables

Check every variable named in the External services section of `PROJECT.md`
resolves in the environment the demo will run in — including the deploy, which is
usually not the one you have been developing in.

### 3. Errors on the demo path

Every `await` on the demo path needs a failure path that renders something. An
unhandled rejection in a Server Component is a blank screen, and a blank screen
during a demo is indistinguishable from a crash.

Use `silent-failure-hunter` for swallowed errors and empty catch blocks.

### 4. Loading and empty states

Every async view needs both. An empty list with no message reads as broken; a
missing loading state reads as frozen.

### 5. Tests on the demo path

Every MUST-DEMO feature gets at least a `smoke-test`. Work backward from the demo
path: if a step has no test, it has no alarm when it breaks.

### 6. Security review

If any of it touched auth, payments, user input, database queries, file paths, or
crypto, run the `security-reviewer` agent now. Row-level authorization gets the
two-user check from `security-review`: a second user must see none of the first
user's rows, enforced in logic rather than only in the UI.

### 7. Gate and review

`/gate` for the full check, then `/review` on the accumulated diff.

## Report

State what was hardened and **what was deliberately left**. An honest list of
remaining gaps is worth more than a clean-looking report:

```
Hardened
  - rotated the Supabase key that was in lib/db.ts (it was committed — rotate again if that repo is public)
  - added error + empty states to the receipts list
  - smoke tests on all 3 demo path steps

Left undone
  - no tests on the settings page (NICE tier, not on the demo path)
  - export button has no loading state
```
