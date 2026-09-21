# RIDE-001 — CareLink contracted-provider dispatch

## User-visible outcome

A navigator and transportation coordinator turn Camila's risk into an eligibility-aware outbound and return plan, recover from one contracted-provider failure, and keep the blocker open until Camila acknowledges the plan.

## Product/demo impact

This slice supplies the active operational recovery in the final: CareLink coordinates a center's own local provider network while Uber Health remains a truthful provider-ready alternative.

## In scope

- Center-specific providers, service areas, operating windows, minimum data disclosure, funding/eligibility, mobility/escort, arrival, outbound, return, backup, and acknowledgment rules.
- Authorized request, offer, accept/decline, driver/vehicle assignment, arrival, completion, cancellation, failure, recovery, and return-trip events.
- Server-side idempotent CareLink adapter and active finals configuration.
- Data-minimized staff, transportation, patient, and caregiver projections.
- Uber Health provider-ready request concepts and activation requirements without external execution.

## Out of scope

- Real Uber Health quote/request/driver/ETA/completion, production transportation credentials, or arbitrary destinations.
- Automatic treatment cancellation/rescheduling or automatic closure without patient acknowledgment.
- A fleet owned by OncoReady or a claim that a real health system uses OncoReady.

## Architecture impact

- Extends the event/outbox spine with normalized provider commands/events and distinct active/provider-ready modes.
- Enforces server-side authorization, service-area/eligibility policy, idempotency, allowlists, and minimum projections.
- `frontend_design_required=true`; transport surfaces reuse the locked design system and existing map fallback rules.

## Contract impact

Required. Define provider capability/configuration, trip request, offer, assignment, status, failure, return, backup, acknowledgment, callback/audit, and role projection contracts.

## Test depth

TARGETED. Independent tests cover authorization, eligibility/cutoffs, idempotency, all failure/recovery transitions, data minimization, permission revocation, provider modes, and no fabricated vendor state.

## Security risk

HIGH with dedicated review. Material concerns are consequential external actions, location/contact disclosure, role authorization, arbitrary destinations, callback spoofing/replay, and cross-role clinical leakage.

## Dependencies

- `FLOW-001` stable transportation work, events, cutoffs, permissions, and closure rules.
- Delegated synthetic center/provider/service-area, coordinator/driver and funding/eligibility settings from [LAUNCH_SCENARIO_SETTINGS.md](../LAUNCH_SCENARIO_SETTINGS.md), reviewed and frozen in the task contract; no actual vendor contract or external action is implied.

## Acceptance criteria

1. Deterministic checks cover notice cutoff, funding/eligibility, operating and arrival windows, outbound and return plans, mobility/escort needs, service area, and provider availability.
2. Only authorized staff or transportation sessions can dispatch or mutate provider assignments. Patient projections are allowlisted and expose the patient-owned acknowledgment command; caregiver projections remain read-only. Acknowledgment cannot assign a driver or alter a trip.
3. Request creation is idempotent and goes through the server-side normalized adapter.
4. Requested, offered, accepted, driver assigned, patient notified, patient acknowledged, arriving, completed, cancelled, declined, provider unavailable, return pending, and backup required remain distinct events.
5. Cancellation or failure reopens the blocker and permits controlled retry, backup activation, or navigator escalation without losing the original audit trail.
6. When no transportation option is available, the treatment event remains at risk. Patient acknowledgment of the current complete plan is required before transportation work can close; a changed or failed plan invalidates the earlier acknowledgment.
7. The product never autonomously cancels or reschedules treatment.
8. CareLink supports the center's contracted provider rather than requiring an OncoReady-owned fleet.
9. Uber Health can show provider-ready concepts and activation requirements but cannot claim quote, request, driver, ETA, or completion without approved credentials and verified callbacks.
10. Caregiver and transportation visual, accessibility, search, export, API, and log projections exclude clinical concern text and Epic-only clinical fields.
