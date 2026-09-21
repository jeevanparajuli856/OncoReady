# Controlled launch scenario settings

**Status:** Agent-planned defaults under the human's September 21, 2026 delegation. The delivery deadline is **September 25, 2026**. These are synthetic scenario and engineering acceptance settings, not an approved hospital protocol, clinical response standard, transportation contract, or evidence of clinical validity.

The responsible task architect must copy the applicable settings into its requirements/contracts and record a frozen version before implementation or evaluation. The orchestrator can resolve routine synthetic configuration under the delegation without asking the human to supply every value. Ask only when a choice changes approved product scope, introduces clinical advice, changes locked visuals, needs external access, or authorizes a consequential external action. Real clinical/customer policy and broader provider activation remain separate future approvals. The human has specifically authorized bounded Twilio/ElevenLabs test-contact delivery in OUTREACH-001.

## Clock and provenance — FLOW-001

- Scenario version: `camila-launch-v1`; center timezone: `America/Chicago`; store instants with explicit UTC offsets and render in the center timezone.
- Synthetic treatment: Friday, September 25, 2026 at 10:00 local; arrival deadline: 09:30. This is an OncoReady scenario appointment. Preserve all actual Epic dates and resource provenance unchanged; do not manufacture an Epic appointment association.
- T−7 snapshot: September 18 at 10:00; T−2: September 23 at 10:00; T−1: September 24 at 10:00. Patient response follows the T−1 snapshot so the prediction never consumes the subsequent reply.
- Routine transport booking cutoff: September 23 at 12:00, two business dates before treatment. For any replacement appointment, walk backward two Monday–Friday dates, excluding the configured holiday set, and apply local noon. Version the calendar; the September scenario has no holiday exclusions. Test an explicit synthetic holiday, weekend, and daylight-saving boundary independently.
- A cancelled ride at T−1 is a late recovery request. It fails the routine-booking cutoff but can enter a separately recorded, human-approved backup exception. Never mark the original cutoff as satisfied or waive service-area, mobility, funding, or availability checks automatically.
- Model outcome horizon/intervention cutoff: T−4 hours (September 25 at 06:00), distinct from the routine-booking cutoff. Define attendance disruption as an unresolved practical readiness blocker at that horizon in generated data; this is not clinical urgency or observed attendance.
- The clock advances only through a private operator command. Each event carries scenario time, actual recording time, scenario version, actor, and correlation/idempotency key. Reset must not change Epic synchronization times or credentials. Real scheduling and replay must not both emit the same transition.

## Ownership, escalation, and confirmation — FLOW-001

All durations below are scenario-time operational test settings. They are not medical triage deadlines. Human review remains responsible for any clinical concern.

| Work | Owner | Acknowledgment / next action | On miss |
|---|---|---|---|
| Clinical-contact work | Sarah Jenkins, RN | Acknowledge within 15 minutes; record human contact/disposition within 30 minutes | Keep open and escalate to the configured covering nurse queue |
| Transport navigation | Marcus Vance, MSW | Acknowledge within 15 minutes; record an actionable plan or escalation within 60 minutes | Escalate to the navigation supervisor queue |
| CareLink offer | CareLink Dispatch | Accept/decline within 10 minutes | Expire offer and require coordinator backup selection |
| Patient plan acknowledgment | Camila | Request after complete current plan; reminder/human follow-up after 30 minutes without acknowledgment | Remain unconfirmed; never auto-acknowledge |

- Staff queues can represent covering responsibility without inventing additional fully interactive people or cases. Assignments and changes are explicit events.
- Preserve “My ride was cancelled—and I’m not feeling well today.” exactly. The controlled response carries explicit patient-selected clinical-contact and ride-barrier categories; uncertain free text goes to staff review and cannot be silently interpreted or discarded by a model.
- The clinical concern is staff-only verbatim content. Transportation receives the structured ride barrier and permitted logistics, never the symptom clause or a copied original message. Patient-visible text may include the patient's own submission; caregiver projections exclude it.
- Clinical acknowledgment alone does not resolve clinical work. An authorized nurse must record that contact occurred and explicitly record the controlled workflow disposition. The software supplies no symptom-specific advice, severity assessment, or automatic permission to receive treatment.
- `Continuity plan confirmed` requires: required clinical work has a human-recorded disposition with no open follow-up blocking confirmation; the current outbound, return and backup plans are complete; and Camila acknowledges that same plan version. Open, escalated, stale, failed, or changed dependencies prevent confirmation.
- Permission revocation immediately removes Ana's future access. A changed assignment/appointment invalidates affected prior acknowledgment and reopens work. Actual attendance stays `unknown` until an authorized outcome event.

## CareLink fixture — RIDE-001

- Center: Benson Cancer Center (controlled fixture). Primary provider: `CareLink Partner A`; backup: `CareLink Partner B`. Both are fictional configured local-vendor records, not claims of actual contracts.
- Coordinator: CareLink Dispatch. Seed driver/vehicle identifiers as clearly synthetic internal records; never borrow real driver identities or imply live GPS tracking.
- Service area: server-allowlisted scenario pickup and center destination with a maximum one-way planned route distance of 50 miles. Seed one 28-mile trip. Coordinates/route illustration are fixture data, not proof of a real pickup or ETA; the browser cannot submit arbitrary destinations.
- Operating window: 07:00–18:00 local on scenario business days. Seed pickup window 08:15–08:30, planned arrival 09:15 and arrival deadline 09:30. Route timing is a planning fixture, not a verified provider estimate.
- Mobility: ambulatory, no clinical transport requirement; escort optional for this fixture. Unsupported needs remain unresolved and escalate; no eligibility is inferred from Epic diagnoses or the model.
- Funding: center-sponsored synthetic authorization recorded by Marcus. No real payer/benefit check or actual spending is performed.
- Return plan: will-call coordination window 13:00–16:00 with recorded coordinator and backup owner. It is a logistics plan, not an assertion that treatment ends at a medically determined time.
- Main path: request → primary offer → acceptance → assignment → primary failure → blocker reopened → Marcus records late-recovery exception → backup offer/acceptance/assignment → outbound/return/backup plan → notify patient → acknowledge current version.
- Controlled provider actions are authenticated, persisted, idempotent operator events. `active` means this internal dispatch workflow works; it does not mean a real ride is ordered. No network vendor execution is authorized.
- If both providers fail, retain at-risk/no-option state and escalate. Do not create a success event, change treatment, or silently relax eligibility.

## Outreach and controlled copy — OUTREACH-001

- Automatic learned channel/time selection is now required by human direction. The human selected real SMS/calls to a verified test contact and confirmed Twilio/ElevenLabs accounts purchased. SMS/voice target bounded `live_test` after configuration/security verification; Uber Health remains deferred. A private operator may arm a live run; only replay can advance scenario time. Due actions execute automatically with explicit mode/provenance and live wall-clock limits.
- Synthetic Camila preference: English; previously successful SMS; SMS and voice consent recorded at seed time. Do not infer consent or preferred language from ethnicity or name.
- Supported launch script language: English. Other preferences go to human follow-up; do not improvise clinical translations. Generate broader language groups for model evaluation without claiming supported translated outreach.
- Universal readiness review runs at T−7, T−2 and T−1. At T−2, model priority orders additional supportive review within the daily capacity. Explicit patient requests/barriers enter owned work immediately regardless of model or capacity.
- Score every eligible channel/time pair with the trained engagement model. Camila's prior successful SMS is an input, not an instruction to force SMS first. Choose the highest predicted response probability; after four scenario hours without response, recompute using updated history. If voice wins, schedule and automatically execute the bounded call through the configured adapter. No response/choice may suppress a human-owned concern as T−1 approaches.
- Maximum two automated-planned attempts in 24 scenario hours, at least four hours apart, within 08:00–18:00 local. A quiet-hours case is queued for the next allowed time with staff visibility; an explicit clinical concern still routes immediately for human review.
- Opt-out suppresses new channel attempts immediately without closing existing human work. A failed or unavailable channel creates a human follow-up requirement. Consent changes and channel outcomes are timestamped.

Draft controlled copy (requires task review for truthful content; no clinical approval is claimed):

- SMS: “OncoReady: Is your transportation plan ready for your upcoming appointment? Open your workspace to confirm your plan or request help. Reply STOP to stop text outreach.”
- Voice script: “This is an OncoReady transportation check-in. You can confirm your plan in your workspace or ask your care team to contact you.”
- Consent: “I agree to receive appointment-support texts and calls at my configured contact number. I can change these preferences or opt out. Carrier charges may apply.”
- Unarmed provider-ready feedback: “Outreach plan saved. Sending is not active.”
- Armed controlled-run feedback: “Scheduled from engagement history.” Show controlled-execution provenance in the action evidence/timeline; do not label a replay outcome as actual provider delivery.

No outbound text includes diagnosis, regimen, lab values, clinical concern text, or credentials. `Call me` requests create a human task; they are not evidence a call occurred. Actual clinical scripts remain out of scope. Bounded real test-contact messaging is authorized through OUTREACH-001 and its configuration/security gates.

## Prespecified model acceptance — ML-001

These are proposed synthetic engineering gates, not published clinical thresholds. The architect freezes `model-gate-v1` before final evaluation, records the split manifest and selection procedure, and keeps an immutable final-test result. Do not lower thresholds after seeing the final holdout or select seeds solely to make Camila look convincing.

- Dataset: at least 75,000 encounters, 8,000 fictional patients, 12 fictional centers and 18 months. Pin generator seed `20260921` and document library/runtime and generator versions at implementation.
- Time range: March 2025–August 2026. Train March–December 2025; calibrate January–March 2026; final test April–August 2026. Assign disjoint patient groups to partitions before generation, generate their encounters within their assigned window, and verify no patient or future feature crosses a boundary. Retain repeated encounters within each partition. Explain this synthetic cohort construction in the data card.
- Camila's September signature series is a separate, frozen scenario outside fitting, calibration, tuning, and aggregate final-test metrics. Her output must run through the same feature/scoring pipeline. Show the resulting scores truthfully; no numeric score or forced monotonic trajectory is an acceptance shortcut.
- Capacity `K`: five model-prioritized additional encounter reviews per center per scenario day, after explicit-barrier routing. Rank eligible T−2 encounter snapshots once per encounter; fewer than five eligible records uses available records. Report actual workload and explicit-barrier workload separately. T−7/T−1 are trajectory checks, not duplicate rows in the primary ranking evaluation.
- Baseline ordering: deterministic unresolved practical barriers, then cutoff proximity, then response delay; tie-break by stable encounter ID. Contact-all/contact-none use the same eligible population. For probability metrics include a constant training-prevalence predictor.
- Calibration gate: Brier score better than the constant baseline; calibration intercept between −0.20 and +0.20 and slope between 0.80 and 1.20 on final-test calibrated probabilities. Record curve and bin counts; undefined/nonfinite metrics fail.
- Ranking gate: PR-AUC exceeds final-test prevalence; aggregate precision@K exceeds the deterministic baseline by at least 0.05 absolute; recall@K is no worse than that baseline at the same capacity. Report per-center/day results and aggregate selected positives divided by selected encounters, plus total recovered positives divided by eligible positives.
- Subgroups: rurality, age band, language/channel, digital access, transport need and service line. Predefine bins before generation. Each evaluated primary subgroup must have at least 200 final-test encounters including at least 30 positive and 30 negative outcomes; insufficient support blocks a passing subgroup claim and the gate until a newly versioned evaluation is designed.
- Subgroup rejection rule: subgroup recall@K may not trail its deterministic baseline by more than 0.05 absolute, and subgroup Brier score may not exceed its training-prevalence baseline by more than 0.02. Report uncertainty and counts; these synthetic comparisons cannot establish fairness in real populations. Required clinical/explicit-barrier routing bypasses the model regardless of subgroup or score.
- Artifacts: produce model, calibrator, feature schema, SHA-256 manifest, generator configuration, seeds, evaluation report and data/model card together. Use only locally produced trusted artifacts; no arbitrary upload/deserialization path. Pin the selected manifest in the build/deployment and persist its identity in database metadata.
- Staleness: incompatible schema/generator/model manifest, corruption, or deployment artifact beyond a configured 30-day maximum age measured using actual wall-clock time, not the scenario clock yields `Score unavailable`. Preflight verifies the artifact; deterministic workflow continues. The age is an operational setting, not a scientific guarantee.
- If a final holdout fails, record failure, retain deterministic behavior, and open a new version with a genuinely untouched evaluation set before another acceptance attempt. Reusing a failed test set for tuning cannot become a new final-test pass. The launch ML requirement remains unsatisfied until a valid artifact passes.

## Learned channel/time selection — ML-001 and OUTREACH-001

This human-requested addition replaces deterministic channel selection. Retain the readiness classifier and add one action-conditioned engagement classifier trained offline. No reinforcement-learning service or online exploration is required for the September 25 scope.

- Candidate actions: SMS or bounded scripted voice at the next 09:00, 13:00 or 17:00 center-local slots within the next 24 hours, strictly before the T−4 intervention cutoff. Filter by consent, explicit preferences, opt-out, quiet hours, at least four hours since the last attempt, the two-attempt/24-hour limit and configured channel capability. An available replay adapter counts only for controlled execution, never as live vendor availability.
- Input: dated history of attempted/answered channels, response latency, time-of-day success/nonresponse, recent failed attempts, explicit preferences, appointment-relative time and candidate channel/time. Exclude patient name/ID, future replies, future delivery outcomes, Epic clinical data and post-decision activity. Cold-start uses population patterns and the same constraints, with sparse-history evidence visible.
- Target: a non-opt-out patient response within four hours after the candidate attempt. Provider delivery, answered calls without patient response, and treatment attendance are distinct labels, not successful engagement. Use the same bounded success definition in generator, callback/replay normalization and evaluation.
- Selection: choose the eligible action with highest calibrated engagement probability. Only exact score ties use earliest slot, then stable action ID. Persist all candidate probabilities/exclusions, selected due time, model/calibrator version, feature cutoff and decision version. Never display response probability as clinical or attendance risk.
- Scheduler: use the existing API service plus durable outbox, not another platform service. Recheck consent, kill switch, current appointment/work state, plan version and decision expiry at execution; claim due work transactionally and preserve idempotency across restarts. A decision expires at the end of its selected slot's 15-minute dispatch window or on any invalidating event; missed windows require a fresh decision, not late blind sending.
- Re-evaluate immediately after explicit patient response/opt-out and cancel superseded actions. Nonresponse after the four-hour horizon can produce a new model-selected attempt; exhausted limits or no eligible candidate creates human follow-up. The model must not rank away an explicit request or clinical work.
- Training data: extend the longitudinal generator with timestamped contact decisions, candidate sets, randomized eligible action assignment with recorded nonzero assignment probabilities, and delayed outcomes. Patient-separated chronological partitions remain unchanged. Record only the chosen action's observed outcome as supervised training data; simulator counterfactual probabilities are evaluation-only and never features or training labels.
- The frozen simulator must include heterogeneous channel/time behavior, noise, missing history, nonresponse and drift. Use separate training and final-evaluation random streams. Pin its response-generating logic before fitting; do not rewrite it to produce a passing score or preferred Camila choice.
- Engagement gate: on final held-out randomized action records, Brier score beats the constant training response-rate baseline and satisfies the same prespecified calibration intercept/slope bounds as the readiness model. In a separately seeded frozen synthetic policy evaluation, the mean response probability of selected actions must exceed the fixed preferred-channel/earliest-slot baseline by at least 0.05 absolute at the same eligible population and attempt budget. Report cohort/center/subgroup counts and uncertainty. This measures performance inside the stated synthetic simulator only.
- Apply the existing minimum subgroup-support rules to engagement evaluation. Within each supported subgroup, selected-policy response probability must not trail the fixed-policy baseline by more than 0.05 absolute. Report policy coverage and no-action cases separately; do not drop difficult cases to inflate performance. No supported candidates or undefined metrics cannot count as a passing learned policy.
- Behavioral proof: freeze non-Camila held-out histories with contrasting response patterns before training. Demonstrate different selected channel/time choices based on these histories; renaming identity with the same features leaves results unchanged. Camila traverses the same pipeline, and the presentation shows the actual winning action without overriding it to preserve a scripted SMS-first story.
- Both accepted classifiers/calibrators and schemas are one release bundle with separate targets/evaluation reports. Missing engagement artifact shows `Action selection unavailable` and leaves human follow-up/universal readiness routing functional; rules-based fallback must not be labeled learned selection. Missing readiness output remains `Score unavailable`.

The trained selector, scheduler and **real test-phone execution** are required for launch. Twilio supplies SMS/phone transport; ElevenLabs supplies prepared, reviewed voice audio. Provider setup and live acceptance follow [OUTREACH_TEST_DELIVERY.md](./operations/OUTREACH_TEST_DELIVERY.md). Replay alone cannot satisfy the selected requirement.

Live dispatch uses future actual wall-clock windows; accelerated scenario time never releases real backlog. Preserve the live ledger/consent/rate limits across reset. Keep four actual hours between attempts and record steps ahead of the presentation if needed; do not fake provider time to fit the video. Separately prove each channel with frozen eligible histories rather than forcing the model to pick both in one run.

## September 25 execution target

| Date | Target integrated outcome | Work that can proceed alongside it |
|---|---|---|
| September 21 | RAIL architecture/contracts, scaffold and deployment foundation | Secure Epic prerequisites, inventory preparation, and synthetic-policy review |
| September 22 | RAIL reviewed/integrated; ACCESS; EPIC authorization/inventory progress | FLOW contract planning, model gate/split design, bounded provider fixtures |
| September 23 | EPIC and FLOW integration; event/feature contracts frozen | Isolated readiness/engagement pipelines and RIDE work against approved contracts |
| September 24 | Both ML artifacts and RIDE acceptance, automatic OUTREACH integration, EVIDENCE completion; aim to freeze candidate by 18:00 center time | Continuous verification, security/final reviews, rehearsal and operator documentation |
| September 25 | Deployment preflight, primary/recovery rehearsal, backup recording and delivery | Repair only demonstrated release blockers, followed by fresh affected verification |

The 18:00 freeze is an agent-planned internal target; the event's exact submission/timezone requirements still need organizer/user evidence before treating them as a hard cutoff. Integrate/review small changes continuously. Missed gates remain visible; never mark incomplete work done to satisfy a date. The human has retained the full scope. Any necessary scope tradeoff goes back to the human with the specific missed outcome and remaining work.
