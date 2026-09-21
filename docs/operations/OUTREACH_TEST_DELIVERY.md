# Real test-contact outreach — launch activation plan

**Human decision:** Real SMS and voice calls to a verified test contact are required for the September 25 demo. The human confirmed Twilio and ElevenLabs accounts are purchased. This supersedes the earlier blanket deferral of SMS/voice execution. `OUTREACH-001` owns this bounded activation; no additional permission to plan/build the selected mode is needed. No provider configuration, delivery or successful callback has been verified by this planning update.

## Provider responsibilities

- Twilio Programmable Messaging sends the selected SMS and supplies delivery/inbound-message callbacks.
- Twilio Programmable Voice places the selected telephone call. ElevenLabs produces audio for the reviewed, bounded nonclinical script; prepare and version that audio before the run, then play it on the real call. This keeps audio generation out of the dispatch critical path.
- Capture an explicit keypad acknowledgment/request through the call flow. A connected or completed call alone is not a patient response. Do not add open-ended medical dialogue or voice cloning.
- The engagement model chooses channel/time; Twilio and ElevenLabs do not replace model selection. The operator arms a bounded run but does not manually pick the winning action or click Send/Call for each scheduled attempt.
- Uber Health remains provider-ready and cannot execute a trip. Purchased communications accounts do not change the other production/clinical boundaries.

## Required setup and evidence

| Item | Known / action |
|---|---|
| Accounts | Human confirms both purchased; inspect account/API availability using authorized tooling without printing secrets |
| Twilio sender | Verify an owned sender capable of the required SMS and voice traffic; verify destination-country permissions and any applicable sender registration/verification |
| Test recipient | One phone controlled by a consenting test participant; verify possession/consent and keep its E.164 value in protected server configuration, not chat, Git or screenshots |
| Credentials | Put live Twilio API credentials, callback-validation material and ElevenLabs API key in server-side environment/secret configuration; never use Twilio test credentials as proof of real delivery |
| Voice asset | Select an available licensed stock voice, generate only reviewed nonclinical script, store version/hash and serve provider-retrievable audio without embedding secrets or patient data |
| Callback origin | Deployed HTTPS endpoints with signature verification against the externally visible URL/body, intended account, correlated provider identifier and expected recipient/run |
| Controls | Default inactive until configured; explicit `live_test` mode, current consent, exact destination allowlist, private run arming, kill switch, attempt/cost limits and durable audit |
| Live evidence | Real received SMS, real answered call with audible approved audio, verified outcomes and an explicit reply/keypad response through the same event path |

A paid account is not proof that a sender can deliver to the selected country. Check sender readiness early, in parallel with RAIL/ACCESS planning. Do not promise a registration completion date or bypass a rejected sender. If this external gate cannot be met, report the remaining blocker; replay preserves rehearsal but cannot satisfy the real-delivery acceptance criterion.

## Clock, limits and reset boundary

- `live_test` dispatch uses actual wall-clock scheduling. Presenting a past/future scenario clock or advancing replay time must not instantly send due historical attempts to a real telephone.
- Before the live run, define the future wall-clock test window and timezone; compute features/time remaining consistently for that window, retain original Epic source times, and persist both scenario and execution provenance.
- Keep quiet hours, consent, maximum two attempts per rolling 24 hours, and at least four actual hours between attempts. For a short prerecorded video, run the real contact steps at their scheduled times and edit waiting time transparently; never change provider timestamps or bypass limits to fit three minutes.
- One live rehearsal may require only the channel chosen by the model. Acceptance separately proves both SMS and voice via frozen eligible test histories/windows; do not manipulate a final model choice to force both into a single run.
- Default live budget: no more than two outbound attempts per armed run, at most 120 seconds per voice call, one prepared audio asset per script version. Reserve attempts transactionally before provider submission; prohibit unlimited retries. An explicit operator-set monetary cap and account cost/capability check are required before arming; this is not authorization for new subscriptions or unbounded charges.
- Maintain the live dispatch ledger and recipient opt-out/contact-rate state outside scenario reset/reseed. Resetting a demo must not resend, clear opt-out, erase a provider SID, release a spent budget reservation or re-arm a live run. Arming a new run does not bypass rolling limits.
- Provider acceptance, sent/delivered, ringing/answered/completed, and explicit response remain separate events. A timeout after submission is `outcome unknown` pending reconciliation; never blindly repeat a potentially accepted SMS/call. Bound retries only where the provider behavior makes them safe.
- STOP or revoked consent cancels unsent work immediately. Unexpected numbers, changed recipients, invalid signatures, wrong accounts, duplicate/out-of-order callbacks and stale decisions cannot create a success or dispatch event.
- Keep real phone numbers, audio URLs with access credentials and message bodies out of ordinary logs, public UI and exports. Only synthetic/nonclinical content is sent; Epic chart data and Camila's clinical concern stay inside their authorized projections.

## Acceptance and fallback

The dedicated OUTREACH security review now covers HIGH-risk external delivery. Automated tests stay network-disabled; use a separately invoked, bounded live acceptance run after verification/security approval against the selected revision. Record sanitized live results. If evidence is added to Git or implementation/test reports change, commit it and refresh verification/security evidence before final review; never reuse stale commit-bound reports.

1. A valid learned decision becomes a real SMS at the verified phone without a manual Send click. Provider acknowledgment alone does not count as delivery.
2. A valid learned voice decision rings the verified phone and plays the ElevenLabs-generated reviewed audio; call status and an explicit keypad response are recorded separately. No medical free-form conversation is required.
3. Inbound text or keypad response updates the shared event history and invalidates superseded outreach; nonresponse is recorded only after the actual response horizon.
4. Verify opt-out, wrong-destination denial, kill switch, callback validation, unknown-outcome reconciliation, rate/budget bounds and restart/reset idempotency without contacting any unapproved person.
5. `provider_ready` makes no calls. `replay` is explicitly labeled and network-disabled. `live_test` uses real provider evidence. A failed live call must not silently become a successful replay in the same attempt.
6. Retain a disclosed replay and recorded backup for presentation failure. The live requirement stays incomplete until the real acceptance proof exists; do not replace it with simulated success.

## Documentation checked September 21, 2026

- Twilio test credentials simulate requests without real delivery/calls or status callbacks: [test credentials](https://www.twilio.com/docs/iam/test-credentials).
- Voice supports hosted audio playback and keypad input: [Play](https://www.twilio.com/docs/voice/twiml/play), [Gather](https://www.twilio.com/docs/voice/twiml/gather); status events come through the [Call resource](https://www.twilio.com/docs/voice/api/call-resource).
- ElevenLabs supports generating the reviewed text as audio: [Text to Speech](https://elevenlabs.io/docs/overview/capabilities/text-to-speech).
- Sender readiness depends on number type/destination. For example, US/Canada toll-free SMS requires approved verification: [Twilio toll-free onboarding](https://www.twilio.com/docs/messaging/compliance/toll-free/console-onboarding). US local-number messaging has its own [A2P 10DLC requirements](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc).

Implementation must refresh provider-specific SDK/signature/configuration details using current documentation. These links document capabilities and prerequisites, not proof of this account's setup.
