# RIDE-001 — Playable CareLink recovery and plan acknowledgment

**Scope revision:** September 21, 2026 two-day demonstration. Supersedes this task's prior full-product launch requirements. Status remains PROPOSED; architecture/implementation/review are not certified by this specification.

## User-visible outcome

CareLink visibly recovers Camila's transportation plan through working frontend actions and patient acknowledgment.

## Required scope

Use fictional provider/driver records for one request, assignment, primary failure, backup recovery, outbound pickup, return plan and current-plan acknowledgment. Update staff, transportation, caregiver, patient, graph and timeline together. Show minimum relevant logistics using existing components. Add a short timed replay of a previous scenario dispatch with acceptance, driver assignment and advancing status feed, using a separate historical trip identity. Finish with one clear patient plan summary, including current pickup, return, contact and a versioned caregiver-seen status.

## Deferred

Real provider integration, ride booking, callbacks, GPS/ETA feeds, fleet management, broad eligibility engine, payments and Uber Health execution.

## Architecture and contract guidance

Frontend-only scenario transitions integrated into FLOW's single store. No dispatch API, migration or vendor credential is needed. Data structures are internal typed interfaces, not a new external contract.

All frontend work preserves [the approved visual system](../design/DESIGN_SYSTEM.md). Design-required work is a compatibility/extension plan with the existing digest gate. The architect must record actual impacts, execution controls and scope before BUILD_READY; the guidance here is not a completed architecture report.

## Verification and risk

TARGETED; LOW risk for synthetic-only actions. Independent tests cover failed-plan reopening, required logistics, acknowledgment invalidation and visible consistency.

## Dependencies

- FLOW-001

## Acceptance criteria

1. Starting from open transportation work, request and assign the fictional primary provider; the transport workspace, staff timeline and graph update from the same state. Verify the click path.
2. Trigger primary failure, preserve the failed assignment in the timeline and reopen the blocker; selecting the backup records a new current plan without erasing history.
3. The recovered plan shows outbound pickup/arrival, return arrangement and backup owner. Missing required logistics prevents patient confirmation; test the incomplete-plan state.
4. Camila acknowledges the current plan version. A later change/failure invalidates that acknowledgment; no option available leaves the plan at risk instead of generating success.
5. Ana sees only permitted ride logistics and transportation sees no copied clinical concern or Epic-only context; inspect the rendered role views and accessibility output.
6. Provider/driver/map details are synthetic scenario assets. No action places a real ride or claims live GPS, real ETA, a provider contract or Uber success; verify no external dispatch network activity.
7. The selected controls, map fallback, status transitions and final graph look native to the approved interface; compare baseline screenshots and complete a keyboard walkthrough.
8. Playing the previous-trip dispatch advances requested, accepted, driver-assigned, arriving and pickup/completion events with original timestamps. Pause/restart/exit cleanly control local replay; no real dispatch or GPS is implied. Verify replay with networking disabled.
9. Historical replay has a distinct trip ID and cannot change the current ride, patient acknowledgment, graph confirmation or real communications ledger. Reset/exit cancels replay timers; verify isolation and repeat playback.

10. After current-trip recovery, the patient finish shows the current pickup/arrival, return arrangement, named logistics contact, caregiver seen/pending state and patient acknowledgment together using existing components. Every value comes from the current plan; no historical trip date or assignment appears. Verify the patient/caregiver round trip.
11. Ana can mark the permitted current logistics plan as seen through a bounded local scenario action. The shared view records the actor, plan version and scenario time; a changed plan returns this state to pending. This cannot change assignments, disclose clinical details, substitute for Camila's acknowledgment or become an additional clinical-clearance condition. Verify these boundaries.

See [the two-day sprint](../LAUNCH_SPRINT_PLAN.md), [scenario settings](../LAUNCH_SCENARIO_SETTINGS.md) and [demo runbook](../operations/DEMO_RUNBOOK.md). Future product work is listed in [the roadmap](../LAUNCH_ROADMAP.md); it is not an additional release gate.
