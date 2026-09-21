# ADR-0002 — Integration Modes and Epic Boundary

## Status

Accepted — September 21, 2026

## Context

The finals journey needs real interoperability evidence without allowing vendor availability, expiring OAuth credentials, or unapproved external actions to create fake success or presentation failure.

## Decision

Every external integration has an explicit mode and truthful product state.

- Epic Sandbox is an active, read-only integration for Camila's authorized staff clinical context.
- Epic authorization occurs privately before recording through standalone SMART on FHIR using the Non-PRD configuration. Credentials and tokens remain server-side and expiring access is refreshed only when authorized.
- A complete last-known-good Camila snapshot may be used only as `Snapshot fallback` with its original synchronization time. Partial refreshes never replace a complete snapshot or appear live.
- Epic writeback is not approved. OncoReady owns outreach, barriers, work, transportation, permissions, acknowledgment, metrics, and closure.
- CareLink Partner Dispatch is the active controlled transportation mode.
- SMS, voice, and Uber Health remain `provider_ready` until credentials, allowlists, external calls/callbacks, targeted tests, and security approval exist.
- Controlled replay is distinguishable from verified external-provider activity.
- Camila is the only complete Epic-backed case. Other queue entries remain bounded frontend fixtures and do not trigger Epic requests.

## Alternatives Considered

- Require live Epic and vendor calls for every recorded step: rejected because external availability would control the critical path.
- Present cached or replayed events as live: rejected as misleading.
- Attempt Epic writeback for the finals: rejected because the enabled API surface is read-only and writeback materially expands clinical, customer, and security risk.

## Consequences

### Positive

- Real Epic interoperability is visible without misrepresenting scope.
- The prerecorded journey remains reliable and auditable.
- Future adapters share normalized state semantics.

### Negative

- UI and audit models must carry source/mode/provenance explicitly.
- Presenter preflight must verify authorization, resource inventory, and snapshot age.

### Security Implications

- OAuth state/nonce, issuer, redirect URI, scopes, token expiry, refresh, encryption, redaction, role access, and snapshot publication require targeted tests and dedicated review.
- Epic-derived fields are forbidden from patient, caregiver, and transportation projections unless a future approved contract explicitly changes the boundary.

### Operational Implications

- Preflight chooses `Live`, deliberately accepts labeled `Snapshot fallback`, or stops when neither is safe.
- Production customer installation and embedded EHR launch require separate architecture and customer participation.
