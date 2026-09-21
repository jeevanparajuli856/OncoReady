# OncoReady Nexus DevDay Winning Product Plan

**Status:** APPROVED AND RECONCILED — September 21, 2026

**Planning branch:** `feature/PLAN-002-railway-launch-roadmap`

**Primary inputs:** confirmed product direction from September 21, 2026 plus the reconciled [`PROJECT.md`](./PROJECT.md) and [`SYSTEM.md`](./architecture/SYSTEM.md)

**Execution plan:** [`LAUNCH_SPRINT_PLAN.md`](./LAUNCH_SPRINT_PLAN.md) decomposes this roadmap into dependency waves, task workspaces, external gates, verification evidence, and the launch-day runbook.

**Implementation state:** Human approved. `PLAN-002` reconciled the authoritative product, architecture, deterministic configuration, operations, long-lived decisions, and visual-lock instructions. This roadmap remains the approved planning record; the concern-specific source-of-truth files govern implementation. Production code still requires the applicable feature task to reach `BUILD_READY`.

**Confirmed delivery direction:** September 25, 2026; full scope retained. The human delegated synthetic planning to the agents. [`LAUNCH_SCENARIO_SETTINGS.md`](./LAUNCH_SCENARIO_SETTINGS.md) supplies concrete defaults for task-specific freezing, without claiming clinical policy or external activation.

## 1. Mission

Build the strongest product in the Nexus DevDay final: a polished, technically credible treatment-continuity platform that detects when an oncology patient is becoming less likely to arrive ready for infusion, selects the appropriate outreach path, coordinates accountable recovery work, and proves that the continuity plan closed.

The product should feel like one coherent hospital application rather than a collection of feature proofs. The primary journey follows Camila Lopez across Epic-sourced clinical context, patient outreach, staff intervention, transportation coordination, caregiver visibility, and final acknowledgment. Public pages explain the product; patient details, Epic context, the Treatment Readiness Workspace, and the Treatment Readiness Graph exist only after workspace access.

### Winning priorities

| Judging dimension | Target impression | Product proof |
|---|---|---|
| Problem legitimacy | OncoReady intervenes while treatment can still be preserved | T−7/T−2/T−1 trajectory, transport cutoff, and early exception queue |
| Novelty | The product closes a linked oncology readiness chain instead of sending a generic reminder | Adaptive outreach, department ownership, CareLink dispatch, acknowledgment, and closure evidence |
| Development difficulty | The difficult work is visible and inspectable | Live read-only Epic Sandbox context, durable event state, provider adapters, adaptive LightGBM scoring, SHAP, FHIR validation, and Railway deployment |
| Product quality | The experience looks ready for a hospital conversation | Professional access, strong visual hierarchy, responsive workspaces, purposeful motion, and coherent status behavior |
| Opportunity for impact | The audience can see how the product changes operations | Lead time, time-to-owner, time-to-closure, unresolved blockers, outreach response, and final disposition |

### Implementation bar

- Deploy the complete application in one Railway project containing a frontend service, backend service, and Railway PostgreSQL service.
- Build production-quality interaction and visual polish across the landing page, access flow, and every role workspace.
- Preserve the current approved OncoReady UI as the visual baseline. New work must adapt its existing design language rather than introducing a new theme, palette, typography system, or product-wide restyle.
- Permit the frontend specialist to source licensed online stock photography and SVG illustrations, icons, diagrams, or decorative assets when they materially improve the product aesthetic and remain consistent with that visual baseline.
- Core state transitions, deadlines, routing, CareLink assignments, metrics, and model outputs must come from working backend logic and persisted events rather than hard-coded screen swaps.
- SMS and voice must have complete provider-ready product surfaces and backend adapter contracts. Twilio and ElevenLabs credentials and outbound calls are explicitly deferred until access is purchased and approved.
- Uber Health must have a polished provider-ready surface and normalized adapter boundary. It must not issue rides, quotes, assignments, or provider-branded confirmations until approved credentials and verified callbacks exist.
- CareLink Partner Dispatch is the active transportation path. It must support a hospital's contracted local transportation providers, not only a single OncoReady-operated fleet.
- Epic Sandbox is the active clinical-context source for Camila in the staff workspace. The integration is read-only and uses the registered Non-PRD client ID through a server-backed standalone SMART on FHIR flow.
- A private pre-recording setup may complete Epic authorization before the recorded journey begins. Access tokens still expire; refresh-token support, secure server-side credential storage, reauthorization preflight, and an explicit last-known-good snapshot fallback provide continuity without fabricating live status.
- Only Camila receives the complete Epic-backed, end-to-end journey. Other nurse and transportation queue records remain lightweight OncoReady frontend fixtures and must never be represented as Epic-sourced or fully functional.
- The FHIR artifact must pass a pinned validator before the product labels it validated.
- The LightGBM pipeline, calibration, inference, and SHAP explanations must use real generated artifacts and a rich longitudinal synthetic dataset.
- The primary prerecorded journey must use live Epic Sandbox data when the preflight succeeds and remain deterministic through a visibly labeled Camila snapshot if Epic authorization or availability fails. Messaging, voice, and transportation vendor availability must not control the core story.
- No surface or presentation may claim a message was delivered, a call was completed, or an Uber Health ride was assigned without the corresponding verified provider event. Provider-ready capability may look complete; provider execution may not be fabricated.

### Confirmed human direction

- Host frontend, backend, and database together on Railway so Codex can provision, configure, deploy, inspect, and troubleshoot the complete stack through Railway tooling.
- Replace `Explore workspace` in the public navigation with `Workspace access`.
- Remove the public Treatment Readiness Workspace and Treatment Readiness Graph completely; both belong inside an authenticated workspace.
- Replace the removed patient preview with an interactive, record-free `Continuity Rescue Story` that explains the product through public storytelling rather than exposing any workspace.
- Provide exactly two pricing plans:
  - `Pilot` at `$18,000/year`, with `$1,500/month billed annually` as supporting copy.
  - `Network` with `Talk to us` instead of a public price.
- Make workspace access look like a professional institutional sign-in page, with a hospital/center selector at the top, SSO-style options, email/password sign-in, forgotten-password access, and email sign-up.
- Do not show presenter shortcuts or visible labels such as `Google → patient`, `Microsoft → caregiver`, or similar role mappings.
- For the controlled build, keep that routing hidden in server configuration: Google opens patient, Microsoft opens caregiver, Apple opens hospital staff, and configured email sign-in opens transportation.
- Start the recorded journey after a private presenter-only Epic authorization step. Do not show the Epic login or consent screen in the recording, and do not merge Epic authorization into the public or ordinary OncoReady sign-in flow.
- Give only the authenticated nurse and oncology navigator access to Camila's Epic clinical context. Ana remains Camila's family caregiver and receives only the transportation information Camila authorizes.
- Use a real read-only Epic Sandbox connection for Camila, with an exact-source timestamp and connection state. Preserve the last successful normalized Camila snapshot as a clearly labeled fallback; never present fallback data as live.
- Use the enabled R4 APIs for Patient, Appointment, Encounter, Condition, Observation labs, MedicationRequest, Oncology CarePlan, Oncology Plan Day RequestGroup, Location, Practitioner, DiagnosticReport results, patient-reported surgical history, and surgeries.
- Keep Epic actions read-only. Outreach, patient replies, work ownership, nurse acknowledgment, transportation coordination, caregiver permissions, and closure remain OncoReady-owned events with no Epic writeback claim.
- Show SMS, voice, and Uber Health as polished provider-ready capabilities while their external adapters remain unconfigured.
- Use CareLink as the active transportation coordination and dispatch path. CareLink must also support local transportation vendors contracted by an infusion center when Uber Health is unavailable or not preferred.
- Make the ML capability central to the story: it must learn from longitudinal readiness and engagement patterns, identify increasing attendance disruption risk, and drive the timing and channel of supportive outreach.
- Use Camila's longitudinal pattern as the signature explainable example without hard-coding her model result.
- Optimize every workspace for a prerecorded product video with live voice-over: fast state changes, readable data storytelling, strong transitions, and a reliable reset path.
- Keep the current UI design, colors, typography, spacing, component character, and other visual details; extend them consistently across every new surface.
- Allow appropriate licensed stock and SVG assets from online sources when needed to make the application more polished, memorable, and visually complete.

## 2. Finals Scenario and Cast

Use one consistent case across every surface so the audience follows Camila's rescue rather than learning several disconnected examples. Camila is an Epic-provided Sandbox test patient, not a real patient. Her returned clinical resources remain non-production test data; Ana, the center, staff identities, transportation activity, outreach history, model history, and all other queue records are controlled OncoReady fixtures.

| Scenario element | Selected scope | Purpose |
|---|---|---|
| Patient | Camila Lopez | Supplies the single live Epic Sandbox clinical record and shows a deteriorating readiness and engagement pattern followed by coordinated support |
| Caregiver | Ana Hernandez | Sees only patient-authorized transportation logistics |
| Selected center | Benson Cancer Center | Demonstrates facility-scoped access without implying a real hospital integration |
| Hospital staff | Sarah Jenkins, RN and Marcus Vance, MSW | Own clinical review and transportation navigation |
| Transportation coordinator | CareLink Dispatch | Manages contracted-provider requests, assignment, recovery, and acknowledgment |
| Active transportation | CareLink Partner Dispatch | Supplies the real persisted dispatch workflow for the final |
| Provider-ready transportation | Uber Health | Appears as an available integration path but cannot produce live provider events before activation |
| Provider-ready outreach | SMS and voice | Shows complete channel orchestration and history while Twilio/ElevenLabs activation remains deferred |
| ML unit | One scheduled oncology treatment encounter | Ranks supportive outreach; never makes clinical, eligibility, or treatment-access decisions |
| Clinical context | Epic Sandbox through SMART on FHIR | Supplies Camila's read-only clinical context to authorized staff; it does not receive OncoReady writeback |

### Presentation and engineering boundary

- The access screen must look like a finished institutional login, not a role switcher or demo menu.
- In the controlled finals build, provider buttons and seeded email accounts create server-managed sessions for synthetic identities. Real Google, Microsoft, or Apple OAuth is a later activation task.
- Provider-to-persona mappings remain in server configuration and are never printed on the access screen.
- Do not place `demo`, `synthetic`, `sandbox`, or similar badges throughout the visible product. A single truthful `Epic Sandbox` connection/provenance treatment inside the protected staff record is required and is not decorative demo labeling.
- The presenter gives one concise verbal disclosure before the integrated journey: Camila is an Epic Sandbox test patient; the read-only Epic connection, OncoReady workflow, CareLink dispatch, database, ML pipeline, and product state are working; SMS, voice, and Uber Health are provider-ready interfaces awaiting external account activation.
- Provider mode, fixture provenance, and adapter activation state remain explicit in server configuration, audit data, tests, and technical documentation.
- No real patient data may be used. Epic Sandbox data is the only externally sourced clinical test data in scope. Until another vendor adapter is activated, the backend must reject external execution even if the polished controls are visible.
- CareLink may represent an infusion center's contracted local vendor network. The product must not state or imply that Ochsner or another real health system uses OncoReady unless that relationship becomes real and approved.
- Provider-specific delivery, call, quote, driver, or trip states appear only after a verified callback from that provider. Deterministic replay events are permitted in the prerecorded journey only when the presenter has disclosed the controlled environment.
- `Continuity plan confirmed` is the correct final outcome. The product must not claim medical clearance, clinical validation, HIPAA compliance, autonomous clinical authority, an Ochsner connection, an Epic partnership, production Epic access, or Epic writeback.

## 3. Target Demonstration Journey

```text
Public landing page
  → Navigation shows Workspace access, not Explore workspace
  → Pricing shows Pilot and Network only
  → Detect early, Coordinate recovery, and Confirm continuity cards open public story panels in place
  → No public story card opens a workspace, creates a session, or exposes a patient record
  → Workspace access opens a professional sign-in page
  → Presenter selects Benson Cancer Center at the top
  → Apple opens the hospital staff workspace without showing that mapping on the access page
  → Camila opens as the only fully functional case, already connected through the private pre-recording Epic authorization
  → Staff sees Epic-sourced appointment, oncology plan, labs, medication orders, diagnostic results, procedure history, and source timestamp
  → Staff queue reveals Camila's rising readiness-disruption pattern at T−2
  → Why flagged? shows dated signals, calibrated probability, and SHAP contributors
  → Outreach orchestration selects SMS first, with voice escalation based on response history and time remaining
  → At T−1 Camila replies: “My ride was cancelled—and I’m not feeling well today.”
  → One response preserves Camila's exact words and creates separately owned clinical-contact and transportation work
  → Staff sees owners, SLA, transport cutoff, and a unified channel timeline
  → Configured email sign-in opens the transportation workspace
  → Transportation workspace opens a CareLink request for the center's contracted local provider network
  → CareLink records offer, acceptance, assignment, one failure/recovery event, and return planning
  → Uber Health is visible as a provider-ready alternative but is not selected for the active trip
  → Microsoft opens Ana's caregiver workspace, which shows logistics but no symptom text or nurse discussion
  → Google opens Camila's patient workspace, where she acknowledges the recovered plan
  → Treatment Readiness Graph changes from Treatment at risk to Continuity plan confirmed
  → Sign out and return through Apple staff access
  → Timeline, metrics, Epic provenance, and FHIR evidence resolve inside the authorized staff workspace
```

### Winning narrative

**Epic knew what treatment Camila needed. OncoReady discovered what could keep her from receiving it.**

Epic supplies the clinical truth: Camila's scheduled treatment, oncology plan, labs, medication orders, diagnostic results, and procedure history. But the chart alone does not reveal that her ride disappeared, that she stopped responding, or that the treatment deadline is closing.

At T−2, OncoReady recognizes the deteriorating engagement pattern and unresolved transportation plan. At T−1, Camila replies, “My ride was cancelled—and I’m not feeling well today.” Her single message becomes two accountable actions without allowing a model to interpret or downgrade her words: the exact clinical concern reaches the triage nurse, while the transportation barrier reaches the oncology navigator. The nurse acknowledges the concern. The navigator secures an outbound ride, return plan, and backup. Ana receives only the transportation information Camila authorized. Camila confirms the recovered plan, and the readiness graph moves from `Treatment at risk` to `Continuity plan confirmed`.

OncoReady is not another reminder system, generic no-show predictor, patient portal, EHR viewer, or ride-booking button. The differentiating claim is:

> OncoReady connects the clinical record to the operational reality around it: it recognizes a recoverable treatment threat before the cutoff, reaches the patient through the right channel, gives each barrier an accountable owner, and proves the continuity plan closed.

Every implemented feature must reinforce trusted clinical context, early detection, adaptive engagement, accountable rescue, or verified closure. Generic chatbot behavior, broad EHR browsing, unrelated oncology education, vanity dashboards, and decorative integrations are out of scope.

## 4. Public Experience Plan

### Visual continuity constraint

The current integrated OncoReady interface is the human-approved visual baseline. `frontend_design_required=true` still requires the frontend specialist to perform design Phase A, but that phase adapts and extends the approved system; it does not authorize a rebrand or independent aesthetic direction.

**Preserve:**

- the existing light/dark theme behavior, brand colors, semantic colors, and contrast relationships;
- the current typography families, type scale, weights, line heights, and hierarchy;
- the established spacing rhythm, content density, grid behavior, and responsive breakpoints;
- component shapes, border treatment, corner radii, shadows, surface elevation, and icon style;
- navigation structure, button character, form treatment, status language, data-visualization tone, animation character, easing, and reduced-motion behavior;
- approved logo, wordmark, and brand assets.

**Allowed adaptation:**

- reuse existing tokens, primitives, and components for the new public story, pricing cards, access flow, and workspaces;
- compose a feature-specific variant from existing tokens when needed; any new global semantic token or established component-style change still requires explicit human approval for that exact change;
- make localized responsive or accessibility corrections when needed for keyboard access, readable contrast, text reflow, touch targets, or reduced motion;
- refine spacing or hierarchy within a new component while keeping it visibly part of the current product.

**Not allowed without new human approval:**

- replacing the primary or secondary palette;
- changing the typography family or global scale;
- introducing a new global visual trend, such as unrelated glassmorphism, neon styling, heavy gradients, or a different illustration language;
- changing global radii, shadows, border language, icon family, navigation character, or motion system;
- restyling existing approved pages merely to make them match a new component;
- treating the public story or access page as permission to redesign the rest of the product.

Before implementation, the frontend specialist records the current visual baseline in the frontend design report: screenshots of key existing surfaces, the active token values, typography, component primitives, responsive behavior, and motion examples. Design approval is based on whether the new work remains recognizably within that baseline.

### Approved image and SVG sourcing

The frontend specialist has explicit permission to research, download, adapt, and use online stock imagery and SVG assets when they strengthen hierarchy, storytelling, atmosphere, or comprehension. This permission covers stock photography, vector illustrations, icon sets, diagrams, textures, backgrounds, and decorative SVG elements.

Asset requirements:

- use only assets whose license permits the intended product, presentation, and repository use;
- record the source URL, creator or publisher when available, license, required attribution, and retrieval date in a repository asset-source manifest;
- download and serve an approved local copy when the license permits; do not depend on third-party hotlinks during the application or prerecorded journey;
- optimize raster images for responsive delivery and avoid shipping unnecessarily large originals;
- sanitize SVG files before use by removing scripts, event handlers, unsafe embedded content, and unnecessary external references;
- provide meaningful alternative text for informative imagery and use empty alternative text or `aria-hidden` for purely decorative assets;
- preserve adequate contrast, text legibility, responsive cropping, reduced-motion behavior, and layout stability;
- avoid visible real-patient information, credentials, private locations, watermarks, unclear model releases, or imagery that implies a real hospital, customer, vendor, or patient endorsement;
- use official third-party logos or trademarks only when their use is accurate, permitted, and does not falsely imply an active integration or partnership;
- adapt asset color treatment, cropping, framing, and surrounding components to the current OncoReady visual system rather than changing the product to match the asset;
- reject assets with unclear licensing or provenance.

Externally sourced assets remain subject to the exact approved frontend design digest and final visual review. Asset permission does not override the no-rebrand constraint.

### Landing page

Remove the entire public section that renders Camila's Treatment Readiness Workspace, Treatment Readiness Graph, regimen, facility, avatar, case row, and patient/staff entry buttons. Do not blur, rename, or visually hide it; the record must be absent from the public DOM, accessibility tree, metadata, and searchable text.

Replace that space with a signature interactive section titled `How continuity gets protected`. Its visual centerpiece is a horizontal `Continuity Rescue Story`: three connected cards on a calm signal-to-resolution rail. This is public product storytelling, not a disguised workspace preview.

| Public story card | Resting visual | Click/tap result |
|---|---|---|
| `Detect early` | An abstract T−7 → T−2 → T−1 signal horizon with rising urgency and no person-level data | Expands an inline story panel showing how readiness, engagement, and transportation signals can reveal an actionable risk before the cutoff |
| `Coordinate recovery` | Three linked lanes for outreach, care team, and transportation, each with an owner and deadline | Expands an inline story panel showing how one signal becomes accountable parallel work across SMS/voice, clinical contact, and CareLink/local transport |
| `Confirm continuity` | The lanes converge into acknowledgment, evidence, and a closed continuity loop | Expands an inline story panel showing how patient confirmation, audit history, metrics, and interoperability evidence establish closure |

Creative direction and interaction requirements:

- express the complete section with the current OncoReady palette, typography, surfaces, radii, borders, shadows, icons, and motion language;
- use abstract signals, route lines, owner initials/icons, time windows, and state transitions rather than a patient card, avatar, regimen, facility, case row, or readiness graph;
- give each card a distinct microinteraction: signal pulse for detection, coordinated lane motion for recovery, and a closing confirmation ring for continuity;
- keep the visuals scenario-neutral and avoid invented outcome statistics, customer counts, or hospital claims;
- clicking a card expands its public story inline or in an accessible adjacent panel and updates the active card state;
- clicking a different card changes only the public story panel; it must not navigate to `/patient`, `/caregiver`, `/staff`, `/transport`, or `/access`;
- a public story interaction must not create a session, read seeded patient data, call a workspace API, or preload protected workspace content;
- the expanded content must be present in an accessible form for keyboard and screen-reader users, with `aria-expanded`, `aria-controls`, visible focus, and reduced-motion behavior;
- the section ends with a separate `See how OncoReady works` CTA to `/access`, visually distinct from the three storytelling cards.

Public navigation requirements:

- replace `Explore workspace` with `Workspace access` on desktop and mobile;
- route `Workspace access` and all product CTAs to `/access`;
- use `Pricing` as the pricing navigation label;
- do not route directly from a public CTA to a patient or staff record;
- do not expose patient, facility, model, or workflow fixtures in public page source.

### Workspace access page

The access page should look appropriate for a healthcare operations platform and must not resemble a developer persona picker.

**Information hierarchy:**

1. OncoReady identity and a concise trust statement.
2. `Hospital or center` selector at the top of the form.
3. `Continue with Google`, `Continue with Microsoft`, and `Continue with Apple` buttons.
4. Divider labeled `or continue with email`.
5. Email address and password fields, password visibility control, `Remember me`, and `Forgot password?`.
6. Primary `Sign in` action.
7. `New to OncoReady? Create an account with email` link and a polished email sign-up view.
8. Privacy, terms, and support links in the footer.

**Behavior and boundaries:**

- no button includes a persona name or role hint;
- no visible text explains which provider opens which workspace;
- the selected center scopes the resulting seeded session and persists through refresh;
- SSO buttons use a server-side seeded identity broker in the controlled build and make no claim that external OAuth occurred;
- email sign-in accepts only configured synthetic accounts until production identity is implemented;
- email sign-up is a complete visual flow that creates a controlled, non-privileged account or pending-access record in Railway PostgreSQL; it must not silently grant staff access;
- password values are never logged, embedded in fixtures, or stored in plaintext;
- role and center access are resolved by the backend, never trusted from a browser-provided role value;
- invalid credentials, unavailable center, expired session, and insufficient access have polished, recoverable states;
- sign-out invalidates the server session and returns to `/access`;
- reset restores the known finals state without exposing a reset control to normal users;
- the page supports keyboard navigation, visible focus, screen readers, password-manager semantics, mobile layouts, and reduced motion.

**Internal seeded routing for the controlled build (never rendered on the access page):**

| Successful access method | Server-resolved identity | Destination |
|---|---|---|
| Google | Camila Lopez | `/patient` |
| Microsoft | Ana Hernandez | `/caregiver` |
| Apple | Sarah Jenkins / Benson care team | `/staff` |
| Configured email and password | CareLink transportation coordinator | `/transport` |

- this mapping lives in one server-side configuration object and is covered by route-level tests;
- the browser submits the selected center and access method but never supplies or overrides its own role or destination;
- after successful access, the server creates the scoped session and the client navigates directly to the mapped workspace;
- refresh preserves the authorized workspace, while manually entering a different workspace route returns an insufficient-access state;
- email sign-up creates a pending or non-privileged account and is not the configured transportation login until an authorized server-side assignment exists.

### Two-tier pricing

Use one centrally editable pricing configuration.

| Plan | Public price | Positioning | Primary action |
|---|---:|---|---|
| Pilot | **$18,000/year** | One oncology program at one site; readiness workflow, adaptive outreach orchestration, CareLink coordination, five staff seats, and guided onboarding | `Request a pilot` |
| Network | **Talk to us** | Multi-site health system; enterprise identity, advanced routing, FHIR integration support, reporting, contracted-provider network management, and provider adapter activation | `Talk to us` |

Pricing requirements:

- show `$1,500/month billed annually` below the Pilot price;
- show no numeric price, `starting at` amount, or monthly equivalent for Network;
- display exactly two plan cards at every breakpoint;
- carrier, voice, and transportation charges are usage-based and separate from the software subscription;
- there is no self-serve checkout;
- Pilot and Network entitlements come from one configuration object used by both cards and comparison content.

The two-tier structure keeps the buying decision simple: a center can validate the workflow through Pilot, while a multi-site organization discusses integrations, identity, deployment, and vendor-network requirements through Network.

## 5. Railway Launch Architecture

### One project, three services

Use one Railway project and one controlled finals environment:

| Railway service | Source | Exposure | Responsibility |
|---|---|---|---|
| `web` | `/frontend` | Public HTTPS | React + TypeScript + Vite application and SPA routing |
| `api` | `/backend` | Public HTTPS; private DB access | FastAPI commands, sessions, projections, Epic SMART/FHIR adapter, provider adapters, FHIR export, ML inference, and scheduler |
| `Postgres` | Railway PostgreSQL | Private network only | Events, projections, sessions, encrypted Epic authorization state, normalized snapshots, provider configuration, audit state, and model metadata |

Use Railway Railpack unless repository inspection demonstrates that a Dockerfile is necessary. Configure explicit service root directories and watch paths so frontend-only changes do not rebuild the API and backend-only changes do not rebuild the web service.

```text
Browser
  │
  ├── HTTPS ──> Railway web (React/Vite)
  │                │
  │                └── HTTPS API calls
  │
  └────────────> Railway api (FastAPI)
                       │
                       ├── workflow + adaptive outreach policy
                       ├── read-only Epic SMART/FHIR adapter ── HTTPS ──> Epic Sandbox
                       ├── CareLink Partner Dispatch adapter (active)
                       ├── SMS adapter contract (provider-ready)
                       ├── voice adapter contract (provider-ready)
                       ├── Uber Health adapter contract (provider-ready)
                       ├── metrics + FHIR projection
                       ├── LightGBM inference + SHAP evidence
                       └── private Railway network
                                   │
                                   ▼
                            Railway PostgreSQL
```

### Backend and persistence shape

- Use an append-only workflow event table with current-state projections.
- Keep Epic resource ingestion separate from OncoReady workflow events: the adapter records source resource type/ID, fetch time, connection mode, and a versioned normalized Camila snapshot, while OncoReady owns readiness and coordination state.
- Use a server-backed confidential SMART on FHIR client when refresh-token persistence is available. Store tokens only in an encrypted server-side credential store protected by a Railway-managed encryption key; never send Epic tokens or client credentials to the browser.
- Treat Epic access tokens as expiring credentials. Refresh them when authorized, and require presenter reauthorization during preflight if the refresh grant or persistent access period is unavailable or expired.
- Add outbox and idempotency records so future provider integrations do not duplicate consequential actions.
- Use Alembic migrations stored under the backend source tree and run them deliberately during release.
- Keep the T−7/T−2/T−1 scheduler inside the API service for the final; do not add Redis, Kafka, a queue, or another worker service unless measured behavior requires it.
- Store provider configuration and activation state server-side. The frontend receives normalized capabilities, never credentials.
- Expose `/health` for process health and `/ready` for database/migration readiness. Report model availability separately so deterministic workflows continue; an accepted artifact remains required at release preflight.
- Bind the API to Railway's supplied `PORT` and use the Railway private database URL.
- Restrict CORS to the deployed web origin and local development origins explicitly configured for development.

### Railway delivery controls

- Codex may use Railway MCP for project/service discovery and bounded platform operations and Railway CLI for repository-aware deployment or exact logs.
- Provision `web`, `api`, and one PostgreSQL service in the same Railway project; check the service list before creation to prevent duplicates.
- Keep secrets in Railway variables, never in Git, browser bundles, screenshots, reports, or chat.
- Use separate variables for integration activation, including an Epic mode plus `SMS_PROVIDER_MODE`, `VOICE_PROVIDER_MODE`, and `TRANSPORT_PROVIDER_MODE`.
- Default Epic to live Sandbox with an explicit snapshot fallback, SMS and voice to `provider_ready`, CareLink to `active`, and Uber Health to `provider_ready`.
- Treat a detached Railway upload as queued, not deployed; the submitted deployment must reach `SUCCESS` before it is reported as live.
- Verify the public web URL, API health, database migration revision, CORS, reset/reseed, and one full critical path after every finals deployment.
- Configure only the approved Epic Non-PRD identifiers, registered redirect URI, and confidential-client credential material needed by `EPIC-001`; do not configure Twilio, ElevenLabs, or Uber Health secrets until the corresponding activation task is separately approved.

### Controlled-environment safeguards

- Epic Sandbox test data plus controlled OncoReady synthetic records only, with no real patient data;
- restrictive origin policy, request-size limits, and rate limits;
- secure, HTTP-only session cookie with appropriate same-site and secure attributes;
- server-managed seeded identities and center membership;
- a non-public reset/reseed command;
- adapter kill switches and explicit provider modes;
- exact registered Epic redirect URIs, OAuth state/nonce validation, least-privilege read scopes, encrypted refresh-token storage, token redaction, and a non-public presenter connection flow;
- no arbitrary phone number or ride destination accepted from the browser;
- audit entries for access, workflow mutations, outreach decisions, provider actions, and reset;
- no frontend-only authorization for staff, caregiver, or transportation actions.

## 6. Dependency-Ordered Feature Roadmap

| Order | Task ID | Vertical slice | User-visible proof | Depends on |
|---:|---|---|---|---|
| — | PLAN-002 (planning milestone) | Reconcile product and architecture source of truth | Approved execution plan | Human approval of this roadmap; documented milestone, no task lifecycle record |
| 1 | RAIL-001 | Railway web, API, and PostgreSQL foundation | One URL serving a healthy end-to-end stack | PLAN-002 |
| 2 | ACCESS-001 | Public page, two-tier pricing, and workspace access | Polished center-scoped sign-in without public patient data | RAIL-001 |
| 3 | EPIC-001 | Read-only Epic Sandbox clinical context | Camila's live Epic record appears in the authorized staff workspace with truthful fallback provenance | ACCESS-001 |
| 4 | FLOW-001 | Durable early-warning and department ownership | Camila's barriers become separately owned work | EPIC-001 |
| 5 | ML-001 | Rich longitudinal LightGBM pipeline and Camila explanation | Real calibrated score, SHAP evidence, and adaptive outreach input | FLOW-001; integrates before OUTREACH-001 |
| 6 | OUTREACH-001 | Adaptive SMS/voice orchestration and provider-ready surfaces | Model-informed channel timing without vendor dependency | FLOW-001, ML-001 |
| 7 | RIDE-001 | CareLink contracted-provider dispatch and Uber-ready surface | Real local-vendor assignment, recovery, and acknowledgment | FLOW-001 |
| 8 | EVIDENCE-001 | Computed metrics and validated FHIR artifact | Inspectable operational and interoperability evidence | EPIC-001, FLOW-001, OUTREACH-001, RIDE-001 |

The table is a portfolio, not a strictly sequential execution list: after FLOW-001, ML-001 and RIDE-001 can proceed independently; OUTREACH-001 integrates after ML-001. Although ML-001 is implemented after the workflow contracts stabilize, the data contract and Camila acceptance scenario are defined during FLOW-001 so ML is central to the product rather than attached as a decorative final screen. Epic data provides clinical context; it must not be repurposed as unapproved model training data or silently blended into synthetic outcomes.

### Architecture and delivery controls

| Task | DB | Backend | Frontend | Design phase | Infrastructure | Contract | Test depth | Security |
|---|---:|---:|---:|---:|---:|---:|---|---|
| RAIL-001 | Yes | Yes | Yes | No | Yes | Yes | TARGETED | STANDARD; security review |
| ACCESS-001 | Yes | Yes | Yes | Yes | Yes | Yes | TARGETED | HIGH; security review |
| EPIC-001 | Yes | Yes | Yes | Yes | Yes | Yes | TARGETED | HIGH; security review |
| FLOW-001 | Yes | Yes | Yes | Yes | No | Yes | TARGETED | STANDARD; security review |
| OUTREACH-001 | Yes | Yes | Yes | Yes | No | Yes | TARGETED | STANDARD; security review |
| RIDE-001 | Yes | Yes | Yes | Yes | No | Yes | TARGETED | HIGH; security review |
| EVIDENCE-001 | Yes | Yes | Yes | Yes | No | Yes | TARGETED | HIGH; security review |
| ML-001 | Yes | Yes | Yes | Yes | No | Yes | FULL | STANDARD; security review |

## 7. Feature Specifications

### PLAN-002 — Source-of-truth reconciliation

Before production code:

- update `docs/PROJECT.md` with the Railway delivery model, two-tier pricing, professional access journey, Camila narrative, read-only Epic Sandbox boundary, provider-ready vendor boundary, CareLink network model, and adaptive ML story;
- update `docs/architecture/SYSTEM.md` with the Railway web/API/PostgreSQL topology, session boundary, Epic SMART authorization and snapshot boundary, event state, and adapters;
- update `.ai/project.json` to enable backend and database and retain runnable frontend/schema checks; `RAIL-001` must register actual required backend and migration/integration checks once the harness exists, and later tasks extend them before integration verification;
- add one ADR for Railway topology and one ADR for provider-ready versus active adapter semantics if the architect judges both decisions long-lived;
- create individual feature/task artifacts for `RAIL-001`, `ACCESS-001`, `EPIC-001`, `FLOW-001`, `OUTREACH-001`, `RIDE-001`, `EVIDENCE-001`, and `ML-001`;
- do not reopen or rewrite completed `CORE-001`, `LAND-001`, or `UI-001` task history.

### RAIL-001 — Railway foundation

**User outcome:** The public application and authenticated workspaces run against a real API and persistent database from one manageable Railway project.

**Acceptance criteria:**

- Railway contains exactly one intended `web`, one `api`, and one PostgreSQL service for the finals environment;
- the web service serves SPA routes directly on refresh;
- the API reports healthy only when the process runs and ready only when PostgreSQL and required migrations are available;
- a backend write persists through API restart and is visible after refresh;
- database traffic uses Railway private networking;
- environment variables and secrets remain server-side;
- frontend and backend watch paths prevent unrelated rebuilds;
- each submitted deployment is tracked to `SUCCESS` before being called deployed;
- RAIL reset/reseed restores the foundation proof seed without deleting unrelated state; EPIC-001 and FLOW-001 later prove reset of the full Camila scenario while preserving valid authorization and the last-known-good snapshot;
- a failed migration or missing required variable prevents readiness and leaves actionable logs.

### ACCESS-001 — Public experience, pricing, and access

**User outcome:** A visitor understands the product and pricing without seeing a patient record, then enters a center-scoped workspace through a polished sign-in experience.

**Acceptance criteria:**

- `Explore workspace` is replaced by `Workspace access` everywhere;
- the frontend design report inventories the current UI baseline before proposing the new public story or access components;
- new public, access, pricing, and workspace surfaces reuse the existing theme tokens, typography, spacing system, radii, borders, shadows, icon treatment, and motion language;
- no global palette, typography, theme, component-shape, navigation, or motion-system change is introduced without separate human approval;
- existing approved pages remain visually unchanged except for the explicitly requested content and navigation updates or documented accessibility corrections;
- the public Treatment Readiness Workspace, Graph, and all Camila-specific content are removed from the DOM, accessibility tree, metadata, and searchable text;
- `How continuity gets protected` replaces the removed patient preview with the three public cards `Detect early`, `Coordinate recovery`, and `Confirm continuity`;
- activating each story card reveals its matching record-free public explanation and updates `aria-expanded` and the controlled panel relationship;
- public story cards never navigate to a workspace, create a session, call a workspace endpoint, or load seeded patient content;
- exactly two responsive plan cards show Pilot at `$18,000/year` and Network at `Talk to us`;
- every public CTA reaches `/access`;
- the hospital/center selector appears above all sign-in methods;
- Google, Microsoft, Apple, email/password, forgot-password, and email sign-up states have production-quality loading, error, disabled, and success presentation;
- no provider button or helper text reveals a persona or role mapping;
- the backend maps Google to `/patient`, Microsoft to `/caregiver`, Apple to `/staff`, and the configured email account to `/transport` without trusting a browser-provided role or destination;
- each successful access method opens only its mapped workspace and refresh preserves that authorized destination;
- direct navigation to any other workspace produces an insufficient-access state rather than rendering that workspace;
- email sign-up cannot self-assign staff, transport, or administrator access;
- sign-out invalidates the session;
- invalid route, expired session, and insufficient access return to a safe recoverable state;
- keyboard, focus, mobile, screen-reader, password-manager, and reduced-motion behavior pass targeted checks;
- visual comparison at desktop and mobile confirms that new surfaces read as extensions of the current product, with any intentional token addition listed in the approved frontend design report.
- every externally sourced image or SVG has recorded provenance and license evidence, is served locally when permitted, is optimized/sanitized as applicable, and has the correct accessible-text treatment.

### EPIC-001 — Read-only Epic Sandbox clinical context

**User outcome:** An authorized nurse or oncology navigator opens Camila's OncoReady case and immediately sees the relevant clinical context retrieved from the Epic Sandbox, while the product remains focused on the nonclinical and communication barriers that could still interrupt treatment.

**Product boundary:**

- Epic is a read-only source of clinical context, not the owner of OncoReady outreach, barrier, transportation, caregiver-permission, or closure state;
- only Camila is Epic-backed and fully interactive in the finals journey;
- other nurse and transportation queue records are lightweight frontend fixtures, do not initiate Epic calls, and cannot be opened as complete cases;
- only authenticated staff roles assigned to the selected center may receive Epic-derived clinical context;
- Ana, Camila's patient workspace, and the transportation workspace receive only their existing allowlisted OncoReady projections, never a copied Epic chart;
- the UI may say `Connected to Epic Sandbox through SMART on FHIR`; it must not imply Ochsner connectivity, Epic endorsement, production access, or writeback.

**Enabled R4 read surface:**

| Clinical need | Epic API families |
|---|---|
| Identity and care setting | Patient demographics, Location organizational directory, Practitioner organizational directory |
| Scheduled and historical care | Appointment, Encounter |
| Problems and results | Condition problems, Observation labs, DiagnosticReport results |
| Medications | MedicationRequest signed medication orders |
| Oncology treatment context | CarePlan oncology, RequestGroup oncology plan day |
| Procedure history | Procedure patient-reported surgical history, Procedure surgeries |

Every family uses only its enabled `.Read` and `.Search` R4 interactions. The implementation must inventory Camila's actual Sandbox responses before designing the final clinical summary. A field may be attributed to Epic only when the live response or the versioned last-known-good Epic snapshot contains it.

**Authorization and credential handling:**

- use the registered Non-PRD client ID and exact registered HTTPS redirect URI;
- use standalone SMART on FHIR for the Sandbox connection; an embedded EHR launch is the future customer deployment path, not part of the recorded journey;
- complete authorization through a non-public presenter setup before recording so the Epic login and consent screens do not appear in the video;
- keep OncoReady workspace authentication separate from Epic authorization;
- use a server-backed confidential-client flow with refresh tokens when the Epic app registration and Sandbox authorization support it;
- treat access and refresh tokens as expiring credentials; never describe them as permanent or guaranteed not to expire;
- encrypt persisted authorization material with a server-held key, rotate refresh tokens correctly, redact them from logs/errors, and never expose them to the browser;
- validate OAuth state and nonce, enforce the configured issuer and redirect URI, and reject callbacks that do not match the pending authorization transaction;
- if refresh is unavailable or fails, preflight requires presenter reauthorization before recording.

**Normalization and provenance:**

- fetch Epic through one backend adapter and normalize the allowed resources into a typed `ClinicalContextSnapshot` boundary;
- retain resource type, resource ID, source base URL identifier, retrieval time, and transformation version for every normalized item;
- validate the received resource type before mapping and safely ignore unsupported extensions while preserving an inspectable technical payload;
- never infer a diagnosis, urgency, medical clearance, or treatment recommendation from labs, reports, medications, procedures, or free text;
- show a compact staff clinical-context panel rather than recreating a general-purpose EHR viewer;
- show connection state and source time as one of `Live — synchronized <time>`, `Snapshot fallback — synchronized <time>`, or `Unavailable`;
- do not combine a failed partial refresh with older fields under a single `Live` label. Publish a complete successful snapshot atomically or keep the prior snapshot labeled as fallback.

**Acceptance criteria:**

- a private preflight authorizes or refreshes the Epic Sandbox connection without placing credentials in source control, chat, the browser bundle, or ordinary product logs;
- the recorded journey begins in the OncoReady access flow and reaches an already-connected Camila staff record without displaying Epic authentication;
- Camila's staff record renders only clinical facts actually returned by the enabled APIs, with clear source provenance and complete loading, empty, partial-source, unauthorized, expired-session, rate/error, fallback, and unavailable states;
- a successful refresh atomically replaces the prior normalized snapshot and records a non-secret audit event;
- an expired access token is refreshed server-side when permitted; otherwise the adapter changes state and requests presenter reauthorization without looping or exposing details to ordinary users;
- a live-call failure displays the last successful snapshot only with the `Snapshot fallback` label and original synchronization time;
- snapshot fallback is restricted to Camila and cannot be silently generalized to other patients;
- Ana, patient, and transportation API responses exclude Epic-only clinical fields, including when searched, exported, logged, or rendered for accessibility; approved staff accessibility and explicitly authorized staff evidence exports retain required context while normal logs stay redacted;
- all Epic endpoints are read-only and no OncoReady action attempts a FHIR create, update, patch, or delete;
- tests cover state/nonce mismatch, invalid issuer, token expiry/refresh, redaction, unauthorized role, partial FHIR responses, atomic snapshot replacement, live-to-fallback transition, and proof that non-Camila fixtures trigger no Epic request;
- a dedicated security review approves the exact verified revision before the task advances.

**Implementation references:** [Epic OAuth 2.0 tutorial](https://fhir.epic.com/Documentation?docId=oauth2tutorial), [implementing SMART on FHIR](https://fhir.epic.com/Documentation?docId=implementing&section=implementsmartonfhir), and [Epic Sandbox test data](https://fhir.epic.com/Documentation?docId=testpatients).

### FLOW-001 — Durable early-warning and owned work

**User outcome:** Camila is surfaced before the transport cutoff, and one response creates separately owned clinical-contact and transportation work with deadlines and closure evidence.

**Minimum domain:**

- treatment event and appointment-relative cutoffs;
- T−7, T−2, and T−1 feature snapshots;
- barriers and immutable patient verbatim text;
- work items, department threads, owners, SLAs, and escalation;
- caregiver authorization and allowlisted projection;
- append-only workflow events, provenance, correlation IDs, and idempotency keys;
- outbox and current-state projections.

**Required transitions:**

```text
detected → outreach planned → response received → department received
         → owner assigned → needs information / accepted
         → action recorded → patient informed
         → patient acknowledged → closed

SLA missed → escalated
appointment changed → cutoff and dependent work recomputed/reopened
```

**Acceptance criteria:**

- every signal states what was known and when;
- transport notice cutoff uses business-day arithmetic;
- explicit symptom or transportation barriers bypass model priority and route immediately;
- clinical-contact and transportation threads have different owners, deadlines, data projections, and closure rules;
- invalid or out-of-order closure attempts are rejected;
- duplicate commands and events are idempotent;
- patient, caregiver, staff, transport, graph, timeline, and metrics projections stay consistent;
- stale scheduler or source data is visible and never appears as reassurance;
- reset/reseed restores the exact finals scenario.

### OUTREACH-001 — Adaptive SMS and voice orchestration

**User outcome:** OncoReady uses Camila's recent engagement and readiness pattern to choose supportive outreach timing and escalate from SMS to voice when necessary, while remaining usable before messaging providers are activated.

**Provider-ready experience:**

- a unified outreach composer and timeline for SMS, voice, response, consent, delivery state, failure, and escalation;
- visible channel availability, preferred language, last successful channel, typical response delay, attempts, and next recommended action;
- complete empty, queued, scheduled, attempted, responded, opted-out, failed, and human-follow-up presentation;
- adapter contracts for Twilio messaging and ElevenLabs/Twilio voice, with signature validation and idempotent callback design ready for later activation;
- controlled event replay that exercises normalized workflow events without invoking an external vendor.

**Acceptance criteria:**

- the model score and dated engagement features inform outreach priority;
- deterministic policy chooses the safe channel and cadence: preferred/previously successful channel first, then approved escalation as the cutoff approaches;
- an explicit `need a ride`, `call me`, symptom, or scheduling response overrides model inference immediately;
- repeated declines, nonresponse, increasing response latency, or recent delivery failures can shorten the next review interval or recommend voice/human follow-up;
- the system never autonomously sends clinical advice, interprets symptoms, or closes a clinical barrier;
- in `provider_ready` mode, the backend creates internal planned/replay events but makes no Twilio or ElevenLabs network call;
- the UI never labels a message `Delivered` or call `Completed` without a verified provider callback or disclosed deterministic replay event;
- adapter activation later requires server-side credentials, destination allowlists, consent/opt-out enforcement, signed webhook validation, and a dedicated security review;
- no provider secret or arbitrary destination reaches the browser;
- ML-001 must supply an accepted artifact before model-informed acceptance; if scoring later fails, deterministic cadence continues with `Score unavailable`.

### RIDE-001 — CareLink and contracted local providers

**User outcome:** A navigator and transportation coordinator turn Camila's transportation risk into an eligibility-aware outbound and return plan, assign the trip through CareLink to the center's contracted provider, recover from one provider failure, and keep the blocker open until Camila acknowledges the plan.

**CareLink operating model:**

- each hospital/center can configure its own approved local transportation organizations and service areas;
- a contracted provider receives only the minimum trip, mobility, timing, contact, and acknowledgment data required for dispatch;
- the provider workspace supports offer, accept/decline, driver/vehicle assignment, arrival update, completion, cancellation, failure reason, and return-trip management;
- center staff retain visibility and can activate a backup provider without losing the original audit trail;
- CareLink is the active normalized adapter in the finals environment.

**Uber Health provider-ready model:**

- Uber Health appears in integration settings and provider-selection design as a supported normalized adapter;
- its UI supports the future concepts of quote, request, driver assignment, status, cancellation, and callback history;
- with no approved credentials, selecting it may prepare a request or show activation requirements but cannot claim a quote, request, driver, ETA, or completion from Uber;
- future activation must use server-side credentials, verified callbacks, idempotency, an allowlisted finals destination, and a separate security review.

**Acceptance criteria:**

- deterministic checks cover notice cutoff, funding/eligibility path, operating window, arrival window, outbound and return plan, mobility/escort need, service area, and provider availability;
- only authorized staff or transportation sessions can initiate dispatch or mutate provider assignments; patient sessions can acknowledge the current plan through a separate allowlisted command;
- request creation uses an idempotency key and server-side adapter;
- requested, offered, accepted, driver assigned, patient notified, patient acknowledged, arriving, completed, cancelled, declined, provider unavailable, return pending, and backup required remain distinct events;
- a cancelled or failed trip reopens the blocker and permits controlled retry or navigator escalation;
- when no transportation option is available, the treatment event remains at risk;
- the patient-owned acknowledgment command confirms the current plan without granting dispatch privileges; a changed/failed plan invalidates the earlier acknowledgment;
- the product never autonomously cancels or reschedules treatment;
- external provider-specific success states require a verified response; controlled CareLink operator actions are persisted with actor provenance and do not imply real-world driver movement or an external vendor callback;
- CareLink works for a center's own contracted vendor rather than requiring that vendor to be an OncoReady-owned fleet.

### EVIDENCE-001 — Operational metrics and FHIR R4

**User outcome:** Judges and hospital stakeholders can inspect Epic source provenance, OncoReady workflow evidence, and computed operational metrics instead of relying on fixture-only dashboard numbers.

**Computed metrics:**

- lead time at first actionable signal;
- time to owner, acceptance, first action, and closure;
- unresolved blockers at T−72/T−24/T−4;
- outreach attempts, responses, escalation, and acknowledgment;
- CareLink provider acceptance, assignment, failure, recovery, and completion;
- final kept, clinically rescheduled, administratively rescheduled, cancelled, or unknown disposition.

**Acceptance criteria:**

- a metric changes only when its underlying event or approved formula version changes; plan confirmation is not proof of attendance and final disposition stays `unknown` until an authorized outcome event;
- provider-ready replay metrics are distinguishable from verified external-provider events in audit and technical evidence;
- an Epic source-evidence view shows the active mode, last successful synchronization time, mapped resource types/counts, and non-secret source references for Camila;
- the source-evidence view distinguishes live Epic resources, the last-known-good Epic snapshot, and OncoReady-owned events without merging their provenance;
- the FHIR R4 bundle maps Patient, Appointment, QuestionnaireResponse, Task, Communication, RelatedPerson/consent representation, and Provenance as applicable;
- a pinned validator returns a passing report before the UI says `Validated`;
- the mapping and validator output are inspectable;
- validation failure blocks the `Validated` label;
- the UI states that validation applies to the OncoReady-generated FHIR artifact; it does not represent Epic writeback, production Epic access, an Ochsner connection, or customer approval.

### ML-001 — Rich adaptive LightGBM and SHAP

**User outcome:** Staff can see why Camila's encounter was prioritized and why SMS followed by voice/human follow-up is recommended, without presenting the model as clinical risk or autonomous decision-making.

**Model definition:**

- one shallow, regularized `lightgbm.LGBMClassifier`;
- target: `unresolved attendance disruption by the intervention cutoff`;
- output: calibrated probability used for supportive-outreach ordering and cadence;
- explicit barriers and deterministic deadlines always override the model;
- channel selection remains a deterministic, auditable policy informed by engagement features and model priority, avoiding an unvalidated autonomous communication agent.

**Rich longitudinal dataset:**

- generate at least 75,000 synthetic treatment encounters across at least 8,000 fictional patients, 12 fictional centers, and 18 months;
- include repeated encounters, timestamped readiness signals, transportation availability, caregiver support, travel distance, rural/urban access, appointment changes, weather/holiday context, channel preference, language, delivery history, response latency, decline/nonresponse patterns, prior intervention, outcomes, site effects, missingness, and controlled drift;
- model missingness explicitly rather than filling every record with ideal data;
- use patient-separated and chronological train/calibration/test partitions;
- keep the final test partition untouched until the model and calibrator are frozen;
- reject post-cutoff outcomes, final cancellation reasons, future notes, and actions created after the scoring timestamp through leakage tests;
- publish a data card describing generation rules, label logic, limitations, subgroup coverage, and why synthetic performance cannot be represented as clinical validation.

**Camila signature scenario:**

- Camila's held-out time series includes a worsening transportation plan, increasing response latency, a recent declined or unanswered contact, prior successful SMS engagement, distance/notice pressure, and an approaching infusion cutoff;
- Camila must flow through the normal feature pipeline and must not have a hard-coded score, explanation, or channel choice;
- the staff UI shows her T−7, T−2, and T−1 trajectory rather than a single unexplained number;
- `Why flagged?` shows dated top contributors such as unresolved transportation, response delay trend, prior disruption, and time remaining;
- the outreach recommendation explains why SMS is first and what condition triggers voice or human escalation;
- an explicit Camila response immediately supersedes prediction and routes actual stated needs.

**Calibration and explainability:**

- fit LightGBM only on the training partition;
- fit sigmoid calibration on a distinct calibration partition by default;
- evaluate isotonic calibration only with sufficient calibration data and held-out evidence that it improves calibration without overfitting;
- persist model, calibrator, feature schema, generator version/seed, training timestamp, thresholds, and evaluation manifest as one versioned artifact set;
- use `shap.TreeExplainer` on the underlying LightGBM margin;
- display calibrated probability separately from SHAP contributions;
- label contributors as model associations, not causes or pieces of the calibrated probability;
- never show a patient-facing claim such as `AI thinks you will miss treatment`.

**Model acceptance gate:**

- Brier score and calibration intercept/slope/plot;
- PR-AUC plus precision, recall, and workload at navigator capacity `K`;
- comparison with deterministic policy, contact-all, and contact-none;
- subgroup sample counts and performance across rurality, age band, language/channel, digital access, transport need, and service line;
- reproducible generator and training seeds;
- leakage, schema, artifact-compatibility, and Camila-not-hard-coded tests;
- rejection when prespecified calibration/top-K value is not met or subgroup harm is unacceptable.

**Failure behavior:** Missing, malformed, stale, or incompatible artifacts produce `Score unavailable`. Universal readiness cadence and deterministic routing continue. Model failure must never appear as low risk.

## 8. External Prerequisites and Activation Gates

### Required for the finals build

- Railway workspace access available to Codex through approved Railway MCP and/or CLI authentication;
- one Railway project with `web`, `api`, and PostgreSQL services;
- public HTTPS domains for web and API;
- configured synthetic centers, seeded identities, Camila scenario, and reset state;
- the Epic app's Non-PRD client ID, exact deployed redirect URI, enabled R4 Read/Search APIs, and server-side confidential-client credential or JWK configuration required for refreshable access;
- access to the appropriate Epic Sandbox clinician/administrative authorization flow for private presenter setup; credentials are entered only into Epic and are never shared in source control, fixtures, documentation, reports, or chat;
- a successful Camila resource inventory and a versioned last-known-good normalized snapshot generated from that authorized Sandbox session;
- a recording preflight that verifies live synchronization or deliberately selects the labeled snapshot fallback before the recorded journey begins;
- one configured CareLink center, contracted local provider, coordinator, and driver assignment path;
- an agreed department owner/SLA matrix and finals treatment clock;
- a reviewed provider-ready SMS/voice script, consent language, and opt-out design;
- versioned ML dataset generator and model artifact storage strategy.

### Deferred activation; not a finals blocker

- Twilio account, Messaging Service, number, destination allowlist, and webhook secret;
- ElevenLabs account, bounded voice agent, linked Twilio number, and webhook secret;
- approved Uber Health application, credentials, sandbox/production decision, and verified callback configuration;
- real Google, Microsoft, or Apple OAuth applications;
- production Epic customer connectivity, customer Non-PRD testing, and an embedded EHR launch.

Acquiring a vendor account does not automatically authorize integration. Each external adapter requires an explicit activation task, updated threat boundary, secrets configuration, contract tests, failure-path verification, and security approval.

## 9. Verification and Finals Reliability

### Independent critical path

```text
Private pre-recording preflight
 → Railway web/API/Postgres healthy
 → Epic Sandbox authorization refreshes successfully or presenter reauthorizes privately
 → Camila resource inventory succeeds and a new atomic snapshot is recorded
 → connection state is Live, or the presenter deliberately accepts the labeled Snapshot fallback

Recorded journey
 → landing contains no patient record or graph
 → Detect early opens its public story panel without a workspace route or session
 → Coordinate recovery and Confirm continuity replace the panel content in place
 → Workspace access
 → select Benson Cancer Center
 → Apple session opens staff without a visible persona mapping
 → Camila opens as the only complete case with Epic clinical context and source time
 → Camila's T−7/T−2/T−1 adaptive risk trajectory and Why flagged?
 → provider-ready SMS plan and controlled response event
 → voice/human escalation recommendation
 → split clinical-contact and transport work
 → staff workspace ownership and SLA
 → configured email session opens transportation
 → CareLink contracted-provider offer/assignment/failure/recovery
 → Uber Health visible but not used for an unverified ride
 → Microsoft session opens Ana's data-minimized caregiver workspace
 → Google session opens Camila's patient workspace and records acknowledgment
 → resolved patient graph
 → sign out and return through Apple staff access for metrics, Epic provenance, and validated OncoReady FHIR evidence
```

### Required failure tests

- Railway API or database unavailable;
- migration mismatch or missing model artifact;
- Epic authorization denied, expired access token, unavailable/expired refresh token, and presenter reauthorization required;
- OAuth state/nonce or issuer mismatch, unregistered redirect URI, token endpoint failure, and accidental token/credential logging;
- Epic Sandbox timeout, rate/error response, wrong resource type, missing optional resource, malformed bundle, pagination failure, and partial refresh;
- live-to-snapshot transition, stale snapshot, missing snapshot, and any attempt to label fallback content as live;
- unauthorized patient/caregiver/transport request for Epic clinical context and any non-Camila fixture triggering an Epic request;
- malformed center, workspace route, credentials, session, or role claim;
- public story card attempting workspace navigation, session creation, workspace API access, or seeded-data rendering;
- provider login resolving to the wrong workspace or a browser-supplied role/destination override;
- duplicate and out-of-order commands/provider events;
- SMS/voice action attempted while adapter mode is `provider_ready`;
- attempted fabricated `Delivered`, `Call completed`, Uber quote, or Uber assignment state;
- CareLink decline, unavailable provider, cancellation, stale assignment, return pending, and backup activation;
- missed department SLA;
- appointment time change invalidating the old cutoff or trip;
- caregiver permission revoked;
- clinical text excluded from caregiver visual, accessibility, search, export, and outbound content;
- model missing, stale, malformed, biased beyond the acceptance gate, or feature-schema incompatible;
- reset/replay with external network access disabled.

### Finals safeguards

- preflight Railway service health, migration revision, model artifact, seeded sessions, CareLink reset state, deterministic provider-event replay, Epic authorization health, Camila resource inventory, and snapshot timestamp;
- complete Epic authorization outside the recording and verify the refresh path; if it cannot remain valid for the recording window, reauthorize immediately before recording rather than extending the access-token lifetime or pretending it is persistent;
- show the protected staff record's truthful `Epic Sandbox` source state and synchronization time; never expose client credentials, tokens, raw authorization errors, or presenter setup controls in the recorded journey;
- give one concise verbal environment disclosure before the integrated sequence; do not turn it into persistent visual decoration;
- keep the SMS, voice, and Uber Health interfaces polished and available in navigation while adapter execution remains server-disabled;
- SMS/voice replay can show disclosed controlled events with replay provenance; Uber Health stays inactive and cannot gain a quote, driver, ETA, or trip confirmation through this replay exception; CareLink assignments come from persisted controlled operator actions;
- never silently convert a failed or disabled external action into a fake success;
- keep a deterministic local event replay for each future network step;
- keep a recorded backup run for the presentation;
- rehearse one primary path and one CareLink recovery; avoid free-form exploration during the pitch.

## 10. Three-Minute Finals Presentation

| Time | Screen/action | Judge takeaway |
|---|---|---|
| 0:00–0:20 | Click `Detect early`, show the public continuity story replacing the old patient preview, then reveal two pricing plans and `Workspace access` | The public site explains the mechanism without exposing a workspace or patient record |
| 0:20–0:35 | Select Benson Cancer Center and use Apple to enter the staff workspace | OncoReady is institution-aware and the access experience feels operational |
| 0:35–1:00 | Open Camila; show the live Epic Sandbox source time, upcoming treatment, and compact clinical context, then reveal the T−2 readiness risk | Epic knows the treatment; OncoReady reveals what could prevent Camila from receiving it |
| 1:00–1:25 | Show the T−7/T−2/T−1 trajectory, SMS-first logic, and Camila's exact reply about her cancelled ride and feeling unwell | Outreach adapts to engagement, then yields immediately to the patient's stated need |
| 1:25–1:45 | Show the untouched clinical text routed to the nurse and the transport barrier routed to navigation | One message becomes two accountable actions without autonomous clinical interpretation |
| 1:45–2:15 | Use configured email access to enter CareLink; show the center's contracted provider, one failure, backup assignment, and return plan; briefly reveal Uber Health as provider-ready | The platform works with local vendors now and has a clean path to Uber Health later |
| 2:15–2:30 | Use Microsoft to open Ana's caregiver view | Privacy is visible through a narrow logistics projection |
| 2:30–2:50 | Use Google to open Camila's patient workspace; Camila acknowledges and the graph changes from `Treatment at risk` to `Continuity plan confirmed` | Each access method reaches its intended workspace and OncoReady proves closure |
| 2:50–3:00 | Return through Apple staff access, open Epic provenance plus validated OncoReady FHIR evidence, and finish on `Continuity plan confirmed` | The clinical connection is real, the operational loop is inspectable, and no writeback is fabricated |

Use sign-out/access between personas; never bypass role authorization for the recording. Rehearse the full sequence, including the final return to staff, to approximately 2:40 so transitions or narration do not remove the closing evidence.

## 11. Approved Decisions

Human approval is recorded for:

1. One Railway project with `web`, `api`, and Railway PostgreSQL services.
2. Replacement of `Explore workspace` with `Workspace access`.
3. Complete removal of the public Treatment Readiness Workspace and Graph, replaced by the interactive `Detect early`, `Coordinate recovery`, and `Confirm continuity` public story.
4. Exactly two pricing plans: Pilot at `$18,000/year` and Network at `Talk to us`.
5. A professional access page with center selection, SSO-style buttons, email/password, forgot-password, and email sign-up, with no visible persona mappings.
6. Server-managed seeded routing for the controlled build: Google → patient, Microsoft → caregiver, Apple → hospital staff, and configured email → transportation, with real enterprise OAuth deferred.
7. A live, read-only Epic Sandbox connection for Camila through the Non-PRD SMART on FHIR app, authorized privately before recording, refreshed server-side when supported, and backed by a visibly labeled last-known-good snapshot.
8. Epic clinical context visible only to authorized nurse/navigator staff, with no chart leakage to Ana, Camila's patient view, or transportation.
9. Camila as the only fully functional case; other nurse and transportation queue entries remain lightweight frontend context and never imply Epic backing.
10. SMS and voice as provider-ready interfaces with Twilio and ElevenLabs activation deferred.
11. CareLink as the active dispatch path for an infusion center's contracted local providers.
12. Uber Health as a polished provider-ready alternative that cannot generate unverified provider states.
13. A rich longitudinal LightGBM dataset and Camila-specific held-out trajectory feeding adaptive, deterministic outreach orchestration.
14. A prerecorded deterministic journey with one concise verbal disclosure and no repeated `demo` labeling in the interface.
15. Preservation of the current OncoReady theme, palette, typography, spacing, component styling, iconography, and motion language across all new work, with no broad restyle without human approval.
16. Permission to use licensed online stock and SVG assets when aesthetically valuable, subject to provenance, licensing, local-hosting, sanitization, accessibility, performance, and truthful-branding requirements.

## 12. Stop Condition

This roadmap may enter implementation when the first feature task reaches `BUILD_READY` under the reconciled source-of-truth artifacts.

The finals build is complete when:

- Railway serves the frontend and backend successfully and PostgreSQL persists the workflow;
- the public site exposes no patient record or readiness graph;
- the existing OncoReady visual identity remains intact and all new surfaces pass the approved visual-baseline comparison;
- all external stock and SVG assets pass license/provenance review, security sanitization, accessibility checks, and performance review;
- the removed preview is replaced by the three-card public Continuity Rescue Story, and its cards never enter a workspace or create a session;
- `Workspace access` provides the approved center-scoped professional sign-in experience;
- Google, Microsoft, Apple, and configured email access each open only their approved mapped workspace;
- exactly two pricing plans are shown;
- Camila's staff record reads the enabled clinical context from Epic Sandbox through the approved read-only adapter and shows truthful live/fallback provenance;
- Epic authorization is completed privately before recording, tokens remain server-side and refresh safely when supported, and expiry never becomes a fabricated live state;
- Camila is the only fully functional Epic-backed case, while other nurse and transportation records remain bounded frontend context;
- Camila's real generated model output and dated explanation drive the outreach recommendation;
- provider-ready SMS, voice, and Uber Health surfaces are polished without fabricating external execution;
- CareLink completes the contracted-provider request, assignment, recovery, return plan, and acknowledgment path;
- all OncoReady workspace projections, metrics, graph, timeline, and FHIR export evidence derive from the same workflow events while Epic source context retains separate, inspectable provenance;
- the prerecorded critical path and deterministic reset pass;
- selected targeted/full tests pass, verification is current, required security reviews approve, final review approves, and the human completes the feature merges.
