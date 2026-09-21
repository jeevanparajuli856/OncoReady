# OncoReady Product Definition

> Classification labels:
> - **Confirmed** — explicitly approved by the human or established by current evidence
> - **Assumption** — a working premise that still requires validation
> - **Recommendation** — an approved implementation choice for the launch path
> - **Open question** — a material unknown that is not represented as fact

## 1. Product Identity

### Product name

**OncoReady — Treatment Readiness and Continuity Loop**

### One-sentence description

OncoReady connects the clinical record to the operational reality around cancer treatment: it detects what could interrupt an upcoming treatment, gives every barrier an accountable owner, and proves the continuity plan closed.

### Status

**Confirmed:** The launch roadmap is approved. The project is moving from the completed frontend-first proof into a Railway-hosted web/API/PostgreSQL application with a read-only Epic Sandbox integration for the finals journey.

### Product presentation rule

Present OncoReady as a treatment-continuity platform. Do not call it a prototype, portfolio project, toy, or cheap demo. Do not claim an Ochsner connection, Epic partnership, production Epic access, Epic writeback, clinical validation, HIPAA compliance, real patients, customers, or outcomes that do not exist.

### Human-approved visual lock

**Confirmed:** The current interface and [`DESIGN_SYSTEM.md`](./design/DESIGN_SYSTEM.md) are the approved visual product. Future work must preserve the existing design, theme behavior, palette and token values, typography, spacing rhythm, radii, borders, shadows, icon and logo language, component styling, navigation character, layout character, motion language, and responsive behavior.

- New functionality must look like a native extension of the current UI by reusing existing runtime tokens and component primitives.
- A frontend design phase may solve the placement and interaction of new content inside the established system; it may not rebrand, retheme, restyle, or modernize existing surfaces.
- No global token, established component style, or existing page may change without explicit human approval for that exact visual change.
- Accessibility corrections remain mandatory and must use the smallest visual delta. A materially visible correction requires human approval.
- Matching before/after screenshots at affected viewports are required evidence for frontend review. Unapproved visual drift is a blocker.

## 2. Problem Statement

### Confirmed

- Cancer treatment can be disrupted when transportation, medication access, cost, caregiving, communication, or a clinical concern threatens a time-sensitive appointment.
- The clinical chart can show the treatment plan without showing whether the patient can reach treatment, is responding to outreach, or has an unresolved practical barrier.
- A useful workflow must show detection, ownership, deadline, acknowledgment, action, patient confirmation, and closure rather than stop at screening, referral, or reminder delivery.
- One patient response can contain both a clinical concern and a practical barrier; each needs a different accountable human pathway without allowing a model to interpret or downgrade the patient's words.

### Assumptions

- Some oncology organizations lack one treatment-anchored view that joins clinical context with cross-department readiness and closure evidence.
- A focused exception workflow can reduce duplicate outreach and reconciliation work instead of becoming another general inbox.
- A read-only Epic integration plus a separate OncoReady workflow is more credible and safer for the launch than attempting EHR writeback.

## 3. Intended Users and Outcomes

| Actor / user | Need | Desired outcome |
|---|---|---|
| Patient receiving active treatment | A simple way to report what threatens the next treatment | Know who owns each issue, what happens next, and whether the plan is confirmed |
| Authorized family caregiver | Only the logistics the patient permits | Help with transportation without receiving clinical details |
| Oncology navigator | A prioritized view of practical barriers and deadlines | Resolve the barrier before the treatment cutoff and prove closure |
| Triage nurse | Relevant clinical context plus the patient's original concern | Acknowledge and handle the concern through a human-controlled pathway |
| Transportation coordinator | Minimum necessary trip, timing, mobility, and acknowledgment details | Assign an outbound and return plan, recover from failure, and preserve the audit trail |
| Operations leader | Evidence about aging exceptions, ownership, and resolution | Understand workload, response, recovery, and continuity outcomes |

### Primary product outcome

Camila's patient-reported clinical concern and cancelled ride become two separately owned workflows, both reach an accountable disposition, Ana receives only permitted transportation information, and Camila sees `Continuity plan confirmed` before treatment.

## 4. Signature Story and Hero Journey

### Central hook

> **Epic knew what treatment Camila needed. OncoReady discovered what could keep her from receiving it.**

### Hero journey

```text
Private pre-recording setup authorizes the read-only Epic Sandbox connection
  ↓
Staff opens Camila Lopez, the single fully functional Epic-backed case
  ↓
Epic supplies the available appointment, oncology plan, labs, medications,
diagnostic results, procedure history, encounter, practitioner, and location context
  ↓
At T−2, OncoReady flags deteriorating engagement and unresolved transportation
  ↓
At T−1, Camila replies:
“My ride was cancelled—and I’m not feeling well today.”
  ↓
Her exact clinical words route to the triage nurse without model interpretation
and the transportation barrier routes separately to the oncology navigator
  ↓
The nurse acknowledges the concern; navigation secures an outbound ride,
return plan, and backup through CareLink Partner Dispatch
  ↓
Ana sees only transportation information Camila authorized
  ↓
Camila acknowledges the recovered plan
  ↓
The Treatment Readiness Graph changes from Treatment at risk
to Continuity plan confirmed
```

### Demo-critical path

The reliable recorded path is: public continuity story → professional workspace access → staff opens already-connected Camila → Epic clinical context and source time → T−7/T−2/T−1 readiness trajectory → exact patient reply → split nurse/navigation work → nurse acknowledgment → CareLink assignment and recovery → Ana's permission-limited view → Camila acknowledgment → resolved graph, timeline, metrics, Epic provenance, and validated OncoReady FHIR evidence.

The Epic login and consent screen occur only in a private pre-recording setup. Access tokens are expiring credentials; a server-side refresh path or immediate pre-recording reauthorization is required. If live retrieval fails, the staff UI may use only the last successful Camila snapshot with its original timestamp and the explicit label `Snapshot fallback`.

## 5. Product Impression Strategy

### First 30-second impression

Viewers should understand that the chart explains the treatment while OncoReady reveals and resolves the human dependencies that could still interrupt it.

### Visual hook

The existing Treatment Readiness Graph remains the signature protected-workspace surface. It centers the upcoming treatment and shows every unresolved dependency, owner, deadline, action, fallback, and proof of closure. The public site uses the existing `Detect early`, `Coordinate recovery`, and `Confirm continuity` story without exposing a patient record.

### Interaction hook

One patient message visibly becomes separately owned clinical and transportation work. Subsequent human actions propagate through the graph, audit timeline, staff queue, patient status, transportation workspace, and permission-limited caregiver view.

### Data/storytelling hook

- Epic clinical facts retain their source resource, source identifier, retrieval time, and live/fallback state.
- OncoReady workflow events retain actor, owner, deadline, correlation, acknowledgment, and closure evidence.
- The UI never merges those provenances or represents an OncoReady event as Epic writeback.

### Experience principles

- Calm urgency: deadlines are legible without increasing patient anxiety.
- Human authority: consequential clinical and operational actions always have a named human owner.
- Closure over referral: a sent message, referral, or ride suggestion is not success.
- Exact words: patient-reported clinical text is preserved and routed, never summarized into a lower urgency.
- Data minimization: each role receives only the information needed for its responsibility.
- Truthful integration: live, fallback, synthetic, replay, and provider-ready states remain distinguishable where the boundary matters.
- Visual continuity: new work extends the approved UI without changing it.

## 6. Current Launch Scope

### In scope

- Public landing story, exactly two pricing plans, and professional center-scoped workspace access.
- Railway deployment with React/Vite web, FastAPI API, and Railway PostgreSQL services.
- Server-managed seeded OncoReady identities for the controlled patient, caregiver, staff, and transportation routes.
- A read-only standalone SMART on FHIR connection to the Epic Sandbox using the Non-PRD application configuration.
- Camila as the only complete Epic-backed and fully interactive case.
- Lightweight contextual queue records on nurse and transportation surfaces that never trigger Epic calls or imply full functionality.
- Durable append-only workflow events, projections, ownership, deadlines, idempotency, and reset/reseed behavior.
- Treatment Readiness Graph, role-specific workspaces, audit timeline, computed metrics, and source provenance.
- Adaptive LightGBM readiness-disruption prioritization with calibrated output and SHAP evidence; explicit barriers always override prediction.
- Provider-ready SMS and voice surfaces without unverified external execution.
- Active CareLink Partner Dispatch for a center's configured local provider, including failure recovery and return planning.
- Provider-ready Uber Health surface without fabricated quote, assignment, driver, or completion states.
- A validated OncoReady-generated FHIR R4 evidence bundle that is distinct from Epic source data and writeback.
- Responsive, accessible, keyboard-complete, reduced-motion-aware states within the locked visual system.

### Out of scope

- Production Epic customer connectivity, an embedded Epic EHR launch, Epic writeback, or production PHI.
- Any claim of Ochsner use, access, endorsement, configuration, workflow approval, or partnership.
- Real Google, Microsoft, or Apple OAuth in the controlled finals build.
- Live Twilio, ElevenLabs, or Uber Health execution until separately activated with credentials, allowlists, callbacks, tests, and security approval.
- Autonomous symptom triage, diagnosis, prognosis, treatment recommendation, treatment modification, medical clearance, or emergency disposition.
- A general EHR viewer, general cancer chatbot, statewide resource marketplace, billing system, or broad oncology analytics suite.
- Multiple complete patient journeys; non-Camila records remain bounded context.
- A visual redesign, new theme, new palette, new typography system, or broad component restyle.

## 7. Functional Requirements

### Epic clinical context

- Only authenticated nurse and oncology navigator roles may receive Camila's Epic-derived clinical context.
- The enabled R4 Read/Search surface covers Patient demographics, Appointment, Encounter, Condition problems, Observation labs, MedicationRequest signed orders, Oncology CarePlan, Oncology Plan Day RequestGroup, Location, Practitioner, DiagnosticReport results, patient-reported surgical history, and surgeries.
- The implementation must inventory Camila's actual Sandbox responses. The UI may attribute a field to Epic only if it exists in the live response or the versioned last-known-good Epic snapshot.
- Epic access is read-only. No OncoReady action may call a FHIR create, update, patch, or delete operation.
- The staff UI shows `Live — synchronized <time>`, `Snapshot fallback — synchronized <time>`, or `Unavailable`; it never silently presents cached data as live.
- Ana, patient, and transportation projections must exclude Epic-only clinical fields from visual output, accessibility output, search, exports, and logs.

### Readiness and owned work

- A patient response with a clinical concern and transportation failure creates two distinct work items with different owners, deadlines, projections, and closure rules.
- Clinical text remains visible verbatim and no model may set, interpret, or downgrade clinical urgency.
- Every work item shows source, owner, due time, state, next action, and closure evidence.
- Invalid or out-of-order state transitions are rejected and duplicate commands are idempotent.
- A transportation request cannot close until staff records the required plan and Camila acknowledges it.
- Ana sees only transportation status authorized by Camila.
- All relevant views derive from the same OncoReady workflow event history.

### Controlled access and case boundary

- The public site contains no patient record, treatment graph, Epic payload, or protected workspace data.
- OncoReady's controlled access mapping remains server-resolved: Google → Camila patient, Microsoft → Ana caregiver, Apple → hospital staff, configured email → transportation.
- Browser-provided role or destination values cannot grant a workspace.
- Camila is the only case that opens the complete staff-to-transport-to-caregiver-to-patient journey.
- Other queue entries remain non-interactive or explicitly bounded contextual fixtures and must not be represented as Epic-connected.

## 8. Technical Credibility and Target Architecture

### Core engineering capability

OncoReady combines a read-only, provenance-preserving Epic clinical-context adapter with a typed workflow engine that converts readiness signals into separately owned, deadline-aware actions. Every protected view derives from durable events and projections, while the ML model only prioritizes supportive outreach and deterministic rules preserve clinical authority.

### Required platform

| Subsystem | Approved technology | Product reason |
|---|---|---|
| Web | React + TypeScript + Vite | Preserve the existing polished interface and responsive workspaces |
| API | Python + FastAPI | Server-enforced sessions, workflow commands, adapters, FHIR normalization/export, metrics, and inference |
| Database | Railway PostgreSQL | Durable events, projections, sessions, encrypted integration state, snapshots, and model metadata |
| Migrations | Alembic under `backend/alembic/versions` | Git-tracked, reviewable schema evolution |
| Hosting | One Railway project | One controlled environment for web, API, and private database networking |
| Epic | SMART on FHIR R4, standalone Sandbox launch | Real read-only clinical context for Camila; embedded EHR launch deferred |
| ML | LightGBM + calibration + SHAP | Inspectable readiness-disruption prioritization, never clinical decision-making |

### Deliberately avoided complexity

- No Redis, Kafka, Kubernetes, microservice split, or separate worker service for the finals build.
- No speculative adapter implementation for vendors without approved access.
- No EHR writeback, broad chart replication, or Epic data use as unapproved model training input.
- No frontend-only authorization for protected data or consequential actions.

## 9. Data, Privacy, Security, and Trust Boundaries

### Data involved

- Epic-provided non-production Sandbox test resources for Camila.
- Controlled OncoReady fixtures for Ana, staff, center, other queue entries, outreach history, transportation activity, and model history.
- OncoReady workflow events, projections, sessions, permissions, metrics, model metadata, and audit evidence.

### Sensitive-data rule

No real patient data or production credentials are permitted. Epic access tokens, refresh tokens, confidential-client material, signing keys, database credentials, and provider secrets must remain server-side, encrypted or platform-managed as appropriate, redacted from logs, and absent from Git, browser bundles, screenshots, reports, and chat.

### Trust boundaries

- **Epic authorization → API:** validate state, nonce, issuer, redirect URI, granted scopes, expiry, and refresh behavior; never send Epic credentials to the browser.
- **Epic resources → normalization:** validate resource types, retain provenance, handle pagination and partial failures, and atomically publish only complete successful snapshots.
- **OncoReady session → protected API:** enforce role and center access server-side; browser role claims are untrusted.
- **Patient text → rendering/workflow:** validate bounded input and render as text, never executable markup.
- **Patient → caregiver:** use an allowlisted transportation projection; clinical text and Epic context are forbidden.
- **Staff → transportation:** expose only the minimum trip, timing, contact, mobility, and acknowledgment information needed for dispatch.
- **Model → workflow:** model output may prioritize outreach but cannot suppress explicit barriers, set clinical urgency, or close work.
- **Live → fallback:** a failed Epic refresh may use only the complete last-known-good snapshot with its original timestamp and fallback label.

### Security posture

The target launch includes authentication, authorization, persistent data, OAuth credentials, external APIs, and role-limited clinical test data. Relevant implementation tasks are STANDARD or HIGH risk and require targeted tests; Epic authorization, access, transportation actions, and other sensitive boundaries require dedicated security review when selected by architecture.

## 10. Quality and Non-Functional Requirements

### Reliability

- A private recording preflight verifies Railway health, migrations, model artifacts, seeded sessions, CareLink reset state, Epic authorization, Camila's resource inventory, and snapshot timestamp.
- Reset/reseed restores the workflow scenario without deleting a currently valid Epic authorization or last-known-good snapshot.
- A live dependency failure never becomes silent success; degraded states remain explicit and recoverable.
- The recorded journey has a rehearsed live path and a labeled snapshot fallback.

### Accessibility and responsiveness

- Full keyboard operation, semantic structure, visible focus, sufficient contrast, large controls, non-color state cues, screen-reader output, and reduced-motion behavior are required.
- Patient/caregiver surfaces must remain usable on mobile; staff/transport workspaces must remain usable on presentation-laptop viewports.

### Visual consistency

- All new UI must pass visual comparison against the locked pre-change baseline.
- Loading, error, empty, disabled, success, live, fallback, and unavailable states must use established components and tokens.
- No frontend task is complete if it changes unrelated existing surfaces or introduces unapproved visual drift.

### Verification

- Build, type checks, frontend tests, targeted integration/authorization tests, contract/schema checks, migration checks, and the critical end-to-end path must pass at the depth selected for each task.
- Verification is commit-bound. Changes to implementation, architecture, requirements, contracts, or design evidence invalidate downstream evidence.

## 11. External Systems and Truthful Status

| System / provider | Purpose | Launch status |
|---|---|---|
| Epic Sandbox | Camila clinical context through enabled FHIR R4 Read/Search APIs | Active read-only target; private pre-recording authorization; no production or writeback claim |
| OncoReady FHIR R4 export | Standards-shaped workflow evidence | Generated and pinned-validator checked; not Epic writeback |
| Railway | Web, API, and PostgreSQL hosting | Approved target |
| CareLink Partner Dispatch | Contracted local-provider transportation workflow | Active normalized finals path |
| SMS / voice | Supportive outreach and escalation | Provider-ready; external activation deferred |
| Uber Health | Optional normalized transportation provider | Provider-ready; no unverified provider events |
| Google / Microsoft / Apple | Controlled route-entry presentation | Seeded identity broker only; real OAuth deferred |
| Ochsner | Possible future customer discovery context | No integration, endorsement, access, or approved workflow claim |

## 12. Delivery Strategy

| Order | Task ID | Vertical slice | User-visible outcome | Depends on |
|---:|---|---|---|---|
| 0 | PLAN-002 | Source-of-truth reconciliation | Approved product, architecture, configuration, and visual lock | Approved roadmap |
| 1 | RAIL-001 | Railway web/API/PostgreSQL foundation | One healthy deployed stack with durable state | PLAN-002 |
| 2 | ACCESS-001 | Public experience, pricing, and workspace access | Professional center-scoped access without public patient data | RAIL-001 |
| 3 | EPIC-001 | Read-only Epic Sandbox clinical context | Camila's authorized staff record shows truthful live/fallback Epic provenance | ACCESS-001 |
| 4 | FLOW-001 | Durable early warning and owned work | Camila's clinical and transportation barriers become separately owned actions | EPIC-001 |
| 5 | OUTREACH-001 | Adaptive outreach orchestration | Model-informed timing and provider-ready channel surfaces | FLOW-001 |
| 6 | RIDE-001 | CareLink contracted-provider dispatch | Outbound/return plan, recovery, and acknowledgment close the transport dependency | FLOW-001 |
| 7 | EVIDENCE-001 | Metrics and FHIR evidence | Inspectable operational metrics, Epic provenance, and validated export | EPIC-001, FLOW-001, OUTREACH-001, RIDE-001 |
| 8 | ML-001 | Longitudinal LightGBM and SHAP | Real calibrated Camila explanation drives supportive outreach priority | Stable workflow/event contracts |

Each task follows the repository lifecycle. Frontend tasks must obey the human-approved visual lock; Epic and access tasks require formal contracts, targeted testing, and security review at the risk level selected by architecture.

## 13. Stop Condition and Success Criteria

The launch build is complete when:

- the public site explains the mechanism without exposing a patient record;
- the current OncoReady visual identity is unchanged and new surfaces pass baseline comparison;
- Camila's staff record reads the enabled clinical context from Epic Sandbox through the approved read-only adapter and shows truthful live/fallback provenance;
- one exact Camila response creates separately owned clinical and transportation work without autonomous clinical interpretation;
- CareLink completes assignment, recovery, return planning, and patient acknowledgment;
- Ana's view contains permitted transportation information and no Epic or clinical text;
- Camila acknowledges the plan and the graph reaches `Continuity plan confirmed`;
- workflow projections, metrics, graph, timeline, and FHIR export derive from the same OncoReady events while Epic context retains separate provenance;
- the live critical path and deterministic fallback pass targeted verification;
- required security and frontend design reviews approve the exact verified revision;
- the human completes the feature merges.

Success means a viewer can retell the patient, problem, mechanism, clinical-context boundary, accountable recovery, and outcome after one viewing. It does not mean every imaginable production-hardening task has been implemented.

## 14. Assumptions and Open Questions

| ID | Type | Item | Required validation |
|---|---|---|---|
| A-001 | Assumption | Camila's enabled Epic Sandbox resources contain enough data for the intended compact clinical summary | Run the EPIC-001 resource inventory; show only returned facts |
| A-002 | Assumption | The app registration supports the confidential-client/refresh behavior needed for the recording window | Validate during private authorization preflight; otherwise reauthorize immediately before recording |
| A-003 | Assumption | One complete Epic-backed case is more persuasive than several shallow cases | Rehearse the three-minute story with uninvolved viewers |
| Q-001 | Open question | Which production Epic launch point and user context would a future customer choose? | Decide with that customer's operational and IT stakeholders |
| Q-002 | Open question | Which treatment cohort, owners, SLAs, and clinical response boundaries would support a real pilot? | Validate with an authorized oncology workflow owner |
| Q-003 | Open question | Which staff surface would OncoReady replace or augment? | Validate before production workflow design |

## 15. Approved Project-Level Decisions

- Use Camila Lopez as the single complete Epic Sandbox story; Ana retains the same permission-limited family-caregiver relationship.
- Use read-only Epic clinical context only in authorized nurse/navigator staff surfaces.
- Keep patient, caregiver, and transportation workflows OncoReady-owned; no Epic writeback.
- Complete Epic authorization privately before recording and use a truthful last-known-good snapshot fallback.
- Use Railway web/API/PostgreSQL architecture, CareLink as the active transportation path, and provider-ready SMS, voice, and Uber Health boundaries.
- Preserve the current UI design, palette, theme, typography, components, motion, and responsive character exactly; future agents may extend functionality but may not redesign the product without explicit human approval.
