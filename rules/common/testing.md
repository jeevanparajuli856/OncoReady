# Testing Requirements

> Derived from ECC `rules/common/testing.md`. ECC-H changes one thing: the test policy
> **scales with the size tier** from `ship-pipeline`, instead of demanding full TDD for
> every change.

## Test policy by size tier

The `ship-pipeline` size classifier assigns every piece of work a tier. That tier sets
the test policy — this is the whole rule:

| Tier | Policy | Coverage target |
|------|--------|-----------------|
| **trivial** | One assertion that the change does what it says, if a test file already exists for that unit. | none |
| **small** | **Smoke test** — one happy-path test written after GREEN, before the work is called done. | none |
| **standard** | **Full TDD** — RED → GREEN → REFACTOR on each task. | 80% of the changed surface |
| **large** | **Full TDD** plus at least one integration or E2E test through the new path. | 80% of the changed surface |

**Escalation is one-way.** Anything touching a security trigger (see `security.md`) or a
public API/contract is at least **standard**, regardless of how few files it touches.
Auth, payments, user input, database queries, and secrets therefore always get full TDD.

You may not skip a tier's policy because of time pressure. Reclassify the work honestly
or state that you are overriding, and say so out loud.

## Test-Driven Development (standard and large tiers)

MANDATORY workflow:

1. Write test first (RED)
2. Run test — it should FAIL
3. Write minimal implementation (GREEN)
4. Run test — it should PASS
5. Refactor (IMPROVE)
6. Verify coverage of the changed surface (80%+)

Use the **tdd-guide** agent or the `tdd-workflow` skill.

## Smoke tests (trivial and small tiers)

One test, the happy path, written after the code works. Use the `smoke-test` skill.
It should fail if the feature is broken and pass if a user could use it. Nothing more.

A smoke test is not a lower-quality test — it is a *narrower* one. It still runs in CI,
still uses real assertions, and still lives in the repo.

## Test types

1. **Unit** — individual functions, utilities, components
2. **Integration** — API endpoints, database operations
3. **E2E** — critical user flows (framework chosen per language; see `e2e-testing`)

Which of these are required is set by the tier table above, not by preference.

## Troubleshooting test failures

1. Use the **tdd-guide** agent
2. Check test isolation
3. Verify mocks are correct
4. Fix the implementation, not the test — unless the test is genuinely wrong

Never delete or `.skip` a failing test to make a gate pass. If a test is wrong, fix it and
say why in the commit.

## Test structure (AAA pattern)

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### Test naming

Descriptive names that state the behavior under test:

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```
