# Recording and live presentation runbook

For the **seven-minute product segment following a separate three-minute problem/solution introduction**, use the timed [presenter script](./SEVEN_MINUTE_PRODUCT_DEMO.md). The script states the current call/SMS and media gates explicitly.

## Goal and assets

Demonstrate the completed-looking OncoReady journey primarily through recorded product footage, then place one short real call. One real SMS must also be received; it may be shown from the recording.

Use `https://app.oncoready.me` for the product and `https://api.oncoready.me` for the existing API. These hosts are human-confirmed; verify their current health during preflight.

Required presentation assets:

- Main walkthrough video and locally playable backup copy.
- Actual Epic Sandbox JSON capture and source/checksum manifest.
- Synthetic ML dataset, executed notebook and matching exported UI insights.
- Versioned scenario checkpoints, prepared scheduled-message/reply history, a separate previous-trip dispatch replay and documented reset behavior.
- Prepared nonclinical call audio, genuine recorded SMS receipt and backup call clip.
- Build/asset version manifest and sanitized real-delivery evidence.

Do not claim these assets exist until EVIDENCE-001 verifies them. Use the exact presentation device, output resolution and audio routing for the final rehearsal.

## Presenter disclosure

Before the walkthrough: “This is a controlled patient scenario using captured Epic Sandbox data. The ML results come from a model demonstrated on synthetic data, and CareLink replays a previous scenario dispatch and shows our recovery workflow with fictional providers. The earlier scheduled-message history is prepared scenario data. We will place a short live call if the separately authorized event window is ready.” Mention a real received SMS only after a later delivery has been verified; the September 22 SMS test was undelivered.

Use “read-only Epic Sandbox integration” only once actual capture plus UI mapping have been verified. Do not say the recorded view is synchronizing live or that a hospital's production EHR is connected. If capture is not yet verified, the Epic criterion is still open.

Keep source/mode detail in the existing evidence treatment. Preserve polished product language throughout the ordinary UI.

## Recording click path

| Step | Presenter action | Required visible result |
|---|---|---|
| 1 | Reset privately; open public story and Workspace access | Polished entry with no patient data on public pages |
| 2 | Enter staff and open Camila | Staff workspace and readiness graph |
| 3 | Open clinical source drawer | Actual captured Sandbox fields, source and original timestamp |
| 4 | Inspect T−7/T−2/T−1, open Why flagged?, toggle transportation what-if and return | Checkpoint/variant scores match notebook; actual plan stays unchanged |
| 5 | Open automated-outreach history and a message/reply thread; show any later verified genuine SMS receipt separately | Original scheduled/sent/reply times and follow-up changes; real SMS evidence distinct and redacted only if delivery is later verified |
| 6 | Submit the prepared patient reply | Separate tasks with named owner, next action, deadline and waiting state |
| 7 | Record nurse contact and disposition | Clinical task resolved by a human action, no medical clearance |
| 8 | Replay the previous CareLink dispatch; return to current trip, assign primary and trigger failure | Advancing historical status feed remains separate; current failure reopens the blocker |
| 9 | Select backup and complete outbound/return plan | Consistent current plan in all relevant views |
| 10 | Ana marks the logistics plan seen; Camila reviews and acknowledges | Pickup, return, contact and caregiver state together; separate current-plan acknowledgment |
| 11 | Return to staff; open each closing-receipt item | Visible at-risk-to-confirmed graph; receipt links to matching current-scenario events |

All six human-approved refinements are required shots within this same sequence, not separate presentation segments. Keep the graph in the opening and closing framing so the transformation is easy to compare; use the existing motion language.

Record actual interactions. Editing out waiting time is acceptable; do not fabricate a UI or provider outcome. Off-path features need no backend implementation but must not distract with dead buttons or false success.

## Live call moment

The September 22 test call completed and used the current one-shot window. The operator page now presents that result as a previous call, not as the stage cue. The current backend does not support rearming: implement and authorize a new bounded event window before the live presentation; ordinary scenario reset cannot rearm delivery. The SMS test remains undelivered while Twilio A2P review is pending. No Video Part 2 or backup call media file is tracked in this repository yet, so verify those files and their playback before presenting.

1. Verify the participant has the phone, sound is audible and consent is current. Keep the private operator token out of the recording.
2. The presenter says, “Let’s see our core feature: live call now.” Open `/operator/live`, check the current status, and confirm the arm/window and one-call allowance.
3. Press **Place live call** once. Show `initiating → ringing`; the participant answers on speaker and says one sentence. The ElevenLabs agent replies briefly and ends the call within its 60-second limit.
4. Wait for Twilio to report `completed` and confirm the exchange was audible. State only what occurred; completed call is not patient acknowledgment.
5. Start **Video Part 2** to continue the prepared patient story, then continue the closing vision/funding ask. Ongoing conversation or automatic clinical/workflow updates are unnecessary.

If the stage call fails or remains unknown, say “Here is the recorded call from rehearsal,” play the local backup and preserve the actual failure state. Do not retry repeatedly on stage or silently replace live evidence.

## Rehearsal and freeze

- Verify app/API availability, prepared capture loading, insight assets, audio and all selected links.
- Rehearse twice from reset with external sends disabled. Check persona switches, refresh behavior, graph/timeline agreement and the three closure blockers.
- Separately conduct the bounded real SMS/call acceptance with the allowed phone and scoped security/verification evidence.
- Rehearse Epic offline using the actual saved capture and rehearse the live-call failure branch.
- Capture the final video and backup after UI review; retain exact build and asset versions.
- Freeze feature additions for the final two hours. Fix only observed journey, audio, source or visual defects, then rerun affected checks.

## Release distinction

Documentation updated is not demonstration ready. The release checklist passes only when every required asset, chosen click, actual SMS/call proof and rehearsal has evidence. Broader product backend wiring, enterprise auth, production ML and hospital integration remain future work.
