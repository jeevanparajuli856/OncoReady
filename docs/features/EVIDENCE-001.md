# EVIDENCE-001 — Operational metrics and validated FHIR evidence

## User-visible outcome

Judges and hospital stakeholders can inspect Epic source provenance, event-derived operational metrics, and a validator-gated OncoReady FHIR artifact instead of relying on fixture-only dashboard numbers.

## Product/demo impact

This slice supplies the final technical proof: the journey's graph, timeline, metrics, source evidence, and interoperability artifact agree because they derive from the same persisted events while Epic provenance stays separate.

## In scope

- Event-derived lead-time, ownership/action/closure, unresolved-blocker, outreach, CareLink recovery, acknowledgment, and final-disposition metrics.
- Distinction between controlled replay and verified external-provider evidence.
- Protected Epic source-evidence view with live/fallback mode, synchronization time, mapped resource counts/types, and non-secret references.
- OncoReady-generated FHIR R4 Bundle mapping and Provenance.
- Pinned validator integration, persisted/inspectable report, and UI gating of the `Validated` label.
- Protected metrics/evidence UI using the locked design system.

## Out of scope

- Epic writeback, production Epic access, customer/Ochsner approval, clinical validation, or regulatory compliance claims.
- Analytics unrelated to the Camila continuity journey or invented outcome/ROI figures.
- Metrics sourced from independent frontend fixtures when an underlying workflow event exists.

## Architecture impact

- Adds deterministic metric projections and an evidence-access boundary over persisted events and source metadata.
- Adds FHIR mapping and pinned validation output without changing Epic's read-only boundary.
- `frontend_design_required=true`; evidence surfaces use existing system/graph/timeline primitives.

## Contract impact

Required. Define metric formulas/version, evidence access, Epic source summary, FHIR artifact metadata/download, validator status/report, and replay-versus-verified provenance.

## Test depth

TARGETED. Independent tests cover metric recomputation, event consistency, authorization, mapping fixtures, malformed/invalid bundles, validator failure, provenance separation, and truthful claim language.

## Security risk

HIGH with dedicated review. Material concerns are export authorization, over-disclosure, clinical/Epic data provenance, download handling, validator execution/input bounds, and misleading validation claims.

## Dependencies

- `EPIC-001`, `FLOW-001`, `OUTREACH-001`, and `RIDE-001` integrated event/source contracts.
- Pinned FHIR validator/version and approved evidence visibility before `BUILD_READY`.

## Evidence access and disposition

Epic source details and clinical FHIR evidence belong to authorized center-scoped staff. The recording returns through staff access after patient acknowledgment; do not expand patient/caregiver permissions to shorten that sequence. The evidence contract must define any separately allowlisted nonclinical projections.

`Continuity plan confirmed` is a planning outcome. Keep treatment attendance/disposition `unknown` until an actual authorized outcome event records it; ride assignment, acknowledgment, or a resolved graph cannot imply treatment was kept.

## Acceptance criteria

1. A metric changes only when its underlying persisted event or approved formula version changes.
2. Metrics compute lead time, time to owner/acceptance/first action/closure, unresolved blockers at required checkpoints, outreach response/escalation, CareLink recovery, acknowledgment, and final disposition from the shared event spine.
3. Controlled replay and verified provider events remain distinguishable in audit and technical evidence.
4. The Epic source view shows mode, last successful synchronization, mapped resource types/counts, and non-secret references, clearly separating live resources, fallback snapshot, and OncoReady events.
5. The FHIR R4 Bundle maps Patient, Appointment, QuestionnaireResponse, Task, Communication, RelatedPerson/consent representation, and Provenance as applicable to actual data.
6. A recorded pinned-validator pass is required before the UI shows `Validated`; failure, timeout, stale report, or artifact mismatch suppresses the label.
7. Authorized users can inspect the mapping and validator report without receiving secrets or fields outside their projection.
8. UI copy states validation applies only to the OncoReady-generated artifact and does not imply Epic writeback, production access, Ochsner connection, customer approval, clinical validation, or compliance.
9. The final graph, timeline, workspaces, metrics, and FHIR evidence reconcile to the same event revision while Epic context retains separate provenance.
