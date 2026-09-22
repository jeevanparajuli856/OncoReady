# Two-day scope review and coding-agent handoff

## Current result

The human explicitly replaced the earlier full-product launch requirements with a two-working-day demonstration. This planning revision updates the active product, architecture, roadmap, sprint, seven proposed specs/task records and operator documents. It does not implement features, capture Epic data, train a model, send messages, deploy, commit or advance task status.

Work is on `feature/PLAN-003-two-day-demo`, based on the completed RAIL-001 repository state. PLAN-003 is a documentation milestone, not an invented DONE implementation task.

## Confirmed decisions

- Finished-looking UI remains mandatory; the existing visual system is locked.
- Most of the presentation is recorded product footage/playback.
- One real SMS plus one short live call are required. Manual triggering and prepared nonclinical audio are sufficient.
- Retrieve actual authorized Epic Sandbox data into reviewed JSON, then render it in the UI with original source and capture time. Future production integration is not claimed as current.
- A small runnable notebook trains/evaluates a model on synthetic data and exports actual results used by the UI. No online inference or production training pipeline.
- Show an automatic-outreach history with scheduled/sent messages, patient replies and follow-up changes using prepared timestamped events.
- CareLink includes a timed previous-dispatch replay with driver assignment/status updates, plus the current failure/recovery/acknowledgment path. Fictional provider activity remains separate from actual live communication evidence; no real ride dispatch.
- Existing Railway hosts: `https://app.oncoready.me` and `https://api.oncoready.me`, human-confirmed. No new deployment platform is needed.
- This pass updates documentation only; notebook and UI implementation happen in the two-day sprint.
- The human subsequently approved all five impact refinements plus the ML what-if: graph transformation, Why flagged?, ownership/next action/deadline, patient finish, evidence-linked receipt and two precomputed model variants. They are now required in existing task blocks, ahead of optional embellishments.

## Reconciliation

| Previous requirement | Active replacement |
|---|---|
| Full backend before recording | Shared frontend scenario plus minimum live adapter |
| Live Epic lifecycle and comprehensive inventory | Actual limited capture in advance, JSON playback and provenance |
| Large dual-model/calibration/SHAP pipeline | Small offline synthetic notebook, actual evaluation/export and matching UI |
| Model-selected scheduled SMS/voice | Prepared automatic-outreach history plus manually triggered real SMS/call with protected limits |
| Durable server CareLink dispatch | Previous-trip dispatch playback plus coherent current frontend recovery |
| Enterprise access, signup/recovery delivery | Prepared presentation personas; separate real protection for outbound actions |
| Required validated FHIR export | Inspectable capture/ML/scenario evidence and reliable recording |
| Restart RAIL planning | Reuse completed foundation and supplied hosts |

## Implementation handoff

1. Read AGENTS.md, PROJECT, SYSTEM, ADR-0004 and the revised sprint. Preserve existing user work and the visual lock.
2. RAIL, CORE, LAND and UI are already DONE. Their task records/specs/reports remain historical; do not reinterpret old future-facing prose as new sprint requirements. ProjectRaw research is historical too.
3. Start ACCESS/FLOW planning; check authorized Epic access and communication sender/recipient readiness early. Do not ask again whether real SMS/call or actual Sandbox data are wanted.
4. Use the existing lifecycle and architecture reports to select only impacted workers, contracts and verification. Proposed specs contain recommendations, not completed architecture controls.
5. FLOW can proceed without EPIC. OUTREACH depends on RAIL/FLOW, not ML. ML exports are consumed by frontend with a parity check; EVIDENCE closes after all required scenes/assets.
6. All seven rewritten tasks stay PROPOSED. No architecture report, security approval or review is manufactured by this plan. Completed evidence and required project verification configuration are retained.
7. Integrate/review the reduced slices, freeze the recording candidate, rehearse twice without sends and separately prove bounded real SMS/call delivery. Follow the normal exact-commit verification, scoped security review and human merge gates.

## Open implementation prerequisites

Actual authorized Epic access/capture, sender capability, protected credentials, consenting test recipient, current domain/callback behavior, audio assets and final event timing remain to be verified. These are execution prerequisites, not reasons to restart product discovery. Do not request secrets in chat or describe missing evidence as implemented.

The two-day schedule is aggressive. Start external checks on Day 1, preserve the last two hours for rehearsal and report any missed MUST-DEMO criterion explicitly. Scope reductions do not lower the UI bar or convert replay into real delivery.

## Planning validation

- Project configuration validation: passed.
- All 11 task/report schemas: passed.
- Existing OpenAPI structure validation: passed; no new communication endpoint is claimed implemented.
- Seven proposed spec/task acceptance lists agree exactly; dependencies exist and are acyclic.
- All 11 lifecycle states and completed task records are preserved.
- All 78 local Markdown links in the 30 changed/new documentation/task files resolve.
- Whitespace/diff check: passed. Runtime files, contracts and required verification configuration are unchanged.

Runtime suites were not rerun for this documentation-only revision. No capture, model, provider delivery, live host check or new UI implementation is certified by these checks.

## Self-review

The intent-driven-development and scope-guard skills shaped observable acceptance and the MUST-DEMO/deferred boundary. The agent-self-evaluation rubric was applied to this documentation deliverable; this is not an independent implementation review.

| Axis | Score | Evidence and limit |
|---|---|---|
| Accuracy | 4/5 | Schemas, exact acceptance parity and historical states checked; external access/host facts remain human-reported until preflight |
| Completeness | 4/5 | Thirty files cover all seven remaining tasks, both days, latest history/replay additions and the supplied domains; actual provider/capture prerequisites remain open for implementation |
| Clarity | 4/5 | One active scope and explicit ADR supersession separate prepared and live behavior; historical completed specs still need the handoff context |
| Actionability | 4/5 | Day-by-day blocks, artifact requirements, click path and measurable gates are defined; two-day estimates depend on existing access and focused implementation |
| Conciseness | 4/5 | The long launch plans were replaced with a smaller scoped plan; intentional duplication remains between human specs and machine acceptance |

Overall: 4.0/5. Next implementation priorities are verifying external access early and freezing shared scenario/export interfaces before parallel work. Self-check: this meets the requested documentation update without pretending the future demo is already built. The subsequently approved six impact refinements are now explicit requirements in the product scope, sprint, four affected feature specs/task records and recording script. Optional keypad input, extra recording angles and a FHIR example stay below this cut line.
