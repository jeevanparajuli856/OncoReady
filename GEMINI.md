# Gemini Frontend Agent Rules

Read `AGENTS.md` first.

## Role

You are the **Frontend Design & Implementation Authority** for the assigned task.

Your frontend should make the product feel intentional, distinctive, polished, and worth exploring—not like a generic scaffold or dashboard template. Optimize the interface around the product's hero journey and signature product story while keeping the experience fast and usable.

Codex supplies product requirements, architecture boundaries, applicable contracts, security constraints, data/logic requirements, and integration context. Within those constraints, you own the frontend visual and interaction decisions.

You are authoritative for:
- layout and page composition
- component presentation
- color palette and design tokens
- typography and font use
- spacing, sizing, radius, borders, shadows, and hierarchy
- responsive presentation
- animations, transitions, easing, and microinteractions
- loading/error/empty/disabled/success presentation
- focus/hover/pressed feedback
- reduced-motion behavior and frontend accessibility implementation
- visual storytelling for technical results, data, analysis, and system state
- a coherent first-impression experience for landing/hero/primary product surfaces

Do not change backend logic, contracts, security controls, authorization behavior, or architecture simply because another approach would look better.


## Product presentation

The rapid-delivery workflow is internal. Do not put labels such as prototype, resume project, portfolio project, toy, practice app, or cheap demo into user-facing UI/marketing surfaces. Present the real product and its real capability confidently, without inventing customers, scale, compliance, security guarantees, or functionality that does not exist.

Avoid unfinished placeholder copy, lorem ipsum, obvious starter-template branding, default framework imagery, or generic dashboard composition in intended showcase surfaces.

## Writable scope

Primary writable scope is defined by `permissions.frontend` in `task.json` and normally includes:
- `frontend/**`
- `tests/frontend/**`
- `docs/design/**`
- `.ai/tasks/<TASK-ID>/frontend-design-report.json`
- `.ai/tasks/<TASK-ID>/frontend-report.json`

Never modify unless the orchestrator changes the task permission boundary:
- `backend/**`
- `database/**`
- `supabase/**`
- `contracts/**`
- `.ai/tasks/<TASK-ID>/task.json`
- `.ai/tasks/<TASK-ID>/frontend-design-review.json`

## Before any frontend work

Read:
1. `AGENTS.md`
2. `GEMINI.md`
3. `.ai/tasks/<TASK-ID>/task.json`
4. `docs/features/<TASK-ID>.md`
5. `.ai/tasks/<TASK-ID>/architecture-report.json`
6. applicable contracts
7. `docs/standards/FRONTEND.md`
8. `docs/design/DESIGN_SYSTEM.md` when present
9. `database-report.json` when relevant
10. `backend-report.json` when relevant

Do not begin frontend implementation before the committed task state is `IMPLEMENTATION`.

## Design-first gate

Read `architecture-report.json.impacts.frontend_design_required`.

### When `frontend_design_required=false`

Implement the task using the existing design system and established UI patterns. Do not redesign unrelated surfaces.

### When `frontend_design_required=true`

**Phase A — design only**

Before writing production frontend code:
1. inspect the existing UI/design system and relevant product context
2. decide the task's visual and interaction direction
3. cover layout, hierarchy, typography, color usage, component presentation, responsive behavior, states, animation/transitions, microinteractions, accessibility, and reduced motion
4. prefer reusing the existing design system; extend it only when justified
5. write `.ai/tasks/<TASK-ID>/frontend-design-report.json` with `status: DESIGN_READY`
6. run `python scripts/agentctl.py scope check <TASK-ID> frontend`
7. commit the design-report-only handoff on `agent/<TASK-ID>-frontend` so Codex can inspect it from the feature worktree
8. stop and return control to Codex for compatibility review; Codex approval is bound to the exact canonical design-report digest

During Phase A, do not write production frontend implementation. The committed design report is the handoff artifact.

**Phase B — implementation**

After Codex commits its review on the feature branch, sync that review into this same private frontend worktree:

```bash
python scripts/agentctl.py worktree sync <TASK-ID> frontend
python scripts/agentctl.py frontend design-gate <TASK-ID>
```

The sync requires a clean worker tree. The design-gate command must pass, `frontend-design-review.json` must be `APPROVED`, and its `reviewed_design_sha256` must still match your current design report. If you revise the design report after approval for any reason, stop and return it to Codex for a new compatibility review; do not bypass the gate.

Then implement the approved design yourself in the same frontend worker branch/worktree. Codex is the integrator, not a second frontend stylist.

## Design authority boundaries

Codex design review is compatibility-only. Treat requested changes as binding when they concern:
- missing/incorrect requirements
- architecture or contract incompatibility
- security or authorization
- accessibility
- performance
- scope creep
- conflict with an explicit human/brand requirement or approved existing design system

A preference such as "I would use a different color/font/radius/animation" is not, by itself, a valid Codex blocker.

## Contract behavior

Never invent a backend endpoint, schema, or error behavior.

If required behavior is missing:
- do not change the contract yourself
- add a blocker to the appropriate frontend report
- use `CONTRACT_CHANGE_REQUIRED`
- describe the exact missing interface

## Design system continuity

`docs/design/DESIGN_SYSTEM.md` is the persistent human-readable design source of truth when the project has established one. Runtime design tokens/components remain authoritative for actual implementation details.

For new products, the first substantial frontend design task may establish the system. Later tasks should reuse or deliberately extend it rather than inventing a new aesthetic per feature. Any extension must be documented in the design report and reflected in `docs/design/DESIGN_SYSTEM.md` when approved and implemented.

## Frontend quality review

Before reporting implementation complete, verify:
- the hero/primary journey feels visually complete and intentional
- the interface does not look like an uncustomized starter/template
- meaningful data/technical behavior is communicated clearly through the UI
- visual hierarchy and design consistency
- responsive behavior
- typography/spacing consistency
- keyboard/focus behavior
- loading, error, empty, disabled, and success states
- animation and transition quality
- reduced-motion behavior
- no unnecessary motion or obvious layout shift
- no unfinished placeholder UI

Then run applicable:
- lint
- TypeScript typecheck
- frontend tests
- production build

Then run:

```bash
python scripts/agentctl.py scope check <TASK-ID> frontend
```

Update:

`.ai/tasks/<TASK-ID>/frontend-report.json`

Use the 5-line worker completion format from `AGENTS.md`.
