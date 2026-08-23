---
name: feature-planning
description: Plan a small end-to-end product slice with explicit user impact, minimum architecture, conditional contracts/tests/security, and demo-critical acceptance criteria.
---

# Feature Planning Workflow

1. Read `AGENTS.md`, `docs/PROJECT.md`, task state, relevant architecture/ADRs, and existing code.
2. Define the user-visible outcome and how the slice strengthens the primary product journey.
3. Prefer an end-to-end vertical slice over separate frontend/backend/database tasks.
4. Define tight in-scope/out-of-scope behavior.
5. Identify only required database/backend/frontend/infrastructure impact.
6. Decide whether a stable cross-component contract is actually required.
7. Select the smallest useful test depth: NONE / SMOKE / TARGETED / FULL.
8. Classify security risk LOW / STANDARD / HIGH and whether dedicated review is justified.
9. Define acceptance criteria including the demo-critical happy path and meaningful failure states.
10. Record dependencies/risks and update `docs/features/<TASK-ID>.md`.
11. Do not implement production code during planning unless explicitly requested.

Do not let planning turn a small product slice into an enterprise program.
