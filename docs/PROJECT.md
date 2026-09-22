# OncoReady Product Definition

## Current delivery decision — September 21, 2026

**Confirmed by the human:** Complete the remaining demonstration scope in **two working days**. Deliver a finished-looking frontend that communicates OncoReady's vision to potential funders. The presentation primarily uses prerecorded product footage and playback, with **one real SMS and one short live telephone call** to a consenting test contact. Backend work is limited to what those actions and the selected visible journey need.

This decision supersedes the earlier full-product launch scope, production-model requirement, automatic outreach scheduler, and multi-day sprint sequence. September 25 remains the previously recorded event target; the two-day build window is relative to implementation start, not permission to use all remaining calendar days. Exact presentation time is still unconfirmed.

**Current evidence:** CORE-001, LAND-001, UI-001 and RAIL-001 are DONE. The remaining seven tasks are PROPOSED. The existing frontend and Railway/API/PostgreSQL foundation are reusable. This planning revision does not establish that Epic capture, communication delivery, ML assets or the new journey are implemented.

## Product identity and users

**OncoReady — Treatment Readiness and Continuity Loop**

OncoReady connects clinical context with the practical barriers that can interrupt cancer treatment, gives each barrier an accountable owner, and makes the continuity plan visible to patients, caregivers and care teams.

Primary users: patient Camila Lopez, caregiver Ana Hernandez, nurse Sarah Jenkins, navigator Marcus Vance, and CareLink Dispatch. These names define the controlled story, not actual customers or evidence of a hospital relationship. Only Camila's journey needs to be fully playable; other queue records are contextual.

The signature story remains: **The chart describes the treatment; OncoReady shows what could keep the patient from receiving it and coordinates the response.**

## Presentation and visual quality

The current UI and [design system](./design/DESIGN_SYSTEM.md) remain human-approved and visually locked. Preserve tokens, theme behavior, typography, spacing, component styling, logo, navigation, motion and responsive behavior. New content must look native to this system. No redesign is authorized.

Reduce implementation breadth, never the finish of the recorded surfaces: readable copy, coherent data, working chosen controls, intentional loading/error/success states, keyboard access, and clean transitions. Capture matching before/after screenshots. Avoid exposed debug controls, dead links, unfinished panels and fake success messages.

Public product language describes OncoReady's value and actual capabilities. Do not call it a toy, portfolio project or cheap demo. A concise presenter disclosure and source/evidence details explain prepared data, simulated provider activity and live delivery without covering the product in demo badges. Do not claim production Epic access, Epic writeback, clinical validation, real customers, HIPAA compliance or measured patient outcomes.

## Hero journey and visible result

1. Open the polished public story and enter the prepared staff workspace.
2. Open Camila and inspect clinical context from an **actual Epic Sandbox JSON capture**, including source and capture time.
3. Show prepared T−7/T−2/T−1 insights, open Why flagged?, briefly compare the isolated transportation what-if, then show an outreach history containing scheduled SMS, sent message text, patient reply text and follow-up changes. This prepared history demonstrates the automated workflow without requiring its scheduler engine.
4. Show the one-off SMS and short live call at the selected presentation moment; real outcomes come from provider evidence.
5. Submit the prepared patient reply: “My ride was cancelled—and I’m not feeling well today.”
6. Create separate nurse and transportation work. The nurse records contact and a human disposition; no software interprets symptoms.
7. In CareLink, play a previous scenario trip through dispatch acceptance, driver assignment and timestamped status updates. Then return to the current trip, show its failure, recover with the backup, and record outbound, return and backup logistics.
8. Ana sees and marks the current permitted logistics plan as seen. Camila reviews pickup, return and contact information together and acknowledges that plan.
9. The graph visibly resolves to **Continuity plan confirmed**. A compact receipt links addressed barriers, the backup arrangement and patient acknowledgment to the matching timeline events.

Confirmation is a coordination outcome, not medical clearance or proof of treatment attendance. The call does not need to collect symptoms, conduct a conversation, update every view automatically, or trigger the whole story. The presenter can advance the prepared journey separately.

## Approved impact refinements

**Confirmed:** The human approved all five UI refinements and the ML what-if comparison for these same two working days. All six are MUST-DEMO, implemented inside the existing screens.

| Refinement | Required visible behavior | Task |
|---|---|---|
| Before/after graph | Treatment at risk becomes Continuity plan confirmed through real scenario actions; each affected node visibly updates | FLOW-001 |
| Why flagged? | Open dated factors, feature values and a supportive next action beside the exported score | ML-001 |
| Ownership and next action | Every selected open item shows who owns it, what happens next, by when and what it is waiting on | FLOW-001 |
| Patient-facing finish | Current pickup, return arrangement, contact, caregiver seen/pending and patient acknowledgment together | RIDE-001 |
| Closing receipt | Current-scenario barrier resolution, backup arrangement and patient acknowledgment link to supporting events | EVIDENCE-001 |
| ML what-if | Compare baseline versus transportation available using two actual notebook outputs; never mutate the real plan | ML-001 |

This allocates the existing feature blocks to these refinements ahead of optional keypad input, extra recording angles and a FHIR example. No additional page family, analytics dashboard, global visual pattern, live inference service or recording-time cut is authorized. The schedule remains an estimate; raise any missed required outcome rather than silently dropping it.

## Two-day cut line

| Area | MUST-DEMO | Deferred beyond this window |
|---|---|---|
| Frontend | One complete, polished, clickable story; consistent state; reset and recording checkpoints | Every menu, patient, setting and workflow |
| Epic | Retrieve needed real Sandbox resources once; save reviewed JSON; map them into the staff UI with provenance | Runtime SMART lifecycle, continuous sync, broad resource inventory, production connectivity, writeback |
| ML | Synthetic dataset, runnable lightweight training/evaluation notebook, exported predictions/factors and matching UI | Production model pipeline, online inference, calibration/SHAP gates, learned channel selection, clinical effectiveness claims |
| SMS/voice | Automatic-outreach history with message/reply detail; one real SMS and one short live call; protected delivery and verified outcomes | Automatic scheduler, outbox orchestration, adaptive retries, long conversation, clinical dialogue |
| CareLink | Previous-trip dispatch replay plus current request → assignment → failure → backup → acknowledgment | Real dispatch, vendor callbacks, fleet operations, GPS, marketplace and Uber execution |
| Workflow | Shared frontend scenario state, human actions, derived graph/timeline/counts | Full event-sourced backend, persistent multiuser workflow, broad SLA engine |
| Access | Prepared synthetic personas and polished navigation | Enterprise auth, real social OAuth, provisioning, recovery email |
| Evidence | Source drawer, coherent scenario counts, dataset/notebook access, recording and fallback | Validated FHIR export, production analytics, ROI/outcome claims |
| Infrastructure | Reuse the completed foundation for the minimal protected live adapter | New platform, migration campaign, queues and additional services |

**NICE only after every required item passes:** a short keypad acknowledgment, additional recording angles, optional prepared FHIR example with accurate status. No NICE item displaces rehearsal or UI finish.

## Minimum technical shape

Existing Railway hosts are **https://app.oncoready.me** (web) and **https://api.oncoready.me** (API), confirmed by the human. Reuse them; verify current HTTPS/origin/callback behavior during implementation preflight.

Reuse the existing React/TypeScript frontend, workflow state and components. One versioned scenario contains prepared checkpoints and immutable source metadata. All visible workflow surfaces read the same state; switching personas preserves the journey, and operator reset restores the same start.

Frontend scenario state may be in memory with small local persistence if useful. It is not authorization. Browser assets may contain only synthetic or redistributable, reviewed Sandbox test data. Credentials, actual recipient numbers, live delivery controls and provider result verification remain server-side. Reuse the FastAPI service and existing database for the minimal one-off delivery ledger; do not expand the backend for simulated CareLink or prepared scores.

Prepared outreach history and the previous-trip dispatch replay have explicit scenario provenance and original event times. Dispatch replay has a separate trip identity and cannot mutate the current ride, acknowledgment or live-delivery ledger. Show its moving status feed and optional illustrative map without claiming current GPS or real vendor dispatch.

Keep actual Epic source dates, scenario dates and real delivery timestamps separate. Save only needed Sandbox data; exclude tokens, credentials and unexpected sensitive content. No runtime Epic connection is needed during the presentation.

See [SYSTEM](./architecture/SYSTEM.md) and [ADR-0004](./adr/ADR-0004-two-day-demo-scope.md).

## Acceptance and verification

- Starting from the reset checkpoint, the selected clicks complete the hero journey without dead ends; all views and scenario counts agree. Verify with a browser walkthrough and focused state-transition checks.
- Opening the clinical source drawer displays only captured fields with resource provenance and capture time. Missing data stays absent. Verify the capture manifest and the rendered fields.
- Dataset and notebook train/evaluate a small offline demonstration model on synthetic data and export the actual scenario predictions/factors shown in the UI. Verify clean notebook execution, held-out metrics and exact export/UI agreement. No runtime model service is required; do not present synthetic performance as clinical validation.
- The consenting test phone receives the real SMS and rings for the live call with audible prepared audio. Verify each channel separately; playback cannot pass this criterion.
- Double-click, timeout, reset and callback retry cannot produce uncontrolled duplicate sends; invalid requests cannot choose a recipient or submit arbitrary content. Verify the bounded delivery boundary and security review.
- All six approved impact refinements appear in the recorded journey and pass their task acceptance criteria. The what-if comparison is read-only with respect to the actual scenario; caregiver seen state never substitutes for patient acknowledgment.
- A failed ride, unresolved clinical work or missing current-plan acknowledgment prevents confirmation. Verify these three failure paths.
- Opening historical outreach shows the scheduled action, exact sent text, reply, original times and follow-up change. Replaying a prior CareLink trip advances its dispatch feed and can restart without sending anything or changing the current trip. Verify fixture/timeline agreement, pause/restart and network-disabled playback.
- The recording, backup clip and playback run with audible sound and locally available required assets; two full rehearsals succeed. Compare UI against the approved visual baseline.

## Delivery and stop condition

[LAUNCH_SPRINT_PLAN](./LAUNCH_SPRINT_PLAN.md) is the two-day work order and [DEMO_RUNBOOK](./operations/DEMO_RUNBOOK.md) is the recording/live script. Update the existing seven proposed specs and task records; do not invent completed implementation or reopen completed tasks.

The demo release is ready when the required journey, actual Epic capture, prepared ML files, one real SMS, live call proof, visual checks and rehearsal pass. Follow the existing repository lifecycle for changed implementation; required verification, scoped security review and human merge still apply. Finishing this window does not assert enterprise readiness.

## Assumptions and open prerequisites

- **Confirmed:** One real SMS plus a live call; use actual Epic Sandbox data captured into JSON; ML runs offline in a synthetic-data notebook and the UI uses its saved outputs.
- **Prior human confirmation:** Twilio and ElevenLabs accounts purchased. Sender capability, secure credentials, allowed recipient, consent and callback access still need verification.
- **Open prerequisite:** Locate and use authorized Epic Sandbox access. No captured JSON is tracked at this revision. Do not ask the human to paste secrets into chat.
- **Assumption:** A short nonclinical audio call, optionally with one keypad action, is sufficient. Target 20–40 seconds of content and a 60-second hard duration cap.
- **Assumption:** SMS is sent once during a scheduled rehearsal/recording and its genuine received result can be shown in the video; only the call must happen on stage. Both may be live if time and consent permit.
- **Future product:** Durable workflows, real identity, production model development/validation, ongoing Epic sync and operational provider integrations remain a post-funding roadmap, not two-day release gates.
