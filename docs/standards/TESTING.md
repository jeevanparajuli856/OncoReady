# Testing Standards

Testing depth is chosen per task in `architecture-report.json.execution.test_depth`.

## NONE

Use for trivial/non-behavioral changes. No independent tester.

## SMOKE

Use implementation-owned build/lint/typecheck/basic happy-path checks plus repository verification. No independent tester.

## TARGETED

Use an independent tester for important logic, integration boundaries, and the primary user/demo journey.

## FULL

Use broader regression/release-level testing only when complexity or consequence justifies it.

## Principles

- Protect the primary user journey before maximizing coverage.
- Use the smallest effective layer: unit, integration, contract, or end-to-end.
- Test meaningful failure/validation/authorization boundaries when they exist.
- Avoid brittle cosmetic assertions and low-value test multiplication.
- Do not treat test count as product quality.
- Required skipped/unavailable checks fail.

`test-report.json` is mandatory only for TARGETED/FULL. `verification-report.json` remains final commit-bound evidence for every task.
