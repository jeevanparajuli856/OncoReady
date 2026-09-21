# RECOVER-001 — Restore Railway deployment and frontend presentation

## User-visible outcome

The deployed OncoReady public landing page presents the approved Clinical Glass / Continuity Aurora experience without collapsed hero artwork, scattered labels, unexpected overflow, or missing visual hierarchy, while the Railway API and web services both expose a verified healthy deployment.

## Product/demo impact

This restores the first impression and entry point to the role-based treatment-continuity journey. It also closes the verification gap that allowed a technically successful web build to ship a visibly broken hero.

## In scope

- Restore the existing `ContinuityField` presentation using the established design-system direction; do not redesign the landing page.
- Verify the public landing page at desktop and mobile viewport sizes with real browser rendering.
- Add a focused regression assertion that detects loss of the hero visualization's layout-critical styles or geometry.
- Verify the current Railway `api` and `web` services, including API health and the deployed public page/assets.
- Deploy the integrated fix to the existing `OncoReady-Dev` production environment and observe terminal Railway deployment status.

## Out of scope

- New product features, copy, pricing, routes, authentication, API behavior, database schema, provider integrations, or workflow behavior.
- A second visual redesign of the approved LAUNCH-001 experience.
- Production claims or production patient data.

## Architecture impact

Keep architecture to the minimum needed for this slice.

- Frontend-only implementation repair plus deployment verification. Reuse the existing React/Vite component boundary and Railway service topology.
- No backend, database, contract, or long-lived architecture change is expected unless live diagnostics reveal a new blocker.

## Contract impact

State whether a cross-component interface must be created or changed. If not, say none.

None. Existing HTTP and event contracts remain authoritative and unchanged.

## Test depth

Choose the smallest useful level: NONE / SMOKE / TARGETED / FULL.

TARGETED — production build plus independent browser checks at desktop and mobile sizes, with focused assertions for hero geometry/overflow and the primary public-to-access journey.

## Security risk

Classify LOW / STANDARD / HIGH and identify only material trust-boundary concerns. Baseline secret and authorization safety always applies.

LOW — public illustrative content and presentation-only code. Existing secret and authorization guardrails remain unchanged.

## Dependencies

- The existing `ContinuityField` component and approved design system.
- Railway project `966294da-3b6c-4f79-b257-95e1f34038f7`, production environment `d7af9772-eadf-47f1-ab28-9b8c7b21e4ca`.

## Acceptance criteria

- At a 1920×1080 desktop viewport, the public hero has no horizontal overflow, the headline and hero visualization are both visible, and the visualization labels/nodes are positioned inside a bounded visual surface rather than raw page flow.
- At a 390×844 mobile viewport, the landing page remains readable, navigable, and free of horizontal overflow.
- `How it works`, `Pricing`, and `Workspace access` remain usable, and workspace access opens the controlled role gateway.
- Frontend production build and targeted browser regression tests pass.
- The current Railway API responds successfully at `/health`, and both the submitted API/web deployment states are explicitly checked rather than inferred from CLI exit codes.
- The deployed web URL serves the repaired current bundle and passes a post-deploy browser smoke check.
