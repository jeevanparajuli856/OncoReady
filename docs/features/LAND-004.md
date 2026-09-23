# LAND-004: Remove the footer database status badge

**Status:** Done. Merged into `main`.

## User-visible outcome

The footer no longer shows the "Persistent foundation connected / unavailable" badge. It showed developer wording, and on a local run without `VITE_API_ORIGIN` it always read "unavailable", which looked like an error.

## Change

- Removed `frontend/src/components/FoundationStatus.tsx`, its only API helper `frontend/src/api/foundation.ts`, its component test, its `.foundation-status` CSS and its two Playwright assertions.
- The footer keeps the logo, platform label, Reduce motion, Privacy Policy, Terms of Service and FHIR R4 mapping.
- The backend is untouched. `GET /api/v1/foundation/proof` still returns the persisted record (checked on September 23: HTTP 200, "Railway PostgreSQL connected"). RAIL-001 notes the removal.

## Verification

- `npm run build` passes.
- 111 component tests pass (the 3 removed tests covered only the badge).
- 14 Playwright tests pass, including the mobile 44px-target and no-overflow check.
- Screenshots: `frontend/artifacts/LAND-004-footer-desktop.png` and `LAND-004-footer-mobile.png`.
