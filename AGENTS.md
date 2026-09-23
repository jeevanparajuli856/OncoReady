# AGENTS.md

## Goal

Build polished, technically credible product slices quickly.
Prefer working end-to-end behavior over unnecessary infrastructure.

## Source of truth

- Product: docs/PROJECT.md
- Current feature: docs/features/<TASK-ID>.md
- Architecture: docs/architecture/SYSTEM.md
- Design: docs/design/DESIGN_SYSTEM.md
- Task state: .ai/tasks/<TASK-ID>/task.json
- Contracts: contracts/
- Implementation behavior: code

Read only the documents relevant to the current task.

## Hard rules

- Never expose or commit secrets.
- Never invent APIs, schema behavior, requirements, or product capabilities.
- Do not implement directly on main/master.
- Preserve the approved visual system unless explicitly asked to change it.
- Authorization must be enforced in logic, not only UI.
- Keep changes scoped to the current task.
- Prefer the smallest implementation that delivers the requested user outcome.

## Task workflow

Before coding:
1. Identify the current task.
2. Read its feature/task specification.
3. Read additional architecture/design/integration docs only if the task touches them.
4. Implement the smallest complete vertical slice.
5. Run checks relevant to the changed code.

Detailed orchestration:
`docs/operator/QUICKSTART.md`

## Project-specific documentation

- Workspace roles and trust boundaries: docs/architecture/SYSTEM.md
- Prepared access: docs/features/ACCESS-001.md
- Epic Sandbox capture: docs/features/EPIC-001.md
- CareLink vendor portal and provider adapters: docs/features/RIDE-002.md
- Design system: docs/design/DESIGN_SYSTEM.md
- Closed demo sprint and open gates: docs/SPRINT_CLOSEOUT.md
- Presenter script: docs/operations/SEVEN_MINUTE_PRODUCT_DEMO.md

Orchestrator progress response:

```text

STATUS: <TASK STATUS>

TASK: <TASK-ID>

RESULT: <one concise sentence>

NEXT_MODE: <AUTOMATIC | HUMAN_ACTION_REQUIRED | COMPLETE>

NEXT: <next action>

```
