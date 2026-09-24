# OUTREACH-002 — Outreach history and in-app call button

**Status:** Implemented on `feature/OUTREACH-002-in-app-call-and-history`.

## User-visible outcome

Camila's case has an **Outreach** tab. It shows what the outreach engine did (voice check-ins and texts), Camila's replies, the ReadySignal score at each checkpoint and the decision each reply triggered. The Care Navigator can place a real check-in call from inside OncoReady with **Call Camila**, with no token typed on stage.

## Approved decisions

1. **History (frontend only, prepared):**
   - T−7 automated voice check-in: answered, no barrier.
   - T−2 check-in text: ride not yet confirmed, follow-up scheduled.
   - T−1 follow-up text: Camila's reply opens the transportation task (to Marcus) and the symptom mention (to Sarah, for human review).
   - ReadySignal chips use the saved model scores (13.8, 20.5, 26.4).
   - The texts reuse the existing prepared outreach threads, so the story matches the timeline.
2. **Role privacy:** both the Care Team and the Care Navigator see the tab. The Care Team sees Camila's verbatim reply and the symptom routing. The Navigator sees only a reply summary ("Ride cancelled. Clinical details went to the care team.") and the transportation decision; the words "not feeling well" never render for the Navigator.
3. **Text is presented as active:** the Voice and Text channels read **Active**. **Send text** is visible but disabled ("Texts go out automatically on the check-in schedule"). The human product owner will wire live SMS later; the real SMS is pending carrier registration.
4. **In-app call (real):**
   - **Call Camila → Call now** posts to `POST /api/v1/outreach/demo-call`.
   - The status follows the real call (Dialing… → Ringing… → Connected → Call completed / No answer / Line busy) by polling every 2 seconds, then the call joins the history as "Voice check-in · placed by Marcus Vance, MSW".
   - A reload during a call keeps following it: the button stays disabled until the call reaches a final status, then re-enables without another reload. A call placed before the reload does not join the history.
   - Only the Navigator sees the button.
   - When the switch is off, the button is disabled with "Calling is paused for this workspace."
5. **Backend switch instead of a token:** `DEMO_CALL_BUTTON` (default off) enables the no-token endpoint. It keeps the fixed server-side recipient, full outreach readiness, one unresolved call at a time and the daily limit. Each call gets its own `demo` window, so earlier test calls don't block the demo. Responses expose status only, never the recipient or provider. The human product owner turns it on for demo day and off afterwards, and revokes the operator token.
6. **Professional copy:** no provider names (Twilio, ElevenLabs) or synthetic wording anywhere in the UI.

## Boundaries kept

- No transcript parsing. The history's reply decisions are prepared, and the live call doesn't change the workflow.
- The private `/operator/live` page and its token-protected endpoints are unchanged and remain the backup.
- Design system unchanged: the tab reuses the existing cards, chips, pills and buttons.

## Verification

- **Backend:** 83 unit tests pass, including 3 new ones (switch off by default and never calls; fails closed without outreach setup; status exposes no recipient or provider). 10 PostgreSQL integration tests pass, including a new one showing sequential demo calls, one at a time, capped by the daily limit, always to the fixed recipient.
- **Frontend:** 112 component tests pass, including 5 new ones in `tests/outreach-panel.test.tsx` covering the history and scores, Navigator privacy, confirm → call → completion, the paused state and a refused call. 14 Playwright tests pass, including the full Care Team → Navigator → **Call Camila** journey with the call endpoint mocked in the browser.
- **Build:** the production build passes.
- **Screenshots:** `frontend/artifacts/OUTREACH-002-care-team.png`, `OUTREACH-002-navigator-ringing.png`, `OUTREACH-002-navigator-completed.png`.

## Before demo day (human)

Deploy, set `DEMO_CALL_BUTTON=true` on the Railway API service, confirm participant consent, and test once. After the talk, set it back to false and revoke the operator token.

## Dependencies

- OUTREACH-001, ML-002
