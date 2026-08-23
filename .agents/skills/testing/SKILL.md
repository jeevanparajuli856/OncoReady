---
name: testing
description: Independently test only tasks whose architecture selects TARGETED or FULL depth, focusing on critical user journeys and meaningful boundaries rather than test volume.
---

# Testing Workflow

This specialist is required only when `architecture-report.json.execution.test_depth` is `TARGETED` or `FULL`.

1. Read acceptance criteria, architecture execution controls, applicable contracts, implementation reports, and integrated code.
2. Protect the primary user/demo journey first.
3. Add the smallest deterministic set that proves important logic/integration and meaningful failures.
4. Cover authorization/security boundaries only where they actually exist.
5. Avoid low-value test multiplication and brittle cosmetic assertions.
6. Add tests only under tester-permitted paths.
7. Run exact relevant commands and do not hide skipped/flaky tests.
8. Update `test-report.json`; set `tests.passed=true` only when required tests pass.
9. Run `python scripts/agentctl.py scope check <TASK-ID> tester` when applicable.

For NONE/SMOKE tasks, implementation-owned checks plus repository verification are sufficient; do not spawn this specialist merely to satisfy ceremony.
