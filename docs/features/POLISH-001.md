# POLISH-001 — Product-voice UI copy

**Status:** Implemented on `feature/POLISH-001-product-copy`; human-approved September 23, 2026.

## User-visible outcome

Every workspace reads as a finished product. Demo-framing labels no longer undermine the work on screen; the presenter discloses the controlled story verbally.

## Approved decisions

1. Remove demo, synthetic, fictional, prepared, scenario, illustrative and replay qualifiers from landing, sign-in, staff, Epic, insights, transportation/CareLink, timeline, receipt, live-call, patient and caregiver surfaces. Remove the `Demo mode · no live dispatch` chip.
2. Epic surfaces read **Connected to Hospital Epic Sandbox** with `Epic FHIR R4 record · read-only`; captured times read "Retrieved"; missing values read "Not recorded".
3. Remove the notebook, dataset, saved-result and data-dictionary links from Insights. The file names and contents describe demo/synthetic data; the files stay in the repository. The UI hides the artifact's "Synthetic data only." limitation and the `synthetic-` model-version prefix without editing the hash-bound artifact.
4. Transportation positioning: CareLink is OncoReady's vendor portal for local transport partners without their own software (`OncoReady vendor portal · Active`); Uber Health is `API integration · Planned` and not yet connected. Vendor-originated ride events read as reported via CareLink (for example `Partner A reported unavailable via CareLink`).
5. The Care Navigator reaches the CareLink Transportation workspace from the **Transportation** sidebar item, which replaces the static CareLink resources page. The separate Transportation entry is removed from the Switch Workspace dropdown; the direct Transportation sign-in still opens the standalone workspace.
6. The staff shell no longer shows the internal note "Graph and audit context are embedded in the case workspace for this role."

## Boundaries kept

- Clinical-safety copy stays: not medical clearance, human nurse review, planned time rather than live ETA, read-only Epic with no writeback, attendance confirmed separately.
- No new capability claims: no live sync, GPS, real dispatch, HIPAA, real patients or clinical validation.
- The presenter-only `Private checkpoint` control is unchanged.
- Copy only; no layout, token or component-style change.

## Verification

95 component tests, 10 Playwright tests (including the no-send presenter rehearsal) and the production build pass. Browsers that ran the old story show the previous timeline text until **Reset Workspace**.
