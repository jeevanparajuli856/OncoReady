# OUTREACH-001 sequential call check — September 23, 2026

This record omits phone numbers, operator credentials, provider identifiers and call audio.

## Release and guarded path

- The API deployment applied migration `20260923_0004` and reached Railway `SUCCESS`; `/health` and `/ready` returned healthy responses with the migration current. The matching web deployment also reached `SUCCESS`.
- The deployed operator page loaded on mobile without browser errors or provider POSTs during a read-only check.
- The protected status showed the September 22 historical call as `completed`, no open call window, zero calls attempted today, and permission to arm a new window.
- One explicitly consent-confirmed **test** window was opened. One protected call request was accepted and reserved, with today's call count becoming one. No second window was opened.

## Provider and recipient outcome

- Twilio status progressed from `initiating` to `in_progress` to `completed`.
- The recipient reported that the phone rang but they rejected the call because they were on another call. An audible ElevenLabs exchange was **not** confirmed for this attempt.
- The final `completed` status permits a new window under the sequential-call rule. It is a provider call state, not proof that a person answered or heard the agent.
- No retry was placed. Another live call requires a fresh explicit purpose, current recipient consent confirmation and operator action; today's test authorization does not authorize a demo call.

## Offline verification

- 80 backend non-integration tests, five isolated PostgreSQL sequential-call tests, 95 frontend component tests, the frontend production build and contract validation passed before deployment.
- The PostgreSQL tests covered a completed test call followed by a separate demo window, an unknown outcome blocking a new window, current-consent validation, a daily limit, and two devices racing for one call window. Provider requests were mocked in those tests.

The [September 22 evidence](./OUTREACH-001-LIVE-EVIDENCE.md) remains intact and records the earlier audible exchange and undelivered SMS separately.
