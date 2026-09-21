---
description: Verify the running app end to end — boot it, walk the demo path from PROJECT.md in a real browser, and report console errors and broken steps.
argument-hint: "[url]"
metadata:
  origin: ECC-H
---

# /check

Phase 7 of `ship-pipeline`, on demand. Compiling is not the same as working.

## Usage

```
/check                        # boot the dev server and walk the demo path
/check http://localhost:3000  # against an already-running app
```

## What it does

1. Read the **Demo path** from `PROJECT.md`. If there is none, ask for it and
   offer to add it to the brief — every later run gets cheaper.
2. Start the dev server **in the background** (a foreground server holds the turn
   open; the `pre-bash-guard` hook blocks that) and wait for it to be reachable.
3. Use the `browser-qa` skill with the Chrome DevTools MCP to walk each step in
   order, as a user would.
4. Capture console errors, network failures, and a screenshot of the final state.

## Report

```
Demo path — 3 steps

  1. Sign in with the magic link         PASS
  2. Upload a receipt                    PASS
  3. See the total in the chart          FAIL — chart renders empty

  Console: 1 error
    TypeError: Cannot read properties of undefined (reading 'map')
      at ReceiptChart (components/receipt-chart.tsx:24)
```

Report what happened, not what should have happened. A step that half-worked is a
FAIL with a note.

## Escalating

| Situation | Next |
|---|---|
| A step fails | `/ship-fix` with the console error |
| Steps pass individually but the end state is wrong | `click-path-audit` |
| The path is worth protecting permanently | `e2e-runner` writes a Playwright test |
| Nothing renders and there is no error | `silent-failure-hunter` |
