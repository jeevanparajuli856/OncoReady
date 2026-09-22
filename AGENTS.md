# Project Agent Constitution

Universal rules for all coding agents working in this repository.

## 1. Mission: rapid product development

This repository is optimized for building polished, technically credible, end-to-end software products rapidly.

Priority order:
1. strong product idea and clear user value
2. memorable product experience and visual quality
3. working end-to-end behavior
4. reliable primary demonstration journey
5. technical credibility and understandable code
6. risk-appropriate testing/security
7. deeper production hardening only when the product actually requires it

Speed does not permit fake core behavior, hidden breakage, invented interfaces, exposed secrets, or misleading product claims. Avoid unnecessary infrastructure, abstraction, documentation, tests, and security ceremony that do not improve the product, its critical journey, or a material risk.

Prefer a few vertical product slices that each deliver UI + logic + data/integration together over many horizontal infrastructure tasks.

## 2. Product presentation boundary

Rapid-delivery strategy is internal. User-facing product surfaces and normal product descriptions must present the software according to the real problem it solves and capabilities it actually provides.

Do not characterize the product to users as a prototype, resume project, portfolio project, toy, practice app, cheap demo, or similar label that lowers perceived product quality.

Also do not falsely claim production scale, compliance, security guarantees, customers, data, integrations, or capabilities that are not real. Accurate limitations may be documented where technically relevant without cheapening the product identity.

## 3. Source of truth by concern

Use the authoritative artifact for the question being answered:

- product purpose, users, signature experience, scope, delivery priorities → `docs/PROJECT.md`
- deterministic project configuration → `.ai/project.json`
- feature requirements and acceptance criteria → `docs/features/<TASK-ID>.md` and `.ai/tasks/<TASK-ID>/task.json`
- architecture/trust boundaries → approved ADRs, then `docs/architecture/SYSTEM.md`, then `architecture-report.json`
- human-approved visual identity and locked design constraints → `docs/design/DESIGN_SYSTEM.md`, current runtime tokens/components, and `docs/adr/ADR-0003-human-approved-visual-lock.md`
- component interfaces when a contract is required → `contracts/`
- task state, ownership, write permissions → `.ai/tasks/<TASK-ID>/task.json`
- implementation behavior → code, when it does not conflict with approved upstream artifacts
- temporary discussion → chat history

If authoritative artifacts conflict, stop the affected work and let the orchestrator reconcile the upstream artifact. Never silently invent missing API behavior, requirements, schema behavior, or security policy.

### Workspace and role contract

The prepared workspace gateway has two internal care-workspace roles plus one reserved transportation workspace:

- **Care Navigator Workspace — Marcus Vance, MSW**: CareLink, patient coordination, transportation, barriers, appointments, follow-ups, and only the shared patient/readiness data needed for coordination.
- **Care Team (Readiness Team) Workspace — Nurses/Readiness Staff**: clinical and treatment readiness, labs, vitals, nursing/readiness tasks, clinical blockers, and escalations.
- **Transportation (CareLink) Workspace**: reserved for transportation managers and vendor partners; intentionally empty until the future transportation sprint. Do not add dispatch actions yet.

Do not recreate a combined `Staff` workspace or a separate `Readiness Graph & Audit Log` workspace. The readiness graph and audit timeline are embedded in the Care Navigator and Care Team case workspaces and must be permission-scoped to the role. Care Navigator views must not expose clinical verbatim concern text, nurse notes, or clinical-only actions. Care Team views must not expose CareLink dispatch controls or navigator-only operational routes. Transportation is separate and currently has no operational actions.

Reuse the shared staff shell, case workspace, graph, audit, queue, and state machinery with role capabilities rather than duplicating components. Role boundaries must be enforced in routing/state mutation guards as well as in rendered navigation; hiding a button alone is not authorization.

This repository currently uses local prepared personas, so these guards protect the local scenario state but do not provide production identity authentication or backend authorization. Do not claim that they do, and do not invent a server auth contract without an approved task/architecture change.

### Authentication and route contract

- Landing-page workspace access must enter the standard login screen at `/login` before any workspace opens.
- The profile dropdown is the only workspace switcher after login. Do not restore workspace links to the top navbar or a floating workspace dock.
- The standard login supports Patient, Caregiver, Care Team, Care Navigator, and Transportation prepared accounts. Keep the demo account values in test fixtures rather than copying credentials into product copy or documentation.
- `Sign in with Epic` is a simulated provider handoff available only to Care Team, Care Navigator, and Transportation. Clicking it shows a visible redirect transition, then opens the standalone Epic-style page at `/epic/login?redirect_uri=%2Fauth%2Fepic%2Fcallback&client_id=oncoready`.
- A successful Epic login shows a secure redirect/loading state before routing to the selected workspace. Unknown Epic credentials must show the exact invalid-credential error already defined by the UI.
- The Epic page must render without the OncoReady header/footer, use the local Epic logo and forest artwork, and must not display internal callback URLs or simulated-auth explanatory copy inside the provider-style surface.

### Demo login matrix

These are synthetic local demo fixtures only. They are intentionally documented here so agents do not invent credentials or route a persona to the wrong workspace. Never reuse them for production authentication, real Epic access, or backend authorization.

| Login | Demo password | Workspace |
|---|---|---|
| `abcp@oncoready.me` | `1234` | Patient |
| `abcc@oncoready.me` | `1234` | Caregiver |
| `abcs@oncoready.me` | `1234` | Care Team (Readiness Team) |
| `abcn@oncoready.me` | `1234` | Care Navigator |
| `abct@oncoready.me` | `1234` | Transportation (CareLink, currently empty) |

Epic sign-in accepts only the Care Team, Care Navigator, and Transportation demo identities. The simulated provider route is `/epic/login?redirect_uri=%2Fauth%2Fepic%2Fcallback&client_id=oncoready`; the standard login route is `/login`.

## 4. Agent ownership

### Codex orchestrator
Owns:
- project/task orchestration
- lifecycle state
- integration
- source-of-truth reconciliation
- selecting specialists from architecture evidence
- keeping scope small enough for rapid delivery

### Codex specialists
- architect → minimum sufficient architecture plus machine-readable execution controls
- database → schema/migrations only when persistence materially helps the product
- backend → APIs/services/business logic actually required by the product journey
- frontend → visual/interaction design and frontend implementation
- tester → independent tests only when architecture selects TARGETED or FULL depth
- security → independent review only when architecture requires it
- reviewer → independent final product/engineering review

### Codex frontend specialist
The Codex frontend specialist is the frontend design and implementation authority.

The frontend specialist owns:
- visual identity and design-system expression
- color, typography, spacing, radius, borders, shadows, hierarchy
- page/component composition and responsive presentation
- animation, transitions, easing, and microinteractions
- loading/error/empty/disabled/success presentation
- frontend accessibility and reduced-motion behavior
- frontend state/browser behavior
- product storytelling through the interface and data visualization presentation

The orchestrator and architecture specialist define functional requirements, interfaces, trust boundaries, accessibility/performance constraints, and required capabilities. They must not prescribe aesthetics unless an explicit human/brand/approved design-system requirement already makes that choice authoritative.

For `frontend_design_required=true`, the Codex frontend specialist performs design Phase A before production frontend coding; the Codex orchestrator performs compatibility-only review; approval is bound to the exact design report through `reviewed_design_sha256`; the frontend specialist then implements the approved design. The orchestrator must not restyle the approved frontend as a second design pass.

### Human-approved visual lock

The current OncoReady interface and `docs/design/DESIGN_SYSTEM.md` are human-approved and visually locked. This human constraint overrides general frontend design authority.

- Preserve the existing design, theme behavior, palette and token values, typography families and scale, spacing rhythm, radii, borders, shadows, icon language, logo treatment, navigation character, layout character, component styling, motion language, and responsive behavior.
- New Epic, staff, patient, caregiver, transportation, access, pricing, and evidence surfaces must compose the existing runtime tokens and component primitives. They may add content and states, but must look like native extensions of the current product.
- `frontend_design_required=true` authorizes a compatibility/extension plan, not a rebrand, restyle, alternate visual direction, or token redesign.
- No agent may change a global visual token, replace an established component style, restyle an existing page, or introduce a new product-wide visual pattern without explicit human approval for that exact change.
- Accessibility fixes remain required. Implement them with the smallest visual delta; if a fix would materially alter the approved appearance, obtain human approval before implementation.
- Frontend design review must compare the result with the pre-change baseline and reject unapproved visual drift even when functionality passes.

## 5. Public control plane

Agents use:

```bash
python scripts/agentctl.py ...
```

Important commands:

```bash
python scripts/agentctl.py bootstrap
python scripts/agentctl.py project validate
python scripts/agentctl.py task create <TASK-ID> "<TITLE>"
python scripts/agentctl.py git prepare <TASK-ID>
python scripts/agentctl.py task advance <TASK-ID>
python scripts/agentctl.py task validate <TASK-ID>
python scripts/agentctl.py worktree create <TASK-ID> backend
python scripts/agentctl.py worktree create <TASK-ID> frontend
python scripts/agentctl.py worktree sync <TASK-ID> frontend
python scripts/agentctl.py frontend design-digest <TASK-ID> --ref agent/<TASK-ID>-frontend
python scripts/agentctl.py frontend design-gate <TASK-ID>
python scripts/agentctl.py scope check <TASK-ID> <ROLE>
python scripts/agentctl.py verify <TASK-ID>
```

`task status` is recovery/administrative only. Normal progress uses `task advance`.

## 6. Brand-new project inception

Use `.agents/skills/project-inception/SKILL.md`.

Inception must define enough to start quickly without inventing unnecessary complexity. Required outputs:
- `docs/PROJECT.md`
- `docs/architecture/SYSTEM.md`
- `.ai/project.json`
- relevant standards only when decisions are known
- ADRs only for meaningful long-lived decisions
- a small dependency-aware backlog organized around vertical product slices

`docs/PROJECT.md` must identify:
- real problem and intended users
- primary/hero user journey
- first-impression/visual/interaction/data storytelling hooks
- core technical credibility hook
- minimum real backend/data/integration needed
- explicit non-goals and overengineering to avoid
- demo-critical reliability path
- a small initial slice backlog

Clearly distinguish Confirmed, Assumption, Recommendation, and Open question.

At `INCEPTION_READY`, backend/frontend/database enabled flags must be true/false; enabled backend/frontend components must name technology; enabled database must name provider and migration path. `.ai/project.json.delivery.mode` remains `RAPID_PRODUCT` and production hardening is risk-based.

Do not implement code or create tasks during inception.

## 7. Feature lifecycle

Normal lifecycle:

```text
PROPOSED
  ↓
PLANNING
  ↓
BUILD_READY
  ↓
IMPLEMENTATION
  ↓
INTEGRATION
  ↓
REVIEW
  ↓
DONE
```

`BLOCKED` and `CANCELLED` are side states.

### Planning and BUILD_READY

The architect defines only what this slice needs and completes:

`impacts`:
- `database`
- `backend`
- `frontend`
- `frontend_design_required`
- `infrastructure`

`execution`:
- `contract_required`
- `test_depth`: `NONE | SMOKE | TARGETED | FULL`
- `security_risk`: `LOW | STANDARD | HIGH`
- `security_review_required`

Rules:
- `frontend_design_required=true` requires `frontend=true`.
- `HIGH` security risk requires dedicated security review.
- `contract_required=true` requires explicit task contracts and contract validation before `BUILD_READY`.
- TARGETED/FULL testing requires an independent tester after integration.
- NONE/SMOKE does not require a separate tester; repository verification and worker checks provide the lightweight gate.
- Use STANDARD/HIGH risk and a dedicated security reviewer when meaningful auth/authorization, sensitive data, dangerous file/input handling, privileged operations, or consequential external actions justify it.
- A public/synthetic-data product with no meaningful trust boundary should normally be LOW risk.

### Implementation

Spawn only impacted workers:
- database only if `impacts.database=true`
- backend only if `impacts.backend=true`
- Codex frontend specialist only if `impacts.frontend=true`

Prefer one vertical slice to produce a demonstrable user outcome rather than creating separate tasks for database, API, and UI layers unless independent sequencing is genuinely necessary.

For design-required frontend work, the design digest gate remains mandatory.

### Integration

Integrate worker branches deliberately, or integrate scoped commits on the shared sprint branch allowed by section 12. Do not silently change contracts, architecture, or the approved frontend visual direction.

Run independent tester only for TARGETED/FULL.

Commit the integrated feature revision, then run:

```bash
python scripts/agentctl.py verify <TASK-ID>
```

Verification must pass on the current commit.

If `security_review_required=true`, run the security specialist against that exact verified commit while the task remains in `INTEGRATION`; security must approve before advancing to `REVIEW`.

### Review and closure

The final reviewer checks the exact current integrated revision for:
- acceptance criteria and primary user journey
- broken/placeholder product behavior
- architecture/interface compatibility
- technical credibility of core functionality
- demo-critical reliability
- code quality proportional to the project
- current verification evidence
- security evidence only when architecture required a dedicated review
- visual handoff/design consistency when frontend is involved

After APPROVED final review and human merge, close with:

```bash
python scripts/agentctl.py task advance <TASK-ID> --merged
```

## 8. Contracts: conditional, authoritative when used

`contracts/` is authoritative only for interfaces the task declares as contracts.

Use a formal contract when independently implemented components need a stable boundary, especially frontend/backend or external API/schema integration.

Do not create/update contracts for purely local implementation details just to satisfy process.

When `execution.contract_required=true`:
- task `contracts` must be non-empty
- frontend must not invent endpoints
- backend must implement the approved contract
- implementation agents must not silently edit contracts
- validate contracts before BUILD_READY

When false, skip the contract gate.

## 9. Testing depth

Choose the smallest depth that protects the product journey:

- `NONE` — trivial/non-behavioral change; no independent tester
- `SMOKE` — build/lint/typecheck/basic happy-path or implementation-owned checks; no independent tester
- `TARGETED` — independent tests for important logic/integration/critical journey
- `FULL` — broader regression/security-sensitive/release-level test work when justified

Do not maximize test count. Protect the functionality a user or evaluator will actually exercise and important failure boundaries.

## 10. Security: baseline guardrails + risk-triggered review

Security is not a mandatory feature phase, but baseline rules always apply.

Never commit/expose:
- API keys, passwords, access tokens, private keys, production credentials
- real sensitive `.env` files

Never knowingly introduce:
- frontend-only authorization for protected actions
- obvious injection/command execution paths
- unrestricted destructive endpoints
- unsafe secret logging
- disabled TLS verification without explicit justification
- unsafe production database/tool access

Use a dedicated security specialist when architecture marks `security_review_required=true`. Scope the review to actual trust boundaries rather than a generic checklist.

## 11. Task state, reports, and permissions

Only the orchestrator modifies `task.json`.

Workers write only their assigned report and permitted implementation/test paths. The task workspace contains architecture, DB/backend/frontend, frontend design/review, test, verification, security, and final review reports; unused conditional reports may remain in template state.

Before completion, workers run:

```bash
python scripts/agentctl.py scope check <TASK-ID> <ROLE>
```

Out-of-scope work becomes a structured blocker rather than a silent edit.

For shared-branch work, use the explicit pre-handoff commit as the scope-check base as described in section 12; automatic task-branch inference does not apply.

## 12. Git/worktrees

- never implement directly on `main`/`master`
- by default, one feature branch per task: `feature/<TASK-ID>-<slug>`; the approved two-day demo exception below takes precedence
- optional parallel branches: `agent/<TASK-ID>-backend`, `agent/<TASK-ID>-frontend`
- workers branch from the task feature branch, never from another worker branch
- create implementation worktrees only after committed state reaches `IMPLEMENTATION`
- use worktrees only when parallelism actually saves time
- do not rewrite shared history without explicit approval

### Approved exception: one branch for the two-day demo

The human approved using **one shared branch, `feature/two-day-demo`, for both sprint days and all seven remaining demo tasks**: ACCESS-001, FLOW-001, EPIC-001, ML-001, OUTREACH-001, RIDE-001 and EVIDENCE-001. This replaces the per-task branch requirement only for the scope in `docs/LAUNCH_SPRINT_PLAN.md`.

- Carry the reviewed planning work into this branch when implementation begins; do not discard the current planning changes or restart from an older baseline. Keep both sprint days on this branch instead of opening a branch per task/day.
- Keep separate task records, acceptance criteria, permissions, reports and lifecycle gates. Commit small, reviewable changes with the task ID in the commit scope, for example `feat(FLOW-001): connect readiness transitions`.
- Use sequential specialist handoffs in the shared checkout, with one active writer at a time. The orchestrator owns staging/commits and task state; workers retain their assigned file ownership. Do not switch branches underneath another agent or include another role's unfinished changes in a handoff.
- Before each worker handoff, commit the relevant planning/state changes, ensure the checkout is clean, and record the pre-handoff commit. Run `python scripts/agentctl.py scope check <TASK-ID> <ROLE> --base <PRE-HANDOFF-COMMIT>` so earlier tasks' commits are not treated as that worker's changes. Do not use the moving branch tip as the baseline after committing the worker's work.
- Do not run `git prepare` per task or use the task-branch-inferencing worktree create/sync helpers for this exception. They assume separate `feature/<TASK-ID>-*` branches. Shared-checkout handoffs replace branch/worktree handoffs; no implementation is allowed before that task's committed state reaches `IMPLEMENTATION`.
- Frontend design approval is still required when selected. Commit the design report on the shared branch, calculate its digest with `frontend design-digest <TASK-ID> --ref <DESIGN-COMMIT>`, record the orchestrator's compatibility approval and run `frontend design-gate <TASK-ID>` before frontend implementation. No worker-branch sync is required in the shared checkout.
- A downstream task may consume a verified, reviewed upstream checkpoint on this branch before the final merge. Record that dependency commit; do not mark the upstream task DONE merely to unblock dependent work.
- Keep verification, required security review and final review bound to the relevant integrated revision. Later changes still invalidate affected evidence. Before the final sprint merge, freeze the combined revision and refresh affected verification/reviews; one branch does not waive any gate.
- Merge the shared sprint branch only after final review and human merge approval. Close each task with `task advance <TASK-ID> --merged` only after its approved work is actually merged. Production deployment remains deliberate.

Outside this approved two-day scope, the default per-task branch rule still applies.

Human/CI production deployment remains deliberate after review/merge.

## 13. Database and infrastructure restraint

A database, cache, queue, container platform, IaC layer, microservice boundary, or other infrastructure must earn its place through product behavior, data persistence, integration requirements, deployment needs, or a meaningful technical objective.

Do not add technology solely because a "real app" might use it.

Database changes must still be represented by Git-tracked schema/migration artifacts. For Supabase, use development/test projects, timestamped migrations, scoped MCP inspection, synthetic/de-identified data, and deliberate production promotion.

## 14. Verification and evidence freshness

`verification-report.json` is commit-bound durable evidence. Changes to implementation, requirements, architecture, implementation/test reports, contracts, or design evidence invalidate downstream evidence. Status-only task updates and expected downstream verification/security/review report changes do not.

Verification includes framework/schema tests, baseline repository safety checks, and project-specific checks configured in `.ai/project.json`. Required unavailable/skipped checks fail.

## 15. Definition of done

Done means:
- primary user-visible outcome works end to end
- core behavior is genuinely implemented, not a fake façade when real implementation is practical
- no obvious placeholder or unfinished product surface remains in the intended journey
- frontend design gate passed when required and implementation remains coherent with it
- required backend/database/integration work is complete
- selected testing depth is satisfied
- verification passes on the reviewed revision
- dedicated security review passes only when required by architecture
- final review approves the current revision
- setup/README documentation is sufficient to understand and run the product
- human merge is complete

Done does **not** mean every imaginable production hardening task has been implemented. Once the intended experience is polished, technically credible, reliable for its important journey, and risk-appropriate, stop and move to the next planned slice/project.

## 16. Deterministic chat output

Worker final response:

```text
STATUS: <COMPLETE | BLOCKED | CHANGES_REQUIRED>
TASK: <TASK-ID>
RESULT: <one concise sentence>
REPORT: <assigned report path>
NEXT: <one concrete next action>
```

Orchestrator progress response:

```text
STATUS: <TASK STATUS>
TASK: <TASK-ID>
RESULT: <one concise sentence>
NEXT_MODE: <AUTOMATIC | HUMAN_ACTION_REQUIRED | COMPLETE>
NEXT: <next action>
```

Use `HUMAN_ACTION_REQUIRED` only for genuine human decisions/actions, external credentials/access, sensitive/destructive approval, and final merge approval.
