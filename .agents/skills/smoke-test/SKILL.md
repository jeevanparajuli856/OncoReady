---
name: smoke-test
description: Write one happy-path test after a feature works, at trivial and small size tiers where full TDD is not warranted. Covers picking the cheapest harness the project already has, what a smoke test must assert, and what it must not try to cover. Use when a trivial or small change is GREEN and needs its one test before being called done.
metadata:
  origin: ECC-H
---

# Smoke Test

The **trivial / small** tier's test policy. One test, the happy path, written
after the code works and before the work is called done.

This is the counterpart to `tdd-workflow`, which is the **standard / large**
policy. The `ship-pipeline` size classifier decides which applies — you do not.

## When to Activate

- A trivial or small change is GREEN and about to be called done
- Phase 4 of `ship-pipeline` at trivial or small tier
- The user asks for "a quick test" or "just cover the main path"

**Do not use** when:

| Condition | Use instead |
|---|---|
| Tier is standard or large | `tdd-workflow` |
| The diff touches auth, payments, user input, DB queries, paths, crypto, or secrets | `tdd-workflow` — the security trigger forces standard tier |
| The change is a bug fix | `ship-fix-defect` — a fix starts from a *failing* regression test, which is the opposite order |
| A user flow across pages needs covering | `e2e-testing` |

The bug-fix exclusion matters. Reproducing the bug first is what proves you fixed
the actual defect rather than something adjacent.

## Why after, not before

TDD's value is design pressure: writing the test first forces you to decide the
interface before you commit to an implementation. On a one-function change there
is no interface to discover, so that pressure buys nothing and the cycle costs a
full extra turn.

What still has value on a small change is **regression protection** — proof the
thing works now, and an alarm when it stops. A smoke test buys that at a fraction
of the cost.

A smoke test is not a lower-quality test. It is a *narrower* one: real assertions,
committed to the repo, running in CI. What it gives up is coverage of edge cases,
not rigor.

## How It Works

### 1. Use the harness the project already has

Never add a test framework to write one test. Detect what exists:

| Signal | Harness |
|---|---|
| `vitest` in devDependencies, `vitest.config.*` | `vitest` |
| `jest` in devDependencies, `jest.config.*` | `jest` |
| `@playwright/test`, `playwright.config.*` | `playwright` (UI paths only) |
| `pytest` in dev deps, `tests/`, `conftest.py` | `pytest` |
| `go.mod` | `go test` |
| `Cargo.toml` | `cargo test` |

If the project has **no** test harness at all, do not install one for a smoke
test. Say so, and verify by running the code path directly — a script, a curl
against the dev server, or `browser-qa`. Then note in the summary that the change
is unprotected. Silently skipping the step is what is not allowed.

### 2. Put it where the project's tests live

Match the existing convention — `__tests__/`, `*.test.ts` beside the source,
`tests/`. A test in a new directory the runner does not scan is not a test.

### 3. Assert the thing a user would notice

```typescript
// GOOD — fails if the feature is broken
test('GET /api/receipts returns the caller\'s receipts', async () => {
  const res = await GET(new Request('http://x/api/receipts?userId=u1'));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual([{ id: 'r1', total: 12.5 }]);
});

// BAD — passes even when the endpoint returns garbage
test('GET /api/receipts works', async () => {
  const res = await GET(new Request('http://x/api/receipts'));
  expect(res).toBeDefined();
});
```

The test must fail if the feature is broken. A test that cannot fail is worse
than no test: it costs the same to run and buys false confidence.

### 4. Run it, and watch it fail once

Run it. Then break the implementation on purpose — flip a condition, return the
wrong value — and confirm the test goes red. Put it back.

That ten-second check is the entire quality bar for this skill. Without it you
have not verified the test is wired to anything.

### 5. Stop at one

One happy path. Resist adding the empty case, the error case, and the boundary
case — that is the standard tier's job, and if the change deserves them it was
misclassified. Reclassify instead of quietly doing TDD anyway.

## Escalating

Write the test, and if writing it reveals the change was bigger than it looked —
you needed three mocks, or you could not test it without restructuring — that is
the classifier telling you the tier was wrong. Say so, reclassify to standard,
and go back through Plan. Untestable code is a design signal, not an obstacle to
route around.

## Verification

- The harness already existed in the project; nothing new was installed
- The test sits where the runner will find it
- It asserts a concrete value, not just that something is defined
- It was seen to fail against a deliberately broken implementation
- Exactly one happy path is covered
- If no harness existed, the gap was stated out loud rather than skipped
