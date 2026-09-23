# RIDE-002 — CareLink vendor portal, provider adapters and street route map

**Status:** Implemented on `feature/RIDE-002-carelink-vendor-portal`.

## User-visible outcome

A local transport vendor without its own software signs in to CareLink, OncoReady's vendor portal, accepts or releases Camila's trip, and the Care Navigator sees that update in the Transportation Workspace. The route map shows the real street route instead of a drawn corridor. The Uber Health card shows the Uber logo and reports the adapter's honest status.

## Approved decisions

1. **Named fictional partners.** Partner A becomes **Crescent Lantern Medical Rides**, the primary provider and the CareLink vendor signed in to the portal. Partner B becomes **Magnolia Wayfare Transport**, the backup provider. Both are invented names; a web search found no transport company using either name.
2. **CareLink vendor portal.** A new `CARELINK_VENDOR` workspace at `/carelink`, reached through the `abct@oncoready.me` sign-in (since RIDE-003; the short-lived `abcv@` login was removed) and the Switch Workspace menu. It has its own CareLink branding and a "Powered by OncoReady" line.
   - **Trip board:** the vendor sees an offered trip after the navigator assigns it via CareLink. The vendor can **Accept trip** or **Decline**, and after accepting can **Report unavailable** with a reason (vehicle out of service, driver unavailable, outside service window).
   - **Trip-day statuses:** En route, Picked up and Dropped off are shown but disabled until trip day. The scenario ends before treatment day, so no pickup is claimed.
   - **Completed trips:** the previous trip `carelink-prior-001` appears as a completed trip.
3. **Shared state.** Vendor actions go through the single workflow reducer. Accepting records an audit event ("accepted the trip via CareLink"). Declining or reporting unavailable runs the existing primary-failure path, so the blocker reopens, the plan version advances and the acknowledgment is invalidated. A browser `storage` listener lets a CareLink tab and a Care Navigator tab update each other live; each tab keeps its own workspace, route and replay position.
4. **Vendor authorization in logic.** Only `CARELINK_VENDOR` can accept a trip. The vendor cannot run navigator actions or open staff routes. Declining or reporting unavailable works only for its own current assignment. The vendor reads a `deriveVendorTripView` projection with rider first name and last initial, rider callback phone, pickup, destination, times, vehicle type, driver and vehicle. The projection excludes diagnosis, clinical concern, nurse notes, labs, Epic context and caregiver details. The header's readiness pill is hidden for the vendor.
5. **Provider adapters.** A frontend `TransportProvider` interface in `src/lib/transportProviders.ts` describes each update source.
   - **CareLink adapter:** backed by the workflow reducer; status `ACTIVE`.
   - **Uber Health adapter:** a stub with status `AWAITING_CONNECTION` that declares what it would supply (trip status, driver assignment, pickup and drop-off events) and its requirements (contract and API credentials). It performs no network request and cannot enter the dispatch path.
6. **Uber Health card.** It shows the Uber logo (`public/brands/uber-logo.svg`, from Wikimedia Commons `File:Uber_logo_2018.svg`) with "Health" and reads **Adapter built · Awaiting connection**. The human product owner accepted the trademark use for demo purposes and will answer partnership questions directly.
7. **Street route map.**
   - **Where:** the Transportation panel, the caregiver view and the CareLink trip card use the Leaflet map with OpenStreetMap standard tiles, attributed to © OpenStreetMap contributors and softened with a CSS filter. CARTO basemaps were tried first and dropped because they now require an API key. OSM's tile policy allows this light, attributed demo use; heavy production traffic would need a hosted tile provider.
   - **Route:** the polyline follows the stored street route from 1420 St. Charles Ave to Benson Cancer Center (about 8.3 km, about 13 minutes). It was routed once with OSRM on OpenStreetMap data and saved in `src/data/routes.ts`, so there are no runtime routing calls.
   - **Previous-trip replay:** a vehicle marker moves along the route as the events advance.
   - **Fallback:** the drawn SVG remains the offline and test fallback.

## Visual scope

The CareLink portal's teal brand, slate surfaces and `carelink-btn` styles are a human-approved exception to the visual lock, requested so the vendor portal reads as its own product. They apply only inside `/carelink`. Every OncoReady surface keeps the approved system. Map pins keep their existing tone colors.

## Boundaries kept

- No real booking, dispatch, GPS, live ETA, Uber API call or claim of an Uber Health connection or contract.
- The planned times in the current plan are unchanged. The moving vehicle appears only in the previous-trip replay.
- The navigator panel keeps its existing controls. The presenter can still record primary unavailability from the staff side.
- The visual system is preserved. CareLink's distinct branding appears only inside the vendor portal.

## Acceptance criteria

1. Signing in as `abct@oncoready.me` opens `/carelink`. An offered trip appears only after the navigator assigns Crescent Lantern Medical Rides.
2. Accepting in CareLink adds a timeline event and an "Accepted in CareLink" tag on the navigator's assignment.
3. Declining or reporting unavailable in CareLink reopens the navigator's blocker with the event "Crescent Lantern Medical Rides reported unavailable via CareLink". The trip moves to Released in the portal.
4. The vendor cannot trigger navigator or Care Team actions. The vendor projection contains no clinical or Epic fields. Unit tests cover both.
5. With two tabs open, a vendor action in one tab appears in the other without a reload.
6. The Uber Health card shows the logo and "Adapter built · Awaiting connection". No request goes to an Uber domain.
7. The Transportation map follows streets. During replay the vehicle advances. The fallback renders with no network.
8. The build, component tests and Playwright tests pass. Desktop and mobile screenshots are refreshed.

## Verification

- `npm run build` passes.
- 107 component and unit tests pass, including 10 new ones in `tests/carelink-vendor.test.tsx` covering the vendor rules, the privacy projection, cross-tab sync, the portal UI and the Uber adapter making no network request.
- 12 Playwright tests pass, including the new two-tab CareLink ↔ Transportation sync test. Its Uber network check now matches hostnames, so the local `/brands/uber-logo.svg` path is not counted.
- Screenshots: `frontend/artifacts/RIDE-002-carelink-desktop.png`, `RIDE-002-carelink-mobile.png`, `RIDE-002-transport-route.png`. The RIDE-001 transport screenshots were refreshed.
- Browsers that ran an older story keep the old provider names in saved state until **Reset Workspace**.

## Dependencies

- RIDE-001, POLISH-001, NAV-001
