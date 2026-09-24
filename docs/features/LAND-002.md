# LAND-002: Transport partners on the landing page

**Status:** Done. Merged into `main` after owner review. The presenter script covers Uber Health and Lyft Healthcare wording.

## User-visible outcome

The public landing page has a **Transport partners** section between the Louisiana access map and the business model. It shows which ride partners OncoReady works with and which are still being connected.

| Card | Badge | Footer |
| --- | --- | --- |
| CareLink by OncoReady (endorsed lockup) | Active | Live in the OncoReady workspace |
| Uber Health (Uber logo) | Coming soon | none |
| Lyft Healthcare (Lyft logo) | Coming soon | none |

Heading: "When a ride falls through, the backup is already lined up." The lede says OncoReady coordinates the ride with transport partners and that the Uber Health and Lyft Healthcare connections are coming soon.

## Approved decisions

1. Uber Health and Lyft Healthcare both show only a **Coming soon** badge, with no requirements footer. The owner reports a Lyft relationship is in progress.
2. The official Lyft logo is used. `frontend/public/brands/lyft-logo.svg` comes from Wikimedia Commons `File:Lyft_logo.svg` (Lyft press kit, listed as public domain). The owner accepted the trademark use.
3. The section appears on the landing page. *Update (September 23, 2026):* at the owner's request, the Transportation Workspace's **Update sources** now shows a third card, Lyft Healthcare, with a **Coming soon** status and "Needs: Lyft Healthcare agreement and API access". No Lyft adapter is built: `lyftHealthcareProvider` in `frontend/src/lib/transportProviders.ts` lists no capabilities and makes no network request.
4. No navbar link was added; the header is unchanged.

## Boundaries kept

- No "Connected" label, API endpoint, dispatch time or "books the ride" claim. Nothing on the page calls an Uber or Lyft domain.
- Hero, pricing, FAQ and trust copy are unchanged.
- The section reuses `landing-business-grid`, `landing-business-card`, `chip-mint`, `chip-sun` and `CareLinkMark`, with no new CSS or tokens.

## Verification

- `npm run build` passes.
- 114 component tests pass, including a new LAND-002 test in `tests/access.test.tsx`: three cards in order Active, Coming soon, Coming soon; both logos render; no "Awaiting connection" footer; no "Connected" text.
- 14 Playwright tests pass. A separate browser check recorded zero requests to Uber or Lyft hosts.
- Screenshots: `frontend/artifacts/LAND-002-partners-desktop.png` and `LAND-002-partners-mobile.png`.

## Dependencies

- LAND-001, RIDE-002, RIDE-003
