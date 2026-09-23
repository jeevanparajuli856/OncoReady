# LAND-002: Transport partners on the landing page

**Status:** Implemented on `feature/LAND-002-transport-partners`, awaiting owner review.

## User-visible outcome

The public landing page has a **Transport partners** section between the Louisiana access map and the business model. It shows which ride partners OncoReady works with and which are still being connected.

| Card | Badge | Footer |
| --- | --- | --- |
| CareLink by OncoReady (endorsed lockup) | Active | Live in the OncoReady workspace |
| Uber Health (Uber logo) | Coming soon | Awaiting connection: requires an Uber Health contract and API credentials |
| Lyft Healthcare (Lyft logo) | Coming soon | Awaiting connection: requires a Lyft Healthcare agreement and API credentials |

Heading: "When a ride falls through, the backup is already lined up." The lede says OncoReady coordinates the ride with transport partners and that the Uber Health and Lyft Healthcare connections are coming soon.

## Approved decisions

1. Uber Health and Lyft Healthcare both read **Coming soon · Awaiting connection**. The owner reports a Lyft relationship is in progress.
2. The official Lyft logo is used. `frontend/public/brands/lyft-logo.svg` comes from Wikimedia Commons `File:Lyft_logo.svg` (Lyft press kit, listed as public domain). The owner accepted the trademark use.
3. The section appears only on the landing page. The Transportation Workspace provider list is unchanged, so Lyft is not added there.
4. No navbar link was added; the header is unchanged.

## Boundaries kept

- No "Connected" label, API endpoint, dispatch time or "books the ride" claim. Nothing on the page calls an Uber or Lyft domain.
- Hero, pricing, FAQ and trust copy are unchanged.
- The section reuses `landing-business-grid`, `landing-business-card`, `chip-mint`, `chip-sun` and `CareLinkMark`, with no new CSS or tokens.

## Verification

- `npm run build` passes.
- 114 component tests pass, including a new LAND-002 test in `tests/access.test.tsx`: three cards in order Active, Coming soon, Coming soon; both logos render; two "Awaiting connection" notes; no "Connected" text.
- 14 Playwright tests pass. A separate browser check recorded zero requests to Uber or Lyft hosts.
- Screenshots: `frontend/artifacts/LAND-002-partners-desktop.png` and `LAND-002-partners-mobile.png`.

## Dependencies

- LAND-001, RIDE-002, RIDE-003
