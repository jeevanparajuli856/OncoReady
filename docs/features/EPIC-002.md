# EPIC-002 — Epic Sandbox roster and captured vital signs

Extends [EPIC-001](./EPIC-001.md), which remains DONE and whose committed capture is frozen by this task.

## User-visible outcome

The Care Team patient directory shows a caseload rather than a single patient: the prepared scenario case plus the other reviewed Epic Sandbox test patients, each openable as a read-only captured record. Camila's vital signs panel shows her prepared scenario vitals alongside the vital-sign observations actually captured from Epic, with each reading labelled by where it came from.

## Required scope

- Capture Patient, Appointment and vital-sign Observation resources for the Epic R4 Sandbox test patients using the existing authorised operator capture path.
- Store each patient as its own reviewed JSON package under `frontend/src/data/epic-roster/<patientId>/`, reusing the manifest/checksum/provenance mechanism rather than inventing a second one.
- Merge captured vital signs into Camila's existing vitals panel. Where both sources describe the same measurement, the prepared scenario value is kept; only non-duplicate Epic readings are added.
- Surface the roster in the Care Team and Care Navigator directories, permission-scoped.

## Deferred

Production Epic access, live synchronisation, writeback, token refresh infrastructure, readiness workflow state for roster patients, and MedicationRequest or laboratory capture for roster patients.

## Constraints

- EPIC-001's capture directory, manifest and capture id are frozen. This task must not alter them.
- Roster patients are read-only. Only the prepared scenario patient carries readiness state, tasks, a graph and an audit trail; no workflow state may be invented for a captured patient.
- Roster patients are presented under the identity the Sandbox recorded. No scenario alias is attached to them.
- Care Navigator surfaces must not expose vital signs or any other clinical measurement for roster patients; coordination fields only.
- All new surfaces compose existing runtime tokens and component primitives per [the visual lock](../adr/ADR-0003-human-approved-visual-lock.md).

## Acceptance criteria

1. Vital-sign Observations are retrieved read-only from the authorised Epic Sandbox and saved with resource types/ids, capture time, source environment and a checksum manifest. A synthetic fixture cannot satisfy this criterion.
2. Each roster package is an independently reviewed v2 manifest describing exactly one patient, with no scenario binding, validated against `contracts/schemas/epic-capture-manifest.v2.schema.json`.
3. Camila's vitals panel keeps every prepared scenario value. An Epic reading of the same measurement is dropped, not shown twice; measurement identity is resolved through LOINC rather than display text alone.
4. Epic-sourced vitals are visibly labelled as captured Sandbox data and are never presented as prepared scenario data, or the reverse.
5. A missing, empty or malformed roster package costs at most its own directory row. The directory, the vitals panel and the build all remain correct with no roster present at all.
6. Fields absent from a captured resource stay absent; no roster patient displays an invented MRN, appointment, vital sign or readiness status.
7. The Care Navigator directory exposes no captured vital signs. The Care Team directory does.
8. Captured assets contain no credentials or tokens, and checksums match the committed files.

## Captured roster

Captured from the Epic Non-Production Sandbox via backend-services OAuth 2.0 (`client_credentials` with an RS384 client assertion). Every id below was verified by `Patient.Read`; the name is the identity the Sandbox returned.

| Source identity | Epic patient id | Appointments | Vital signs | Capture |
|---|---|---|---|---|
| Camila Maria Lopez | `erXuFYUfucBZaryVksYEcMg3` | 0 | 9 | complete |
| Derrick Lin | `eq081-VQEgP8drUUqCWzHfw3` | 5 | 6 | bounded slice |
| Desiree Caroline Powell | `eAB3mDIBBcyUKviyzrxsnAw3` | 2 | 9 | bounded slice |
| Elijah John Davis | `egqBHVfQlt4Bw3XGXoxVxHg3` | 3 | 0 | complete |
| Olivia Anne Roberts | `eh2xYHuzl9nkSFVvV3osUHg3` | 0 | 10 | complete |
| Warren James McGinnis III | `e0w0LEDCYtfckT6N.CkJKCw3` | 1 | 10 | bounded slice |

Notes on the real data, which the UI must handle and does:

- **Elijah John Davis has no vital signs** in the Sandbox, and **Olivia Anne Roberts has no appointments**. Both render their absent section as stated-absent rather than empty or invented.
- **The scenario patient's Sandbox chart contains only blood pressure.** The prepared scenario already carries a blood pressure, so every captured reading collides and is dropped; her panel is unchanged. This is the merge rule working, not a failure.
- Packages marked *bounded slice* stopped at a configured ceiling and record `bounded: true`, so a partial chart is never presented as a complete record.
- A seventh Sandbox test patient exists but its FHIR id was not resolvable without an authenticated Epic account; `Patient.Search` returns no results for the parameter combinations available. Adding it later needs only a capture run, no code change.

## Verification status

Passing on the integrated revision: project manifest, OpenAPI contract, agentic framework tests, backend fast tests (103), frontend build, frontend critical-path smoke (82), roster checksum/patient-scope/vital-signs/secret validation, tracked-secret baseline.

Two checks fail for reasons that **predate this task**. Do not attribute them to EPIC-002 and do not "fix" them inside it:

- **PostgreSQL migration and integration** — requires `TEST_DATABASE_URL`/`DATABASE_URL`, which are unset locally.
- **Frontend end-to-end** — 4 Playwright specs assert a mobile workspace dock and a `role="dialog"` auth screen. Both were removed by commit `856e6b2`, which did not update the suite. Verified by running the same suite at `e530fc2`: the identical 4 specs fail there, before any EPIC-002 change. The affected specs are `e2e.spec.ts:87`, `:156`, `:194` and `:260`, and they belong to UI-001/ACCESS-001 scope.

Realigning those specs with the current auth and navigation is separate work against the task that changed them.

See [the two-day sprint](../LAUNCH_SPRINT_PLAN.md) and [the demo runbook](../operations/DEMO_RUNBOOK.md).
