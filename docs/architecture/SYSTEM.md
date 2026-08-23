# OncoReady System Architecture

## System summary

OncoReady is a frontend-first treatment-readiness product that demonstrates how one patient report becomes separate clinical and practical work, gains accountable ownership, and reaches visible closure around an upcoming cancer treatment.

CORE-001 uses a single React application with typed synthetic data and a deterministic workflow reducer. Patient, navigator, nurse, and caregiver perspectives all derive from the same in-browser event state. No backend, database, authentication, PHI, live AI, messaging, resource, or Ochsner integration is required.

## Architecture principles

- Optimize for the complete reset-to-closure journey and presentation reliability.
- Make core workflow behavior real even when people, data, delivery, and integrations are synthetic.
- Keep deterministic rules authoritative; optional AI cannot control clinical routing or task state.
- Derive every view from one typed source of truth to prevent demo inconsistency.
- Add infrastructure only when a later product slice needs it.

## Components

### Frontend

**Framework:** React + TypeScript + Vite

Responsibilities:

- patient treatment home and readiness check;
- staff exception queue and case workspace;
- Treatment Readiness Graph and audit timeline;
- navigator and simulated nurse actions;
- patient-authorized caregiver status;
- typed workflow transitions, validation, browser persistence, and reset;
- responsive, accessible, reduced-motion-aware presentation;
- explicit synthetic-data and simulated-integration disclosures.

### Backend / service layer

**Framework:** Not required for CORE-001.

Future responsibilities, only if enabled by a later slice, would include server-enforced identity/authorization, production workflow validation, integration orchestration, and durable persistence.

### Database

**Technology:** Not required for CORE-001.

Typed fixtures plus local browser persistence are sufficient for one deterministic synthetic journey. Durable multi-user task history would justify a database later.

### Infrastructure

**Technology:** Static frontend build and local preview only.

The primary demonstration must not depend on cloud services or live vendor availability.

## Domain model

```text
SyntheticPatient
  ├─ UpcomingTreatment
  ├─ CaregiverPermission
  └─ ReadinessSubmission
       ├─ ClinicalConcern → ClinicalTask
       └─ PracticalBarrier → NavigationTask → ResourceAction

WorkflowEvent[] → Queue + ReadinessGraph + Timeline + Patient/Caregiver status
```

The task lifecycle is explicit:

```text
detected → assigned → acknowledged → actioned → confirmed → resolved
                                          └─→ escalated
```

Invalid transitions must be rejected or unavailable in the interface.

## Primary data flow

```text
Maria opens upcoming infusion
  ↓
Readiness form validates transportation and clinical-concern input
  ↓
Deterministic routing creates separate clinical and navigation tasks
  ↓
Shared event state derives queue, graph, ownership, deadlines, and timeline
  ↓
Staff acknowledge clinical review and confirm simulated transportation
  ↓
Permission filter derives Ana's transportation-only status
  ↓
Maria confirms receipt and the treatment plan resolves
```

## Interfaces

CORE-001 has no cross-component API contract. Internal TypeScript types are implementation details owned by the frontend task.

Future adapters may map the domain to FHIR R4 resources such as Patient, RelatedPerson, Consent, Appointment, QuestionnaireResponse, Task, Communication, PractitionerRole, and Provenance. The first slice must not imply a live FHIR or Ochsner connection.

## Trust boundaries

- **Patient input → browser rendering:** free text is untrusted and renders as text only.
- **Simulated role perspectives:** role switching demonstrates views, not production authentication or authorization.
- **Patient → caregiver disclosure:** the local permission filter must prevent clinical details from entering Ana's view.
- **Clinical concern → workflow:** deterministic rules preserve the original words and route to human review; no AI controls urgency or treatment.
- **Synthetic → real-world interpretation:** persistent labeling prevents fictional people, outcomes, resources, and integrations from being mistaken for production behavior.

## Reliability-critical path

```text
reset
 → treatment home
 → readiness submission
 → two created tasks
 → readiness graph with two blockers
 → clinical acknowledgment
 → transportation confirmation
 → permissioned caregiver update
 → patient confirmation
 → resolved graph and timeline
```

Reliability controls:

- deterministic fixtures and timestamps;
- no live service dependencies;
- one-click reset from every main surface;
- valid transition guards and disabled states;
- local persistence or safe reinitialization on refresh;
- critical-path automated smoke coverage;
- reduced-motion path with equivalent state feedback.

## Security architecture

Security risk is low because the slice uses public/synthetic data, no authentication, no backend, no production access, and no consequential external action.

Baseline controls:

- no secrets or real PHI;
- no raw HTML rendering of patient text;
- no clinical diagnosis, treatment decision, or autonomous urgent disposition;
- no unsupported compliance, validation, integration, or outcome claims;
- caregiver data minimization is visible and enforced in the local view model;
- third-party packages are limited to justified frontend dependencies.

## Accessibility and performance constraints

- Semantic document structure and controls, full keyboard operation, visible focus, large targets, sufficient contrast, icons plus text, and no color-only meaning.
- Motion supports comprehension and honors `prefers-reduced-motion`.
- Mobile patient surfaces and presentation-laptop staff surfaces must remain usable.
- Avoid interaction-blocking animation and visible layout shift.

## Observability

The append-only in-app event timeline is product behavior and development evidence. External logs, traces, analytics, and monitoring are not justified for CORE-001.

## Deferred production architecture

Authentication, authorization, backend validation, durable audit storage, FHIR/SMART integration, messaging delivery, resource-capacity data, Ochsner clinical protocols, and privacy/security governance require separately approved future architecture. They must not be inferred from this frontend slice.
