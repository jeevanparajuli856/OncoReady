# OUTREACH-001 — Adaptive SMS and voice orchestration

## User-visible outcome

OncoReady uses Camila's dated engagement and readiness pattern to plan supportive SMS-first outreach and recommend voice or human escalation as the cutoff approaches, while remaining truthful and usable before vendors are activated.

## Product/demo impact

This slice shows that outreach is adaptive and auditable instead of a generic reminder, without making the final depend on Twilio or ElevenLabs credentials.

## In scope

- Normalized outreach plan, consent, opt-out, attempt, delivery/call callback, response, failure, replay, and escalation boundaries.
- Deterministic channel/cadence policy informed by dated engagement features and the approved model priority.
- Explicit request/barrier overrides and immediate routing to the appropriate human-owned work.
- Twilio messaging and ElevenLabs/Twilio voice adapter interfaces, activation modes, kill switches, signature/idempotency boundaries, and server-side destination allowlist hooks.
- Provider-ready UI and controlled disclosed replay through normalized workflow events.

## Out of scope

- Live Twilio or ElevenLabs activation, real outbound messages/calls, arbitrary destinations, or browser-held provider secrets.
- Clinical advice, symptom interpretation, clinical closure, or an autonomous communication agent.
- Provider-specific success states without a verified callback or explicitly disclosed controlled replay.

## Architecture impact

- Extends the workflow/outbox with normalized outreach decisions and events.
- Keeps provider activation and credentials server-side; `provider_ready` performs no external provider call.
- `frontend_design_required=true`; composer and timeline states reuse locked workspace components.

## Contract impact

Required. Define outreach capability, plan, attempt, consent/opt-out, response, callback, replay, failure, escalation, and audit projection contracts.

## Test depth

TARGETED. Independent tests cover policy precedence, consent/opt-out, explicit overrides, provider modes, no-network guarantees, callback verification/idempotency boundaries, and truthful status projection.

## Security risk

STANDARD with dedicated review. Material concerns are consequential outbound actions, arbitrary destinations, webhook spoofing/replay, consent enforcement, secrets, and disclosure in messages/logs.

## Dependencies

- `FLOW-001` stable events, projections, explicit-barrier routing, and feature snapshot.
- Stakeholder-reviewed outreach scripts, consent/opt-out content, and supported-language behavior before activation-ready acceptance.

## Acceptance criteria

1. Dated model/engagement features inform outreach priority, while deterministic policy chooses preferred or previously successful channel first and approved escalation near the cutoff.
2. `Need a ride`, `call me`, symptom, or scheduling responses override prediction immediately and create the appropriate owned work without clinical interpretation.
3. Declines, nonresponse, increasing latency, and recent delivery failure can shorten review timing or recommend voice/human follow-up according to the approved policy.
4. The system never sends clinical advice, interprets symptoms, or closes a clinical barrier autonomously.
5. In `provider_ready` mode, the backend may create planned/disclosed-replay events but makes no Twilio or ElevenLabs network call.
6. The UI never shows `Delivered` or `Completed` without a verified callback or clearly disclosed replay event.
7. Adapter activation boundaries require server-side credentials, destination allowlists, consent/opt-out checks, signed webhook validation, idempotency, and separate approval.
8. The composer/timeline provides accessible empty, queued, scheduled, attempted, responded, opted-out, failed, and human-follow-up states with channel availability, language, response history, and next action.
9. No provider secret or arbitrary phone destination reaches or is accepted from the browser.
