# OncoReady — seven-minute product demonstration

**Use:** This product demonstration starts immediately after another presenter has spent approximately three minutes on the problem and OncoReady's proposed solution. This document covers only the following **7:00**. It is a presenter script and stage cue sheet, not proof that missing media or a second live call is ready.

**Story:** Camila Lopez has an upcoming infusion. A transportation problem and a concern she reports in her own words threaten the plan. OncoReady makes the work visible, assigns it to people, coordinates a recovered ride plan, and records Camila's acknowledgment. It does not determine medical clearance or whether she attended treatment.

## Roles and stage setup

| Role | Responsibility |
| --- | --- |
| Product presenter | Speaks the script and advances Part 1 and Part 2. |
| Demo operator | Prepares the private `/operator/live` control off screen, places **one** authorized call only when the new event window is ready, and watches actual provider status. This may be the product presenter if the switch is rehearsed. |
| Phone participant | Holds the consenting test phone on speaker, answers once, says one short sentence, then lets the agent finish. |
| AV operator | Starts and pauses the local videos, confirms speaker audio, and keeps the private token out of the projected image. |

Use the actual app at `https://app.oncoready.me` for the product views and `https://app.oncoready.me/operator/live` for the private call control. Videos should be local files on the presentation laptop with a second local copy. Show the actual call status; never edit a provider status into the live feed.

## Seven-minute cue sheet

The times are wall-clock targets. Part 1 is an edited recording of real product interactions; Part 2 continues the same scenario after the live-call interlude. Keep a visible timer for the presenter. The quoted lines are ready to say, but speak naturally and leave the indicated pauses for the screen.

| Clock | Screen and action | Presenter words / cue |
| --- | --- | --- |
| **0:00–0:20** | Other presenter hands over. Open the public story, then start **Video Part 1**. | “You have heard the problem and our approach. Let me show what happens to one treatment plan when the barriers become visible.” |
| **0:20–0:55** | Public entry → staff workspace → Camila's **Treatment Readiness Graph**, initially **Treatment at risk**. | “This is Camila's controlled scenario. Her infusion is on the calendar, but the graph shows that the practical plan is still at risk. We start with the treatment event and the work that must be owned around it.” |
| **0:55–1:35** | Open the Epic tab and **View source details**. Hold on source, capture time and read-only fields. | “The clinical context here comes from the hospital Epic Sandbox over FHIR R4. It is read-only—OncoReady never writes back—and the source drawer preserves the original resource identifiers and retrieval time.” |
| **1:35–2:15** | Insights: T−7, T−2, T−1; open **Why flagged?**; toggle the transportation what-if and return to baseline. | “These readiness scores come from a small model demonstrated on synthetic data. We can inspect the factors behind a saved score and compare the transportation input. The comparison changes only the displayed model output; it does not change Camila's actual plan or make a clinical decision.” |
| **2:15–2:55** | Graph timeline: open the first prepared scheduled message and reply thread. Then switch to Camila's patient check-in, where her later prepared reply is ready to submit: “My ride was cancelled—and I’m not feeling well today.” | “The earlier check-ins and replies are prepared scenario history. You can see when a message was scheduled, its text, Camila's reply, and the follow-up change. Now Camila reports a cancelled ride and that she is not feeling well. Her exact words are preserved when she submits them.” |
| **2:55–3:35** | Submit the prepared reply; show separate nurse and transportation tasks. Accept clinical ownership and record the human disposition. **Pause Part 1**. | “One reply opens two different responsibilities. Sarah, the nurse, owns contact and a human disposition; Marcus, the navigator, owns transportation. Each has a next action, target time and waiting state. The software does not interpret Camila's symptoms or grant medical clearance.” |
| **3:35–4:45** | Switch briefly to the real private control. Operator checks the new arm and allowance, then presses **Place live call once**. Show `initiating → ringing`. Phone participant answers on speaker, speaks one sentence, and pauses. Wait for actual `completed`. | Presenter: **“Let's see our core feature: live call now.”** Agent gives its configured transportation check-in opener. Participant: **“My ride fell through, and I need help getting to my appointment.”** Pause for the agent's short reply. Presenter, only after the call ends and the participant confirms it was audible: **“That was a real call. Twilio reports it completed; the care-plan story continues separately.”** |
| **4:45–5:40** | Start **Video Part 2**. Show previous CareLink trip replay with advancing event feed; exit. Show current request → primary assignment → failure → backup selection and saved outbound, return, contact and backup details. | “The previous-trip sequence is a scenario replay, clearly separate from today's plan. In the current plan, the first fictional provider becomes unavailable. The blocker reopens. Marcus selects the backup and records the pickup, return, logistics contact and backup owner. No real ride is dispatched from this screen.” |
| **5:40–6:25** | Ana sees the current logistics plan; Camila opens **Review & Confirm Plan**, sees the same pickup, return and contact, then acknowledges the current version. | “Ana receives only the logistics view she is permitted to see. Camila sees the complete current plan and acknowledges that version herself. Caregiver visibility does not substitute for patient acknowledgment.” |
| **6:25–6:50** | Return to staff Graph: **Continuity plan confirmed**. Open the three receipt items and their supporting timeline events. End Part 2 on the graph. | “The graph now moves from treatment at risk to continuity plan confirmed. The receipt links the human disposition, backup arrangement and Camila's acknowledgment to the exact scenario events. Attendance is still unknown.” |
| **6:50–7:00** | Hold the closing graph or logo. Hand back to the main presenter. | “That is the continuity loop: context, owned action, and a plan the patient can see. We are ready for your questions.” |

**Call timing:** The live segment has a 70-second budget. The agent is configured for a short nonclinical exchange and a 60-second conversation cap; the previous confirmed test lasted 23 seconds. Do not fill extra time by making a second call. If the call runs long, shorten the Part 2 narration while keeping the recovery, acknowledgment and closing receipt visible.

## Truthful presentation rules

The product screens carry no demo labels ([POLISH-001](../features/POLISH-001.md)). Disclose the controlled story verbally before the walkthrough, and keep the rules below in what you say.

- At the first source view, identify the Epic information as **read-only data from the hospital Epic Sandbox**. Do not say it is synchronizing live during the talk or connected to a production hospital.
- Describe the ML view as saved outputs from a model demonstrated on **synthetic data**. Do not call the score a clinical risk probability or claim measured patient outcomes.
- Describe the scheduled-message history and CareLink replay as **prepared scenario activity**. The current CareLink actions use fictional providers and do not order a real ride.
- The September 22 SMS test was **undelivered**. Do not show a received-SMS shot or say “the SMS arrived” unless a later separately authorized test is actually delivered and its evidence is reviewed. If that happens, show the redacted phone receipt separately from the prepared timeline. Do not send an SMS on stage merely to fill time.
- The phone call is the only planned live provider action in this seven-minute segment. Its completion proves a completed call, not that the phone participant acknowledged a care plan or that the prepared workflow automatically changed.
- “Continuity plan confirmed” is a coordination outcome. Do not imply medical clearance, treatment attendance, customers, deployment at a hospital or clinical effectiveness.

## Live-call go / no-go and fallback

**Before opening the doors**, verify all of the following on the exact presentation laptop and audio path:

1. Video Part 1, Video Part 2 and their local backups exist, play with readable text and audible sound, and match the current UI. The closing receipt and original source time must be legible at the projector resolution.
2. The consenting participant and phone are present; speaker volume and microphone pickup are tested. Keep the operator token off the projected surface until it is masked in the private field.
3. A **new, separately authorized, bounded event call window** has been implemented and verified. The September 22 one-shot test consumed the existing window; resetting the prepared story does not restore it. Confirm the private screen says the event call can be placed before promising a live call.
4. `https://app.oncoready.me` and the API health endpoint respond, and the private control can read status. Do not press a live action during ordinary rehearsal.
5. Two human-paced rehearsals complete the full seven-minute sequence, including a timed switch into and out of the private control, without a provider send. The automated browser passes verify the product click path, not the stage's video and audio timing.

**If no new call window is ready:** Do not press the disabled call action. Say: “Our earlier real test call completed, but this presentation window is not armed. Here is the verified product workflow.” Advance Part 2 and use the remaining time to inspect source and receipt evidence or take a question. This is an honest product demonstration; it does not count as a stage call.

**If a newly authorized call fails or stays unknown:** Leave the actual status visible briefly. Say: “The live call did not complete on stage. Here is the recorded rehearsal call.” Play a **real, locally available call recording only if one has been captured and reviewed**. If no such recording exists, show the sanitized September 22 test evidence and continue Part 2. Do not claim the backup was live and do not retry repeatedly.

**If Part 2 playback fails:** Continue through the deployed app using the prepared scenario checkpoint and the same sequence: CareLink replay → current recovery → Ana → Camila → Graph receipt. The browser path passed twice in automated rehearsal, but this fallback still needs a timed human rehearsal.

## Recording split and operator marks

- **Part 1 in-point:** public OncoReady story. **Out-point:** clinical and transportation responsibilities visible after the prepared reply and nurse action. Export target approximately **3:15**, leaving live commentary to cover the transitions.
- **Part 2 in-point:** previous CareLink replay. **Out-point:** confirmed graph and evidence-linked receipt. Export target approximately **2:05**. Keep the same scenario state, plan version and visible dates across both parts.
- Add an AV slate outside the audience video with exact filenames, duration, frame size, audio route and checksum. No filenames or checksum are assumed in this document because the media is not yet in the repository.
- On the presenter cue sheet, mark **PAUSE PART 1 → OPEN PRIVATE CONTROL → WAIT FOR `completed` AND AUDIBLE CONFIRMATION → PLAY PART 2**. The operator must not treat a historical `completed` result from the September 22 test as this event's completion.

## Sources for the presenter

- [Product scope](../PROJECT.md)
- [Sprint closeout and open presentation prerequisites](../SPRINT_CLOSEOUT.md)
- [Sanitized live-call and SMS test evidence](./OUTREACH-001-LIVE-EVIDENCE.md)
