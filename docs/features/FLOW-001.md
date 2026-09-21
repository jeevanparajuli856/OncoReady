# FLOW-001 — Durable early-warning and owned work

## User-visible outcome

Camila is surfaced before the transportation cutoff, and her exact reply creates separately owned clinical-contact and transportation work with deadlines, acknowledgments, actions, and closure evidence.

## Product/demo impact

This is the core operational slice. It replaces frontend-scripted state changes with durable, auditable events and keeps patient, caregiver, staff, transportation, graph, timeline, and metric projections consistent.

## In scope

- Treatment event, deterministic scenario clock, business-day cutoffs, T−7/T−2/T−1 snapshots, barriers, and immutable patient verbatim text.
- Append-only events, outbox, correlation/idempotency, current projections, optimistic concurrency, owners, SLAs, escalation, and audit evidence.
- Distinct clinical-contact and transportation threads with separate permissions, deadlines, transitions, projections, and closure rules.
- Appointment-change recomputation, permission revocation, stale-source/scheduler states, and deterministic reset/reseed.
- API commands/projections integrated into the existing role workspaces, Treatment Readiness Graph, and timeline.
- Stable feature snapshot contract required by `ML-001`.

## Out of scope

- Autonomous clinical interpretation/advice, treatment cancellation/rescheduling, or model-controlled clinical routing.
- Live SMS/voice vendor calls, CareLink dispatch details, model training, final metrics, or FHIR export owned by later tasks.
- Multiple fully functional patient cases.

## Architecture impact

- Adds the append-only workflow event spine, transition policy, current-state projections, and outbox/idempotency records.
- Keeps bounded T−7/T−2/T−1 scheduling in the API service; no queue service is added.
- Uses server-built allowlisted role projections; the browser cannot select fields or authorize commands.
- `frontend_design_required=true`; frontend work adapts existing workspace primitives without global design changes.

## Contract impact

Required. Define command envelopes, transition errors, event metadata, role-specific projections, graph/timeline views, clock/reset operations, caregiver permission, and the versioned ML feature snapshot.

## Test depth

TARGETED. Independent integration tests cover valid/invalid transitions, idempotency, ordering/concurrency, business-day deadlines, appointment changes, stale data, role projections, exact-text preservation, and deterministic replay.

## Security risk

STANDARD with dedicated review. Material concerns are authorization of mutations, cross-role projection leakage, stored patient text, audit/redaction, replay/reset access, and consequential outbox actions.

## Dependencies

- `EPIC-001` clinical-context/provenance boundary and `ACCESS-001` authorized sessions.
- Human-confirmed owner/SLA matrix, finals treatment clock, business-day calendar, and transportation cutoff before `BUILD_READY`.

## Acceptance criteria

1. Every readiness signal records what was known, when it was known, its source, and the scenario/model version that used it.
2. Transportation notice cutoff uses the approved business-day calendar and recomputes when the appointment changes.
3. Explicit symptom or transportation text bypasses model priority and routes immediately without clinical interpretation.
4. Camila's exact reply remains immutable and creates separate clinical-contact and transportation work with different owners, deadlines, projections, acknowledgments, and closure rules.
5. Invalid or out-of-order commands are rejected without partial mutation; duplicate commands/events return the same effective result.
6. SLA miss escalates; appointment change reopens or recomputes affected work; caregiver permission revocation removes future caregiver access without rewriting history.
7. Patient, caregiver, staff, transportation, graph, timeline, and preliminary metrics remain consistent because they derive from the same committed events.
8. Stale scheduler, source, or projection state is visible and never appears as reassurance or confirmed readiness.
9. Reset/reseed restores the exact finals workflow state without deleting valid Epic authorization or the last-known-good Camila snapshot.
10. The current visual hierarchy, accessibility, responsiveness, and reduced-motion behavior remain within the locked baseline while the critical journey moves from local state to API-backed state.
