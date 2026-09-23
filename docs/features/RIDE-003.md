# RIDE-003 — CareLink as an OncoReady sub-brand

**Status:** Implemented on `feature/RIDE-003-carelink-subbrand`.

## User-visible outcome

CareLink opens as its own full page with its own logo and reads as **CareLink by OncoReady**, a sub-brand for local transport vendors. The presenter can still reach it from the Switch Workspace menu and switch back in one click.

## Approved decisions

1. **Logo:** `frontend/public/carelink-mark.svg` reuses OncoReady's continuity loop in white on a teal tile. The check becomes a dotted route from a pickup point to OncoReady's node, now indigo as the tie back to the parent brand. The wordmark is "Care" plus "Link" in teal. `CareLinkMark` renders the lockup; `endorsed` adds "by [OncoReady mark] OncoReady".
2. **Standalone page:** in the `CARELINK_VENDOR` workspace the OncoReady header and footer are hidden. CareLink has its own sticky top bar with the endorsed lockup and vendor name, and its own footer with the lockup, Privacy and Terms. While the page is open, the browser tab title is `CareLink by OncoReady · Trip board` and the tab icon is the CareLink mark. Both are restored on leaving.
3. **Launch and return:** the Switch Workspace list is now the shared `WorkspaceSwitchMenu`. The OncoReady header shows it with the entry **CareLink by OncoReady (Crescent Lantern Medical Rides)**, and the CareLink bar shows the same list under **Dispatch desk · Switch workspace**. The CareLink bar has no Reset button, so the scenario can't be wiped by accident. The portal receives only avatar images for the menu, never patient records.
4. **Update sources card:** the CareLink card on the Transportation Workspace shows the endorsed lockup.

## Boundaries kept

- The RIDE-002 vendor rules, privacy projection, cross-tab sync and Uber Health wording are unchanged.
- OncoReady's own logo, header and footer are unchanged everywhere else.
- No CareLink-branded sign-in yet. `abcv@oncoready.me` still signs in through the OncoReady login.

## Verification

- `npm run build` passes.
- 107 component tests pass. The portal test checks the endorsed lockup and the tab title.
- 13 Playwright tests pass. A new test launches CareLink from the Care Navigator menu, confirms there is no OncoReady header and the CareLink tab title, then switches back through the CareLink bar. The two-tab sync test also checks that the OncoReady header and footer are absent.
- The RIDE-002 CareLink and transport screenshots were refreshed.

## Dependencies

- RIDE-002
