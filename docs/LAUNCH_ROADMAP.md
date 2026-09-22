# OncoReady Demo Roadmap

## Approved direction

The September 21 human decision replaces the full launch build with a two-day, frontend-led funding demonstration. [PROJECT](./PROJECT.md) defines scope; [LAUNCH_SPRINT_PLAN](./LAUNCH_SPRINT_PLAN.md) defines execution. Every former multi-day sprint is either compressed into the visible journey or deferred below.

The product should look finished. Build the controls needed to tell one convincing continuity story; prepared data and recorded footage are accepted. One SMS and one short call must actually reach the consenting test phone.

## Keep, simplify, defer

| Former workstream | Two-day deliverable | Future product work |
|---|---|---|
| Railway platform | Reuse DONE foundation and minimal live delivery service | Further operational hardening and platform expansion |
| Public/access | Preserve polished public story, two pricing plans, prepared persona entry | Real identity providers, provisioning, enterprise sessions and account recovery |
| Epic | Capture actual Sandbox data into JSON; show clinical context and source/time in UI | Continuous sync, refresh lifecycle, customer authorization, production installation |
| Workflow | Shared frontend state and consistent chosen transitions | Durable event spine, multiuser projections, generalized scheduler, concurrency and SLA engine |
| ML | Synthetic dataset, lightweight trained notebook, held-out metrics, exported predictions in UI | Production training/inference, calibration, subgroup and clinical validation |
| Outreach | Scheduled-message/reply history plus manual one-shot real SMS/call with verified status | Autonomous channel/time selection, scheduled follow-up and long conversations |
| CareLink | Timed replay of a previous dispatch plus current synthetic failure/recovery and acknowledgment | Live vendor dispatch, operational contracts, real drivers/locations/callbacks |
| Evidence | Source and scenario evidence, coherent counts, video and fallback | Validated FHIR export, production analytics and outcome measurement |

## Experience to demonstrate

Camila's chart explains treatment. Her readiness trajectory shows a practical concern. A patient reply creates separately owned clinical and transportation work. The nurse handles the concern, CareLink recovers the ride plan, Ana sees logistics, and Camila confirms. The graph resolves only when all required human steps are complete.

The outreach history shows when automation scheduled and sent each prepared message, what the patient replied and how follow-up changed. CareLink plays a previous scenario dispatch as an updating board with a driver assignment and event feed; its source details distinguish historical replay from live vendor activity. The previous trip never closes the current trip.

The real call is the presentation highlight. It can play a reviewed voice message prepared earlier through ElevenLabs; an open-ended voice agent is unnecessary. One real SMS can be captured in the recording. Ongoing synchronization between the phone and every scene is unnecessary.

## Presentation outline

Target a 3–4 minute recorded story plus a 30–60 second live-call moment; adjust to the organizer's actual slot once known.

| Segment | Approximate time | Evidence |
|---|---|---|
| Problem and polished product opening | 20 seconds | Public story, no patient information |
| Epic context and readiness trajectory | 40 seconds | Captured Sandbox source/time, prepared insights |
| Outreach and two owned tasks | 35 seconds | Real SMS recording and visible handoff |
| CareLink failure and recovery | 45 seconds | Working frontend transitions and return plan |
| Patient/caregiver closure | 30 seconds | Current acknowledgment, graph/timeline consistency |
| Live call and funding ask | 30–60 seconds | Real ring/audio; next-stage plan |

[DEMO_RUNBOOK](./operations/DEMO_RUNBOOK.md) owns click order, checkpoints, source disclosure and recovery.

## Truthful proof

- Once verified: “This walkthrough uses data retrieved from Epic's Sandbox and rendered in OncoReady.” The source drawer says captured Sandbox data and displays the actual timestamp.
- After a real request/response and UI mapping are evidenced, “read-only Epic Sandbox integration” may describe that limited implemented path. Do not imply runtime synchronization, customer deployment or production connectivity.
- The notebook demonstrates a small model's capability on synthetic held-out data. The UI reads its actual exported predictions and factors. No clinical effectiveness, calibrated-probability or SHAP claim without supporting evidence.
- CareLink demonstrates a working coordination interface with fictional providers. No real ride is ordered.
- SMS delivery, call connection/completion and any explicit recipient response are separate outcomes. Only verified actual results are described as live.
- Funding supports completing and validating the operational product; avoid claims of clinical effectiveness or existing customers.

## Approved impact refinements

All six refinements are now required within the existing two-day scope: graph transformation and ownership/next actions (FLOW), Why flagged? and notebook-exported transportation what-if (ML), patient finish with current logistics/caregiver-seen status (RIDE), and a closing receipt linked to scenario evidence (EVIDENCE). They extend existing screens and displace optional embellishments. The what-if is a model illustration, not a causal outcome claim or an actual plan change.

## Work order

Reconcile documents → ACCESS and shared FLOW → captured EPIC + prepared ML → CareLink recovery and bounded OUTREACH → EVIDENCE, polish, rehearsal and recording. Start external access checks on Day 1. RAIL is already complete; do not start it again.

The existing seven task IDs remain the implementation containers. Their specs and machine acceptance now match the smaller scope. Source-of-truth changes do not certify architecture, implementation, deployment or review.

## Post-funding backlog

1. Real identity, center authorization and durable multiuser workflows.
2. Operational Epic authorization, refresh, sync and customer-specific integration.
3. Trained/evaluated models, validated clinical boundaries and governed data.
4. Adaptive outreach, delivery scheduling and sustained response handling.
5. Live CareLink providers and operational transport requirements.
6. Validated interoperability exports, audit retention, analytics and risk-appropriate production hardening.

These are future outcomes, not work to squeeze into this sprint. The two-day release stops when the selected story, real delivery proof and presentation package pass.
