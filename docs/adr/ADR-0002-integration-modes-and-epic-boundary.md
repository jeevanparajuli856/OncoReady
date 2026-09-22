# ADR-0002 — Integration Modes and Epic Boundary

> Current scope: Partially superseded by [ADR-0004](./ADR-0004-two-day-demo-scope.md): use actual captured Epic Sandbox JSON, offline synthetic-model outputs and manually triggered one-off real SMS/call. Live Epic lifecycle, learned scheduling and automatic delivery are deferred. The historical decision below retains context; truthful provenance and read-only/no-writeback boundaries still apply.

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
- SMS/voice now target bounded `live_test` delivery using the purchased Twilio/ElevenLabs accounts and a verified test contact. They remain inactive until configuration, allowlists, tests and dedicated security review pass. Uber Health remains `provider_ready`.
- Controlled replay is distinguishable from verified external-provider activity.
- Camila is the only complete Epic-backed case. Other queue entries remain bounded frontend fixtures and do not trigger Epic requests.

## September 21 learned-outreach clarification

The human subsequently requested learned channel/time selection and automatic execution for the demo. Readiness and engagement models select within allowed actions; the scheduler executes the choice through the configured adapter. This supersedes deterministic channel selection elsewhere, but does not turn replay into verified vendor delivery. The human subsequently selected real SMS/call delivery and confirmed both accounts purchased. OUTREACH-001 owns that bounded activation; real provider outcomes are required, while replay remains a disclosed fallback. See the test-delivery runbook for wall-clock dispatch, reset-safe limits and live acceptance. Uber Health activation remains deferred.

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
