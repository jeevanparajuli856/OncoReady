# OncoReady Nexus DevDay Winning Product Plan

**Status:** Revised for human review

**Planning branch:** `feature/PLAN-002-railway-launch-roadmap`

**Primary inputs:** [`PROJECT.md`](./PROJECT.md), [`SYSTEM.md`](./architecture/SYSTEM.md), [`TRANSPORTATION_RESEARCH_AND_FINALS_DECISION.md`](./TRANSPORTATION_RESEARCH_AND_FINALS_DECISION.md), and confirmed product direction from September 21, 2026

**Implementation state:** This document authorizes planning only. After approval, the orchestrator must reconcile the authoritative project and architecture documents and create the feature tasks below before production code begins.

## 1. Mission

Build the strongest product in the Nexus DevDay final: a polished, technically credible treatment-continuity platform that detects when an oncology patient is becoming less likely to arrive ready for infusion, selects the appropriate outreach path, coordinates accountable recovery work, and proves that the continuity plan closed.

The product should feel like one coherent hospital application rather than a collection of feature proofs. The primary journey follows Maria Hernandez across patient outreach, staff intervention, transportation coordination, caregiver visibility, and final acknowledgment. Public pages explain the product; patient details, the Treatment Readiness Workspace, and the Treatment Readiness Graph exist only after workspace access.

### Winning priorities

| Judging dimension | Target impression | Product proof |
|---|---|---|
| Problem legitimacy | OncoReady intervenes while treatment can still be preserved | T−7/T−3/T−1 trajectory, transport cutoff, and early exception queue |
| Novelty | The product closes a linked oncology readiness chain instead of sending a generic reminder | Adaptive outreach, department ownership, CareLink dispatch, acknowledgment, and closure evidence |
| Development difficulty | The difficult work is visible and inspectable | Durable event state, provider adapters, adaptive LightGBM scoring, SHAP, FHIR validation, and Railway deployment |
| Product quality | The experience looks ready for a hospital conversation | Professional access, strong visual hierarchy, responsive workspaces, purposeful motion, and coherent status behavior |
| Opportunity for impact | The audience can see how the product changes operations | Lead time, time-to-owner, time-to-closure, unresolved blockers, outreach response, and final disposition |

### Implementation bar

- Deploy the complete application in one Railway project containing a frontend service, backend service, and Railway PostgreSQL service.
- Build production-quality interaction and visual polish across the landing page, access flow, and every role workspace.
- Core state transitions, deadlines, routing, CareLink assignments, metrics, and model outputs must come from working backend logic and persisted events rather than hard-coded screen swaps.
- SMS and voice must have complete provider-ready product surfaces and backend adapter contracts. Twilio and ElevenLabs credentials and outbound calls are explicitly deferred until access is purchased and approved.
- Uber Health must have a polished provider-ready surface and normalized adapter boundary. It must not issue rides, quotes, assignments, or provider-branded confirmations until approved credentials and verified callbacks exist.
- CareLink Partner Dispatch is the active transportation path. It must support a hospital's contracted local transportation providers, not only a single OncoReady-operated fleet.
- The FHIR artifact must pass a pinned validator before the product labels it validated.
- The LightGBM pipeline, calibration, inference, and SHAP explanations must use real generated artifacts and a rich longitudinal synthetic dataset.
- The primary prerecorded journey must work deterministically without external vendors while preserving the same events and screens that live adapters will use later.
- No surface or presentation may claim a message was delivered, a call was completed, or an Uber Health ride was assigned without the corresponding verified provider event. Provider-ready capability may look complete; provider execution may not be fabricated.

### Confirmed human direction

- Host frontend, backend, and database together on Railway so Codex can provision, configure, deploy, inspect, and troubleshoot the complete stack through Railway tooling.
- Replace `Explore workspace` in the public navigation with `Workspace access`.
- Remove the public Treatment Readiness Workspace and Treatment Readiness Graph completely; both belong inside an authenticated workspace.
- Replace the removed patient preview with an interactive, record-free `Continuity Rescue Story` that explains the product through public storytelling rather than exposing any workspace.
- Provide exactly two pricing plans:
  - `Pilot` with a public montly price.
  - `Network` with `Talk to us` instead of a public price.
- Make workspace access look like a professional institutional sign-in page, with a hospital/center selector at the top, SSO-style options, email/password sign-in, forgotten-password access, and email sign-up.
- Do not show presenter shortcuts or visible labels such as `Google → patient`, `Microsoft → caregiver`, or similar role mappings.
- For the controlled build, keep that routing hidden in server configuration: Google opens patient, Microsoft opens caregiver, Apple opens hospital staff, and configured email sign-in opens transportation.
- Show SMS, voice, and Uber Health as polished provider-ready capabilities while their external adapters remain unconfigured.
- Use CareLink as the active transportation coordination and dispatch path. CareLink must also support local transportation vendors contracted by an infusion center when Uber Health is unavailable or not preferred.
- Make the ML capability central to the story: it must learn from longitudinal readiness and engagement patterns, identify increasing attendance disruption risk, and drive the timing and channel of supportive outreach.
- Use Maria's longitudinal pattern as the signature explainable example without hard-coding her model result.
- Optimize every workspace for a prerecorded product video with live voice-over: fast state changes, readable data storytelling, strong transitions, and a reliable reset path.

## 2. Finals Scenario and Cast

Use one consistent case across every surface so the audience follows Maria's rescue rather than learning several disconnected examples. All people, centers, encounters, and training records used for the final remain synthetic.

| Scenario element | Selected scope | Purpose |
|---|---|---|
| Patient | Maria Hernandez | Shows a deteriorating readiness and engagement pattern, then receives coordinated support |
| Caregiver | Ana Hernandez | Sees only patient-authorized transportation logistics |
| Selected center | Benson Cancer Center | Demonstrates facility-scoped access without implying a real hospital integration |
| Hospital staff | Sarah Jenkins, RN and Marcus Vance, MSW | Own clinical review and transportation navigation |
| Transportation coordinator | CareLink Dispatch | Manages contracted-provider requests, assignment, recovery, and acknowledgment |
| Active transportation | CareLink Partner Dispatch | Supplies the real persisted dispatch workflow for the final |
| Provider-ready transportation | Uber Health | Appears as an available integration path but cannot produce live provider events before activation |
| Provider-ready outreach | SMS and voice | Shows complete channel orchestration and history while Twilio/ElevenLabs activation remains deferred |
| ML unit | One scheduled oncology treatment encounter | Ranks supportive outreach; never makes clinical, eligibility, or treatment-access decisions |

### Presentation and engineering boundary

- The access screen must look like a finished institutional login, not a role switcher or demo menu.
- In the controlled finals build, provider buttons and seeded email accounts create server-managed sessions for synthetic identities. Real Google, Microsoft, or Apple OAuth is a later activation task.
- Provider-to-persona mappings remain in server configuration and are never printed on the access screen.
- Do not place `demo`, `synthetic`, `sandbox`, or similar badges throughout the visible product.
- The presenter gives one concise verbal disclosure before the integrated journey: the clinical case is illustrative; the workflow, CareLink dispatch, database, ML pipeline, and product state are working; SMS, voice, and Uber Health are provider-ready interfaces awaiting external account activation.
- Provider mode, fixture provenance, and adapter activation state remain explicit in server configuration, audit data, tests, and technical documentation.
- No real patient data may be used. Until a vendor adapter is activated, the backend must reject external execution even if the polished controls are visible.
- CareLink may represent an infusion center's contracted local vendor network. The product must not state or imply that Ochsner or another real health system uses OncoReady unless that relationship becomes real and approved.
- Provider-specific delivery, call, quote, driver, or trip states appear only after a verified callback from that provider. Deterministic replay events are permitted in the prerecorded journey only when the presenter has disclosed the controlled environment.
- `Continuity plan confirmed` is the correct final outcome. The product must not claim medical clearance, clinical validation, HIPAA compliance, autonomous clinical authority, or a live EHR connection.

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
  → Staff queue reveals Maria's rising readiness-disruption pattern at T−3
  → Why flagged? shows dated signals, calibrated probability, and SHAP contributors
  → Outreach orchestration selects SMS first, with voice escalation based on response history and time remaining
  → Maria's controlled response reports transportation difficulty and requests human contact
  → One response creates separately owned clinical-contact and transportation work
  → Staff sees owners, SLA, transport cutoff, and a unified channel timeline
  → Configured email sign-in opens the transportation workspace
  → Transportation workspace opens a CareLink request for the center's contracted local provider network
  → CareLink records offer, acceptance, assignment, one failure/recovery event, and return planning
  → Uber Health is visible as a provider-ready alternative but is not selected for the active trip
  → Microsoft opens Ana's caregiver workspace, which shows logistics but no symptom text or nurse discussion
  → Google opens Maria's patient workspace, where she acknowledges the recovered plan
  → Treatment Readiness Graph, timeline, metrics, and FHIR evidence resolve inside the workspace
```

### Winning narrative

OncoReady is not another reminder system, generic no-show predictor, patient portal, or ride-booking button. The differentiating claim is:

> OncoReady recognizes a recoverable treatment threat before the cutoff, adapts outreach to the patient's engagement pattern, gives each dependency an accountable owner, coordinates transportation through the center's available network, and proves the continuity plan closed.

Every implemented feature must reinforce early detection, adaptive engagement, accountable rescue, or verified closure. Generic chatbot behavior, unrelated oncology education, vanity dashboards, and decorative integrations are out of scope.

## 4. Public Experience Plan

### Landing page

Remove the entire public section that renders Maria's Treatment Readiness Workspace, Treatment Readiness Graph, regimen, facility, avatar, case row, and patient/staff entry buttons. Do not blur, rename, or visually hide it; the record must be absent from the public DOM, accessibility tree, metadata, and searchable text.

Replace that space with a signature interactive section titled `How continuity gets protected`. Its visual centerpiece is a horizontal `Continuity Rescue Story`: three connected cards on a calm signal-to-resolution rail. This is public product storytelling, not a disguised workspace preview.

| Public story card | Resting visual | Click/tap result |
|---|---|---|
| `Detect early` | An abstract T−7 → T−3 → T−1 signal horizon with rising urgency and no person-level data | Expands an inline story panel showing how readiness, engagement, and transportation signals can reveal an actionable risk before the cutoff |
| `Coordinate recovery` | Three linked lanes for outreach, care team, and transportation, each with an owner and deadline | Expands an inline story panel showing how one signal becomes accountable parallel work across SMS/voice, clinical contact, and CareLink/local transport |
| `Confirm continuity` | The lanes converge into acknowledgment, evidence, and a closed continuity loop | Expands an inline story panel showing how patient confirmation, audit history, metrics, and interoperability evidence establish closure |

Creative direction and interaction requirements:

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
| Google | Maria Hernandez | `/patient` |
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
| `api` | `/backend` | Public HTTPS; private DB access | FastAPI commands, sessions, projections, adapters, FHIR, ML inference, and scheduler |
| `Postgres` | Railway PostgreSQL | Private network only | Events, projections, sessions, provider configuration, audit state, and model metadata |

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
- Add outbox and idempotency records so future provider integrations do not duplicate consequential actions.
- Use Alembic migrations stored under the backend source tree and run them deliberately during release.
- Keep the T−7/T−3/T−1 scheduler inside the API service for the final; do not add Redis, Kafka, a queue, or another worker service unless measured behavior requires it.
- Store provider configuration and activation state server-side. The frontend receives normalized capabilities, never credentials.
- Expose `/health` for process health and `/ready` for database and required-artifact readiness.
- Bind the API to Railway's supplied `PORT` and use the Railway private database URL.
- Restrict CORS to the deployed web origin and local development origins explicitly configured for development.

### Railway delivery controls

- Codex may use Railway MCP for project/service discovery and bounded platform operations and Railway CLI for repository-aware deployment or exact logs.
- Provision `web`, `api`, and one PostgreSQL service in the same Railway project; check the service list before creation to prevent duplicates.
- Keep secrets in Railway variables, never in Git, browser bundles, screenshots, reports, or chat.
- Use separate variables for provider activation, for example `SMS_PROVIDER_MODE`, `VOICE_PROVIDER_MODE`, and `TRANSPORT_PROVIDER_MODE`.
- Default SMS and voice to `provider_ready`, CareLink to `active`, and Uber Health to `provider_ready`.
- Treat a detached Railway upload as queued, not deployed; the submitted deployment must reach `SUCCESS` before it is reported as live.
- Verify the public web URL, API health, database migration revision, CORS, reset/reseed, and one full critical path after every finals deployment.
- Do not configure Twilio, ElevenLabs, or Uber Health secrets until the corresponding activation task is separately approved.

### Controlled-environment safeguards

- synthetic records only, with no real patient data;
- restrictive origin policy, request-size limits, and rate limits;
- secure, HTTP-only session cookie with appropriate same-site and secure attributes;
- server-managed seeded identities and center membership;
- a non-public reset/reseed command;
- adapter kill switches and explicit provider modes;
- no arbitrary phone number or ride destination accepted from the browser;
- audit entries for access, workflow mutations, outreach decisions, provider actions, and reset;
- no frontend-only authorization for staff, caregiver, or transportation actions.

## 6. Dependency-Ordered Feature Roadmap

| Order | Task ID | Vertical slice | User-visible proof | Depends on |
|---:|---|---|---|---|
| 0 | PLAN-002 | Reconcile product and architecture source of truth | Approved execution plan | Human approval of this roadmap |
| 1 | RAIL-001 | Railway web, API, and PostgreSQL foundation | One URL serving a healthy end-to-end stack | PLAN-002 |
| 2 | ACCESS-001 | Public page, two-tier pricing, and workspace access | Polished center-scoped sign-in without public patient data | RAIL-001 |
| 3 | FLOW-001 | Durable early-warning and department ownership | Maria's barriers become separately owned work | ACCESS-001 |
| 4 | OUTREACH-001 | Adaptive SMS/voice orchestration and provider-ready surfaces | Model-informed channel timing without vendor dependency | FLOW-001 |
| 5 | RIDE-001 | CareLink contracted-provider dispatch and Uber-ready surface | Real local-vendor assignment, recovery, and acknowledgment | FLOW-001 |
| 6 | EVIDENCE-001 | Computed metrics and validated FHIR artifact | Inspectable operational and interoperability evidence | FLOW-001, OUTREACH-001, RIDE-001 |
| 7 | ML-001 | Rich longitudinal LightGBM pipeline and Maria explanation | Real calibrated score, SHAP evidence, and adaptive outreach input | Stable workflow/event contracts |

Although ML-001 is implemented after the workflow contracts stabilize, the data contract and Maria acceptance scenario are defined during FLOW-001 so ML is central to the product rather than attached as a decorative final screen.

### Architecture and delivery controls

| Task | DB | Backend | Frontend | Design phase | Infrastructure | Contract | Test depth | Security |
|---|---:|---:|---:|---:|---:|---:|---|---|
| RAIL-001 | Yes | Yes | Yes | No | Yes | Yes | TARGETED | STANDARD; security review |
| ACCESS-001 | Yes | Yes | Yes | Yes | Yes | Yes | TARGETED | HIGH; security review |
| FLOW-001 | Yes | Yes | Yes | Yes | No | Yes | TARGETED | STANDARD; security review |
| OUTREACH-001 | Yes | Yes | Yes | Yes | No | Yes | TARGETED | STANDARD; security review |
| RIDE-001 | Yes | Yes | Yes | Yes | No | Yes | TARGETED | HIGH; security review |
| EVIDENCE-001 | Yes | Yes | Yes | Yes | No | Yes | TARGETED | HIGH; security review |
| ML-001 | Yes | Yes | Yes | Yes | No | Yes | FULL | STANDARD; security review |

## 7. Feature Specifications

### PLAN-002 — Source-of-truth reconciliation

Before production code:

- update `docs/PROJECT.md` with the Railway delivery model, two-tier pricing, professional access journey, provider-ready vendor boundary, CareLink network model, and adaptive ML story;
- update `docs/architecture/SYSTEM.md` with the Railway web/API/PostgreSQL topology, session boundary, event state, and adapters;
- update `.ai/project.json` to enable backend and database and add frontend, backend, schema, and integration verification commands;
- add one ADR for Railway topology and one ADR for provider-ready versus active adapter semantics if the architect judges both decisions long-lived;
- create individual feature/task artifacts for `RAIL-001`, `ACCESS-001`, `FLOW-001`, `OUTREACH-001`, `RIDE-001`, `EVIDENCE-001`, and `ML-001`;
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
- reset/reseed restores the same Maria scenario without recreating infrastructure;
- a failed migration or missing required variable prevents readiness and leaves actionable logs.

### ACCESS-001 — Public experience, pricing, and access

**User outcome:** A visitor understands the product and pricing without seeing a patient record, then enters a center-scoped workspace through a polished sign-in experience.

**Acceptance criteria:**

- `Explore workspace` is replaced by `Workspace access` everywhere;
- the public Treatment Readiness Workspace, Graph, and all Maria-specific content are removed from the DOM, accessibility tree, metadata, and searchable text;
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
- keyboard, focus, mobile, screen-reader, password-manager, and reduced-motion behavior pass targeted checks.

### FLOW-001 — Durable early-warning and owned work

**User outcome:** Maria is surfaced before the transport cutoff, and one response creates separately owned clinical-contact and transportation work with deadlines and closure evidence.

**Minimum domain:**

- treatment event and appointment-relative cutoffs;
- T−7, T−3, and T−1 feature snapshots;
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

**User outcome:** OncoReady uses Maria's recent engagement and readiness pattern to choose supportive outreach timing and escalate from SMS to voice when necessary, while remaining usable before external providers are activated.

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
- no provider secret or arbitrary destination reaches the browser.

### RIDE-001 — CareLink and contracted local providers

**User outcome:** A navigator and transportation coordinator turn Maria's transportation risk into an eligibility-aware outbound and return plan, assign the trip through CareLink to the center's contracted provider, recover from one provider failure, and keep the blocker open until Maria acknowledges the plan.

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
- only authorized staff or transportation sessions can initiate or mutate a request;
- request creation uses an idempotency key and server-side adapter;
- requested, offered, accepted, driver assigned, patient notified, patient acknowledged, arriving, completed, cancelled, declined, provider unavailable, return pending, and backup required remain distinct events;
- a cancelled or failed trip reopens the blocker and permits controlled retry or navigator escalation;
- no available option leaves the treatment event at risk;
- patient acknowledgment remains required for closure;
- the product never autonomously cancels or reschedules treatment;
- provider branding and provider-specific statuses appear only when backed by a verified response from that provider;
- CareLink works for a center's own contracted vendor rather than requiring that vendor to be an OncoReady-owned fleet.

### EVIDENCE-001 — Operational metrics and FHIR R4

**User outcome:** Judges and hospital stakeholders can inspect evidence derived from the same workflow rather than fixture-only dashboard numbers.

**Computed metrics:**

- lead time at first actionable signal;
- time to owner, acceptance, first action, and closure;
- unresolved blockers at T−72/T−24/T−4;
- outreach attempts, responses, escalation, and acknowledgment;
- CareLink provider acceptance, assignment, failure, recovery, and completion;
- final kept, clinically rescheduled, administratively rescheduled, cancelled, or unknown disposition.

**Acceptance criteria:**

- a metric changes only when its underlying event changes;
- provider-ready replay metrics are distinguishable from verified external-provider events in audit and technical evidence;
- the FHIR R4 bundle maps Patient, Appointment, QuestionnaireResponse, Task, Communication, RelatedPerson/consent representation, and Provenance as applicable;
- a pinned validator returns a passing report before the UI says `Validated`;
- the mapping and validator output are inspectable;
- validation failure blocks the `Validated` label;
- the UI states that a valid FHIR artifact is not an Epic, Ochsner, or other EHR connection or writeback.

### ML-001 — Rich adaptive LightGBM and SHAP

**User outcome:** Staff can see why Maria's encounter was prioritized and why SMS followed by voice/human follow-up is recommended, without presenting the model as clinical risk or autonomous decision-making.

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

**Maria signature scenario:**

- Maria's held-out time series includes a worsening transportation plan, increasing response latency, a recent declined or unanswered contact, prior successful SMS engagement, distance/notice pressure, and an approaching infusion cutoff;
- Maria must flow through the normal feature pipeline and must not have a hard-coded score, explanation, or channel choice;
- the staff UI shows her T−7, T−3, and T−1 trajectory rather than a single unexplained number;
- `Why flagged?` shows dated top contributors such as unresolved transportation, response delay trend, prior disruption, and time remaining;
- the outreach recommendation explains why SMS is first and what condition triggers voice or human escalation;
- an explicit Maria response immediately supersedes prediction and routes actual stated needs.

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
- leakage, schema, artifact-compatibility, and Maria-not-hard-coded tests;
- rejection when prespecified calibration/top-K value is not met or subgroup harm is unacceptable.

**Failure behavior:** Missing, malformed, stale, or incompatible artifacts produce `Score unavailable`. Universal readiness cadence and deterministic routing continue. Model failure must never appear as low risk.

## 8. External Prerequisites and Activation Gates

### Required for the finals build

- Railway workspace access available to Codex through approved Railway MCP and/or CLI authentication;
- one Railway project with `web`, `api`, and PostgreSQL services;
- public HTTPS domains for web and API;
- configured synthetic centers, seeded identities, Maria scenario, and reset state;
- one configured CareLink center, contracted local provider, coordinator, and driver assignment path;
- an agreed department owner/SLA matrix and finals treatment clock;
- a reviewed provider-ready SMS/voice script, consent language, and opt-out design;
- versioned ML dataset generator and model artifact storage strategy.

### Deferred activation; not a finals blocker

- Twilio account, Messaging Service, number, destination allowlist, and webhook secret;
- ElevenLabs account, bounded voice agent, linked Twilio number, and webhook secret;
- approved Uber Health application, credentials, sandbox/production decision, and verified callback configuration;
- real Google, Microsoft, or Apple OAuth applications;
- production EHR connectivity.

Acquiring a vendor account does not automatically authorize integration. Each external adapter requires an explicit activation task, updated threat boundary, secrets configuration, contract tests, failure-path verification, and security approval.

## 9. Verification and Finals Reliability

### Independent critical path

```text
Railway web/API/Postgres healthy
 → landing contains no patient record or graph
 → Detect early opens its public story panel without a workspace route or session
 → Coordinate recovery and Confirm continuity replace the panel content in place
 → Workspace access
 → select Benson Cancer Center
 → Apple session opens staff without a visible persona mapping
 → Maria's adaptive risk trajectory and Why flagged?
 → provider-ready SMS plan and controlled response event
 → voice/human escalation recommendation
 → split clinical-contact and transport work
 → staff workspace ownership and SLA
 → configured email session opens transportation
 → CareLink contracted-provider offer/assignment/failure/recovery
 → Uber Health visible but not used for an unverified ride
 → Microsoft session opens Ana's data-minimized caregiver workspace
 → Google session opens Maria's patient workspace and records acknowledgment
 → resolved graph, metrics, and validated FHIR evidence
```

### Required failure tests

- Railway API or database unavailable;
- migration mismatch or missing model artifact;
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

- preflight Railway service health, migration revision, model artifact, seeded sessions, CareLink reset state, and deterministic provider-event replay;
- give one concise verbal environment disclosure before the integrated sequence; do not turn it into persistent visual decoration;
- keep the SMS, voice, and Uber Health interfaces polished and available in navigation while adapter execution remains server-disabled;
- show ordinary provider statuses such as `Delivered`, `Call completed`, `Quote received`, or `Driver assigned` only when backed by verified callbacks or explicitly disclosed replay data;
- never silently convert a failed or disabled external action into a fake success;
- keep a deterministic local event replay for each future network step;
- keep a recorded backup run for the presentation;
- rehearse one primary path and one CareLink recovery; avoid free-form exploration during the pitch.

## 10. Three-Minute Finals Presentation

| Time | Screen/action | Judge takeaway |
|---|---|---|
| 0:00–0:20 | Click `Detect early`, show the public continuity story replacing the old patient preview, then reveal two pricing plans and `Workspace access` | The public site explains the mechanism without exposing a workspace or patient record |
| 0:20–0:35 | Select Benson Cancer Center and use Apple to enter the staff workspace | OncoReady is institution-aware and the access experience feels operational |
| 0:35–1:00 | Open Maria at T−3; show trajectory, calibrated score, and SHAP contributors | The model identifies an actionable pattern rather than displaying a decorative risk score |
| 1:00–1:25 | Show SMS-first outreach and voice/human escalation logic, then Maria's controlled response | Outreach adapts to engagement and stated need without autonomous clinical behavior |
| 1:25–1:45 | Show the response split into owned clinical-contact and transportation work | One patient signal becomes accountable operational action |
| 1:45–2:15 | Use configured email access to enter CareLink; show the center's contracted provider, one failure, backup assignment, and return plan; briefly reveal Uber Health as provider-ready | The platform works with local vendors now and has a clean path to Uber Health later |
| 2:15–2:30 | Use Microsoft to open Ana's caregiver view | Privacy is visible through a narrow logistics projection |
| 2:30–2:50 | Use Google to open Maria's patient workspace; Maria acknowledges and the graph, timeline, and metrics resolve | Each access method reaches its intended workspace and OncoReady proves closure |
| 2:50–3:00 | Open FHIR evidence and finish on `Continuity plan confirmed` | The product is technically credible and ready for a focused hospital pilot |

Rehearse the primary sequence to approximately 2:40 so transitions or narration do not remove the closing evidence.

## 11. Approval Checklist

Human approval is requested for:

1. One Railway project with `web`, `api`, and Railway PostgreSQL services.
2. Replacement of `Explore workspace` with `Workspace access`.
3. Complete removal of the public Treatment Readiness Workspace and Graph, replaced by the interactive `Detect early`, `Coordinate recovery`, and `Confirm continuity` public story.
4. Exactly two pricing plans: Pilot at `$18,000/year` and Network at `Talk to us`.
5. A professional access page with center selection, SSO-style buttons, email/password, forgot-password, and email sign-up, with no visible persona mappings.
6. Server-managed seeded routing for the controlled build: Google → patient, Microsoft → caregiver, Apple → hospital staff, and configured email → transportation, with real enterprise OAuth deferred.
7. SMS and voice as provider-ready interfaces with Twilio and ElevenLabs activation deferred.
8. CareLink as the active dispatch path for an infusion center's contracted local providers.
9. Uber Health as a polished provider-ready alternative that cannot generate unverified provider states.
10. A rich longitudinal LightGBM dataset and Maria-specific held-out trajectory feeding adaptive, deterministic outreach orchestration.
11. A prerecorded deterministic journey with one concise verbal disclosure and no repeated `demo` labeling in the interface.

## 12. Stop Condition

This roadmap is ready to enter implementation when the approval checklist is accepted and the authoritative product, architecture, and deterministic project configuration are reconciled through `PLAN-002`.

The finals build is complete when:

- Railway serves the frontend and backend successfully and PostgreSQL persists the workflow;
- the public site exposes no patient record or readiness graph;
- the removed preview is replaced by the three-card public Continuity Rescue Story, and its cards never enter a workspace or create a session;
- `Workspace access` provides the approved center-scoped professional sign-in experience;
- Google, Microsoft, Apple, and configured email access each open only their approved mapped workspace;
- exactly two pricing plans are shown;
- Maria's real generated model output and dated explanation drive the outreach recommendation;
- provider-ready SMS, voice, and Uber Health surfaces are polished without fabricating external execution;
- CareLink completes the contracted-provider request, assignment, recovery, return plan, and acknowledgment path;
- all workspace projections, metrics, graph, timeline, and FHIR evidence derive from the same events;
- the prerecorded critical path and deterministic reset pass;
- selected targeted/full tests pass, verification is current, required security reviews approve, final review approves, and the human completes the feature merges.
