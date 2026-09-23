# OncoReady — current product and demo scope

OncoReady connects clinical context with practical barriers that can interrupt cancer treatment, gives each barrier an accountable owner, and makes the coordination plan visible to the patient, caregiver and care team. The signature story is: **the chart describes the treatment; OncoReady shows what could keep the patient from receiving it and coordinates the response.**

## Current delivery state

The two-day implementation sprint is closed. Its [closeout](./SPRINT_CLOSEOUT.md) names what shipped, which task records remain open and which external or presentation gates still need evidence. The seven-minute product segment follows a separate three-minute problem/solution introduction; use the [timed presenter script](./operations/SEVEN_MINUTE_PRODUCT_DEMO.md).

The deployed product at `https://app.oncoready.me` uses a polished React/TypeScript frontend and an existing FastAPI/PostgreSQL foundation. The selected patient story is a controlled, synthetic scenario. It uses actual **captured Epic FHIR Sandbox JSON** for read-only clinical context, saved outputs from a model demonstrated on **synthetic data**, and fictional CareLink ride activity. None of those prepared views synchronizes with a production EHR or dispatches a real ride.

One September 22 test call completed with an audible ElevenLabs agent exchange. The one SMS attempt was **undelivered**. On September 23, the new sequential-call path placed one test call that rang, but the recipient rejected it while occupied; Twilio reported `completed`, and no audible exchange was confirmed for that attempt. The deployed backend now permits a new bounded call window after a confirmed final status. No next window is armed. A stage call still needs fresh authorization and current recipient consent.

## Selected journey

1. Open the public story and enter the prepared staff workspace. Public pages contain no patient record. Two existing pricing plans remain a buyer-facing illustration; checkout is disabled.
2. Open Camila Lopez. Show the at-risk graph, captured Epic source drawer and original capture time. Inspect saved T−7/T−2/T−1 insights, Why flagged? factors and the read-only transportation what-if.
3. Open prepared message history with scheduled/sent text, patient replies and follow-up changes. Camila submits: “My ride was cancelled—and I’m not feeling well today.” Her words are preserved verbatim.
4. The shared scenario creates separate nurse and transportation work. Sarah Jenkins records contact and a human disposition. Marcus Vance handles the ride plan with named next action, target time and waiting state.
5. Show the previous CareLink dispatch replay, then the current fictional primary failure and backup recovery. Record pickup, arrival, return, logistics contact and backup owner. Ana sees only permitted logistics and marks the current plan seen.
6. Camila reviews the same current plan and acknowledges its version. The graph reaches **Continuity plan confirmed** only when the human clinical disposition, complete current transportation plan and current patient acknowledgment exist. The closing receipt opens the supporting scenario events. Treatment attendance remains unknown.
7. At the planned presentation moment, place a separately authorized real call through the protected private control and show actual provider status. The phone exchange does not automatically update the prepared care workflow. Start Video Part 2 only after actual completion and audible confirmation, or use the disclosed failure path.

## Product and safety boundaries

- Prepared local persona selection is not enterprise authentication. The live call/SMS API has a separate server-side operator boundary, fixed consenting recipient, one-shot SMS ledger, sequential call history and server-held credentials.
- The model illustrates practical readiness on synthetic data; it is not a calibrated clinical probability, treatment decision or evidence of improved outcomes. Clinical concerns go to a human nurse.
- CareLink's visible providers, driver and replay are fictional. No live GPS, vendor dispatch or funded trip is claimed.
- Caregiver and transportation views receive only the scenario logistics they need. Patient acknowledgment is separate from caregiver visibility.
- Epic Sandbox capture is read-only and saved with provenance. Do not claim a hospital deployment, Epic partnership, production Epic access, writeback, HIPAA compliance, real patients, customers or clinical validation.
- A completed telephone call is not patient care-plan acknowledgment. Provider submission is not SMS delivery. The September 22 SMS was not received.
- Scenario reset and playback never arm or send a provider action. Each further real call requires its own finite window, purpose and current-consent confirmation; SMS remains one-shot. A final provider call status does not prove an audible exchange.

### Product copy

The user interface speaks as a finished product ([POLISH-001](./features/POLISH-001.md)). It carries no demo, synthetic, fictional, prepared, scenario or illustrative labels; the presenter discloses the controlled nature of the story verbally before the walkthrough. The boundaries above remain true: new copy may remove qualifiers but must not add claims such as live sync, GPS, real dispatch, HIPAA compliance or clinical validation. The Epic surface reads **Connected to Hospital Epic Sandbox**, meaning read-only FHIR R4 data retrieved from the Epic Sandbox with its original retrieval time and no writeback.

## Source map

Read only what the task needs:

| Need | Source |
| --- | --- |
| Sprint result and remaining gates | [SPRINT_CLOSEOUT](./SPRINT_CLOSEOUT.md) |
| Stage timing, spoken cues and fallback | [SEVEN_MINUTE_PRODUCT_DEMO](./operations/SEVEN_MINUTE_PRODUCT_DEMO.md) |
| Feature acceptance | `docs/features/<TASK-ID>.md` and `.ai/tasks/<TASK-ID>/task.json` |
| Architecture and locked appearance | [SYSTEM](./architecture/SYSTEM.md) and [DESIGN_SYSTEM](./design/DESIGN_SYSTEM.md) |
| Live test evidence | [OUTREACH-001-LIVE-EVIDENCE](./operations/OUTREACH-001-LIVE-EVIDENCE.md) |
| API shape and actual behavior | `contracts/` and code |

Future enterprise identity, ongoing Epic synchronization, production ML, automatic outreach, real ride dispatch and validated outcome claims remain deferred. Preserve the approved visual system when changing the selected product surfaces.
