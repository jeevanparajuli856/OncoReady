# EVIDENCE-001 — Coherent demo evidence recording and rehearsal

**Scope revision:** September 21, 2026 two-day demonstration. Supersedes this task's prior full-product launch requirements. Status remains PROPOSED; architecture/implementation/review are not certified by this specification.

## User-visible outcome

The closing scene, source evidence and presentation package make the completed journey inspectable and reliable.

## Required scope

Compute small scenario counts from the shared state, expose actual Epic capture provenance and ML notebook/output evidence, distinguish live delivery from scenario events, and assemble the final recording, local backup and operator runbook. Show only the metrics needed for the story. Add a compact closing receipt whose barrier, backup-plan and patient-acknowledgment items open their supporting timeline evidence.

## Deferred

Validated FHIR export, broad interoperability mapping, production analytics, ROI dashboards, clinical outcome claims and extensive backend reporting.

## Architecture and contract guidance

Frontend evidence views plus local recording/asset manifests. Preserve existing actual live evidence from OUTREACH without exposing recipient numbers or secrets. No new analytics database or FHIR validator service.

All frontend work preserves [the approved visual system](../design/DESIGN_SYSTEM.md). Design-required work is a compatibility/extension plan with the existing digest gate. The architect must record actual impacts, execution controls and scope before BUILD_READY; the guidance here is not a completed architecture report.

## Verification and risk

TARGETED; LOW risk for reviewed synthetic/captured evidence. Reassess risk if a new protected export boundary is added. Independent full-path checks and visual review; OUTREACH retains its dedicated HIGH-risk review.

## Dependencies

- EPIC-001
- FLOW-001
- ML-001
- RIDE-001
- OUTREACH-001

## Acceptance criteria

1. The closing graph, workspaces, timeline and scenario counts reconcile to the same current scenario. Reset changes those counts consistently without rewriting captured Epic or real provider evidence.
2. The source/evidence view identifies actual Epic Sandbox capture time and source, notebook/dataset/model export identity and synthetic-data limitations; links open and show the matching artifacts.
3. Real SMS/call evidence and synthetic workflow/CareLink events retain distinct provenance. Show only sanitized live evidence; no real phone number, secret or fabricated delivery outcome enters the recording or export.
4. Continuity plan confirmed is never labeled medical clearance or proof of attendance. Scenario counts are not production KPIs, efficacy, customers or ROI; inspect product and presenter wording.
5. The local main recording, backup call clip, required JSON/audio assets and version/checksum manifest exist and play on the presentation device. Missing files/audio fail readiness.
6. Two uninterrupted rehearsals complete the selected click path from reset with external sends disabled. A separately armed bounded acceptance verifies actual SMS and call; preserve the exact build and evidence versions.
7. Off-path controls cannot derail the selected journey and the recorded views pass visual-baseline, keyboard, readable-state and representative responsive checks without rebranding.
8. An Epic-offline run uses the actual saved capture, and a failed live-call run follows the disclosed backup without changing failure into live success. Record both recovery checks.
9. The recording includes the automated-message/reply history and previous-dispatch playback. Original event times, replay/source detail and separate real SMS/call evidence remain readable; historical completion never counts as current-trip success.

10. The closing scene includes a compact receipt derived from the current scenario: barriers addressed, backup transportation arranged and patient acknowledgment. Each item opens its supporting timeline event/details; before completion, missing items remain pending. Verify incomplete, completed and reopened states without hard-coded success counts.
11. The recording demonstrates the graph's at-risk-to-confirmed transformation, Why flagged? detail, named ownership/next action/deadline, patient finish, evidence-linked receipt and the isolated ML what-if comparison. All six use the locked existing surfaces and show matching source data; include them in the two rehearsals without adding separate dashboards.

See [the two-day sprint](../LAUNCH_SPRINT_PLAN.md), [scenario settings](../LAUNCH_SCENARIO_SETTINGS.md) and [demo runbook](../operations/DEMO_RUNBOOK.md). Future product work is listed in [the roadmap](../LAUNCH_ROADMAP.md); it is not an additional release gate.
