# Launch planning review and coding-agent handoff

Reviewed September 21, 2026 against base commit `66ae11f` on `feature/PLAN-002-railway-launch-roadmap`. This is a planning audit, not feature verification, a lifecycle approval, or evidence of deployed integrations. Changes remain on the planning branch for review/checkpointing.

## Result

The approved scope is coherent after reconciliation. Start **RAIL-001 planning**, not all eight implementations. All eight launch tasks intentionally remain `PROPOSED`, their architecture reports remain uncompleted templates, and the OpenAPI document still has no endpoints. Passing schema validation does not mean these tasks are `BUILD_READY`.

The review covered the roadmap, sprint plan, product definition, system architecture, accepted ADRs, design lock, all eight launch specs/task records, completed-task history, project verification configuration, operator guidance, and historical research-plan context. `ProjectRaw/` is historical research, not current implementation authority. Completed CORE/LAND/UI history and runtime code were not changed.

## Discrepancies corrected

| Finding | Resolution |
|---|---|
| Sprint described an execution-ready backlog while contracts and architecture were empty | Label it ready for planning; retain all lifecycle gates |
| RAIL depended on nonexistent tracked task PLAN-002 | Identify PLAN-002 as the documented planning milestone; remove the dangling machine dependency without inventing a DONE record |
| Outreach required real model input but was integrated before ML | Add ML-001 to OUTREACH dependencies and reorder roadmap/sprint integration; RIDE can proceed independently after FLOW |
| RAIL acceptance required authentication and full Camila reset owned by later tasks | Limit RAIL proof to the persistent foundation and private reset; ACCESS owns sessions and EPIC/FLOW prove real snapshot/workflow preservation |
| Enabled backend/database had only frontend/schema verification commands | Make RAIL register real required backend and migration/integration checks once its harness exists; no fake commands were added |
| Independent testers could not write the existing frontend tests | Allow `frontend/tests/**` in proposed tasks while keeping product edits outside tester write scope |
| Backend and database workers both had migration write authority | Reserve `backend/alembic/**` for database workers; orchestrator can maintain verification configuration and operator docs |
| Roadmap said monthly Pilot pricing, but approved decision said annual | Use $18,000/year with $1,500/month billed annually; carry the detailed configuration into ACCESS acceptance |
| Design document retained public record/role previews and four-part pricing; roadmap allowed new global tokens | Mark old public composition as historical and apply approved replacement content; retain exact global-token approval requirement |
| Transport spec made patient views read-only while requiring patient acknowledgment | Permit only the patient-owned acknowledgment command; dispatch mutations stay with staff/transport; changed plans invalidate old acknowledgment |
| Final recording step opened staff Epic/FHIR evidence from a patient session | Require sign-out/access between personas and return to staff for the evidence close |
| Model artifact readiness could disable the whole API despite promised safe degradation | Separate scoring capability from database/migration readiness; deterministic workflow remains available, while launch preflight still requires an accepted model |
| Blanket Epic search/export/accessibility exclusion conflicted with staff evidence | Preserve staff-authorized fields and accessibility; exclude them from public/lower-privilege projections and normal logs |
| Final graph state could be confused with clinical clearance or actual attendance | Require human clinical disposition plus current transport plan and acknowledgment; attendance remains unknown without an outcome event |
| Scenario clock could silently overwrite actual Epic appointment/source dates | Keep generated workflow dates separate and inventory any Epic appointment link; never attribute generated dates to Epic |
| Provider replay exception could be read as authorizing Uber success | Restrict the replay allowance; Uber remains inactive, CareLink has controlled persisted operator provenance |
| Recovery/sign-up screens lacked a defined working delivery path | Require a controlled recovery/pending-request contract before ACCESS BUILD_READY; no fake reset-email success or dead support/legal links |
| Feature merges were deferred to launch day despite downstream merge prerequisites | Review/merge dependencies as they finish; final release evidence covers the frozen integrated revision |
| Quickstart relied on absent task-orchestration/frontend-development skills | Point current feature work to installed capabilities, AGENTS.md, task specs, and the public control plane |

## Confirmed direction and remaining task gates

These are task-specific gates. They do not prevent RAIL planning, and should not cause the agent to repeatedly request global permission.

| Item | Current status / next action | Gate |
|---|---|---|
| Delivery deadline | Human confirmed September 25, 2026; full launch scope retained | Fixed delivery date |
| Synthetic scenario settings | Human delegated planning to the agents; concrete defaults are in [LAUNCH_SCENARIO_SETTINGS.md](./LAUNCH_SCENARIO_SETTINGS.md) | Responsible architect freezes applicable version; routine synthetic choices need no repeated human permission |
| Workflow policy | Use the proposed clock/calendar, owners, operational SLAs, escalation and confirmation rules; architect checks and freezes the scenario contract under delegated planning authority | FLOW BUILD_READY |
| Transportation fixtures | Review and freeze the proposed synthetic provider, service area, windows, funding, coordinator and backup rules | RIDE policy freeze |
| Outreach content | Review the proposed bounded nonclinical scripts, consent/opt-out copy, language and cadence; no clinical approval or external activation is implied | OUTREACH acceptance |
| Model gate | Freeze the proposed K, calibration/top-K thresholds, subgroup count/rejection rules, split manifest and artifact strategy before final evaluation | Before final holdout evaluation; no thresholds chosen from test results |
| Railway access | Inspect existing authorized account/services first. No live Railway discovery or deployment was performed in this planning audit | RAIL deployed acceptance |
| Epic access and inventory | Use secure environment configuration and private human authorization. Prove actual Camila resources and refresh support; a missing field stays absent | EPIC live integration acceptance |
| FHIR validator | Architect selects and pins validator/version plus report/artifact binding and staff evidence contract | EVIDENCE BUILD_READY |
| Controlled account recovery | Architect specifies an implemented operator-assisted or otherwise approved path; no new email vendor assumed | ACCESS BUILD_READY |

No secret values should be placed in chat or these documents. The September 25 compressed schedule remains high risk from the current backend-empty starting point; do not silently drop ML, interoperability, authorization, or reviews to fit it. Any reduction in approved launch scope requires an explicit human decision.

## Coding-agent start

1. Read AGENTS.md, this review, PROJECT.md, SYSTEM.md, the launch sprint plan, LAUNCH_SCENARIO_SETTINGS.md, and RAIL-001's spec/task. Preserve the visual lock and existing user changes.
2. Inspect the working tree and checkpoint the reconciled planning changes before branching. No runtime edits belong on the planning branch; no implementation belongs on main/master. This audit did not commit, merge, deploy, or advance any task.
3. Run project/task validation, prepare `feature/RAIL-001-...` using `python3 scripts/agentctl.py git prepare RAIL-001`, then advance RAIL to PLANNING through `task advance`.
4. Use the architect to complete impacts, execution controls, minimum schema/contract decisions, ownership, verification commands, and external prerequisites. The roadmap selects TARGETED testing and STANDARD risk with dedicated security review for RAIL; any change needs recorded justification.
5. The orchestrator declares/validates actual contracts. Only after architecture and contract gates pass may RAIL reach BUILD_READY and IMPLEMENTATION. Spawn only impacted workers; use worktrees when they save time. Scope-check worker changes before integration.
6. Run independent targeted tests, commit integration, run exact-commit verification, obtain dedicated security and final review, then human merge and task closure. Do not reuse this planning audit as any of those reports.
7. Continue ACCESS → EPIC → FLOW. After FLOW, ML and RIDE can run on isolated owned paths; OUTREACH integration follows accepted ML; EVIDENCE follows EPIC/FLOW/OUTREACH/RIDE. Final release needs all eight slices and the actual deployment/preflight evidence.

The current control-plane validation does not enforce dependency existence/completion. The orchestrator must check dependencies and frozen shared interfaces explicitly. Planning can overlap; shared contract and migration edits need a single owner and deliberate integration.

## Validation performed

- `python3 scripts/agentctl.py project validate`: passed.
- `python3 scripts/validate-task.py`: all 11 tracked tasks passed schema/report validation.
- `python3 scripts/validate-contracts.py`: passed; the empty OpenAPI skeleton is structurally valid, not an implemented API.
- Frontend `npm run build`: passed (includes TypeScript compilation).
- Frontend `npm run test:smoke`: 19 tests passed across 4 files.
- Frontend `npm run test:e2e`: 5 Chromium tests passed, including the existing Maria journey.
- Planning consistency audit: dependency references exist and are acyclic, proposed task states are unchanged, completed history is untouched, and intended test/migration write ownership is consistent.
- `git diff --check`: passed.

These frontend checks protect the existing baseline; they do not prove the planned Camila backend journey. No live Railway, Epic, ML, or FHIR acceptance was claimed.

## Self-evaluation

Applied the agent-self-evaluation skill; overall **4.0/5**.

| Axis | Score | Evidence and improvement |
|---|---:|---|
| Accuracy | 4 | Local validation and baseline tests pass; live service/access assumptions still need task-specific verification |
| Completeness | 4 | All launch specs/tasks and authoritative plans reviewed; synthetic policy defaults are now concrete under delegated planning; live access evidence remains task-specific |
| Clarity | 4 | One handoff identifies fixes, decisions, and next task; repeated requirements across source documents still require care |
| Actionability | 4 | RAIL can enter planning with concrete gates; downstream architects must freeze the delegated scenario settings in their contracts |
| Conciseness | 4 | Findings are summarized here; future edits should avoid expanding duplicate prose across the roadmap/specs |

The two human questions are resolved: September 25 is confirmed and synthetic planning is delegated. Next improvements: freeze task-specific settings, then record real RAIL architecture/contracts and service evidence. Self-check: the user can spawn the coding agent with a clear start and without a false claim that implementation is already build-ready.
