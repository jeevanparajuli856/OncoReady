# OncoReady — seven-minute product demonstration

**Use:** This segment starts right after another presenter has spent about three minutes on the problem and OncoReady's approach. It covers the following **7:00**. It is a presenter script and stage cue sheet, not proof that the media or a live call is ready. Check the go / no-go list first.

**Story in one line:** Camila Lopez has chemotherapy tomorrow. Her ride falls through and she doesn't feel well. In seven minutes the audience watches OncoReady turn one message into owned work, a recovered ride and a plan Camila confirms herself.

**The three things that make this demo land.** Deliver each one:

1. **Real hospital data.** Camila's clinical context comes from the Epic FHIR Sandbox, read-only, and the Epic tab shows it.
2. **A real phone call.** The outreach agent calls a real phone on stage.
3. **A real vendor handoff.** A transport vendor taps a button in CareLink, and the navigator's workspace has already changed when we switch back to it.

**Disclosure is handled before this segment.** The first presenter tells the audience this is a product demo on synthetic data and explains the team's assumptions and plan. This script doesn't repeat it on stage.

## Roles and stage setup

| Role | Responsibility |
| --- | --- |
| Product presenter | Speaks the script, advances the videos and runs the live CareLink moment (or hands it to the demo operator). |
| Demo operator | On demo day, turns `DEMO_CALL_BUTTON` on in Railway and confirms **Call Camila** is enabled. Pre-stages the CareLink windows. After the talk, turns the switch off and revokes the operator token. |
| Phone (product presenter) | The call rings the product presenter's own phone, which is the consenting `OUTREACH_RECIPIENT`. The presenter answers on speaker, says one short sentence, then lets the agent finish. |
| AV operator | Plays and pauses the local videos, switches the projector between video and the live browser, and confirms speaker audio. |

Use the deployed app at `https://app.oncoready.me`. The call is placed from **Camila's case → Outreach → Call Camila**, inside the product; no token is typed on stage. The private `https://app.oncoready.me/operator/live` page stays off screen as a backup. Keep the videos as local files on the presentation laptop, plus a second local copy. Show actual call status only; never edit a provider status into the live feed.

### Flow at a glance

Landing page → **Sign in with Epic** as the Care Team → Camila's Epic clinical data and ReadySignal → Camila's own check-in → the Care Team graph and Sarah's disposition → Marcus's outreach and call → CareLink handoff → Ana and Camila confirm → confirmed graph.

The story runs context first (who Camila is, what the hospital record says, how her signal is climbing), then the problem arrives in her own words, then the team resolves it.

### Pre-stage the live CareLink windows (before doors open)

*Only for a live stage run. The pre-recorded video doesn't use pre-staged windows: it records the call and CareLink in two full-size tabs, as the 3:00 and 4:05 cues describe.*

Part 1 is a recording, so the live windows start from the state Part 1 ends in: Camila's check-in is already submitted.

Both windows must be in the **same browser profile**, not incognito, because they share the scenario through local storage. Every prepared account signs in with the password `1234`: patient `abcp@`, caregiver `abcc@`, care team `abcs@`, care navigator `abcn@` and CareLink vendor `abct@`, all at `oncoready.me`. These are synthetic demo personas, not real credentials.

1. **Window L (left half of the screen):** sign in as Camila (`abcp@oncoready.me` / `1234`), tap **Start Readiness Check** and **Submit Readiness Report**. Switch Workspace → **Care Navigator (Marcus Vance, MSW)** → sidebar **Transportation**. Tap **Request ride**, then **Assign Crescent Lantern Medical Rides · via CareLink**. The panel reads "Waiting for Crescent Lantern Medical Rides to accept in CareLink". Then open **Command Center → Review Case → Outreach** so Window L starts on Camila's outreach history, with **Call Camila** enabled.
2. **Window R (right half):** open `https://app.oncoready.me/carelink`, sign in as the vendor (`abct@oncoready.me` / `1234`). The **CareLink by OncoReady** trip board shows **New trip offer** for Camila L. with the street route.
3. Zoom both windows so the status chips are readable from the back row. Don't touch either window again until the cue.

## Seven-minute cue sheet

Times are wall-clock targets. ★ marks a moment to slow down and let the room see it. The whole segment is a **pre-recorded video** of real product interactions, recorded full size in one Chrome window and profile (not incognito) with two tabs on `app.oncoready.me`: **Tab 1** is the OncoReady workspace and **Tab 2** is CareLink (`/carelink`). The editor cross-fades at each tab switch. Hit **Reset Workspace** before each take.

| Clock | Screen and action | Presenter words / cue |
| --- | --- | --- |
| **0:00–0:20** | Hand-over. Start **Video Part 1** on the landing page. | “Tomorrow at ten, Camila Lopez has her fourth chemotherapy infusion. Today, two things go wrong: her ride falls through, and she doesn't feel well. The question is whether her care team finds out in time.” |
| **0:20–0:45** ★ | **Access workspace** → **Sign in with Epic** → the Epic sign-in page. Sign in as the Care Team (`abcs@oncoready.me` / `1234`) → **Redirecting securely…** → the Care Team **Command Center**. | “Let's start where her care team starts their day: signing in. They don't learn a new login. They sign in through their hospital's Epic, the way they already work. And here we have integrated the hospital Epic system, which is a sandbox provided to us by Epic.” |
| **0:45–1:15** ★ | **Review Case** on Camila's row → **Epic** tab. Scroll slowly through her demographics, medications and lab observations. Don't open **View source details**. | “Everything you see here about Camila, her details, her medications and her labs, is pulled from the Epic Sandbox, which mirrors a real hospital record. We read it; we never write back.” |
| **1:15–1:45** | **Insights:** T−7 → T−2 → T−1. Open **Why flagged?**, toggle the transportation what-if, return to baseline. | “This is ReadySignal, our readiness model, trained on patient data. From a week out to the day before, Camila's signal climbs, and **Why flagged?** shows exactly why. Flip transportation in the what-if and you see how much that one fix moves her signal. ReadySignal explains the risk.” |
| **1:45–2:15** | **Switch Workspace → Patient Portal (Camila Lopez)** → **Start Readiness Check**. Her answers: the ride was cancelled, and she isn't feeling well. **Submit Readiness Report.** Her screen shows who is resolving each barrier. | “The record and the signal say she's at risk. What they can't tell us is what changed today. Only Camila knows that. So the day before treatment, she checks in. Her ride was cancelled, and she isn't feeling well. We keep her words exactly.” |
| **2:15–3:00** ★ | **Switch Workspace → Care Team** → Camila's case → **Graph** reads **Treatment at risk**. **Actions:** Sarah accepts ownership and records a human disposition. **Pause Part 1.** | “Back on the care team's side, that one check-in has already changed the picture. The infusion is still booked, but the graph says what the calendar doesn't: the plan around it is at risk. One message, two jobs, two owners. Sarah, the nurse, owns the symptom and records a human decision. Marcus, the navigator, owns the ride. The software never reads her symptoms or grants clearance. People do.” |
| **3:00–4:05** ★ | **OUTREACH + CALL.** In Tab 1: **Switch Workspace → Care Navigator (Marcus Vance, MSW) → Command Center → Review Case → Outreach**. `DEMO_CALL_BUTTON` must be on in Railway so **Call Camila** is enabled. Point to the history: the T−7 voice check-in, the T−2 and T−1 texts, each with its ReadySignal score and the decision it triggered. Click **Call Camila → Call now**. The status shows **Dialing… → Ringing…** The presenter's own phone rings; answer on speaker, say one sentence, pause. Wait for **Call completed**; the call joins the history. | “Our outreach engine has been working this case all week. ReadySignal decided when to reach out: a voice check-in a week before, then texts as her signal climbed. Every reply became a decision, routed to the right owner. The engine does this on its own, but Marcus can also reach out himself. **Let's call Camila now.**” *(Click. Your phone rings.)* “And here's the call.” *(Answer on speaker.)* Agent opener. You, as Camila: **“My ride fell through, and I need help getting to my appointment.”** Let the agent reply. After **Call completed**: **“That was a real call from inside OncoReady. Today the agent handles the conversation. Next, what Camila says lands in the dashboard as a task for the next step, so patients who never open the app can still update their care team by answering a call or a text. Now watch the ride get fixed.”** |
| **4:05–5:10** ★ | **CARELINK, TWO TABS.** **Tab 1:** sidebar **Transportation → Request ride → Assign Crescent Lantern Medical Rides · via CareLink**. **Tab 2:** open `/carelink`, sign in as the vendor (`abct@oncoready.me` / `1234`); the **New trip offer** shows. Tap **Accept trip**. **Tab 1:** point to **Accepted in CareLink**. **Tab 2:** **Report unavailable** → reason *Vehicle out of service* → **Report unavailable**. **Tab 1:** the status reads **Primary unavailable**, recovery reopens. **Select Magnolia Wayfare Transport · via CareLink** → **Save recovered logistics**. Scroll to **Update sources** and point to the **Uber Health** and **Lyft Healthcare** cards. | “This is CareLink, our portal for local transport vendors. Many hospitals rely on local transport services, and many of those run on phone calls, not software. The vendor accepts the trip, *(Tap.)* and back in Marcus's workspace, it's already there. Now their van breaks down. *(Tap.)* Marcus doesn't find out tomorrow morning when Camila is waiting at the curb. He knows now. He reassigns the backup and records the pickup, return and contact. *(Save.)* And the same adapter layer is ready for Uber Health; it just needs a contract and API access. Lyft Healthcare is next.” |
| **5:10–6:30** | Start **Video Part 2**. Ana (caregiver) sees only the logistics plan and marks it seen. Camila opens **Review & Confirm Plan** and acknowledges the current version. Back to the staff Graph: **Continuity plan confirmed**. Open the three receipt items and their timeline events. | “Ana, her daughter, sees only the ride plan. Camila confirms it herself. *(Graph turns.)* Treatment at risk is now continuity plan confirmed, and every step links to the event behind it.” |
| **6:30–7:00** ★ | Hold the confirmed graph. Hand back to the main presenter. | “One message. Two owners. A vendor handoff in real time. And a plan Camila confirmed herself, the day before her chemo. We don't know yet that she made it to the chair. We made sure nothing stood in her way. Thank you. We're ready for your questions.” |

**Timing budget:**
- **Live call:** 65 seconds for the call itself, plus about 15 seconds for the agent line after **Call completed**; the shorter Part 2 narration pays for it. The agent is capped at a 60-second nonclinical exchange; the previous confirmed test lasted 23 seconds. Never make a second call to fill time.
- **CareLink moment:** 65 seconds and six taps. If either live segment runs long, trim the Part 2 narration to its first and last sentences, but keep the confirmed graph and receipt on screen.

## Truthful presentation rules

The product screens carry no demo labels ([POLISH-001](../features/POLISH-001.md)). The first presenter gives the demo and synthetic-data disclosure before this segment, so the script doesn't repeat it. The rules below still apply to anything said on stage or in Q&A.

- **Epic:** call it **read-only data from the Epic FHIR Sandbox**. Don't say it syncs live during the talk or is connected to a production hospital.
- **Epic sign-in:** the Epic-styled sign-in page accepts only the prepared Care Team and Care Navigator accounts; it is not Epic single sign-on and nothing is sent to Epic. The 0:20 line names the Epic Sandbox integration as the presenter chose. If asked, the Q&A line applies: the sign-in is a preview, and a real Epic sign-in comes with a hospital's Epic onboarding.
- **ReadySignal:** present it as OncoReady's working readiness model. The demo disclosure at the start covers its training data, so there's no need to mention it on stage. Don't call the score a clinical risk probability, and don't claim measured patient outcomes or clinical validation.
- **Prepared history:** the scheduled messages and the previous-trip replay are **prepared scenario activity**.
- **CareLink:** the vendor, the drivers and the backup provider are fictional. The CareLink portal and the live sync are real software. No real ride is booked, and there is no live GPS or ETA.
- **Uber Health:** say "the adapter is built and awaiting connection" or "plugs in once a contract and credentials are in place". **Never** say Uber Health is connected, integrated, a partner or a customer. The logo is on screen in the Transportation Workspace and in the landing page's **Transport partners** section, where it reads **Coming soon**; if asked about a partnership, answer honestly that there isn't one yet.
- **Report a problem:** after the check-in, Camila's home screen shows a **Something changed?** card ([PATIENT-001](../features/PATIENT-001.md)). It is visible in the patient windows but is **not** part of the walkthrough. **Don't click it on stage**: it would reopen the confirmed plan. If asked, describe it using the Q&A line.
- **Lyft Healthcare:** the landing page and the Transportation Workspace's **Update sources** show its logo with **Coming soon** ([LAND-002](../features/LAND-002.md)). Say "coming soon" or "next". No Lyft adapter is built and nothing in the product talks to Lyft, so **never** say Lyft is connected, integrated or live, and don't call it a signed partner until an agreement exists.
- **SMS:** the September 22 SMS test was **undelivered**. Don't show a received-SMS shot or send an SMS on stage.
- **The call:** it's the only live provider action. Its completion proves a completed call, not a care-plan acknowledgment or an automatic workflow change. Nothing from the conversation reaches the dashboard today, which is why the script presents that as the next step.
- **Outreach history:** the earlier engine calls and texts, their replies and decisions are prepared history. The opening demo disclosure covers them; present the manual call as the live part.
- **The outcome:** "Continuity plan confirmed" is a coordination outcome. Don't imply medical clearance, treatment attendance, customers, hospital deployment or clinical effectiveness. The closing line deliberately says we don't know yet that she made it to the chair.

## Go / no-go and fallbacks

**Before opening the doors**, check all of the following on the exact presentation laptop and audio path:

1. **Videos:** Part 1, Part 2 and their local backups exist, play with readable text and audible sound, and match the current UI, including the named providers. The receipt and source retrieval time are legible at projector resolution.
2. **Presenter's phone:** it's the number set as `OUTREACH_RECIPIENT`, charged, off silent and not on Do Not Disturb. Speaker volume and microphone pickup are tested.
3. **Call button:** `DEMO_CALL_BUTTON=true` is set on the Railway API service with the presenter's consent to be called, and **Call Camila** is enabled in the Outreach tab. Earlier test calls don't block the demo, as long as the last call reached a final status (completed, busy, no answer or failed) and today's count is under `OUTREACH_DAILY_CALL_LIMIT` (default 4; raise it for demo day if you plan several tests). A call stuck on an unknown status blocks the next one until resolved. Reloading during a test call is safe: **Call Camila** re-enables by itself once that call ends.
4. **CareLink windows:** both are pre-staged in the same browser profile, and a test tap in an earlier rehearsal proved the sync on this laptop and network. Re-stage after that rehearsal: **Reset Workspace** and repeat the pre-stage steps.
5. **Health:** `https://app.oncoready.me` and the API health endpoint respond. The street map tiles load on the venue network; if they don't, the map shows its built-in route drawing, which is acceptable.
6. **Rehearsals:** two human-paced rehearsals complete the full seven minutes, including both switches to and from the live browser, without a provider send.

**If Call Camila is greyed out** ("Calling is paused"): don't click around. Walk through the outreach history, say “The engine already reached Camila this week; let me show you what happened next,” and go straight to CareLink with the extra time.

**If the call fails, isn't answered or stays unknown:** leave the status visible briefly. Say: “The live call didn't complete on stage.” Play a **real, reviewed recording** if one exists; otherwise show the sanitized September 22 evidence and move on to CareLink. Don't claim the backup was live, and don't retry.

**If the CareLink sync doesn't update:** don't reload on stage. On the left, tap **Record primary unavailable** yourself and say: “Marcus can also record the vendor's report directly.” Continue with the backup selection. If the live browser fails entirely, go straight to Part 2.

**If Part 2 playback fails:** stay in Window L and use the Switch Workspace menu: **Caregiver Portal** → mark the plan seen → **Patient Portal** → **Review & Confirm Plan** → acknowledge → **Care Navigator** → Graph receipt. If the live state is lost, switch to **Care Team**; its **Private checkpoint** control can load `RECOVERED_PLAN`.

## Recording split and operator marks

- **Part 1:** in-point is the landing page; it continues through **Sign in with Epic**, the Epic tab's clinical details (demographics, medications, labs), Insights and Camila's check-in; out-point is both responsibilities visible after the nurse's disposition. Target about **2:50**, leaving live commentary to cover transitions. Hit **Reset Workspace** before each take so Camila's check-in starts unsubmitted.
- **Part 2:** in-point is Ana's logistics view **after** recovery: Crescent Lantern Medical Rides failed and Magnolia Wayfare Transport is the backup, the same state the live CareLink moment produces. Out-point is the confirmed graph and evidence-linked receipt. Target about **1:15**. Keep the plan version (**v2**) and visible dates consistent with the live windows.
- **One continuous recording (the chosen path):** follow the cue sheet in order in one Chrome window and profile, recording full size. Use two tabs, not side-by-side windows: half-width windows squeeze the UI into its narrow layout. The tabs share the scenario through local storage, so a CareLink tap has already updated Marcus's tab by the time you switch back. At the call, show the outreach history and **Call Camila** only if calling is enabled; otherwise use the greyed-out fallback line. At the CareLink moment, Marcus first taps **Request ride → Assign Crescent Lantern Medical Rides · via CareLink**, then open `/carelink` in Tab 2 so the new offer shows. Easiest to record in three takes: steps up to the disposition, the call and CareLink, then Part 2. For a side-by-side moment, the editor can split-screen the two full-size clips at each tap.
- **Previous-trip replay:** it's not in the main flow. Keep it for Q&A: **Play previous trip** shows the vehicle moving along the real street route.
- **AV slate:** add one outside the audience video with exact filenames, duration, frame size, audio route and checksum.
- **Cue sheet marks:** mark the presenter's sheet **PAUSE PART 1 → WINDOW L OUTREACH → CALL CAMILA → WAIT FOR `Call completed` + AUDIBLE CONFIRMATION → TRANSPORTATION + LIVE CARELINK (6 TAPS) → PLAY PART 2**.
- **After the talk:** set `DEMO_CALL_BUTTON` back to off (the button then reads "Calling is paused") and revoke the operator token.

## Q&A quick answers

| Likely question | Honest answer |
| --- | --- |
| Is Uber Health integrated? | “Not yet. Our adapter for it is built; it needs a contract and API credentials. CareLink runs on the same adapter layer today.” |
| Is Lyft Healthcare integrated? | “It's coming soon. It isn't connected today; when the agreement and API access are in place, it plugs into the same ride plan CareLink uses now.” |
| What if something changes after the check-in? | “Camila can tap **Report a problem** any time. A new symptom reopens Sarah's task and a ride problem goes back to Marcus; the plan needs her confirmation again.” |
| Can staff really sign in with Epic? | “What you saw is a preview of that sign-in. Today it uses our demo accounts; a real Epic sign-in comes with a hospital's Epic onboarding.” |
| Is this connected to a real hospital's Epic? | “It's real data from Epic's FHIR Sandbox, read-only. A production connection would go through a hospital's own Epic onboarding.” |
| Are these real patients or vendors? | “No. Camila's record is Epic sandbox test data, and the vendors and drivers are fictional. The software and the call are real.” |
| How accurate is ReadySignal? | “In this demo it runs on simulated patient data; it's built for explainability. Training and validating it on a hospital's real history comes with the real rollout.” |
| Is it HIPAA compliant? | “We aren't making a compliance claim today. The demo uses only sandbox and synthetic data.” |
| What does a vendor need to use CareLink? | “A browser. That's the point: local vendors without dispatch software get trips, accept them and report problems in one place.” |

## Sources for the presenter

- [Product scope](../PROJECT.md)
- [Sprint closeout and open presentation prerequisites](../SPRINT_CLOSEOUT.md)
- [Sanitized live-call and SMS test evidence](./OUTREACH-001-LIVE-EVIDENCE.md)
- [CareLink vendor portal and adapters](../features/RIDE-002.md) · [CareLink sub-brand](../features/RIDE-003.md) · [Landing transport partners](../features/LAND-002.md)
