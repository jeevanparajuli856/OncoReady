# RIDE-001 — Playable CareLink recovery and plan acknowledgment

**Current task record:** DONE. This specification records the approved two-day demo scope; [the closeout](../SPRINT_CLOSEOUT.md) distinguishes shipped behavior from remaining gates. The task JSON and current code determine lifecycle and behavior.

## User-visible outcome

CareLink visibly recovers Camila's transportation plan through working frontend actions and patient acknowledgment.

## Required scope

Use fictional provider/driver records for one request, assignment, primary failure, backup recovery, outbound pickup, return plan and current-plan acknowledgment. Update staff, transportation, caregiver, patient, graph and timeline together. Show minimum relevant logistics using existing components. Add a short timed replay of a previous scenario dispatch with acceptance, driver assignment and advancing status feed, using a separate historical trip identity. Finish with one clear patient plan summary, including current pickup, return, contact and a versioned caregiver-seen status. The read-only provider area may name CareLink and Uber Health to communicate adapter extensibility, but Uber Health must be labeled `Integration-ready preview · not connected` and cannot participate in the playable dispatch path.

## Deferred

Real provider integration, ride booking, callbacks, GPS/ETA feeds, fleet management, broad eligibility engine, payments, Uber Health execution and any claim of an active Uber Health contract or connection.

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

12. The provider/integration area labels both CareLink and Uber Health. CareLink remains the playable scenario provider, presented since POLISH-001 as `OncoReady vendor portal · Active` for local partners without their own software; Uber Health is presented only as `API integration · Planned` and not yet connected, with no Uber booking, success, contract or API claim and no effect on scenario state. Verify the label and zero Uber network activity.

    *Superseded by [RIDE-002](RIDE-002.md):* Partner A and Partner B are now **Crescent Lantern Medical Rides** and **Magnolia Wayfare Transport**. The Uber Health card shows the Uber logo and reads `Adapter built · Awaiting connection`. It still makes no booking, success, contract or API claim, and it has no network activity.

See [current product scope](../PROJECT.md), [sprint closeout](../SPRINT_CLOSEOUT.md) and [the presenter script](../operations/SEVEN_MINUTE_PRODUCT_DEMO.md).
