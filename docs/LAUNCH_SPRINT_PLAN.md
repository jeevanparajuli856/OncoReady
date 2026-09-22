# OncoReady — Two-Day Demo Sprint Plan

**Decision:** September 21, 2026 human scope reset. This replaces every earlier sprint and compressed full-product overlay. Two working days total; UI quality remains locked. See [PROJECT](./PROJECT.md) for the authoritative scope.

## Starting point

CORE-001, LAND-001, UI-001 and RAIL-001 are DONE. Reuse their frontend and foundation. ACCESS, EPIC, FLOW, ML, OUTREACH, RIDE and EVIDENCE remain PROPOSED with revised acceptance; this plan does not advance lifecycle states or certify implementation.

The output is a polished recorded walkthrough with **one real SMS and one short live call**. Actual Epic Sandbox JSON is captured in advance. ML and CareLink use prepared assets and working frontend interactions. The presentation no longer depends on runtime models, ongoing Epic connectivity or a full workflow backend.

## Approved six-refinement allocation

The human approved all five impact refinements plus the ML what-if comparison as **MUST-DEMO** within the same two days. FLOW owns the graph transformation and owner/next-action/deadline treatment; ML owns Why flagged? and a two-output what-if; RIDE owns the patient finish; EVIDENCE owns the closing receipt.

Use current components and the existing feature blocks below. These take priority over optional keypad input, extra recording angles and a FHIR example. Keep the final two rehearsal hours. No new dashboards, inference service or extra sprint. If Day 1 evidence shows the remaining required work will not fit, report the specific gap and revise the allocation with the human; the time boxes are estimates, not guaranteed feasibility.

## Sprint 1 — Day 1: make the story playable

Time boxes are planning estimates within one working day, not promises of provider availability. Infrastructure readiness checks begin immediately so external blockers surface before recording.

| Block | Work and owner | Exit evidence |
|---|---|---|
| Hours 0–1 | Orchestrator freezes this cut line, audits current UI, selects recording viewport; backend owner checks existing Epic and SMS/voice access | Click list and source/call prerequisites identified; no secrets copied |
| Hours 1–3 | ACCESS + FLOW: frontend connects prepared personas, one shared scenario, checkpoints and reset using existing components | Open staff → patient → staff without losing state; reset works |
| Hours 3–5 | EPIC: capture only necessary authorized Sandbox resources and map saved JSON into the staff context/source drawer | Actual JSON plus capture manifest; no fabricated Epic fields |
| Hours 5–6 | ML: small synthetic notebook, exported predictions, Why flagged? factors and two-output what-if | Notebook executes; checkpoint and what-if outputs match UI; comparison cannot alter the plan |
| Hours 6–8 | FLOW: outreach history → owned tasks with next actions/deadlines → nurse disposition; visible graph transformation | First half of story recorded once; negative closure check passes |

Day 1 may overlap bounded independent preparation using explicit ownership; feature integration still follows task dependencies. Sender configuration is not postponed until Day 2.

**Day 1 checkpoint:** the opening, Epic context, prepared insights and split-work sequence run. Actual Epic capture is required; missing access is reported as a specific unmet criterion while local mapping/UI work continues.

## Sprint 2 — Day 2: recover, contact, record

| Block | Work and owner | Exit evidence |
|---|---|---|
| Hours 0–2 | RIDE: previous dispatch replay, current recovery and patient finish with pickup/return/contact and caregiver-seen state | Full story closes only after required human steps |
| Hours 2–4 | OUTREACH: minimal protected one-shot adapter, provider status and delivery guards; reviewed prepared audio | One real SMS received; short real call audible; sanitized evidence |
| Hours 4–5 | EVIDENCE: event-linked closing receipt, source/insight evidence, checkpoints and recording checklist | Counts match the current scene; source provenance is inspectable |
| Hours 5–6 | Frontend: click-path audit, focus/contrast/responsive checks, remove recording blockers | No dead selected controls or unapproved visual drift |
| Hours 6–8 | Freeze, affected verification/review, full rehearsal, final capture, backup playback | Final recording and live-call setup tested on presentation equipment |

The final two hours are reserved for rehearsal, recording and recovery. Feature additions stop before that block. If time slips, cut NICE items and off-path work first; do not quietly remove the real SMS, live call, real Epic capture or UI finish.

## Task portfolio and dependency changes

| Task | Revised outcome | Dependencies | Planned validation |
|---|---|---|---|
| RAIL-001 | Reuse completed foundation; no new sprint | Already DONE | Preserve historical evidence |
| ACCESS-001 | Polished prepared-persona entry and usable presentation routes | RAIL-001 | SMOKE + visual check |
| FLOW-001 | Shared frontend scenario and closure rules | ACCESS-001 | TARGETED state/journey checks |
| EPIC-001 | Actual Sandbox capture → JSON → staff UI | ACCESS-001 | TARGETED source/mapping checks |
| ML-001 | Synthetic dataset, trained notebook demonstration and exported insights | FLOW-001 | SMOKE + notebook execution |
| RIDE-001 | Prior-dispatch replay, current failure/recovery and acknowledgment | FLOW-001 | TARGETED transition checks |
| OUTREACH-001 | Prepared scheduler/message/reply history plus one-off real SMS/call | RAIL-001, FLOW-001 | TARGETED + HIGH-risk delivery review |
| EVIDENCE-001 | Coherent closing scene and complete presentation package | EPIC-001, FLOW-001, ML-001, RIDE-001, OUTREACH-001 | TARGETED full rehearsal |

These are recommended planning controls, not completed architecture reports. Architects record actual impacts/contracts and execution flags before BUILD_READY. Use the frontend specialist for affected UI. Use independent testers only for TARGETED/FULL and a dedicated security reviewer for the live adapter or any new meaningful credential/auth boundary.

FLOW no longer waits on live Epic integration. OUTREACH no longer waits on ML. ML assets can be prepared while FLOW is planned. Integrate shared scenario changes deliberately; do not create competing stores.

## What is clickable

Required: the before/after graph, Why flagged? detail, owner/next-action/deadline treatment, patient finish, evidence-linked closing receipt, isolated two-state ML what-if, outreach-history rows with sent/reply detail, a previous-trip dispatch replay with pause/restart and advancing event feed, public entry, prepared workspace entry, Camila case, source drawer, trajectory/factors, patient reply, nurse contact/disposition, ride request/assignment/failure/backup, caregiver logistics, current-plan acknowledgment, graph/timeline, one-off communication trigger and status, private reset/checkpoints, dataset/notebook evidence.

Off-path controls may be hidden, disabled with a useful explanation, or open an honest read-only preview using the existing layout. They must not pretend to save, send, dispatch or authenticate. Do not wire every setting, patient, integration or navigation item. Prepared automated-outreach history and timed dispatch replay are required visible behavior; background scheduling and real ride execution remain deferred. Integrate them into the existing scene work without adding another sprint.

## External gates and fallback

- Epic capture: use actual authorized Sandbox output. If access fails, mapping work can continue against clearly synthetic development fixtures; the Epic acceptance remains incomplete until real capture exists.
- SMS/call: existing purchased accounts are not delivery proof. Confirm sender, recipient consent and callback reachability. Build only the minimal protected path; no automatic outreach engine.
- A failed live call has a clearly introduced recorded backup. Preserve the failed/unknown live status. Playback maintains the presentation but is not successful live delivery.
- No database expansion, new vendor onboarding, real ride dispatch or production integration is needed for prepared scenes.

## Release gate

Complete two uninterrupted rehearsals of the selected click path from reset, with no live sends during ordinary rehearsal. Perform separately armed bounded real-delivery checks. Verify video/audio playback on the presentation device, capture one backup call clip, and retain the exact build/asset versions used.

Keep normal commit-bound verification and affected review gates; do not mark unavailable required checks passed. Human merge remains the final repository closure gate. All future enterprise work goes into the deferred roadmap, not these two days.
