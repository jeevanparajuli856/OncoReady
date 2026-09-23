# OUTREACH-001 — One real SMS and one short live call

**Current task record:** PROPOSED. This specification records the approved two-day demo scope; [the closeout](../SPRINT_CLOSEOUT.md) distinguishes shipped behavior from remaining gates. The task JSON and current code determine lifecycle and behavior.

## User-visible outcome

One real SMS arrives and a real phone rings for a short nonclinical ElevenLabs agent exchange during the demonstration.

## Required scope

Reuse the existing API and purchased Twilio/ElevenLabs accounts. Configure a reviewed agent opener and short response before the event; implement a protected manual one-shot SMS and sequential, explicitly armed calls, server-configured consenting recipient, durable attempt guard, verified outcomes and visible status. The participant says one sentence, hears the agent's short reply, and the presenter starts Video Part 2 only after provider-completed status. SMS can be recorded ahead of time; the call is the live highlight. Include prepared automatic-outreach history with scheduled/sent messages, original text, patient replies and follow-up changes; it demonstrates the workflow without a scheduler engine.

## Deferred

Learned channel/time selection, automatic scheduling/outbox campaigns, ongoing conversations, clinical advice, multi-recipient messaging, broad inbox/reply sync and automatic resends. One optional keypad response is NICE.

## Architecture and contract guidance

Backend, frontend and bounded infrastructure configuration impact; use existing persistence for a small live delivery ledger. Each call has its own finite window, recorded test/demo purpose, explicit current-consent confirmation and preserved attempt. A second call may be armed only after the prior attempt has a confirmed final outcome, with a server-side daily cap. An unresolved or ambiguous call blocks rearming. SMS remains one-shot. Define a formal contract for protected triggering and outcome reads/callbacks before BUILD_READY. No ML dependency. Do not expose arbitrary recipient/content input or provider credentials to the browser.

All frontend work preserves [the approved visual system](../design/DESIGN_SYSTEM.md). Design-required work is a compatibility/extension plan with the existing digest gate. The architect must record actual impacts, execution controls and scope before BUILD_READY; the guidance here is not a completed architecture report.

## Verification and risk

TARGETED; HIGH risk with dedicated security review because real outbound actions and credentials are involved. Automated tests stay network-disabled. Separately arm bounded real acceptance after the required verification/security gate.

## Dependencies

- RAIL-001
- FLOW-001

## Acceptance criteria

1. One explicit protected SMS action sends the reviewed nonclinical text to the single configured consenting test recipient and the message is actually received; retain sanitized provider/recipient evidence. Provider acceptance alone is not delivery.
2. One explicit protected call action rings the configured phone. The reviewed ElevenLabs agent speaks an opener, listens to one sentence, gives a short nonclinical response, and ends within the configured 60-second cap. Retain sanitized live evidence and recipient confirmation of audible exchange.
3. The browser cannot choose an arbitrary number or script, obtain secrets, or bypass operator protection, consent, arming, expiry and configured attempt/cost limits; verify negative API tests and dedicated security review.
4. Double-clicks, request retries, process restart, repeated callbacks and scenario reset cannot dispatch an uncontrolled duplicate. Reserve each live attempt before sending; ambiguous provider submission becomes outcome unknown and blocks another call until resolved.
5. Real status distinguishes submitted, delivered, ringing, answered/completed, failed/unknown and any explicit response. Success originates only from verified provider evidence; do not treat call completion as recipient acknowledgment.
6. One SMS arm permits one SMS. Each call arm permits one call in a finite wall-clock window. Once Twilio confirms the prior call ended, an operator can deliberately open another call window, including after a test call, subject to fixed recipient, consent, daily attempt cap and operator protection. Active or unknown calls block a new call across devices. Ordinary replay/checkpoint/reset never arms or sends; verify network-denial and persistence checks.
7. Missing provider setup, invalid callbacks, opt-out or kill switch produce a visible unavailable/stopped state without a fake success. The live ledger, limits and consent survive reset.
8. A recorded backup call and SMS evidence can be played after explicit disclosure if live delivery fails. Keep live failure status intact; playback cannot satisfy the real-delivery acceptance.
9. The chosen communication control and timeline states preserve the locked UI. Full phone-to-workflow synchronization is not required: the presenter may advance the prepared patient story separately.
10. Opening an outreach-history row shows scheduled time, sent text/time, received reply/time and the follow-up change from the shared scenario fixture. Historical prepared events are distinguishable in source details from the genuine one-off SMS/call and make no provider requests; verify thread/timeline parity.

See [current product scope](../PROJECT.md), [sprint closeout](../SPRINT_CLOSEOUT.md) and [the presenter script](../operations/SEVEN_MINUTE_PRODUCT_DEMO.md).
