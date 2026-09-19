---
name: frontend-development
description: Design and implement approved frontend features with a Codex frontend specialist using the shared contract, design-first gate when required, persistent design system, and frontend standards.
---

# Frontend Design & Development Workflow

1. Read `AGENTS.md` and `frontend/AGENTS.md`.
2. Read task state, feature spec, architecture report, frontend standards, existing design system, and contracts.
3. Never invent API endpoints or backend behavior.
4. Read `impacts.frontend_design_required`.
5. If design is required, complete/scope-check/commit the design-only report first and stop for orchestrator compatibility review. Approval must record the exact canonical design digest.
6. After the orchestrator commits its review on the feature branch, run `python scripts/agentctl.py worktree sync <TASK-ID> frontend` from the private frontend worktree.
7. Before implementation of a design-required task, run `python scripts/agentctl.py frontend design-gate <TASK-ID>` and require it to pass. If the design report changed after approval, stop for a fresh orchestrator review.
8. If design is not required, reuse established design-system patterns rather than redesigning the product.
9. Implement loading, error, empty, disabled, and success states.
10. Own visual hierarchy, typography, color usage, responsive presentation, animation, transitions, and microinteractions within upstream constraints.
11. Preserve accessibility, keyboard interaction, and reduced-motion behavior.
12. Add/update frontend tests.
13. Run lint, typecheck, tests, and build.
14. Perform visual/interaction self-review.
15. Write `frontend-report.json`.
16. Report contract/architecture blockers instead of editing backend/contract scope.
