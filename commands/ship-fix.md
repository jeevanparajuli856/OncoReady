---
description: Fix a bug through the pipeline — reproduce it as a failing test, fix to green, review, and gated commit.
argument-hint: "<what is broken>"
metadata:
  origin: ECC-H
---

# /ship-fix

## Usage

```
/ship-fix "chart is empty when a user has one receipt"
```

## What it does

Invokes the `ship-fix-defect` skill:

1. **Reproduce first.** Write a *failing* test that demonstrates the bug. This is
   what separates a fix from a tweak — without it you cannot tell whether you
   fixed the defect or something next to it.
2. Fix until that test goes green.
3. Review; add `security-reviewer` if the defect sits in a security-sensitive path.
4. Commit as `fix:` → **GATE 2**.

The failing test comes first regardless of tier. The tier only decides how much
*additional* testing the fix earns.

## When it does not converge

After three attempted fixes, stop and switch to `debug-fast`: roll back to the
last green checkpoint and take a different approach rather than a fourth attempt
at the same one.

## Related

`/fix` is for build and type errors — a different problem with a different loop.
`silent-failure-hunter` is the agent for behavior that is wrong while nothing
throws.
