# OncoReady Product Definition

> Classification labels:
> - **Confirmed** — explicitly established by the approved direction or source research
> - **Assumption** — a working premise that remains to be validated
> - **Recommendation** — an implementation choice selected for rapid delivery
> - **Open question** — a material unknown that does not block the first slice unless stated

## 1. Product Identity

### Product name

**OncoReady — Treatment Readiness and Continuity Loop**

### One-sentence description

OncoReady helps patients and oncology teams identify what could derail an upcoming treatment, route each concern to the right human, and visibly confirm the plan.

### Status

Active inception; first product slice approved.

### Product presentation rule

Present OncoReady as the treatment-readiness product it is. Do not label user-facing surfaces as a prototype, demo app, experiment, or portfolio project. Do not imply production Ochsner integration, clinical validation, compliance, real patient use, or outcomes that do not exist.

## 2. Problem Statement

### Confirmed

- Cancer treatment can be disrupted when transportation, medication access, cost, caregiving, communication, or a clinical concern threatens a time-sensitive appointment.
- Ochsner already provides navigation, portal communication, supportive services, urgent clinical pathways, virtual care, and Chemotherapy Care Companion; OncoReady must connect and activate existing services rather than duplicate them.
- A useful workflow must show ownership, deadline, action, acknowledgment, and closure rather than stop at screening or referral.

### Assumptions

- Some cross-domain pre-treatment concerns may not share one visible resolution plan inside Ochsner today.
- A treatment-anchored exception workflow could reduce reconciliation and duplicate outreach instead of adding another inbox.

## 3. Intended Users and Outcome

| Actor / User | Need | Desired outcome |
|---|---|---|
| Patient receiving active treatment | A simple way to report what threatens the next treatment | Know who is helping, what happens next, and whether the plan is confirmed |
| Authorized caregiver | Only the tasks and status the patient permits | Help without receiving blanket clinical access |
| Oncology navigator | A prioritized view of practical barriers | Resolve a barrier before the treatment deadline and prove closure |
| Triage nurse | Preserve and receive clinical concerns through an approved pathway | Review the original report without an AI making a clinical decision |
| Operations leader | Visibility into aging exceptions and resolution | Understand ownership, workload, and continuity metrics |

### Primary product outcome

A patient-reported clinical concern and transportation failure become two correctly owned workflows, both reach a defined disposition, and the patient sees a confirmed plan for the upcoming treatment.

### Non-goals

- General cancer chat, education, diagnosis, prognosis, or treatment recommendations.
- Autonomous symptom triage, treatment modification, or emergency disposition.
- Replacing MyOchsner, Chemotherapy Care Companion, nurse navigation, or urgent clinical pathways.
- Production authentication, PHI, Ochsner/Epic/FHIR connectivity, live messaging, maps, resource APIs, or clinical protocols.
- A statewide resource marketplace, billing system, analytics suite, or all-journey cancer platform.

## 4. Hero User Journey

```text
Maria sees an infusion scheduled for tomorrow
  ↓
She completes a short readiness check and reports a cancelled ride plus a clinical concern
  ↓
Deterministic rules preserve and split the report into triage and navigation work
  ↓
The Treatment Readiness Graph shows two blockers, owners, deadlines, and actions
  ↓
Staff acknowledge the clinical concern and confirm a simulated transportation plan
  ↓
Ana receives only the transportation update Maria authorized
  ↓
Maria confirms receipt and the treatment plan becomes ready
```

### Demo-critical path

The reliable path is: reset → treatment home → readiness check → submit two concerns → split into two owned tasks → open staff case → acknowledge clinical task → confirm transportation → show permission-limited caregiver update → patient confirms → readiness graph and audit timeline resolve.

### Failure states that must still feel complete

- Input validation explains what remains before submission.
- Task actions have explicit disabled and success states.
- Refresh restores the scripted demonstration state when practical.
- A one-click reset always returns to the known opening state.
- Reduced-motion mode preserves all state meaning without animation.
- If optional AI behavior is represented, its failure cannot block routing or task creation.

## 5. Product Impression Strategy

### First 30-second impression

Viewers should immediately understand that tomorrow's treatment has two blockers and that OncoReady turns them into accountable, time-bound action rather than another message or questionnaire.

### Visual hook

The Treatment Readiness Graph makes the upcoming treatment the central event and displays every unresolved dependency, owner, due time, action, and proof of closure. Gemini owns the exact visual system and composition.

### Interaction hook

Maria's single report visibly separates into clinical and practical work; subsequent human actions propagate through the graph, timeline, patient status, and caregiver view.

### Data / storytelling hook

An append-only event timeline tells a causal story from detection through assignment, acknowledgment, action, patient confirmation, and resolution, with transparent synthetic timestamps and ownership.

### Experience principles

- Calm urgency: make deadlines legible without increasing patient anxiety.
- Human authority: always show the person or role responsible for consequential action.
- Closure over referral: a recommendation or sent message is not success.
- Low cognitive burden: one clear action at a time and plain language.
- Truthful simulation: synthetic data and simulated integrations remain visible.

## 6. Technical Credibility

### Core real engineering capability

A typed, deterministic workflow state machine converts readiness input into separate owned tasks and enforces valid transitions from detection to resolution. All visible surfaces derive from the same event state, so the graph, queue, caregiver permissions, and audit timeline remain consistent.

### Minimum real backend / data / integration

- No backend is needed for the first slice.
- Synthetic fixtures and browser-side persistence support the complete journey.
- Deterministic routing and state transitions are real application behavior, not pre-rendered screen swaps.
- FHIR-shaped identifiers or a static mapping explanation may demonstrate a credible future boundary, but no live server is claimed.

| Technology / subsystem | Needed? | Product/technical reason |
|---|---:|---|
| Database | No | One deterministic synthetic journey can persist locally |
| Authentication | No | Role switching is part of the scripted synthetic experience, not real access control |
| External API | No | Live dependencies would reduce deadline reliability |
| Queue/cache/realtime | No | The browser state machine supplies the required transitions |
| IaC/container platform | No | A static frontend build is sufficient |

## 7. Core Capabilities

### Confirmed

- Treatment-anchored patient home and countdown.
- Two-minute readiness check covering transportation and a patient-reported clinical concern.
- Deterministic split routing into one triage task and one navigation task.
- Exception-only staff queue with Maria as the complete interactive case.
- Treatment Readiness Graph with owner, deadline, state, fallback, and closure evidence.
- Simulated transport selection and confirmation.
- Permission-limited caregiver update.
- Patient confirmation, event timeline, synthetic-data disclosure, and one-click reset.

### Recommended / proposed

- A controlled optional AI-timeout proof only after the golden path is flawless.
- A small static FHIR mapping panel for technical explanation, not as a primary screen.

## 8. Scope

### In scope

- Five connected responsive surfaces: treatment home, readiness check, exception queue, case/readiness graph, patient/caregiver resolution.
- Real local state changes for every step of the hero journey.
- Synthetic Maria/Ana scenario plus a few static queue cases for context.
- Polished loading, validation, disabled, focus, pressed, success, and reduced-motion states.
- Local build, deterministic reset, and a critical-path smoke test.

### Out of scope

- Backend, database, authentication, live AI, live SMS/voice, maps, resource capacity, or production integrations.
- Storm Mode, bilingual urgent content, multiple complete journeys, admin settings, and broad analytics.

### Future / possible scope

- More synthetic cases and FIFO-versus-readiness prioritization.
- Unavailable-resource and unacknowledged-task failure paths.
- Low-connectivity behavior and a validated synthetic FHIR export.
- Storm Mode using the same readiness engine.

## 9. Functional Requirements

### Confirmed

- A readiness submission with a clinical concern and transportation failure creates two distinct tasks.
- Clinical text remains visible verbatim and no AI may set or downgrade clinical urgency.
- Every task shows source, owner, due time, state, next action, and closure evidence.
- A transportation suggestion cannot close the task until staff confirms the action and the patient acknowledges the plan.
- Ana sees only transportation status authorized by Maria.
- All relevant views update from the same workflow state.
- Reset returns the application to a deterministic opening state.
- All people, messages, integrations, resources, protocols, and outcomes are labeled synthetic or simulated where shown.

### Assumptions

- Role switching within one browser is acceptable for the draft product experience.
- Maria's single scenario is sufficient to establish the mechanism before additional cases are built.

## 10. Quality and Non-Functional Requirements

### Confirmed

- The hero journey must work locally without network services after dependencies are installed.
- Intended screens must be complete at mobile and presentation-laptop sizes.
- Keyboard navigation, visible focus, semantic structure, sufficient contrast, large controls, non-color state cues, and reduced-motion behavior are required.
- No obvious starter branding, lorem ipsum, dead navigation, exposed secrets, real PHI, or unsupported product claims.

### Recommended

- Keep the initial JavaScript bundle and motion restrained enough for instant demo transitions.
- Use a single source of truth for workflow state and typed fixtures.
- Run build/type checks and one automated critical-path smoke test before handoff.

## 11. Data, Privacy, and Trust Boundaries

### Data involved

- Synthetic patient, caregiver, appointment, message, staff, resource, task, permission, and audit-event data.

### Sensitive / regulated data

- None. No real PHI or production credentials are permitted.

### Trust boundaries

- Patient-entered text is untrusted browser input and must render as text, never executable markup.
- Role switching simulates perspectives and must not be described as production authorization.
- Caregiver visibility rules are enforced in application state to demonstrate the intended permission boundary.

### Baseline safety requirements

- No committed or exposed secrets.
- No diagnosis, prescription, treatment modification, autonomous urgent disposition, or clinical outcome claim.
- Clinical concerns route to a named human-controlled pathway with monitoring-boundary language.
- The workflow remains correct if any optional AI representation fails.

### Open questions

- Production identity, authorization, PHI governance, Ochsner integration, and clinical protocol ownership require future Ochsner validation and are not part of the first slice.

## 12. External Systems and Integrations

| System / Provider | Purpose | Status |
|---|---|---|
| Ochsner / MyOchsner / Epic | Future appointment, identity, task, and communication integration | Proposed only; simulated in product |
| FHIR R4 / mCODE | Future standards-shaped data boundary | Proposed; no live connection |
| SMS / voice provider | Future low-bandwidth delivery | Simulated |
| Transportation/resource provider | Future fulfillment and capacity | Synthetic catalog |
| Language model | Optional nonclinical extraction or staff summary | Deferred; not required for safety or demo |

## 13. Architecture Shape

```text
React + TypeScript browser application
   ↓
Typed synthetic fixtures + deterministic workflow reducer
   ↓
Derived readiness graph, exception queue, permissioned views, and audit timeline
   ↓
Local browser persistence and one-click reset
```

### Deliberately avoided complexity

- Next.js server features, backend API, Supabase/PostgreSQL, authentication, queues, containers, cloud deployment dependencies, and live vendor integrations.

## 14. Delivery Strategy

| Order | Task ID | Vertical slice | User-visible outcome | Depends on |
|---:|---|---|---|---|
| 1 | CORE-001 | Treatment readiness golden path | Maria's two barriers become owned actions and a confirmed treatment plan | — |
| 2 | RESILIENCE-001 | Failure and low-connectivity proof | The workflow survives unavailable resources, missed acknowledgment, and optional AI failure | CORE-001 |
| 3 | FINALS-001 | Multi-case operational proof | Staff compare exception prioritization and closure metrics across synthetic cases | CORE-001 |

### Recommended first slice

**CORE-001 — Treatment Readiness Golden Path**

Reason: it delivers the complete signature patient-to-staff-to-caregiver outcome, proves the state-machine mechanism, and supplies the strongest competition demonstration without external dependencies.

## 15. Stop Condition

The first slice is complete when the hero journey works end to end, every state transition is genuine local behavior, intended surfaces are visually complete and responsive, reset is deterministic, the smoke test and project verification pass, and no dead or misleading surface remains in the journey.

## 16. Success Criteria

- A judge can retell the patient, problem, mechanism, and outcome after one viewing.
- The complete reset-to-closure flow succeeds repeatedly without network services.
- The graph, queue, caregiver view, and timeline remain consistent through every transition.
- Clinical authority, synthetic data, and simulated integration boundaries are truthful and understandable.
- The product feels cohesive and premium on mobile and presentation-laptop viewports.

## 17. Assumptions Register

| ID | Assumption | Why needed | Validation needed |
|---|---|---|---|
| A-001 | Ochsner may have a cross-domain pre-treatment closure gap | Establishes the product opportunity | Validate with an Ochsner workflow owner before expanding beyond the first slice |
| A-002 | A browser-local workflow is sufficient for the draft | Protects delivery speed and reliability | Demonstrate genuine state changes and describe production integration honestly |
| A-003 | One complete case is more persuasive than several shallow cases | Keeps scope centered on the signature experience | Rehearse with uninvolved viewers and confirm they understand the mechanism |

## 18. Recommended Decisions

| ID | Recommendation | Rationale | Human approval needed? |
|---|---|---|---|
| R-001 | Use React, TypeScript, and Vite | Fastest reliable fit for the empty frontend scaffold | Approved |
| R-002 | Use no backend or database for CORE-001 | External persistence adds no value to the judged journey | Approved |
| R-003 | Make the Readiness Graph the signature surface | It communicates novelty, technical depth, and closure in one view | Approved |
| R-004 | Keep AI optional and off the critical path | Deterministic routing is safer and more credible | Approved |

## 19. Open Questions

| ID | Question | Why it matters | Blocks first slice? |
|---|---|---|---|
| Q-001 | Does Ochsner already close this exact appointment-specific cross-domain workflow? | Determines long-term novelty and adoption | No |
| Q-002 | Which treatment cohort, owners, timings, and response boundaries would support a pilot? | Determines future operational configuration | No |
| Q-003 | Which existing staff surface would this replace or augment? | Prevents another inbox | No |

## 20. Project-Level Decisions Already Approved

- The product direction, five-screen hero journey, clickable interaction scope, simulated boundaries, visual opportunity areas, skipped features, frontend stack, and delivery priority were approved on August 23, 2026.
- Prototype-submission logistics are managed by the human and are outside product implementation scope.
