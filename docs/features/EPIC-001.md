# EPIC-001 — Read-only Epic Sandbox clinical context

## User-visible outcome

An authorized nurse or oncology navigator opens Camila's case and sees only the relevant clinical context actually returned by enabled Epic Sandbox APIs, with truthful live, snapshot-fallback, or unavailable provenance.

## Product/demo impact

This slice supplies the launch's real clinical-context proof while preserving the product boundary: Epic knows the treatment context; OncoReady owns readiness, outreach, transportation, acknowledgment, and closure.

## In scope

- Private presenter-only standalone SMART on FHIR authorization and callback handling.
- Read-only Patient, Appointment, Encounter, Condition, Observation, MedicationRequest, CarePlan, RequestGroup, Location, Practitioner, DiagnosticReport, and approved Procedure reads/searches.
- Authorized Camila resource inventory, typed normalization, per-item provenance, atomic snapshot publication, refresh, and labeled last-known-good fallback.
- Compact staff-only clinical-context UI and technical source evidence needed by later work.
- Explicit isolation from patient, caregiver, transportation, public, search, export, logs, and non-Camila fixtures.

## Out of scope

- Epic writeback, embedded EHR launch, production Epic/customer connectivity, arbitrary patient browsing, or a general-purpose EHR viewer.
- Clinical interpretation, diagnosis, urgency assessment, clearance, or treatment recommendation.
- OncoReady workflow/outreach/transport state inside Epic.
- Sharing tokens, credentials, raw authorization errors, or private presenter controls with ordinary users.

## Architecture impact

- Adds encrypted server-side Epic authorization state separated from ordinary workspace sessions.
- Adds one bounded read-only adapter and a versioned `ClinicalContextSnapshot` normalization boundary.
- Publishes a complete new snapshot atomically or serves the prior complete snapshot as fallback; partial refreshes never masquerade as live.
- `frontend_design_required=true`; the staff panel extends the locked design without creating a new product-wide visual pattern.

## Contract impact

Required. Define private setup/preflight states, staff clinical-context projection, `Live`/`Snapshot fallback`/`Unavailable` states, source time, normalized facts/provenance, and safe errors. OAuth/token internals are never browser contract fields.

## Test depth

TARGETED. Independent tests cover OAuth transaction validation, token lifecycle/redaction, response validation/pagination, atomic snapshots, fallback, authorization, data minimization, and proof that non-Camila fixtures cause no Epic request.

## Security risk

HIGH with dedicated review. Material concerns are OAuth callback attacks, credential/token exposure, unsafe persistence, overbroad FHIR scope, cross-role data leakage, upstream payload validation, and misleading provenance.

## Dependencies

- `ACCESS-001` secure staff session and center authorization.
- Approved Epic Non-PRD client configuration, exact HTTPS redirect URI, enabled scopes, and private human authorization.

## Acceptance criteria

1. Private preflight authorizes or refreshes the Epic Sandbox connection without committing or exposing credentials, codes, or tokens to Git, chat, browser bundles, normal logs, reports, or ordinary product UI.
2. The recorded journey begins in OncoReady access and reaches an already-connected Camila staff record without displaying Epic authentication.
3. OAuth state, nonce, issuer, redirect URI, transaction binding, granted scope, expiry, refresh rotation, revocation, encryption, and redaction controls pass targeted tests and security review.
4. Camila's staff record displays only facts returned by enabled R4 Read/Search APIs or the versioned last-known-good snapshot and retains resource type/ID, non-secret source identity, retrieval time, and transformation version.
5. A successful refresh atomically replaces the prior snapshot; a partial or failed refresh does not combine new and old fields under a `Live` label.
6. Live failure serves the prior complete snapshot only as `Snapshot fallback — synchronized <time>`; no snapshot produces `Unavailable`.
7. Loading, empty, partial-source, unauthorized, expired-session, rate/error, fallback, and unavailable states are complete and accessible.
8. Patient, caregiver, transportation, public, search, export, log, and accessible-text projections contain no Epic-only clinical fields.
9. Only Camila is Epic-backed; non-Camila fixtures never initiate an Epic call and cannot open as complete cases.
10. No route or adapter performs FHIR create, update, patch, or delete, and the UI makes no Ochsner, Epic endorsement, production access, or writeback claim.
