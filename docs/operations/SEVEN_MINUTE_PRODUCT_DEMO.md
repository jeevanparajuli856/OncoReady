# OncoReady — seven-minute product demonstration

**Use:** This segment starts right after another presenter has spent about three minutes on the problem and OncoReady's approach. It covers the following **7:00**. It is a presenter script and stage cue sheet, not proof that the media or a live call is ready. Check the go / no-go list first.

**Story in one line:** Camila Lopez has chemotherapy tomorrow. Her ride falls through and she doesn't feel well. In seven minutes the audience watches OncoReady turn one message into owned work, a recovered ride and a plan Camila confirms herself.

**The three things that make this demo land.** Say them up front and deliver each one:

1. **Real hospital data.** Camila's clinical context comes from the Epic FHIR Sandbox, read-only, and the source drawer proves it.
2. **A real phone call.** The outreach agent calls a real phone on stage.
3. **A real vendor handoff, live.** A transport vendor taps a button in CareLink, and the navigator's screen changes in front of the audience.

Open the whole segment by telling the audience this is a product demo and the full product ships later. The vendor, drivers and prepared history are fictional. The software, the Epic Sandbox data, the ReadySignal model and the call are real.

## Roles and stage setup

| Role | Responsibility |
| --- | --- |
| Product presenter | Speaks the script, advances the videos and runs the live CareLink moment (or hands it to the demo operator). |
| Demo operator | On demo day, turns `DEMO_CALL_BUTTON` on in Railway and confirms **Call Camila** is enabled. Pre-stages the CareLink windows. After the talk, turns the switch off and revokes the operator token. |
| Phone participant | Holds the consenting test phone on speaker, answers once, says one short sentence, then lets the agent finish. |
| AV operator | Plays and pauses the local videos, switches the projector between video and the live browser, and confirms speaker audio. |

Use the deployed app at `https://app.oncoready.me`. The call is placed from **Camila's case → Outreach → Call Camila**, inside the product; no token is typed on stage. The private `https://app.oncoready.me/operator/live` page stays off screen as a backup. Keep the videos as local files on the presentation laptop, plus a second local copy. Show actual call status only; never edit a provider status into the live feed.

### Pre-stage the live CareLink windows (before doors open)

Both windows must be in the **same browser profile**, not incognito, because they share the scenario through local storage.

1. **Window L (left half of the screen):** sign in as Camila (`abcp@oncoready.me`), tap **Start Readiness Check** and **Submit Readiness Report**. Switch Workspace → **Care Navigator (Marcus Vance, MSW)** → sidebar **Transportation**. Tap **Request ride**, then **Assign Crescent Lantern Medical Rides · via CareLink**. The panel reads "Waiting for Crescent Lantern Medical Rides to accept in CareLink". Then open **Command Center → Review Case → Outreach** so Window L starts on Camila's outreach history, with **Call Camila** enabled.
2. **Window R (right half):** open `https://app.oncoready.me/carelink`, sign in as the vendor (`abct@oncoready.me`). The **CareLink by OncoReady** trip board shows **New trip offer** for Camila L. with the street route.
3. Zoom both windows so the status chips are readable from the back row. Don't touch either window again until the cue.

## Seven-minute cue sheet

Times are wall-clock targets. ★ marks a moment to slow down and let the room see it. **Part 1** and **Part 2** are edited recordings of real product interactions. The call and the CareLink moment are live.

| Clock | Screen and action | Presenter words / cue |
| --- | --- | --- |
| **0:00–0:20** | Hand-over. Start **Video Part 1** on the public story. | “Tomorrow at ten, Camila Lopez has her fourth chemotherapy infusion. Today her ride falls through, and she doesn't feel well. Watch what happens next. Three things you'll see are real: hospital data, a phone call and a vendor handoff.” |
| **0:20–0:50** | Staff workspace → Camila's **Treatment Readiness Graph**, reading **Treatment at risk**. | “The infusion is booked. But the graph says what the calendar doesn't: the plan around it is at risk, and until now nobody owned the gap.” |
| **0:50–1:20** ★ | Epic tab → **View source details**. Hold on the source, the retrieval time and "read-only". | “This is real data from the Epic FHIR Sandbox, retrieved over FHIR R4. It's read-only; we never write back. Every value carries its original resource ID and retrieval time. Nothing here was typed in for the demo.” |
| **1:20–1:50** | Insights: T−7 → T−2 → T−1. Open **Why flagged?**, toggle the transportation what-if, return to baseline. | “This is ReadySignal, our readiness model. From a week out to the day before, Camila's signal climbs, and **Why flagged?** shows exactly why, including an unresolved barrier. Flip transportation in the what-if and you see how much that one fix moves her signal. ReadySignal explains the risk; people still make the call.” |
| **1:50–2:30** | Timeline: open one prepared scheduled message and its reply. Switch to Camila's check-in. Her reply is ready: “My ride was cancelled, and I’m not feeling well today.” | “OncoReady has been checking in with Camila; this history is prepared. Now her real problem arrives, in her own words, and we keep those words exactly.” |
| **2:30–3:00** ★ | Submit the reply. Two separate tasks appear, nurse and transportation. Sarah accepts ownership and records a human disposition. **Pause Part 1.** | “One message, two jobs, two owners. Sarah, the nurse, owns the symptom and records a human decision. Marcus, the navigator, owns the ride. Each task has a next step and a deadline. The software never reads her symptoms or grants clearance. People do.” |
| **3:00–4:05** ★ | **OUTREACH + LIVE CALL.** Projector to Window L, on Camila's **Outreach** tab. Point to the history: the T−7 voice check-in, the T−2 and T−1 texts, each with its ReadySignal score and the decision it triggered. Click **Call Camila → Call now**. The status shows **Dialing… → Ringing…** The participant answers on speaker, says one sentence, pauses. Wait for **Call completed**; the call joins the history. | “Our outreach engine has been working this case all week. ReadySignal decided when to reach out: a voice check-in a week before, then texts as her signal climbed. Every reply became a decision, routed to the right owner. The engine does this on its own, but Marcus can also reach out himself. **Let's call Camila now.**” *(Click.)* Agent opener. Participant: **“My ride fell through, and I need help getting to my appointment.”** Let the agent reply. After **Call completed** and the participant confirms it was heard: **“That was a real call from inside OncoReady. Now watch the ride get fixed.”** |
| **4:05–5:10** ★ | **LIVE CARELINK.** In Window L click sidebar **Transportation**, then show both windows side by side. **R:** tap **Accept trip**. **L:** point to **Accepted in CareLink**. **R:** **Report unavailable** → reason *Vehicle out of service* → **Report unavailable**. **L:** the status flips to **Primary unavailable**, recovery reopens. **L:** **Select Magnolia Wayfare Transport · via CareLink** → **Save recovered logistics**. | “On the right is CareLink, our portal for local transport vendors, many of whom run on phone calls, not software. The vendor accepts the trip, and Marcus sees it instantly on the left. *(Tap.)* Now their van breaks down. *(Tap.)* Marcus doesn't find out tomorrow morning when Camila is waiting at the curb. He knows now. He reassigns the backup and records the pickup, return and contact. *(Save.)* The vendor and drivers are fictional; nothing here books a real ride. The same adapter layer is built for API partners like Uber Health, which plugs in once a contract and credentials are in place.” |
| **5:10–6:30** | Start **Video Part 2**. Ana (caregiver) sees only the logistics plan and marks it seen. Camila opens **Review & Confirm Plan** and acknowledges the current version. Back to the staff Graph: **Continuity plan confirmed**. Open the three receipt items and their timeline events. | “Ana, her daughter, sees the ride plan and nothing clinical. Camila sees the same plan and confirms it herself; a caregiver can't do that for her. *(Graph turns.)* Treatment at risk is now continuity plan confirmed. Every step links to the exact event behind it: the nurse's decision, the backup ride, Camila's acknowledgment.” |
| **6:30–7:00** ★ | Hold the confirmed graph. Hand back to the main presenter. | “One message. Two owners. A vendor handoff in real time. And a plan Camila confirmed herself, the day before her chemo. We don't know yet that she made it to the chair. We made sure nothing stood in her way. Thank you. We're ready for your questions.” |

**Timing budget:**
- **Live call:** 65 seconds. The agent is capped at a 60-second nonclinical exchange; the previous confirmed test lasted 23 seconds. Never make a second call to fill time.
- **CareLink moment:** 65 seconds and six taps. If either live segment runs long, trim the Part 2 narration to its first and last sentences, but keep the confirmed graph and receipt on screen.

## Truthful presentation rules

The product screens carry no demo labels ([POLISH-001](../features/POLISH-001.md)). The disclosure is spoken: the opening line names what is real, and the CareLink line names what is fictional.

- **Epic:** call it **read-only data from the Epic FHIR Sandbox**. Don't say it syncs live during the talk or is connected to a production hospital.
- **ReadySignal:** present it as OncoReady's working readiness model. The demo disclosure at the start covers its training data, so there's no need to mention it on stage. Don't call the score a clinical risk probability, and don't claim measured patient outcomes or clinical validation.
- **Prepared history:** the scheduled messages and the previous-trip replay are **prepared scenario activity**.
- **CareLink:** the vendor, the drivers and the backup provider are fictional. The CareLink portal and the live sync are real software. No real ride is booked, and there is no live GPS or ETA.
- **Uber Health:** say "the adapter is built and awaiting connection" or "plugs in once a contract and credentials are in place". **Never** say Uber Health is connected, integrated, a partner or a customer. The logo is on screen; if asked about a partnership, answer honestly that there isn't one yet.
- **SMS:** the September 22 SMS test was **undelivered**. Don't show a received-SMS shot or send an SMS on stage.
- **The call:** it's the only live provider action. Its completion proves a completed call, not a care-plan acknowledgment or an automatic workflow change.
- **Outreach history:** the earlier engine calls and texts, their replies and decisions are prepared history. The opening demo disclosure covers them; present the manual call as the live part.
- **The outcome:** "Continuity plan confirmed" is a coordination outcome. Don't imply medical clearance, treatment attendance, customers, hospital deployment or clinical effectiveness. The closing line deliberately says we don't know yet that she made it to the chair.

## Go / no-go and fallbacks

**Before opening the doors**, check all of the following on the exact presentation laptop and audio path:

1. **Videos:** Part 1, Part 2 and their local backups exist, play with readable text and audible sound, and match the current UI, including the named providers. The receipt and source retrieval time are legible at projector resolution.
2. **Phone participant:** the consenting participant and phone are present. Speaker volume and microphone pickup are tested.
3. **Call button:** `DEMO_CALL_BUTTON=true` is set on the Railway API service with fresh participant consent, and **Call Camila** is enabled in the Outreach tab. Earlier test calls don't block the demo, as long as the last call reached a final status (completed, busy, no answer or failed) and today's count is under `OUTREACH_DAILY_CALL_LIMIT` (default 4; raise it for demo day if you plan several tests). A call stuck on an unknown status blocks the next one until resolved.
4. **CareLink windows:** both are pre-staged in the same browser profile, and a test tap in an earlier rehearsal proved the sync on this laptop and network. Re-stage after that rehearsal: **Reset Workspace** and repeat the pre-stage steps.
5. **Health:** `https://app.oncoready.me` and the API health endpoint respond. The street map tiles load on the venue network; if they don't, the map shows its built-in route drawing, which is acceptable.
6. **Rehearsals:** two human-paced rehearsals complete the full seven minutes, including both switches to and from the live browser, without a provider send.

**If Call Camila is greyed out** ("Calling is paused"): don't click around. Walk through the outreach history, say “The engine already reached Camila this week; let me show you what happened next,” and go straight to CareLink with the extra time.

**If the call fails, isn't answered or stays unknown:** leave the status visible briefly. Say: “The live call didn't complete on stage.” Play a **real, reviewed recording** if one exists; otherwise show the sanitized September 22 evidence and move on to CareLink. Don't claim the backup was live, and don't retry.

**If the CareLink sync doesn't update:** don't reload on stage. On the left, tap **Record primary unavailable** yourself and say: “Marcus can also record the vendor's report directly.” Continue with the backup selection. If the live browser fails entirely, go straight to Part 2.

**If Part 2 playback fails:** stay in Window L and use the Switch Workspace menu: **Caregiver Portal** → mark the plan seen → **Patient Portal** → **Review & Confirm Plan** → acknowledge → **Care Navigator** → Graph receipt. If the live state is lost, switch to **Care Team**; its **Private checkpoint** control can load `RECOVERED_PLAN`.

## Recording split and operator marks

- **Part 1:** in-point is the public OncoReady story; out-point is both responsibilities visible after the nurse's disposition. Target about **2:40**, leaving live commentary to cover transitions.
- **Part 2:** in-point is Ana's logistics view **after** recovery: Crescent Lantern Medical Rides failed and Magnolia Wayfare Transport is the backup, the same state the live CareLink moment produces. Out-point is the confirmed graph and evidence-linked receipt. Target about **1:15**. Keep the plan version (**v2**) and visible dates consistent with the live windows.
- **Previous-trip replay:** it's not in the main flow. Keep it for Q&A: **Play previous trip** shows the vehicle moving along the real street route.
- **AV slate:** add one outside the audience video with exact filenames, duration, frame size, audio route and checksum.
- **Cue sheet marks:** mark the presenter's sheet **PAUSE PART 1 → WINDOW L OUTREACH → CALL CAMILA → WAIT FOR `Call completed` + AUDIBLE CONFIRMATION → TRANSPORTATION + LIVE CARELINK (6 TAPS) → PLAY PART 2**.
- **After the talk:** set `DEMO_CALL_BUTTON` back to off (the button then reads "Calling is paused") and revoke the operator token.

## Q&A quick answers

| Likely question | Honest answer |
| --- | --- |
| Is Uber Health integrated? | “Not yet. Our adapter for it is built; it needs a contract and API credentials. CareLink runs on the same adapter layer today.” |
| Is this connected to a real hospital's Epic? | “It's real data from Epic's FHIR Sandbox, read-only. A production connection would go through a hospital's own Epic onboarding.” |
| Are these real patients or vendors? | “No. Camila's record is Epic sandbox test data, and the vendors and drivers are fictional. The software and the call are real.” |
| How accurate is ReadySignal? | “In this demo it runs on simulated patient data; it's built for explainability. Training and validating it on a hospital's real history comes with the real rollout.” |
| Is it HIPAA compliant? | “We aren't making a compliance claim today. The demo uses only sandbox and synthetic data.” |
| What does a vendor need to use CareLink? | “A browser. That's the point: local vendors without dispatch software get trips, accept them and report problems in one place.” |

## Sources for the presenter

- [Product scope](../PROJECT.md)
- [Sprint closeout and open presentation prerequisites](../SPRINT_CLOSEOUT.md)
- [Sanitized live-call and SMS test evidence](./OUTREACH-001-LIVE-EVIDENCE.md)
- [CareLink vendor portal and adapters](../features/RIDE-002.md) · [CareLink sub-brand](../features/RIDE-003.md)
