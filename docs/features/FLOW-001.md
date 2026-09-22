# FLOW-001 — Shared frontend continuity scenario

**Scope revision:** September 21, 2026 two-day demonstration. Supersedes this task's prior full-product launch requirements. Status remains PROPOSED; architecture/implementation/review are not certified by this specification.

## User-visible outcome

One patient reply creates two owned work items and every recorded view follows the same playable recovery story.

## Required scope

Reuse frontend workflow state for one versioned Camila scenario. Implement exact patient reply, nurse ownership/contact/disposition, transportation work, graph/timeline updates, private checkpoints and reset. Use scenario-time dates and prepared history; no durable workflow backend is required. Make the existing graph's at-risk-to-confirmed transformation a required story beat, and show owner, next action, due time and waiting state on every selected work item.

## Deferred

Event-sourced backend, multiuser synchronization, full scheduler/outbox, generalized SLAs, concurrency framework and comprehensive appointment-change handling.

## Architecture and contract guidance

Frontend impact. One shared typed store/reducer drives every scenario projection. Keep captured Epic context, offline ML outputs and live provider outcomes separate from synthetic transitions. Local typed interfaces suffice unless a real server boundary is added.

All frontend work preserves [the approved visual system](../design/DESIGN_SYSTEM.md). Design-required work is a compatibility/extension plan with the existing digest gate. The architect must record actual impacts, execution controls and scope before BUILD_READY; the guidance here is not a completed architecture report.

## Verification and risk

TARGETED; LOW risk for synthetic-only local state. Independent tests focus on state consistency, confirmation rules, acknowledgment invalidation and reset.

## Dependencies

- ACCESS-001

## Acceptance criteria

1. From the risk checkpoint, submitting “My ride was cancelled—and I’m not feeling well today.” preserves that exact text for staff and creates distinct clinical-contact and transport tasks with named owners; verify the state and rendered workspaces.
2. Nurse acknowledgment and recorded human contact/disposition remain distinct. Software gives no diagnosis, urgency downgrade, clinical advice or medical clearance; inspect the supported actions.
3. Staff, patient, caregiver, transport, graph and timeline derive from one shared state; switching persona cannot lose or contradict the current scene. Verify the selected browser path.
4. Continuity plan confirmed requires the human clinical disposition, a complete current outbound/return/backup plan and patient acknowledgment of that plan version. Open clinical work, failed transport or missing acknowledgment prevents confirmation; test each boundary.
5. Changing or failing the acknowledged ride invalidates that acknowledgment and reopens its blocker; duplicate clicks do not add duplicate effective transitions. Verify focused state tests.
6. Private checkpoint/reset restores the documented scenario without changing actual Epic capture timestamps, provider evidence, consent, attempt limits or live activation state; verify reset with a reserved live attempt fixture.
7. Scenario dates, Epic clinical/capture dates and real delivery times retain separate meaning. Attendance remains unknown unless actual evidence exists; inspect the closing graph and timeline.
8. All selected controls have coherent loading, disabled, failure and success presentation inside the locked visual system; verify browser behavior and matching screenshots.
9. Historical scheduled/sent/reply events are checkpoint-aware and the final prepared reply opens the existing split-work transition once; replaying or re-opening history does not duplicate work. Verify the same event text/times in thread and timeline.

10. Starting at Treatment at risk, each recorded nurse, transportation and patient action updates its corresponding graph node and status; only the existing closure rules permit Continuity plan confirmed. The transition remains understandable with reduced motion and non-color labels. Verify the before/after scene and the open-blocker case without inventing a score improvement.
11. Every open work item in the selected journey shows its named owner, next action, due time and waiting/blocked status from shared scenario data. Completing or reopening it updates the graph and timeline consistently; verify the clinical and transportation paths. Deadlines are operational scenario settings, not clinical policy.

See [the two-day sprint](../LAUNCH_SPRINT_PLAN.md), [scenario settings](../LAUNCH_SCENARIO_SETTINGS.md) and [demo runbook](../operations/DEMO_RUNBOOK.md). Future product work is listed in [the roadmap](../LAUNCH_ROADMAP.md); it is not an additional release gate.
