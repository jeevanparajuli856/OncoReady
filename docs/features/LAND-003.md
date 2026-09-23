# LAND-003: Matching header logo size

**Status:** Done. Merged into `main`.

## User-visible outcome

The workspace header (patient, caregiver, staff, sign-in) shows the OncoReady logo at the same size as the landing header. It used to render a smaller compact lockup (`size={30} compact`, about 130px wide).

## Change

`frontend/src/components/Header.tsx` now uses the landing header's pattern in the workspace header: the title lockup at `size={38}` (184 × 59 rendered) from the `sm` breakpoint up, and the 42px continuity-loop mark alone on phones.

## Verification

- `npm run build` passes; 114 component tests and 14 Playwright tests pass, including the mobile 44px-target and no-horizontal-overflow check.
- Measured in the production preview: landing and signed-in patient workspace both render the logo at 184 × 59 on desktop and 42 × 42 on a 390px phone, with no horizontal overflow.
- Screenshots: `frontend/artifacts/LAND-003-header-workspace-desktop.png` and `LAND-003-header-workspace-mobile.png`.
