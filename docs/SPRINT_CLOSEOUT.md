# Two-day demo sprint closeout

**Closed implementation window:** September 22, 2026. This closes the two-day build plan as a planning artifact; it does **not** certify the full demonstration or turn unmet acceptance criteria into success. The current product source is [PROJECT](./PROJECT.md), the stage script is [SEVEN_MINUTE_PRODUCT_DEMO](./operations/SEVEN_MINUTE_PRODUCT_DEMO.md), and implementation behavior is the code.

## What reached `main`

| Area | Evidence-backed result | Task record |
| --- | --- | --- |
| Public entry, prepared personas and shared scenario | Public pages are record-free; one Camila story survives persona switches, reset, split work and closure rules. | ACCESS-001 and FLOW-001 are **REVIEW** with approved historical reviews; post-merge lifecycle closure remains open. |
| Clinical context and saved insights | Captured Epic Sandbox JSON is mapped read-only with provenance. A synthetic-data notebook supplies the saved trajectory, factors and isolated transportation what-if. | EPIC-001 and ML-001 are **DONE**. |
| CareLink and patient finish | Previous-trip replay, fictional current-trip failure/recovery, caregiver logistics visibility and current-plan acknowledgment work in the prepared scenario. | RIDE-001 is **DONE**. |
| Live outreach | One authorized test call rang, completed and had an audible agent exchange. The one SMS was **undelivered**; Twilio reported 30034 while A2P approval was in progress. The protected control retains both statuses and prevents another action in the spent window. | OUTREACH-001 remains **PROPOSED** with incomplete real-SMS acceptance and no event rearm. |
| Closing evidence and presentation | The graph and event-linked receipt work. The seven-minute stage script and two automated no-send browser rehearsals exist. | EVIDENCE-001 remains **PROPOSED** because Part 1/Part 2 recordings, backup call media, device playback and two human-paced rehearsals are unverified. |
| Infrastructure and visual system | Existing Railway web/API/PostgreSQL foundation and locked design are reused. | RAIL-001, CORE-001, LAND-001 and UI-001 are **DONE**. |
| Expanded Epic roster | Reviewed captured roster and vital signs are in code; the task's formal review and verification record remain incomplete. | EPIC-002 remains **PROPOSED**. |

The documented frontend check passed 94 component tests, 10 Playwright tests, a production build and a read-only production browser check. The dedicated presenter path passed twice without provider POSTs. [Sanitized provider evidence](./operations/OUTREACH-001-LIVE-EVIDENCE.md) records the call and SMS separately. Historical task reports in `.ai/tasks/` remain intact; their stale status is not silently rewritten.

## Open gates carried forward

1. **Twilio SMS:** The user deferred A2P checks until they report approval. A later SMS delivery test needs its own explicit authorization and durable bounded attempt; the failed attempt stays in the ledger.
2. **Stage call:** The September 22 one-shot call was used. A new, separately authorized event window and its safety review are needed before another live call. Ordinary scenario reset cannot rearm it.
3. **Presentation media:** Record and verify Video Parts 1 and 2, a genuine backup call clip if one is to be used, local copies and playback on the actual presentation device. Complete two human-paced seven-minute rehearsals.
4. **Lifecycle closure:** ACCESS-001 and FLOW-001 have historical approved reviews but their task records are still REVIEW. Advance them only through the repository's current-revision gates. EPIC-002, OUTREACH-001 and EVIDENCE-001 need their remaining evidence before DONE.

No other two-day sprint is active. New work should use the relevant feature spec and task record; the old hour-by-hour plan, scope review, roadmap and duplicate runbooks were retired to reduce context. Git history retains them if a past decision must be audited.
