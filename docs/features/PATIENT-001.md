# PATIENT-001: Report a new problem after the readiness check

**Status:** Done. Merged into `main`. Not part of the seven-minute demo path.

## User-visible outcome

After Camila completes her readiness check, her home screen shows a **Something changed?** card with a **Report a problem** button. It opens the same two-part form as the check, titled **Report a Problem**, but starting blank: a ride change, a new symptom, or both, in her own words. **Send to Care Team** routes each part to its existing owner.

- **Symptom:** Sarah Jenkins' clinical task reopens (`ASSIGNED`) with the new verbatim text. Sarah must accept ownership and record a new human disposition. Her case screen shows "New patient report, verbatim · Sep 24, 11:20 AM CT".
- **Ride problem, plan already recovered:** the current plan fails through the existing `failCurrentRidePlan` path, so the plan version goes up, Ana's "seen" is cleared, and Marcus recovers with a backup as before.
- **Ride problem, ride work still open:** the plan is not failed. Marcus's case screen shows "Ride update from the patient, verbatim".
- **Either way:** Camila's acknowledgment is cleared and the status returns to **Treatment at risk**. The plan reaches **Continuity plan confirmed** again only after the three existing conditions are met again: human disposition, complete current ride plan, and her new confirmation.

## Rules

- Only the patient can file a report (`REPORT_NEW_PROBLEM` is ignored from any other workspace), only after the readiness check, and only with some text.
- Each report leaves `EVT-PATIENT-REPORT-<n>` plus `-CLINICAL` / `-RIDE` events. Later nurse and patient steps use round-suffixed command and event ids (`-r2`, `-R2`, ...), so repeated rounds stay unique. First-round ids are unchanged, so the demo path and checkpoints behave exactly as before.
- Fix included: a second backup assignment used the same id `RIDE-ASG-BACKUP-002`, which the saved-state validator rejects. That would reset the story on reload or tab sync. Later backups now use `RIDE-ASG-BACKUP-V<version>`.
- New optional fields: `clinicalDetails.reportedAt` and `transportDetails.patientUpdate` / `patientUpdateAt`, added to the saved-state validator.

## Boundaries

- The report form keeps the existing clinical-safety copy: exact words go to a human nurse, with no automated clinical decision.
- No SMS, call or provider action is triggered. Timestamps follow the story's fixed clock (Sep 24, 11:20 AM CT).

## Verification

- `tests/patient-report.test.ts` (5 tests): patient-only guard; symptom reopen through nurse and patient reconfirmation; ride failure and recovery with a unique backup id; ride update without failing open work; a second follow-up round. Every final state passes the saved-state validator.
- `tests/patient-report-ui.test.tsx`: the button appears only after the check, the form starts blank, an empty report is refused, and Sarah sees the new words.
- `npm run build` passes; 120 component tests and 14 Playwright tests pass, including the presenter rehearsal.
- Screenshots: `frontend/artifacts/PATIENT-001-*`.
