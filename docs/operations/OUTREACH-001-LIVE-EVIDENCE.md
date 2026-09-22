# OUTREACH-001 live provider check — September 22, 2026

This record omits phone numbers, provider identifiers, credentials, and message bodies.
The consenting recipient authorized one short call and one SMS in this session.

## Voice

- ElevenLabs agent and its Twilio-linked outbound phone ID were checked by API before the test.
- Agent setup: short transportation check-in opener, one-sentence caller turn, short nonclinical reply, End Call tool, and 60-second conversation maximum.
- The protected API reserved one call, and Twilio reported `ringing → in_progress → completed`.
- Twilio reported a 23-second completed call. The recipient confirmed the phone rang and the full spoken exchange worked.
- The operator page displayed `completed`; its call action became disabled. Completion is not patient acknowledgment.

## SMS

- The protected API reserved one SMS using fixed server-side recipient and text.
- Twilio accepted submission, then reported `undelivered` with provider error `30034`.
- Read-only account inspection found the configured sender attached to its Messaging Service, with the A2P 10DLC campaign `IN_PROGRESS`.
- No SMS receipt was claimed. The operator page displayed `undelivered`; its SMS action became disabled.
- A later real SMS acceptance requires Twilio campaign approval and a separately authorized, bounded retry. This test's ledger and failure evidence must remain intact.

## Boundary checks

- Unauthenticated status returned 401; an unarmed call returned 403 before the live arm.
- The private control authenticated from browser memory, showed provider-polled status, and displayed no recipient, provider SID, or secret.
- Each action was reserved durably before provider submission. A migration cleared two empty reservations produced by an insert-result bug before any provider request; the one-time arm was retained. The corrected API then dispatched exactly one call and one SMS.
- Frontend build, 91 smoke tests, backend 80 non-integration tests (including a browser-payload boundary test), and deployed desktop/mobile private-control checks passed. Separate PostgreSQL integration tests were not run without a disposable test database.
