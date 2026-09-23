# OncoReady system architecture

This is the current architecture for the controlled demo. [PROJECT](../PROJECT.md) defines product scope, [SPRINT_CLOSEOUT](../SPRINT_CLOSEOUT.md) names open gates, and code is authoritative for behavior. The web app is served at `https://app.oncoready.me`; the existing FastAPI service is at `https://api.oncoready.me` on Railway with PostgreSQL.

## Components and trust boundaries

| Component | Responsibility | Boundary |
| --- | --- | --- |
| React/TypeScript frontend | Public story, prepared personas, one versioned Camila scenario, graph, timeline, CareLink replay, CareLink vendor portal, read-only evidence and private operator UI | Local persona selection is a presentation mechanism, not production authentication. The CareLink vendor reads only the `deriveVendorTripView` logistics projection, and the reducer rejects vendor attempts at navigator actions. |
| Reviewed repository assets | Saved Epic Sandbox JSON and manifests, synthetic-data notebook outputs, prepared outreach history and fictional ride data | A prepared event is never reported as a provider delivery or a live EHR/ride action. |
| FastAPI outreach adapter | Protected, fixed-recipient manual SMS/call actions and provider-status reads | Operator bearer protection, consent/availability checks, fixed server-side content, no browser-selected recipient or script. |
| PostgreSQL outreach ledger | Persists the one-shot SMS arm, separate finite call windows and every reserved call attempt before a provider request | Scenario reset, simultaneous devices, retries or process restart cannot create an uncontrolled duplicate. An ambiguous outcome blocks a new call. |
| Twilio and ElevenLabs | Twilio delivers and reports call/SMS outcomes; ElevenLabs supplies the short configured voice agent | Credentials and provider identifiers stay server-side. Verified provider status, not browser state, determines the displayed outcome. |

The September 22 call had an audible exchange and Twilio later marked the SMS undelivered. The deployed sequential-call path now allows the operator to open one new finite window after the latest call has a confirmed final status, with a test/demo purpose, current-consent confirmation and a daily attempt cap. Each window permits one call and preserves prior evidence. The September 23 test rang but the recipient rejected it while occupied; Twilio reported `completed` without a confirmed audible exchange. No next window is armed. A presentation call requires its own authorization and recipient availability. See the [September 22](../operations/OUTREACH-001-LIVE-EVIDENCE.md) and [September 23](../operations/OUTREACH-001-SEQUENTIAL-CALL-EVIDENCE.md) evidence.

## Prepared scenario

One frontend reducer owns Camila's current scenario and its projections to patient, caregiver, Care Team, Care Navigator, Transportation, graph and timeline. A local prepared reply opens separate nurse and transportation tasks. The nurse records a human disposition. The ride plan records an outbound pickup, arrival, return, contact and backup owner. The caregiver sees permitted logistics; Camila acknowledges the current plan version. A later plan failure invalidates that acknowledgment and reopens the blocker. The final **Continuity plan confirmed** state requires the human disposition, complete current plan and current patient acknowledgment; attendance remains unknown.

Historical message/reply rows and the previous CareLink trip are deterministic scenario fixtures with original scenario timestamps. Replay timers can pause, resume, restart and exit without changing the current trip or the real outreach ledger. CareLink providers and drivers in this journey are fictional: Crescent Lantern Medical Rides is the primary and Magnolia Wayfare Transport the backup. No external dispatch or live GPS request occurs. The CareLink vendor portal (`/carelink`, RIDE-002) dispatches acceptance and release actions into the same reducer. Tabs in one browser share the scenario through `localStorage` `storage` events, and each tab keeps its own workspace, route and replay. Update sources are described by the frontend `TransportProvider` adapters. CareLink is active. The Uber Health adapter is a no-network stub awaiting a contract and credentials. The closing receipt reads current scenario state and links each completed item to its corresponding timeline event. It cannot advance state itself.

## Clinical and model evidence

The selected Epic FHIR Sandbox resources were captured read-only before presentation, saved with source identifiers, capture time and checksum manifests, then displayed locally. The scenario name and treatment details remain separate from actual captured fields. Missing Sandbox data stays missing; production EHR synchronization and writeback do not occur. Additional roster packages are read-only; the prepared Camila case alone carries interactive readiness workflow state. Care Navigator and caregiver views must not expose roster clinical measurements.

The ML notebook trains/evaluates on synthetic data and exports the saved checkpoint scores, factors and two transportation-comparison outputs. The UI reads those exports. The comparison is local view state and does not mutate tasks, care plan, graph or provider activity. Model outputs never diagnose, clear treatment, downgrade a reported symptom or control the human clinical task.

## Scope and verification

`contracts/openapi.yaml` defines the protected API shape. Feature specifications and task reports in `.ai/tasks/` retain acceptance and review history. The [seven-minute demo script](../operations/SEVEN_MINUTE_PRODUCT_DEMO.md) names the actual source disclosures and stage fallback. Browser rehearsal and reset use the prepared state only; a live send requires its own protected command.

Enterprise authentication, multiuser workflow persistence, automatic outreach scheduling, production ML, runtime Epic token lifecycle, real ride adapters and clinical/outcome claims remain outside this demo architecture. The locked [design system](../design/DESIGN_SYSTEM.md) applies to every visible extension.
