---
name: debug-fast
description: Timeboxed debugging for deadline work — three bounded attempts, then roll back to the last green checkpoint and take a different approach instead of digging deeper. Use when a bug has survived two or three fixes, when the same error keeps reappearing in a different form, or when a debugging session has stopped producing new information.
metadata:
  origin: ECC-H
---

# Debug Fast

Debugging under a deadline fails in a specific way: not by being too shallow, but
by continuing too long down a path that stopped producing information three
attempts ago. Each fix is individually plausible, so there is never an obvious
moment to stop, and the sunk cost grows.

This skill puts a hard bound on that.

## When to Activate

- A bug has survived **two or three** attempted fixes
- The same error keeps returning in a slightly different form
- You are changing code to see what happens rather than to test a hypothesis
- `ship-fix-defect` has looped without converging
- The last three edits were each "one more thing to try"

**Do not use** for the first attempt at a bug — that is `ship-fix-defect`, which
starts by reproducing the defect as a failing test. Come here when that has not
worked.

| Also not this skill | Use instead |
|---|---|
| Build or type errors | `build-error-resolver` / `/fix` |
| Errors being swallowed somewhere | `silent-failure-hunter` |
| Buttons that work alone but leave the wrong end state | `click-path-audit` |
| An agent run failing, not app code | `agent-introspection-debugging` |

## The rule

**Three attempts, then stop and change approach.** Not three edits — three
*hypotheses*, each one stated before the edit and checked after.

An attempt is: state what you believe is wrong, state what you expect to see if
you are right, change one thing, look. If the observation does not match the
prediction, the hypothesis was wrong and the attempt is spent.

Track them explicitly. Losing count is the failure mode this skill exists to
prevent.

## How It Works

### Attempts 1–3: hypothesis, prediction, one change

```
Hypothesis:  the session cookie is not being forwarded on the server fetch
Prediction:  logging the outbound headers shows no Cookie header
Change:      log the headers
Observed:    Cookie is present and correct
Verdict:     wrong — attempt 1 spent
```

Rules for the three attempts:

1. **One change at a time.** Two changes at once means you cannot attribute the
   result to either.
2. **Read before you edit.** `code-explorer` to trace the actual path is a better
   use of an attempt than a guess.
3. **Check your assumptions are current.** Verify the API you think you are
   calling with `find-docs` rather than from memory. A surprising
   number of "impossible" bugs are a signature that changed.
4. **Revert failed attempts immediately.** Do not accumulate speculative edits.

### After three: stop and roll back

```bash
/checkpoint back
```

Return to the last green checkpoint. Everything from the three failed attempts
goes away — that is the point. Speculative edits left in the tree are how a
single bug turns into three.

Then take a **different approach**, not a fourth attempt at the same one:

| If you were | Try instead |
|---|---|
| Reading code to find the cause | Bisect: `git bisect`, or comment out half the path |
| Guessing at runtime state | Instrument it: log or breakpoint at the boundary |
| Fixing the symptom | Question the design — is this state in the wrong place? |
| Debugging your own code | Check the library's issue tracker; assume you are not the first |
| Working from the error | Work backward from the last known-good state instead |

### The escape hatch: cut it

If the bug is in a **NICE** or **CUT** item, delete the feature and move on. This
is a legitimate outcome, not a failure — a working demo without the feature beats
a broken demo with it.

If it is **MUST-DEMO**, it has to be fixed, but "fix" can mean a narrower path
that avoids the broken code entirely. A hardcoded fallback on the demo path,
clearly labeled as such, is a better use of the last hour than a fourth attempt.

Say out loud which of these you are doing. A silent workaround becomes a mystery
next session.

## What to record

When it is solved, save a `lesson` to `.ecch/memory/` via `session-memory` — but
only if the cause was non-obvious. Record what it actually was, not the three
things it was not:

```
Blank dashboard was a Server Component reading a cookie during static render.
Fix: export const dynamic = 'force-dynamic'. The error was silent because the
cookie read returns undefined at build time rather than throwing.
```

That note is worth more than the fix, because the same class of bug will happen
again in this project.

## Verification

- Each attempt had a stated hypothesis and prediction before the edit
- Attempts were counted, and the count reached three before the approach changed
- Failed attempts were reverted, not left in the tree
- The rollback actually happened — the tree is at a known-good state
- The second approach was genuinely different in kind, not a variation
- If the feature was cut or worked around, that was said explicitly
- A non-obvious root cause was recorded in `.ecch/memory/`
