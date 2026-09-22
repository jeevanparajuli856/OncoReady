# EPIC-001 — Captured Epic Sandbox JSON in the staff UI

**Scope revision:** September 21, 2026 two-day demonstration. Supersedes this task's prior full-product launch requirements. Status remains PROPOSED; architecture/implementation/review are not certified by this specification.

## User-visible outcome

The staff record displays actual read-only Epic Sandbox data captured before the presentation, with inspectable source and capture time.

## Required scope

Use authorized existing Sandbox access to retrieve only resources needed for the story. Save reviewed minimum JSON and a provenance/checksum manifest. Render available clinical context and a source drawer from that capture, without live network dependency during playback.

## Deferred

Production access, customer installation, embedded EHR launch, writeback, ongoing synchronization, comprehensive token refresh infrastructure and broad resource coverage.

## Architecture and contract guidance

Frontend mapping plus a small offline capture utility if needed; server-side handling for credentials. Formal contracts only for independently implemented capture/normalization boundaries. Do not create a runtime Epic service solely for this recording.

All frontend work preserves [the approved visual system](../design/DESIGN_SYSTEM.md). Design-required work is a compatibility/extension plan with the existing digest gate. The architect must record actual impacts, execution controls and scope before BUILD_READY; the guidance here is not a completed architecture report.

## Verification and risk

TARGETED; STANDARD risk with dedicated security review for the credential/capture/publication boundary. Check actual capture contents, source mapping, missing fields and token exclusion; do not simulate external access as successful capture.

## Dependencies

- ACCESS-001

## Acceptance criteria

1. Using authorized Epic Sandbox access, retrieve the selected real test resources read-only and save reviewed JSON plus resource types/IDs, actual capture time, source environment and checksum manifest. A synthetic fixture cannot satisfy this criterion; inspect capture evidence.
2. Opening Camila's staff context renders only fields present in the saved resources. Missing appointment, lab or medication information stays absent; test representative missing fields.
3. If the captured record does not establish Camila's name, preserve original source identity and document Camila as the presentation alias in evidence. Never fabricate a Sandbox patient or rewrite source dates; compare JSON with UI.
4. The source drawer identifies captured Epic Sandbox data and its original capture time. A local reload cannot claim a fresh synchronization or change the capture timestamp; verify offline playback.
5. Generated scenario appointments and workflow events remain separate from Epic clinical facts; no OncoReady action writes to Epic. Inspect mapping and capture request methods.
6. Captured assets contain no credentials, tokens, unexpected sensitive records or content not permitted for distribution. Browser bundles are allowed only for reviewed publishable test data; verify asset review and scoped security evidence.
7. The UI works with the reviewed local capture when Epic is offline; malformed/missing capture produces a truthful unavailable state. No synthetic replacement is labeled as Epic; verify both paths.
8. Only the staff presentation shows clinical context; caregiver and transportation displays contain permitted logistics. UI filtering is not claimed as protection for publicly bundled assets; inspect role views and evidence wording.

See [the two-day sprint](../LAUNCH_SPRINT_PLAN.md), [scenario settings](../LAUNCH_SCENARIO_SETTINGS.md) and [demo runbook](../operations/DEMO_RUNBOOK.md). Future product work is listed in [the roadmap](../LAUNCH_ROADMAP.md); it is not an additional release gate.
