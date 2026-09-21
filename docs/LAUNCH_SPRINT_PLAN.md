# OncoReady Launch Sprint Plan

**Status:** Execution-ready backlog draft

**Prepared:** September 21, 2026

**Authority:** [`LAUNCH_ROADMAP.md`](./LAUNCH_ROADMAP.md), [`PROJECT.md`](./PROJECT.md), [`SYSTEM.md`](./architecture/SYSTEM.md), [`DESIGN_SYSTEM.md`](./design/DESIGN_SYSTEM.md), and the task files under `.ai/tasks/`

## 1. Sprint objective

Deliver the approved Camila continuity-rescue journey as one coherent Railway-hosted product: a record-free public story leads into center-scoped access; authorized staff see truthful read-only Epic Sandbox context; one exact patient response creates separately owned clinical and transportation work; CareLink recovers the transportation plan; Camila acknowledges it; and the graph, timeline, metrics, provenance, model evidence, and validated FHIR artifact all resolve from real persisted state.

This is a launch sprint, not a general platform build. Work that does not improve the approved journey, a material trust boundary, or the launch reliability gate is excluded.

## 2. Verified starting point

| Area | Current evidence | Planning consequence |
|---|---|---|
| Frontend | React/Vite production build passes; 19 smoke/component tests and 5 Playwright tests pass | Preserve this as the visual and functional baseline; migrate behavior behind APIs without restyling |
| Product journey | Completed Maria frontend journey exists in local client state | Reuse interaction patterns, but replace the final Camila path with server-owned state rather than scripted screen swaps |
| Backend | `backend/` contains instructions and a placeholder README only | `RAIL-001` must establish the real FastAPI application before later slices |
| Database | Railway PostgreSQL is approved; no migrations exist yet | Alembic base and migration verification are launch-critical |
| API contract | `contracts/openapi.yaml` has no paths | Every independent frontend/backend boundary must be approved before its task reaches `BUILD_READY` |
| Launch tasks | Only `CORE-001`, `LAND-001`, and `UI-001` are complete | The eight roadmap implementation tasks start at `PROPOSED`; completed history is not reopened |
| Deployment | Railway topology is approved but not provisioned in repository evidence | Railway access, domains, variables, service creation, and deployment checks are external launch gates |
| Epic | Read-only Sandbox design is approved; live Camila inventory and authorization evidence are not present | `EPIC-001` cannot pass without private authorization, actual resource inventory, and truthful fallback evidence |

## 3. Delivery assumptions and feasibility

- The working launch target is the September 25, 2026 final identified in the project research inputs. If the actual target differs, preserve the sequence and expand the timeboxes rather than changing dependencies.
- The complete roadmap is high risk in a four-day window from the current backend-empty state. It is viable only with immediate Railway and Epic access, parallel specialist work inside each task, no scope growth, rapid human decisions, and continuous integration against the Camila critical path.
- A task advances only through the repository lifecycle: `PROPOSED → PLANNING → BUILD_READY → IMPLEMENTATION → INTEGRATION → REVIEW → DONE`.
- Planning for a downstream task may begin when its upstream contract is stable. Production implementation must not silently assume an unapproved upstream interface.
- Parallel work is safe across owned paths within a task. Cross-task work that touches the same backend, frontend, contract, or migration surface must wait for the upstream merge or use an explicitly frozen interface to avoid divergent event models.
- Estimates use relative size because team capacity and external-provider response time are unknown. `M` is a focused vertical slice, `L` spans several components, and `XL` contains a high-risk integration or model gate.

## 4. Non-negotiable launch boundaries

- Camila is the only complete Epic-backed case. Other queue records remain bounded frontend fixtures and never trigger Epic requests.
- Epic access is read-only, staff-only, server-backed, expiring, and provenance-preserving. Snapshot fallback is labeled and never represented as live.
- Patient verbatim text is preserved for human review. The model never interprets clinical urgency, provides advice, or makes treatment decisions.
- Caregiver and transportation projections are allowlisted and contain no Epic-only clinical data or clinical concern text.
- CareLink is the active transportation path. SMS, voice, and Uber Health remain `provider_ready` and cannot create unverified vendor success states.
- The current Clinical Glass design is locked. New screens extend existing tokens and primitives; global restyling is not part of any sprint.
- No production PHI, real patient data, secrets, production Epic access, real enterprise OAuth, external SMS/voice execution, Uber ride execution, EHR writeback, or compliance claim is authorized.

## 5. Dependency and integration spine

```text
PLAN-002 approved planning baseline
  └── RAIL-001 platform + contract foundation
       └── ACCESS-001 sessions + protected routes
            └── EPIC-001 clinical-context boundary
                 └── FLOW-001 durable event/workflow spine
                      ├── OUTREACH-001 adaptive channel orchestration
                      ├── RIDE-001 CareLink recovery path
                      └── ML-001 model pipeline after feature/event contract freeze

EPIC-001 + FLOW-001 + OUTREACH-001 + RIDE-001
  └── EVIDENCE-001 metrics + FHIR + system proof

ML-001 + EVIDENCE-001 + all integrated slices
  └── launch verification, security evidence, final review, Railway preflight,
      deterministic reset, recovery rehearsal, and recorded backup run
```

`EVIDENCE-001` also depends directly on `EPIC-001`, `OUTREACH-001`, and `RIDE-001`. `ML-001` may prepare its generator after the `FLOW-001` feature schema is frozen, but its runtime integration waits for the stable workflow contract.

## 6. Sprint map

| Sprint | Goal | Included work | Exit gate |
|---|---|---|---|
| Sprint 0 — Control plane | Make the roadmap executable | Create task records/specs; confirm external access, owner/SLA matrix, treatment clock, provider modes, model capacity `K`, and acceptance thresholds | All eight tasks validate at `PROPOSED`; no unresolved safety decision is hidden |
| Sprint 1 — Platform | Establish one deployable stateful stack | `RAIL-001` | Web/API/Postgres healthy on Railway; migrations and persistence verified; reset/reseed deterministic |
| Sprint 2 — Trusted entry and clinical truth | Protect every workspace and show truthful Camila context | `ACCESS-001`, then `EPIC-001` | Role/center sessions enforce destinations; staff-only live/fallback Epic projection passes targeted and security checks |
| Sprint 3 — Durable rescue spine | Replace client-scripted behavior with owned, deadline-aware workflow state | `FLOW-001` | Exact reply produces two valid threads; all role projections, graph, and timeline remain consistent and idempotent |
| Sprint 4 — Recovery and intelligence | Complete adaptive engagement and transportation recovery | `OUTREACH-001` and `RIDE-001` after the event contract freezes; `ML-001` after feature-schema freeze | Provider-ready modes make no external calls; CareLink recovery closes only after acknowledgment; model artifact passes its gate |
| Sprint 5 — Evidence and launch | Prove the system and harden the presentation path | `EVIDENCE-001` plus integrated release gate | Metrics derive from events; validator passes; full path, failure paths, preflight, security, review, and recording rehearsal pass |

### Compressed finals overlay

If September 25 is the fixed delivery date, run the sprint map as dependency waves rather than ceremonial multi-week sprints:

1. Day 0: finish Sprint 0 and start `RAIL-001` immediately.
2. Day 1: close `RAIL-001`; execute `ACCESS-001`; begin `EPIC-001` planning and private prerequisites.
3. Day 2: close `EPIC-001`; execute `FLOW-001`; freeze the event and ML feature contracts.
4. Day 3: run `OUTREACH-001`, `RIDE-001`, and isolated `ML-001` work in parallel where their frozen boundaries prevent conflicts; integrate in that order.
5. Launch day: close `EVIDENCE-001`; allow no new feature work after the release candidate; run preflight, the primary journey, the CareLink recovery path, and the backup recording.

This overlay is a risk-controlled target, not a claim that the work fits normal human capacity. Any missed exit gate stops downstream integration; it does not justify fake provider states, skipped authorization, unlabeled fallback data, or bypassed review.

## 7. Task portfolio

| Task | Size | Risk | Test depth | Dedicated security review | Primary proof |
|---|---:|---|---|---:|---|
| `RAIL-001` | L | Standard | TARGETED | Yes | Healthy Railway web/API/Postgres stack with durable state |
| `ACCESS-001` | L | High | TARGETED | Yes | Center-scoped server session opens only its configured workspace |
| `EPIC-001` | XL | High | TARGETED | Yes | Staff-only live/fallback Epic context with atomic provenance |
| `FLOW-001` | XL | Standard | TARGETED | Yes | One reply becomes separately owned clinical and transport work |
| `OUTREACH-001` | L | Standard | TARGETED | Yes | Auditable SMS-first policy and provider-ready replay without vendor calls |
| `RIDE-001` | XL | High | TARGETED | Yes | CareLink assignment, failure, recovery, return plan, and acknowledgment |
| `ML-001` | XL | Standard | FULL | Yes | Reproducible calibrated LightGBM/SHAP artifact and Camila trajectory |
| `EVIDENCE-001` | L | High | TARGETED | Yes | Event-derived metrics, source evidence, and validator-gated FHIR artifact |

## 8. Detailed sprint backlog

### RAIL-001 — Railway web API and PostgreSQL foundation

- `RAIL-01` Approve the initial OpenAPI boundary for liveness, readiness, version/build information, and the minimum persisted proof endpoint.
- `RAIL-02` Scaffold FastAPI with typed settings, structured redacted logs, correlation IDs, explicit CORS origins, request limits, and Railway `PORT` binding.
- `RAIL-03` Add SQLAlchemy/Alembic foundation and the minimum migration history needed for later event, session, integration, audit, and model metadata tables without prematurely implementing their domain behavior.
- `RAIL-04` Implement `/health` and `/ready`; readiness checks PostgreSQL and the required migration revision and later accommodates required model artifacts.
- `RAIL-05` Add deterministic seed/reset infrastructure that separates workflow reset from preserved Epic authorization and last-known-good snapshot state.
- `RAIL-06` Configure one Railway project with `web`, `api`, and private PostgreSQL services, explicit roots/watch paths, public domains, server-only variables, and post-deploy checks.
- `RAIL-07` Verify persistence across API restart, SPA refresh routing, failed-migration readiness, missing-variable logs, private database networking, and deployment `SUCCESS`.

### ACCESS-001 — Public experience, pricing, and workspace access

- `ACCESS-01` Capture the locked desktop/mobile visual baseline and approve an extension-only frontend design report.
- `ACCESS-02` Replace every public `Explore workspace` label with `Workspace access`; remove public patient/workspace/graph data from DOM, metadata, accessibility tree, and API activity.
- `ACCESS-03` Build the record-free three-panel Continuity Rescue Story and exactly two pricing cards: Pilot `$18,000/year` and Network `Talk to us`.
- `ACCESS-04` Define server-controlled center, synthetic identity, role, allowed workspace, session, sign-out, and safe recovery contracts.
- `ACCESS-05` Implement secure HTTP-only sessions, server-side provider/persona mapping, center membership, password hashing for configured accounts, CSRF protection for cookie-authenticated mutations, throttling, and audit events.
- `ACCESS-06` Implement the institutional access page with center selector, SSO-style buttons, email/password, forgot-password, and sign-up states without exposing persona mappings.
- `ACCESS-07` Enforce route and API authorization for patient, caregiver, staff, and transport; email sign-up cannot self-assign privileged access.
- `ACCESS-08` Verify refresh persistence, sign-out invalidation, wrong-workspace denial, invalid/expired session recovery, keyboard/focus/mobile/screen-reader/password-manager/reduced-motion behavior, and visual-lock comparison.

### EPIC-001 — Read-only Epic Sandbox clinical context

- `EPIC-01` Run an authorized Camila resource inventory against only the enabled R4 Read/Search APIs and record which facts can truthfully appear.
- `EPIC-02` Define typed authorization, connection-state, snapshot, resource-provenance, and staff projection contracts.
- `EPIC-03` Implement a non-public standalone SMART setup/callback flow with state/nonce/issuer/redirect validation, least-privilege scopes, encrypted server-side credentials, refresh rotation, revocation, and redaction.
- `EPIC-04` Implement one read-only adapter with resource/status/content-type/pagination validation and bounded retry/error behavior.
- `EPIC-05` Normalize supported resources into a versioned `ClinicalContextSnapshot`; publish only complete refreshes atomically and retain the prior complete snapshot for labeled fallback.
- `EPIC-06` Add a compact staff-only clinical-context panel with loading, empty, partial-source, unauthorized, live, fallback, unavailable, expiry, and error states using the locked visual system.
- `EPIC-07` Prove patient, caregiver, transport, non-Camila fixture, search, export, log, and accessibility projections contain no Epic-only fields.
- `EPIC-08` Run targeted OAuth/adapter/fallback tests, exact-revision verification, and dedicated security review before merge.

### FLOW-001 — Durable early-warning and owned work

- `FLOW-01` Freeze the treatment clock, owner/SLA matrix, business-day cutoff policy, event envelope, command idempotency, and model feature snapshot contract.
- `FLOW-02` Add append-only workflow events, outbox, current projections, correlation IDs, actor/source provenance, and optimistic concurrency/transition guards.
- `FLOW-03` Implement T−7/T−2/T−1 snapshots and deterministic explicit-barrier routing; stale scheduler or source state remains visible.
- `FLOW-04` Preserve Camila's exact reply and create distinct clinical-contact and transportation work with separate owners, deadlines, projections, acknowledgment, and closure rules.
- `FLOW-05` Implement appointment-change recomputation/reopen, SLA escalation, duplicate/out-of-order rejection, caregiver permission changes, and reset/reseed.
- `FLOW-06` Replace the critical frontend's local scripted mutations with API commands and role-specific projections while keeping the approved interaction and visual behavior.
- `FLOW-07` Verify patient, caregiver, staff, transport, graph, timeline, and preliminary metric consistency from the same events, including concurrency and replay.

### OUTREACH-001 — Adaptive SMS and voice orchestration

- `OUTREACH-01` Define normalized outreach plan, attempt, consent, opt-out, callback, replay, and provider-capability contracts.
- `OUTREACH-02` Implement deterministic channel policy using dated engagement features and model priority while allowing explicit requests/barriers to override immediately.
- `OUTREACH-03` Add Twilio and ElevenLabs/Twilio adapter interfaces, kill switches, allowlist hooks, callback signature/idempotency boundaries, and `provider_ready` implementations that make zero vendor calls.
- `OUTREACH-04` Add controlled disclosed replay events that use the same normalized workflow path as future verified callbacks.
- `OUTREACH-05` Extend the outreach composer/timeline with consent, availability, language, response history, empty/queued/scheduled/attempted/responded/opted-out/failed/human-follow-up states.
- `OUTREACH-06` Verify no clinical advice or symptom interpretation, no arbitrary browser destination, no leaked secret, no fake `Delivered`/`Completed`, and no provider network traffic in `provider_ready` mode.

### RIDE-001 — CareLink contracted-provider dispatch

- `RIDE-01` Define center/provider/service-area, minimum trip disclosure, eligibility, offer, assignment, failure, return, backup, and acknowledgment contracts.
- `RIDE-02` Implement server-side cutoff, funding/eligibility, operating window, arrival window, mobility/escort, service area, and provider availability checks.
- `RIDE-03` Implement idempotent CareLink request/offer/accept-or-decline/assignment/arrival/completion/cancellation/failure/return/backup events and audit history.
- `RIDE-04` Enforce staff/transport mutation permissions and build data-minimized transport, patient, caregiver, and staff projections.
- `RIDE-05` Extend the transportation workspace through one contracted-provider failure, backup assignment, outbound and return plan, patient notification, and patient acknowledgment.
- `RIDE-06` Show Uber Health as an inactive normalized alternative with activation requirements; do not claim quote, ETA, driver, request, or completion.
- `RIDE-07` Verify stale assignment, provider decline/unavailability, cancellation, retry, no-option, return-pending, permission revocation, duplicate commands, and clinical-text exclusion; complete dedicated security review.

### ML-001 — Longitudinal LightGBM and SHAP prioritization

- `ML-01` Freeze the feature schema, scoring timestamp, target label, navigator capacity `K`, calibration/top-K thresholds, subgroup harm rule, and artifact compatibility contract.
- `ML-02` Generate at least 75,000 encounters across at least 8,000 fictional patients, 12 fictional centers, and 18 months with repeated encounters, missingness, site effects, controlled drift, and the approved engagement/access signals.
- `ML-03` Add patient-separated chronological train/calibration/test splits and leakage tests that reject post-cutoff outcomes, final reasons, future notes, and post-score actions.
- `ML-04` Train one shallow regularized LightGBM classifier, fit sigmoid calibration on the distinct calibration set, and keep the final test set untouched until freeze.
- `ML-05` Evaluate Brier/calibration, PR-AUC, precision/recall/workload at `K`, deterministic/contact-all/contact-none baselines, and required subgroup counts/performance.
- `ML-06` Persist model, calibrator, feature schema, seeds, generator version, thresholds, timestamp, metrics, and manifest as one versioned artifact set; publish the data/model card.
- `ML-07` Produce Camila's held-out T−7/T−2/T−1 path through the normal pipeline and SHAP margin explanation; prove the score, explanation, and channel choice are not hard-coded.
- `ML-08` Integrate runtime compatibility/staleness checks and `Score unavailable` degradation while universal deterministic cadence continues; complete FULL independent testing and security review.

### EVIDENCE-001 — Operational metrics and validated FHIR evidence

- `EVIDENCE-01` Define event-derived metric formulas, replay-versus-verified provenance, FHIR mapping, evidence access, validator version, and validation report contract.
- `EVIDENCE-02` Compute lead time, ownership/action/closure durations, unresolved blockers, outreach/acknowledgment, CareLink recovery, and final disposition only from persisted events.
- `EVIDENCE-03` Build Epic source evidence showing mode, synchronization time, mapped resource types/counts, and non-secret references without merging Epic and OncoReady provenance.
- `EVIDENCE-04` Generate the approved FHIR R4 Bundle resources and Provenance from the same workflow state, without implying Epic writeback.
- `EVIDENCE-05` Run the pinned validator, persist an inspectable report, block the `Validated` label on failure, and expose mapping/validation evidence only to authorized sessions.
- `EVIDENCE-06` Extend the protected system UI with metrics, source evidence, FHIR mapping, and validation state using the locked design.
- `EVIDENCE-07` Verify metric recomputation, authorization, malformed/invalid bundles, validation failure, provenance claims, final critical path, and dedicated security review.

## 9. Human and external launch gates

These decisions or credentials are required before the named task can reach `BUILD_READY` or complete integration. They must not be invented by an implementation agent.

| Gate | Needed by | Owner/action | Safe fallback |
|---|---|---|---|
| Railway account/tool access, project, public domains, and variable management | `RAIL-001` | Human grants approved workspace/CLI access; orchestrator checks for existing services before creating any | Local web/API/Postgres verifies code, but launch cannot be called deployed |
| Exact Epic Non-PRD client configuration, HTTPS redirect URI, enabled scopes, private presenter authorization | `EPIC-001` | Human supplies access through secure environment configuration and completes Epic login privately | Versioned Camila snapshot may preserve the recording only after one authorized successful inventory; it is visibly labeled fallback |
| Department owner/SLA matrix, treatment clock, business-day calendar, transport cutoff | `FLOW-001` | Authorized oncology workflow owner confirms | Task remains in planning; code must not invent clinical-operational policy |
| Outreach scripts, consent/opt-out language, language variants | `OUTREACH-001` | Product/clinical stakeholder reviews controlled content | Generic provider-ready UI can be built, but no script is represented as approved |
| CareLink center, contracted provider, service area, coordinator/driver fixtures, funding/eligibility rules | `RIDE-001` | Transportation workflow owner confirms synthetic configuration | Keep blocker open and show no-option/escalation state |
| Navigator capacity `K`, calibration/top-K gate, minimum subgroup count, unacceptable-harm rule | `ML-001` | Product/model owner records prespecified values before final test evaluation | Model remains `Score unavailable`; deterministic cadence continues |
| Pinned FHIR validator/version and approved evidence visibility | `EVIDENCE-001` | Architecture/security select and record before contract freeze | UI cannot show `Validated` |

Twilio, ElevenLabs, Uber Health, real Google/Microsoft/Apple OAuth, production Epic connectivity, and customer production deployment are explicitly deferred and are not launch blockers.

## 10. Verification matrix

| Gate | Required evidence |
|---|---|
| Repository baseline | Project validation, contract validation, frontend build, smoke tests, and E2E tests pass |
| Contract | OpenAPI/event/schema/model boundaries validate before each contract-required task enters `BUILD_READY` |
| Database | Migration forward/rollback strategy, constraints, current revision, failed-migration readiness, deterministic seed/reset |
| Backend | Unit and integration tests for business rules, authorization, idempotency, transition ordering, redaction, and failure behavior |
| Frontend | Component/E2E checks for role routes, loading/error/empty/disabled/success states, accessibility, responsive behavior, and reduced motion |
| Visual lock | Matching pre/post desktop and mobile screenshots for affected surfaces; no unapproved token/component drift |
| External adapters | Network-disabled provider-ready tests; signed/idempotent callback boundaries; Epic live/fallback tests in a safe Sandbox environment |
| Model | Reproducible generator/training, leakage and schema tests, final holdout evaluation, subgroup report, Camila-not-hard-coded test |
| FHIR | Pinned validator pass and inspectable mapping/report; failure suppresses `Validated` |
| Security | Required specialist review on the exact verified commit for every roadmap task marked for review |
| Release | Railway deployment reaches `SUCCESS`; `/health`, `/ready`, migrations, CORS, reset, sessions, Epic preflight, model artifact, and the full critical path pass |

## 11. Launch-day runbook

1. Freeze the release candidate; no visual or feature changes after final verification begins.
2. Confirm Railway `web`, `api`, and PostgreSQL services, domains, latest successful deployments, private database connection, migration revision, and required variables without printing secrets.
3. Run reset/reseed while preserving valid Epic authorization and the last-known-good snapshot.
4. Run private Epic preflight: refresh or reauthorize, inventory Camila, atomically publish the snapshot, and select truthful `Live` or accepted `Snapshot fallback` state.
5. Confirm model artifact/version, provider modes (`CareLink=active`; SMS/voice/Uber=`provider_ready`), deterministic replay, and CareLink fixture state.
6. Execute the exact public → access → staff → split work → transport → caregiver → patient acknowledgment → confirmed graph/evidence journey.
7. Execute one failure rehearsal: CareLink provider failure followed by backup recovery. Confirm clinical text never enters caregiver or transport surfaces.
8. Run current repository verification and required exact-revision security/final reviews.
9. Record a backup run, then rehearse the primary narration to approximately 2:40 so the evidence close remains inside three minutes.
10. Human approves and merges each feature; only then close the task with `task advance <TASK-ID> --merged`.

## 12. Definition of done

The launch sprint is complete only when every roadmap stop condition is true on the same integrated revision:

- the primary user-visible outcome works end to end from the public site through `Continuity plan confirmed`;
- protected state is server-authorized and persisted; graph, timeline, workspaces, metrics, and FHIR evidence derive from the same workflow events;
- Epic provenance is truthful and separate from OncoReady-owned state;
- no public patient data, cross-role clinical leakage, secret exposure, fabricated provider action, or unsupported product claim remains;
- the locked visual system, accessibility behavior, responsive layouts, and reduced motion remain coherent;
- selected tests, migration checks, contract checks, model gate, pinned FHIR validation, deployment checks, and the deterministic recovery path pass;
- verification, required security reviews, and final review approve the exact current commit;
- setup/operator documentation supports the private preflight, reset, deployment check, and presentation journey;
- the human completes final merges and deliberately authorizes any later production or external-provider activation.
