# ACCESS-001 — Public experience pricing and workspace access

## User-visible outcome

A visitor understands OncoReady and its pricing without seeing a patient record, then enters only the center-scoped workspace assigned to the selected synthetic identity.

## Product/demo impact

This slice creates the polished entry to the final journey: public Continuity Rescue Story, two approved pricing plans, professional institutional access, and server-enforced routing to patient, caregiver, staff, or transportation.

## In scope

- Replace `Explore workspace` with `Workspace access` and route all public CTAs to `/access`.
- Remove the public Treatment Readiness Workspace, graph, Camila content, and seeded record access.
- Add the record-free three-panel public story and exactly two approved pricing cards.
- Add center selection, seeded provider-entry methods, configured email/password, forgot-password, sign-up, sign-out, and safe recovery states.
- Add server-managed sessions, center membership, hidden provider/persona mapping, route/API authorization, audit events, and privilege-safe sign-up.
- Extend the locked visual system with complete responsive, accessible, loading, error, disabled, and success states.

## Out of scope

- Real Google, Microsoft, or Apple OAuth and enterprise provisioning.
- Self-service creation of staff, transportation, or administrative privileges.
- Epic authorization, clinical context, workflow mutations, or external provider activation.
- Rebranding, global token changes, or restyling approved existing pages.

## Architecture impact

- Adds a server-side synthetic identity broker and secure session boundary.
- Enforces center, role, workspace, and object authorization at the API rather than trusting browser route or role claims.
- Removes protected data from public rendering and public network activity.
- `frontend_design_required=true`; design Phase A is a compatibility/extension plan bound to the locked baseline.

## Contract impact

Required. Define center discovery, provider/email session creation, current session, sign-out, sign-up/recovery state, authorized destination, and standardized unauthenticated/forbidden responses.

## Test depth

TARGETED. Independent browser/API tests cover every access method, route denial, session expiry, refresh, sign-out, public data absence, accessibility, responsive layout, and visual continuity.

## Security risk

HIGH with dedicated review. Material concerns are authentication, session fixation/hijacking, CSRF, credential handling, brute-force/throttling, role escalation, center isolation, and protected-data exposure.

## Dependencies

- `RAIL-001` deployed API, database, migration, and configuration foundation.
- The existing visual baseline and human-approved design lock.

## Acceptance criteria

1. `Workspace access` replaces `Explore workspace` everywhere and every public CTA reaches `/access`.
2. Public HTML, metadata, accessibility tree, searchable text, and network activity contain no Treatment Readiness Workspace, patient graph, Camila record, session creation, or protected workspace data.
3. `Detect early`, `Coordinate recovery`, and `Confirm continuity` update one record-free inline story panel with valid `aria-expanded` and controlled-panel relationships.
4. Exactly two responsive pricing cards show Pilot at `$18,000/year` and Network at `Talk to us`.
5. The center selector appears above all sign-in methods; Google, Microsoft, Apple, email/password, forgot-password, and sign-up have complete interaction states without displaying persona mappings.
6. Server configuration maps Google to patient, Microsoft to caregiver, Apple to staff, and the configured email account to transportation without accepting a browser-provided role or destination.
7. A successful session opens only its authorized workspace; refresh preserves it; direct access to another workspace returns a recoverable forbidden state.
8. Email sign-up cannot create staff, transportation, or administrator access; sign-out invalidates the server session.
9. Secure cookie, password, CSRF, throttling, audit, center-membership, and API authorization controls pass dedicated security review.
10. Keyboard, focus, mobile, screen-reader, password-manager, reduced-motion, and desktop/mobile visual-baseline checks pass with no unapproved global design drift.
11. Any sourced image/SVG includes provenance and license evidence, local serving where permitted, sanitization/optimization, and correct accessible treatment.
