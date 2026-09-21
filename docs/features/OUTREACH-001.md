# OUTREACH-001 — Adaptive SMS and voice orchestration

## User-visible outcome

OncoReady uses trained predictions from Camila's past activity to select a permitted SMS/voice channel and contact time, then automatically schedules and executes the selected action through real SMS/voice delivery to the verified test phone. The staff timeline shows why it was chosen and what actually happened.

## Product/demo impact

This slice shows that outreach is adaptive and auditable instead of a generic reminder, using the human's purchased Twilio/ElevenLabs accounts, with disclosed replay only as a recovery path.

## In scope

- Normalized outreach plan, consent, opt-out, attempt, delivery/call callback, response, failure, replay, and escalation boundaries.
- Learned channel/time selection from ML-001, constrained by consent, explicit preference, quiet hours, rate limits and deadlines; a durable scheduler/outbox automatically executes due actions without a second presenter send/call click.
- Explicit request/barrier overrides and immediate routing to the appropriate human-owned work.
- Twilio messaging and ElevenLabs/Twilio voice adapter interfaces, activation modes, kill switches, signature/idempotency boundaries, and server-side destination allowlist hooks.
- Controlled disclosed execution/replay through the same normalized scheduler/outbox path. A private operator starts the run and may advance scenario time; model output, not the operator, selects the channel/time.
- Real test-contact SMS and voice are now explicitly selected. Twilio handles SMS and telephone transport; ElevenLabs supplies reviewed nonclinical voice audio. Follow [OUTREACH_TEST_DELIVERY.md](../operations/OUTREACH_TEST_DELIVERY.md) for setup, live clocks, acceptance and reset-safe dispatch limits.

## Out of scope

- General patient outreach, arbitrary/unverified destinations, uncontrolled spending, browser-held secrets, production clinical messaging or Uber activation.
- Clinical advice, symptom interpretation, clinical closure, generated medical dialogue, or unbounded agent behavior. Use the bounded reviewed nonclinical message/voice content.
- Provider-specific success states without a verified callback or explicitly disclosed controlled replay.

## Architecture impact

- Extends the workflow/outbox with normalized outreach decisions and events.
- Adds protected provider variables, Twilio callback configuration and prepared ElevenLabs audio serving; infrastructure impact is true for this bounded activation.
- Keeps provider activation and credentials server-side; `provider_ready` performs no external provider call.
- `frontend_design_required=true`; composer and timeline states reuse locked workspace components.

## Contract impact

Required. Define outreach capability, candidate/selected action, model decision, scheduled-at/due-at, plan version, attempt, consent/opt-out, response, callback, replay, cancellation, failure, escalation and audit contracts. Bind each attempt to its model version, feature cutoff, decision and idempotency key; execution mode and provider outcome remain distinct.

## Test depth

TARGETED. Independent tests cover policy precedence, consent/opt-out, explicit overrides, provider modes, no-network guarantees, callback verification/idempotency boundaries, and truthful status projection.

## Security risk

HIGH with dedicated review. Material concerns are consequential outbound actions, arbitrary destinations, webhook spoofing/replay, consent enforcement, secrets, and disclosure in messages/logs.

## Dependencies

- `FLOW-001` stable events, projections, explicit-barrier routing, and feature snapshot.
- `ML-001` accepted artifact and inference contract before model-informed integration/acceptance. Planning and isolated adapter work may overlap against a frozen contract; fixture scores cannot satisfy acceptance. If inference later fails, deterministic cadence continues with `Score unavailable`.
- Task-reviewed nonclinical scripts, consent/opt-out and language behavior from [LAUNCH_SCENARIO_SETTINGS.md](../LAUNCH_SCENARIO_SETTINGS.md), under delegated synthetic planning. Clinical approval remains separate; bounded test-contact activation is authorized here, subject to verified configuration and the dedicated security gate.

## Acceptance criteria

1. ML readiness output prioritizes outreach, and the trained engagement model selects the highest-scoring permitted channel/time using dated activity. Deterministic rules filter illegal choices; they cannot silently force SMS first or supply a fixed timing sequence.
2. `Need a ride`, `call me`, symptom, or scheduling responses override prediction immediately and create the appropriate owned work without clinical interpretation.
3. Nonresponse or delivery failure triggers a new decision with updated activity; it can select voice or another time when eligible. Explicit decline/opt-out cancels affected pending attempts. No candidate or unavailable model creates a visible human-follow-up state, never an invented learned decision.
4. The system never sends clinical advice, interprets symptoms, or closes a clinical barrier autonomously.
5. In `provider_ready` mode, the backend may create planned/disclosed-replay events but makes no Twilio or ElevenLabs network call.
6. The UI never shows `Delivered` or `Completed` without a verified callback or clearly disclosed replay event.
7. Bounded live-test activation uses server-side credentials, the verified contact allowlist, consent/opt-out checks, signed webhooks, idempotency, budget/rate bounds and the dedicated security gate. The human selected this mode; another generic activation approval is not required.
8. The composer/timeline provides accessible empty, queued, scheduled, attempted, responded, opted-out, failed, and human-follow-up states with channel availability, language, response history, and next action.
9. No provider secret or arbitrary phone destination reaches or is accepted from the browser.

## Required observable execution checks

| ID | Starting condition and trigger | Expected result / prohibited side effect | Verification |
|---|---|---|---|
| AC-010 | Accepted artifacts, seeded history and consent; start private controlled run | Persist candidate scores and one selected channel/time, then schedule it; no manual channel picker required | API/model contract integration |
| AC-011 | A scheduled action becomes due | Backend invokes the configured adapter once logically and updates the visible timeline from persisted outcomes; no second send/call click | Scheduler/outbox integration and browser journey |
| AC-012 | Worker restart, duplicate tick or retried command | No duplicate attempt; retries retain idempotency and ambiguous external results are reconciled rather than blindly resent | Concurrency/restart and adapter tests |
| AC-013 | Consent revoked, explicit response received, appointment/plan changed, kill switch set, or model decision expired before due time | Revalidate before dispatch; cancel/replan or require human follow-up. Never execute a stale prohibited action | Negative integration tests |
| AC-014 | First attempt has no response by the decision horizon | New scores use the updated history and select the next eligible action/time or human follow-up; no hard-coded Camila SMS-to-call branch | Held-out behavioral and end-to-end tests |
| AC-015 | Replay configured with network disabled | Automatic execution completes through the controlled adapter with replay provenance; real delivery/completion is never claimed | Network-denial test and visible evidence review |
| AC-016 | Engagement artifact absent, corrupt or incompatible | Show action-selection unavailable; keep explicit-barrier routing and human work active; never label fallback rules as model-selected | Artifact failure tests |
| AC-017 | Model-selected SMS is due in an armed live test window | Real SMS reaches the verified contact; record provider delivery evidence and any reply separately, with no manual Send click | Bounded live acceptance after verification/security approval |
| AC-018 | Model-selected voice action is due in an armed live test window | Real phone rings, reviewed ElevenLabs audio plays, and provider state plus optional explicit keypad response are separately recorded | Bounded live acceptance; no open-ended clinical dialogue |
| AC-019 | Scenario reset, accelerated clock, restart or repeat arming | Live ledger, opt-out, rolling rate limits and spend reservations survive; replay clock cannot trigger live backlog | Negative integration tests |

All checks are required. A recommendation card, pre-scripted score, manual Send/Call, or replay alone cannot satisfy automatic real delivery. The human confirmed both accounts purchased; sender, keys, test contact and callback readiness still need verification. No provider has been configured or invoked by this specification update.
