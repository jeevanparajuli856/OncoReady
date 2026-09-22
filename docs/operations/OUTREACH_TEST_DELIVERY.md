# One real SMS and one short live call

## Active human direction

September 21, 2026: one real SMS plus one short live call to a consenting test contact. Purchased Twilio and ElevenLabs accounts were previously confirmed by the human. Manual send/call is sufficient; trained selection, automatic scheduling, multi-turn dialogue and continued synchronization are deferred.

This is an implementation runbook, not evidence of configured providers or successful delivery. Use the existing Railway hosts, human-confirmed: web `https://app.oncoready.me`, API `https://api.oncoready.me`. Domain ownership/configuration was reported by the human; current HTTPS, callback and delivery behavior still require preflight.

## Prepared history in the UI

OUTREACH also owns the visible automatic-outreach history: scheduled time, sent content/time, patient reply/time and follow-up change. Use the versioned fixtures in [scenario settings](../LAUNCH_SCENARIO_SETTINGS.md); bind the final historical reply to FLOW's existing split-work transition. The UI can show automation's sequence without implementing a scheduler. Keep prepared history and actual SMS/call attempt evidence distinct, and never send while replaying history.

## Minimum implementation

- Twilio supplies the real SMS and phone connection. Prepare reviewed nonclinical voice audio with ElevenLabs before rehearsal and play it on the call.
- Reuse the current API for a protected one-shot trigger and verified status. The architect defines actual endpoint paths and the smallest contract; no endpoint is assumed to exist yet.
- Recipient and fixed message/audio are server-configured. The UI cannot submit arbitrary destinations or content.
- Reuse existing persistence for a small live-attempt reservation/result record that survives restart and scenario reset. A full scheduler/outbox workflow is unnecessary.
- Keep provider secrets and the privileged operator credential out of public bundles and normal browser state. A browser-triggered presentation action needs an implemented protected operator session or equivalent server-mediated boundary; simply embedding the existing operator token is forbidden.
- Optional keypad acknowledgment is NICE. A connected/completed call alone never means the patient confirmed the ride plan.

## Day 1 prerequisites

| Check | Required evidence |
|---|---|
| Existing accounts | Authorized access available; no secret values in chat/logs |
| Sender | Configured number supports the intended SMS and voice destination; any provider-required readiness is satisfied |
| Recipient | One consenting participant controls the allowlisted phone and agrees to rehearsal/presentation timing |
| API host | HTTPS and exact callback reachability verified on api.oncoready.me |
| Browser origin | app.oncoready.me can reach only the intended protected API path under reviewed origin/session rules |
| Audio | Reviewed script is audible, nonclinical, provider-retrievable and available before the event |
| Controls | Private arming, finite actual-time window, kill switch, consent, persistent duplicate guard and bounded cost/attempt settings |
| Evidence | Sanitized provider status and recipient receipt/answered-audio proof can be recorded |

Read current official provider documentation during implementation for the specific send/call, audio, callback-verification and sender setup being used. No SDK syntax or account capability is established by this planning document.

## Live run limits

One arm permits **one SMS and one call**, at most once each. Call content targets 20–40 seconds with a 60-second cap. Set an explicit cost cap and finite window before arming. Separate rehearsal and presentation arms require intentional operator action and renewed verification of remaining budget/consent; reset never re-arms.

Reserve each action before submission. Double-clicks and HTTP retries reuse the same action identity. Unknown submission outcome requires inspection/reconciliation, not blind resend. Persist provider IDs/status and attempt reservations across restart; scenario reset cannot delete them.

Consent withdrawal/STOP and the kill switch disable unsent actions. Reject unexpected numbers/content, expired arms, invalid signatures, wrong accounts and uncorrelated callbacks. Ordinary logs/recordings omit real phone numbers and secret-bearing URLs.

Use actual time for live calls. Scene advancement and scenario dates cannot release a send backlog. No automatic follow-up after nonresponse is needed.

## Observable acceptance

1. The protected SMS action sends the fixed message and it is actually received at the allowed phone. Retain redacted receipt and verified provider evidence; submission alone is insufficient.
2. The protected call rings the allowed phone, plays the prepared audio audibly and ends within the cap. Record actual provider status and the observed result.
3. The UI displays truthful submitted/delivered, ringing/answered/completed, failed/unknown states. An explicit reply, if implemented, is separate from delivery.
4. Automated network-disabled tests prove recipient/content denial, unarmed/expired/opted-out rejection, duplicate/restart/reset protection and callback verification.
5. Dedicated HIGH-risk review covers this small live boundary. Run bounded real checks separately after the required verification/security gate; preserve evidence against the reviewed revision.
6. Rehearsal playback performs no external send. A failed live action stays failed/unknown even when the presenter plays the disclosed backup.

Record the SMS ahead of the presentation if desired. Only the phone call must occur live on stage. A prior successful test is useful evidence but does not make a failed stage call successful.

## Failure recovery

If sender access/configuration is unavailable, continue UI and replay preparation while reporting the exact missing prerequisite. Do not buy extra services or claim that playback meets real delivery acceptance.

Prepare a local recorded call clip with audible sound and the genuine SMS receipt. On failure, state that the clip is from rehearsal, play it, then continue the story. Use no silent fallback that labels a recording as a live result.
