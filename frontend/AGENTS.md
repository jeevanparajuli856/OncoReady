# Frontend Agent Instructions

These rules specialize the root `AGENTS.md`.

- The Codex frontend specialist owns visual and interaction design plus frontend implementation within approved product, architecture, interface, security, accessibility, performance, brand, and human constraints.
- Use the approved API contract when the task declares one; otherwise consume only existing authoritative interfaces and never invent endpoints.
- Read and preserve the established design system when present.
- When architecture marks `frontend_design_required=true`, complete the design-only pass and orchestrator compatibility gate before production frontend coding.
- Prefer generated API clients where practical.
- Preserve accessibility and reduced-motion behavior.
- Handle loading, error, empty, disabled, and success states.
- Do not silently modify backend, security, architecture, or contract scope.
- Do not let non-authoritative aesthetic suggestions override the approved frontend design.

## Product presentation

The rapid-delivery workflow is internal. Do not label user-facing surfaces as prototypes, portfolio work, toys, practice apps, or cheap demos. Present real capabilities confidently without inventing customers, scale, compliance, security guarantees, integrations, or behavior.

Avoid unfinished placeholder copy, starter-template branding, default framework imagery, and generic dashboard composition in intended product surfaces.

## Writable scope

Follow `permissions.frontend` in `.ai/tasks/<TASK-ID>/task.json`. It normally permits:

- `frontend/**`
- `tests/frontend/**`
- `docs/design/**`
- `.ai/tasks/<TASK-ID>/frontend-design-report.json`
- `.ai/tasks/<TASK-ID>/frontend-report.json`

Do not modify backend/database paths, contracts, `task.json`, or `frontend-design-review.json` unless the orchestrator explicitly changes the permission boundary.

## Before frontend work

Read the task state, feature spec, architecture report, applicable contracts, `docs/standards/FRONTEND.md`, the established design system, and relevant database/backend reports. Do not begin implementation before committed task state reaches `IMPLEMENTATION`.

## Design-first gate

When `frontend_design_required=false`, implement with the established design system and patterns without redesigning unrelated surfaces.

When `frontend_design_required=true`:

1. In the frontend worktree, inspect the existing UI and decide the visual/interaction direction.
2. Cover layout, hierarchy, typography, color, component presentation, responsive behavior, application states, motion, accessibility, and reduced motion.
3. Write `frontend-design-report.json` with `status: DESIGN_READY` before production frontend changes.
4. Scope-check and commit that design-only handoff on `agent/<TASK-ID>-frontend`.
5. Return control to the Codex orchestrator for compatibility review bound to the exact canonical design-report digest.
6. After approval, sync the frontend worktree and run the gate:

```bash
python scripts/agentctl.py worktree sync <TASK-ID> frontend
python scripts/agentctl.py frontend design-gate <TASK-ID>
```

If the design report changes after approval, stop for a fresh compatibility review. After the gate passes, implement the approved design in the same frontend branch/worktree.

## Completion

Verify the primary journey, responsive presentation, keyboard/focus behavior, application states, motion/reduced-motion behavior, and absence of unfinished placeholder UI. Run applicable lint, typecheck, tests, and production build; scope-check the frontend role; then update `frontend-report.json` and use the worker completion format from the root `AGENTS.md`.
