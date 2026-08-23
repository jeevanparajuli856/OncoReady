# CORE-001 — Treatment Readiness Golden Path

## User-visible outcome

Maria can report a cancelled ride and a clinical concern before tomorrow's infusion, see each issue routed to the appropriate human-owned workflow, and receive a visibly confirmed treatment plan after staff actions and her acknowledgment. Ana, Maria's authorized caregiver, can see the transportation update without seeing the clinical concern.

All people, appointments, messages, resources, staff actions, integrations, and outcomes in this slice are synthetic or simulated.

## Product/demo impact

This slice delivers OncoReady's complete signature journey in one browser: a single readiness submission becomes two accountable tasks, a Treatment Readiness Graph shows the treatment's unresolved dependencies, and the shared state reaches auditable closure. It demonstrates real routing and workflow transitions without claiming production clinical decision-making or external-system integration.

The demo-critical flow is:

```text
reset
  → treatment home
  → readiness check with transportation failure and clinical concern
  → deterministic split into clinical and navigation tasks
  → staff exception queue and Maria case
  → clinical acknowledgment and simulated transportation confirmation
  → Ana's permission-limited transportation update
  → Maria acknowledges the plan
  → readiness graph and timeline show plan confirmed
```

## In scope

- Five connected responsive capabilities: patient treatment home, readiness check, staff exception queue, Maria case with Treatment Readiness Graph, and patient/caregiver resolution views.
- A typed synthetic Maria/Ana case, upcoming infusion, staff roles, transport resource, caregiver permission, tasks, and audit events.
- A single browser-side workflow state machine or reducer with guarded transitions and shared derived views.
- Readiness validation and deterministic creation of exactly one clinical-review task and one transportation-navigation task from the golden-path submission.
- Preservation and display of Maria's clinical text verbatim as text, routed to named human review without automated urgency or treatment decisions.
- Staff actions to acknowledge the clinical task and confirm a simulated transport action.
- A patient-authorized caregiver projection that exposes transportation status but excludes clinical details.
- Maria's acknowledgment as required closure evidence before the overall treatment plan becomes confirmed.
- An append-only visible event timeline derived from the workflow events.
- Local browser persistence or safe deterministic reinitialization, plus a one-click reset available from every main surface.
- Explicit synthetic/simulated disclosures, input validation, disabled/action-success states, keyboard operation, non-color state cues, and equivalent reduced-motion feedback.
- Static contextual queue cases and static future-integration explanation when they improve product storytelling without adding live behavior.

## Out of scope

- Backend, database, server APIs, authentication, production authorization, durable audit storage, or deployment infrastructure beyond a static frontend build.
- Real patient data, PHI, credentials, Ochsner/MyOchsner/Epic/FHIR connectivity, SMS/voice delivery, transportation booking, maps, resource capacity, or clinical protocols.
- Live AI, autonomous clinical triage, diagnosis, prognosis, treatment recommendation/modification, emergency disposition, or outcome prediction.
- Storm Mode, bilingual clinical content, low-connectivity synchronization, multiple complete patient journeys, broad analytics, settings, and administration.
- Marketing pages and controls or navigation that do not participate in the intended journey.

## Architecture impact

- **Database:** none. Synthetic fixtures and browser persistence are sufficient.
- **Backend:** none. All CORE-001 behavior is local and no server interface is implied.
- **Frontend:** new React + TypeScript + Vite application and complete visible workflow.
- **Frontend design:** required. This establishes OncoReady's first design system and signature graph/workflow experience; Gemini owns the exact visual and interaction design within the stated product, safety, accessibility, and performance constraints.
- **Infrastructure:** none. The required artifact is a locally reliable static frontend build.
- **State/data flow:** one typed source of truth owns fixtures, permissions, workflow events, and valid task transitions; the queue, graph, timeline, patient view, and caregiver view are projections of that state rather than independently scripted screens.
- **Task lifecycle:** `detected → assigned → acknowledged → actioned → confirmed → resolved`; transitions that do not apply to a task type may be collapsed internally, but the UI must not permit invalid or out-of-order closure.

## Trust boundaries and safety constraints

- Patient-entered clinical text is untrusted browser input and must render as inert text, never executable markup.
- Role switching is a synthetic perspective selector, not production authentication or authorization, and must not be represented otherwise.
- Ana's caregiver projection must be derived through an explicit permission filter and must not receive the clinical concern, clinical-task detail, or unrelated patient information.
- The original clinical concern must remain unchanged and route to human review. No model or client-side heuristic may diagnose, downgrade urgency, change treatment, or determine emergency disposition.
- Synthetic people, resources, communications, staff actions, integrations, and outcomes must remain distinguishable from real production behavior wherever ambiguity could arise.
- No secrets or real sensitive data may be committed, displayed, or persisted.

## Failure and recovery states

- Missing readiness answers or an empty required clinical concern block submission and identify the field that needs attention.
- Invalid or out-of-order task actions are unavailable; repeat activation cannot create duplicate tasks or duplicate resolution events.
- Before required closure evidence exists, the treatment remains at risk or in progress and cannot be shown as confirmed.
- Refresh restores the current journey from versioned local state when practical; malformed or incompatible local state falls back safely to the deterministic opening fixture.
- Reset clears journey progress and returns all views to the same known opening state.
- Reduced-motion mode conveys the same split, ownership, and resolution state changes without relying on animation.
- Optional AI or external-integration representations, if shown at all, are non-blocking and cannot affect routing or completion.

## Contract impact

None. CORE-001 has one frontend implementation and no live external or independently implemented component boundary. Internal TypeScript types are implementation details, and the repository's empty OpenAPI placeholder must not be treated as a CORE-001 interface.

## Test depth

**SMOKE.** Implementation-owned build, typecheck/lint as configured, and a critical-path smoke check are sufficient. The smoke check must prove the deterministic journey can progress from reset through two-task creation to plan confirmation, including the caregiver privacy assertion. No independent tester is required.

## Security risk

**LOW.** The slice has only synthetic, non-sensitive data; no authentication, server, upload, secret, production access, or consequential external action. Baseline controls still apply to untrusted text rendering, truthful simulation, clinical non-decision boundaries, and caregiver data minimization. No dedicated security review is required.

## Dependencies

- Approved product definition in `docs/PROJECT.md` and system constraints in `docs/architecture/SYSTEM.md`.
- React + TypeScript + Vite as configured in `.ai/project.json`.
- Gemini Phase A design report and exact design-digest approval before production frontend implementation because `frontend_design_required=true`.
- Frontend implementation must remain self-contained after package installation and must not require network services during the primary demo.
- No API contract, backend, database, infrastructure, tester, or security specialist dependency is introduced by this slice.

## Acceptance criteria

1. From a deterministic reset state, a user can open Maria's upcoming infusion and complete the readiness check with transportation unconfirmed and a clinical concern.
2. Submission validation prevents incomplete required input and provides field-associated, keyboard-accessible correction guidance.
3. One successful submission creates exactly two distinct owned tasks: a clinical-review task for a nurse/triage role and a transportation task for a navigator role.
4. Maria's clinical concern is preserved verbatim, displayed as inert text, and never presented as AI-triaged, diagnosed, or clinically dispositioned by OncoReady.
5. The staff exception queue identifies Maria's at-risk treatment, both blockers, their owners or next owners, and the action timing; any other cases are visibly synthetic context and need not be interactive.
6. The Maria case and Treatment Readiness Graph show the upcoming treatment plus both blockers, task ownership, due information, current state, next action, and closure evidence. Equivalent text/state cues exist when motion is reduced.
7. A staff user can acknowledge the clinical-review task and confirm a simulated transportation action; invalid, duplicate, or out-of-order actions cannot advance the workflow.
8. Ana's authorized caregiver view shows only the transportation status/update and contains no clinical concern text or clinical-task detail.
9. Maria can acknowledge the confirmed plan only after the required staff actions. That acknowledgment supplies closure evidence, resolves the required dependencies, and changes the overall treatment state to plan confirmed.
10. The queue, graph, timeline, patient view, and caregiver view remain consistent because they derive from the same workflow state and event history.
11. The visible timeline records the causal sequence of detection, assignment, acknowledgment/action, confirmation, patient acknowledgment, and resolution with synthetic ownership and timestamps.
12. Refresh restores compatible local progress or safely returns to the opening fixture; one-click reset from every main surface always restores the complete deterministic opening state.
13. Intended patient and caregiver surfaces are usable at mobile width, staff surfaces are usable at presentation-laptop width, and the golden path supports keyboard navigation, visible focus, semantic controls, non-color state meaning, and reduced motion.
14. User-facing surfaces contain no dead primary controls, starter branding, lorem ipsum, real PHI, exposed secrets, or unsupported claims of production integration, compliance, clinical validation, or measured outcomes.
15. The frontend runs without a live network dependency after installation, `npm run build` passes, and the configured `npm run test:smoke` verifies reset-to-confirmed completion plus caregiver clinical-data exclusion.
