# CORE-001 — Treatment Readiness Enterprise Experience

## User-visible outcome

OncoReady presents a credible, connected treatment-readiness product from first contact through operations and patient closure. A visitor can understand and enter the product, staff can navigate an operational workspace and find at-risk treatments, Maria can report a cancelled ride and clinical concern, the two issues route to appropriate human-owned workflows, and Maria and Ana receive privacy-appropriate resolution views.

All people, appointments, messages, resources, organizations, integrations, protocols, staff actions, metrics, and outcomes are synthetic, sandbox, or simulated where shown. The product must not imply that this slice is deployed, certified, clinically validated, compliant, or connected to a live health system.

## Product/demo impact

This slice combines a broad, polished frontend product story with one fully functional signature journey. Judges can move from the public value proposition into a persistent staff workspace, understand how OncoReady fits an oncology operation, and then watch one readiness submission become two accountable tasks and a visibly confirmed plan.

The demo-critical flow remains:

```text
public product entry
  → sandbox sign-in / staff workspace
  → command center or exception queue
  → Maria case and patient readiness check
  → deterministic split into clinical and navigation tasks
  → staff acknowledgment and simulated transportation confirmation
  → permission-filtered caregiver update
  → Maria acknowledges the plan
  → readiness graph, queue, metrics, and timeline reflect closure
```

## Experience surfaces

### Public entry

- **Landing:** explain the treatment-readiness problem, OncoReady's closed-loop mechanism, intended users, and the route into the product without unsupported customer, outcome, deployment, or integration claims.
- **Sign-in:** provide a clickable local sandbox entry into staff, patient, and caregiver perspectives. It is a simulated session/role selector, not authentication; it must not request, store, or imply verification of real credentials.
- **Trust:** explain human clinical authority, caregiver data minimization, synthetic/sandbox data, simulated integrations, workflow traceability, and the limits of the current implementation. Do not display compliance or certification badges that have not been earned.

### Persistent staff workspace

The staff experience has a persistent shell whose primary navigation reaches each named destination and preserves coherent role/session and workflow state:

- **Command Center:** at-risk treatment summary, readiness/exception workload, upcoming treatments, ownership/activity signals, and a clear route to Maria's case. Headline Maria state should derive from the shared workflow; broader metrics may be synthetic fixtures.
- **Exceptions:** searchable/filterable exception queue showing treatment proximity, blocker category, owner, state, due information, and next action. Maria is fully interactive; secondary cases may be static synthetic context.
- **Patients:** searchable/filterable patient directory and case entry. Maria's case is the fully interactive workspace; secondary profiles may be static.
- **Case workspace:** treatment anchor, Treatment Readiness Graph, blocker/task details, owner/action controls, caregiver permission context, and append-only event timeline.
- **Resources:** credible synthetic transportation and supportive-service catalog. Maria's selected transportation action participates in the golden path; the broader directory and availability may be static/mock with explicit synthetic or simulated status.
- **Insights:** complete synthetic operational summaries and trends that help explain readiness, ownership, aging, and closure. They may be fixture-driven and need not be recalculated beyond Maria's demo-relevant headline state.
- **Integrations:** truthful sandbox/proposed connection catalog and future data-boundary explanation. No card may claim a live, authorized, healthy, or certified integration.
- **Admin:** complete read-only or local-only views of routing, roles, sites, channels, and readiness configuration. These screens may be mock/static and must not imply server-enforced policy or production governance.

### Patient and caregiver portals

- **Patient:** focused treatment home, readiness check, responsibility/status view, plan acknowledgment, and relevant event history for synthetic Maria.
- **Caregiver:** focused transportation-only status for Ana, derived from Maria's explicit permission projection. Clinical concern text, clinical-task detail, and unrelated patient information must not enter the caregiver view, its accessible content, or any caregiver-specific search/index fixture.

## Functional scope and fidelity

### Must work from real local application state

- Public calls to action, trust navigation, sandbox sign-in/role entry, persistent shell navigation, and return paths.
- Staff primary navigation to Command Center, Exceptions, Patients, Resources, Insights, Integrations, and Admin.
- Staff global/patient search and exception/patient filters, including useful no-result and clear-filter behavior.
- Patient readiness validation and deterministic creation of exactly one clinical-review task and one transportation-navigation task.
- Preservation of Maria's clinical text verbatim as inert text and routing to a named human-controlled review pathway.
- Maria's case, graph, queue row/card, command-center headline, patient status, caregiver status, and timeline updating consistently from one workflow state.
- Staff acknowledgment of the clinical task and confirmation of a simulated transportation action.
- Permission-filtered caregiver projection and Maria's final acknowledgment/closure.
- Guarded transitions, duplicate-action prevention, browser recovery, and one-click reset.

### May be static or mock

- Secondary patient cases, exception histories, resources, sites, users, teams, messages, and organizational configuration.
- Most enterprise metrics, charts, historical trends, integration statuses, routing-rule catalogs, audit summaries, and admin controls.
- Public product evidence/trust explanation and future standards mapping.
- Simulated identity, messaging, clinical protocol, transport/resource fulfillment, and integration delivery.

Static/mock surfaces must still look complete, use coherent synthetic data, support their primary navigation, and avoid controls that appear consequential but do nothing. Where a static control would mislead, render it read-only, disabled with a reason, or omit it.

## Data and state architecture

- Use one React + TypeScript + Vite browser application.
- Use typed synthetic fixtures for the enterprise dataset: patients, appointments, blockers, tasks, staff/roles, resources, sites, metrics, integration records, routing/configuration summaries, permissions, and audit events.
- A deterministic reducer or equivalent state machine owns Maria's readiness workflow, permissions, versioned local persistence, and reset.
- Queue, patient/case, graph, timeline, command-center Maria signals, patient portal, and caregiver portal are projections of the same state, not independently scripted screen sequences.
- Secondary enterprise surfaces may read stable fixtures and local UI state such as routes, filters, search terms, expansion, and selected records.
- Task lifecycle is explicit: `detected → assigned → acknowledged → actioned → confirmed → resolved`; task-type-specific steps may be collapsed internally, but invalid and out-of-order closure must remain unavailable.
- No backend, database, network service, production identity provider, or external API is required.

## Trust boundaries and safety constraints

- Patient-entered and search text is untrusted browser input and renders as inert text, never executable markup.
- Public, staff, patient, and caregiver routes are presentation boundaries only. Sandbox sign-in and role switching do not provide production authentication or authorization and must not be represented otherwise.
- Ana's caregiver data is created through an explicit allowlist projection; filtering only at final visual render is insufficient if clinical details remain in caregiver-specific view data or accessibility content.
- Maria's original clinical concern remains unchanged and routes to human review. No model or client heuristic may diagnose, downgrade urgency, change treatment, clear treatment medically, or determine emergency disposition.
- Synthetic/sandbox labeling must be present where material, especially people, patient records, operational metrics, resources, integrations, clinical protocols, and outcomes. Repetition should be clear without obscuring normal product use.
- Integration and Admin screens describe proposed or sandbox capabilities only; they cannot imply server enforcement, real data exchange, current vendor status, certification, security assurance, or compliance.
- No secrets, real credentials, real PHI, or other sensitive data may be committed, accepted, displayed, logged, or persisted.

## Failure and recovery states

- Invalid sandbox entry explains the required local selection without implying real credential validation.
- Missing readiness answers or an empty required clinical concern block submission and identify the field needing attention.
- Search and filters provide meaningful no-result and clear/recovery states without breaking navigation.
- Invalid or out-of-order task actions are unavailable; repeat activation cannot create duplicate tasks or events.
- Before required closure evidence exists, the treatment remains at risk or in progress and cannot be shown as confirmed.
- Missing synthetic detail in secondary enterprise records has a designed unavailable/unknown state rather than fabricated certainty.
- Refresh restores compatible, versioned local workflow and navigation state when practical; malformed or incompatible state safely falls back to deterministic fixtures.
- Reset clears golden-path progress, relevant filters/search/session state, and returns all derived surfaces to one known opening state.
- Reduced-motion mode preserves the meaning of routing, ownership, navigation, and resolution without depending on animation.
- Optional AI or external-integration representations remain non-blocking and cannot affect routing, permissions, or completion.

## Out of scope

- Backend, database, server APIs, real authentication/authorization, durable multi-user audit storage, or infrastructure beyond a local/static frontend build.
- Real patient data, credentials, Ochsner/MyOchsner/Epic/FHIR connectivity, production SMS/voice, maps, transportation booking/capacity, payment, billing, or clinical protocols.
- Live AI, autonomous clinical triage, diagnosis, prognosis, treatment recommendation/modification, emergency disposition, or clinical outcome prediction.
- Making every synthetic patient, enterprise metric, resource, integration, or administrative setting interactive or dynamically recomputed.
- Production-grade RBAC, SSO, SCIM, audit export, tenant/site administration, integration setup, resource management, analytics pipelines, notification delivery, or operational monitoring.
- Storm Mode, bilingual clinical content, low-connectivity synchronization, multiple complete patient journeys, or broad backend hardening.

## Architecture impact

- **Database:** none. Typed fixtures and local persistence are sufficient.
- **Backend:** none. All behavior is browser-local and no server interface is implied.
- **Frontend:** new public entry, persistent staff shell, seven staff modules, patient portal, caregiver portal, and the complete Maria workflow.
- **Frontend design:** required. The expanded visible experience establishes and applies the product design system across public, staff, patient, and caregiver contexts; Gemini retains exact visual and interaction authority within the functional, truthfulness, accessibility, and performance constraints.
- **Infrastructure:** none. A locally reliable static frontend build is the only required runtime artifact.

## Contract impact

None. CORE-001 remains one frontend implementation with no live external or independently implemented component boundary. Internal TypeScript types and fixture schemas are implementation details. The repository's empty OpenAPI placeholder is not a CORE-001 interface.

## Test depth

**SMOKE.** Implementation-owned build/type checks and a critical-path smoke check remain proportionate because the product is frontend-only, synthetic, and has no consequential external action. The smoke check must cover public entry, sandbox workspace entry, key route reachability, working search/filter recovery, the complete deterministic Maria journey, caregiver clinical-data exclusion, and reset. No independent tester is required.

## Security risk

**LOW.** The slice has synthetic, non-sensitive data; no real authentication, backend, upload, secret, production access, or external action. Baseline controls apply to inert input rendering, truthful sandbox/session representation, clinical non-decision boundaries, caregiver data minimization, and avoidance of unsupported security/compliance claims. No dedicated security review is required.

## Dependencies

- Approved product definition in `docs/PROJECT.md` and system constraints in `docs/architecture/SYSTEM.md`.
- React + TypeScript + Vite as configured in `.ai/project.json`.
- Expanded Gemini design evidence and compatibility approval bound to this expanded public/staff/patient/caregiver scope before Phase B implementation proceeds.
- Frontend implementation must run after package installation without network services during the primary demonstration.
- No API contract, backend, database, infrastructure, independent tester, or security specialist is introduced.

## Acceptance criteria

1. A visitor can navigate the public landing, sign-in, and trust surfaces; product copy accurately describes OncoReady without unsupported deployment, customer, outcome, certification, compliance, or live-integration claims.
2. Sandbox sign-in or role entry is clickable, does not accept/store real credentials, clearly represents local synthetic access, and can enter the staff, patient, and caregiver perspectives.
3. The staff workspace uses a persistent shell whose primary navigation reaches Command Center, Exceptions, Patients, Resources, Insights, Integrations, and Admin, with selected destination and return paths remaining understandable at supported sizes.
4. Every named staff module has complete, credible synthetic content. Secondary records and enterprise modules may be static/mock, but they are labeled where material and contain no misleading live, editable, certified, or connected state.
5. Staff search and relevant exception/patient filters work against the synthetic dataset, combine predictably, expose useful no-result states, and can be cleared without reset.
6. From deterministic reset, Maria's patient home shows the upcoming synthetic infusion and a clear readiness action; completing required input with transportation unconfirmed and a clinical concern creates exactly one navigation task and one clinical-review task.
7. Maria's clinical concern is preserved verbatim, displayed as inert text, routed through deterministic logic to named human review, and never presented as AI diagnosis, triage, treatment advice, or medical clearance.
8. The Command Center, Exceptions, Patients/Maria case, Treatment Readiness Graph, and timeline show a consistent treatment risk, blocker reason, owner, due information, current state, next action, and relevant activity derived from shared state.
9. A staff user can acknowledge the clinical-review task and confirm a simulated transportation action; invalid, duplicate, and out-of-order actions cannot advance the workflow.
10. The Resources module supplies the synthetic transport action used in Maria's flow. Broader catalog availability and fulfillment are explicitly synthetic/simulated and are not represented as a live booking network.
11. Ana's caregiver portal receives only Maria-authorized transportation status and contains no clinical concern, clinical-task details, unrelated patient data, or clinical content in visible or accessibility-specific output.
12. Maria can acknowledge the plan only after the required staff actions. Her acknowledgment provides closure evidence, gives both blockers defined dispositions, changes the treatment to plan confirmed, and appends the causal events exactly once.
13. Insights may use stable synthetic history, but any Maria/current-case headline shown there or in Command Center does not contradict the shared workflow state. Integrations and Admin remain sandbox/proposed or local/read-only and make no server-enforcement claims.
14. Refresh restores compatible local progress or safely reinitializes; one-click reset from every principal product context restores workflow, permissions, search/filters, and role/session entry to a deterministic opening state.
15. Public, staff, patient, and caregiver surfaces are complete at mobile and presentation-laptop sizes as applicable, keyboard operable, visibly focused, semantic, non-color-dependent, and equivalent under reduced motion.
16. User-facing surfaces contain no dead primary navigation, starter branding, lorem ipsum, real PHI, exposed secrets, real credential collection, or unsupported claims of compliance, certification, production scale, clinical validation, measured outcomes, or live Ochsner/vendor integration.
17. The frontend works without live network services after installation, `npm run build` passes, and `npm run test:smoke` verifies public/workspace entry, primary route reachability, search/filter recovery, reset-to-confirmed Maria completion, and caregiver clinical-data exclusion.
