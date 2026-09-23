# Operator quickstart

The two-day demo build window is closed. Start with [PROJECT](../PROJECT.md) for current scope and [SPRINT_CLOSEOUT](../SPRINT_CLOSEOUT.md) for shipped work and unmet gates. Use the [seven-minute presenter script](../operations/SEVEN_MINUTE_PRODUCT_DEMO.md) for the stage sequence. Do not restart the retired hour-by-hour sprint plan.

## Task work

1. Read the relevant `docs/features/<TASK-ID>.md` and `.ai/tasks/<TASK-ID>/task.json`. Read architecture, design or contracts only if the change touches them. Actual behavior lives in code.
2. Work on a branch, not `main`. Preserve the locked visual system and keep protected provider actions server-side. Ordinary scenario reset or rehearsal must not arm or send a call/SMS.
3. Run checks relevant to the changed code. Keep failed or unavailable gates visible in reports rather than marking them passed.
4. The task lifecycle is `PROPOSED → PLANNING → BUILD_READY → IMPLEMENTATION → INTEGRATION → REVIEW → DONE`. The control plane is `python3 scripts/agentctl.py`; its `task advance` gates and current-revision evidence take precedence over an informal “shipped” label. Human-authorized merge is required for DONE.

ACCESS-001 and FLOW-001 remain in REVIEW despite historical approved reports and merged code. OUTREACH-001 and EVIDENCE-001 remain open because real SMS delivery, event-call rearming and presentation assets/rehearsal are incomplete. The exact state of every task is its `.ai/tasks/<TASK-ID>/task.json`; [SPRINT_CLOSEOUT](../SPRINT_CLOSEOUT.md) explains the distinction between sprint closure and task completion.
