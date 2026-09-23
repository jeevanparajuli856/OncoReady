# LAND-005: Simpler footer

**Status:** Done. Merged into `main`.

## User-visible outcome

The footer shows only the OncoReady logo (links home) and the Privacy Policy, Terms of Service and FHIR R4 mapping links. The "Treatment readiness platform" label and the **Reduce motion / Motion off** button are gone.

## Change

- `frontend/src/App.tsx`: removed the label and the motion button, and the `userReducedMotion` state behind it. Reduced motion now follows only the operating-system `prefers-reduced-motion` setting, which the app already watched live.
- `frontend/src/components/Header.tsx`: dropped the unused `onToggleReducedMotion` prop.
- `docs/design/DESIGN_SYSTEM.md`: motion rules now name the OS preference as the only switch.

## Accessibility

Visitors who need less motion still get it: turning on Reduce Motion in macOS, iOS, Windows or Android settings disables reveals, smooth scrolling, pulses, confetti and decorative movement exactly as before.

## Verification

- The component test now simulates the OS reduce-motion setting and checks that `.motion-reduce` applies, the story stays readable, and no motion button exists.
- The mobile Playwright check that proved the footer control was focusable and not covered by the workspace dock now targets the footer's Privacy Policy link.
- `npm run build` passes; 113 component tests and 14 Playwright tests pass.
- Screenshots: `frontend/artifacts/LAND-005-footer-desktop.png` and `LAND-005-footer-mobile.png`.
