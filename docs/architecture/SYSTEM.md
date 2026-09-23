# OncoReady system architecture

This is the current architecture for the controlled demo. [PROJECT](../PROJECT.md) defines product scope, [SPRINT_CLOSEOUT](../SPRINT_CLOSEOUT.md) names open gates, and code is authoritative for behavior. The web app is served at `https://app.oncoready.me`; the existing FastAPI service is at `https://api.oncoready.me` on Railway with PostgreSQL.

## Components and trust boundaries

| Component | Responsibility | Boundary |
| --- | --- | --- |
| React/TypeScript frontend | Public story, prepared personas, one versioned Camila scenario, graph, timeline, CareLink replay, read-only evidence and private operator UI | Local persona selection is a presentation mechanism, not production authentication. |
| Reviewed repository assets | Saved Epic Sandbox JSON and manifests, synthetic-data notebook outputs, prepared outreach history and fictional ride data | A prepared event is never reported as a provider delivery or a live EHR/ride action. |
| FastAPI outreach adapter | Protected, fixed-recipient manual SMS/call actions and provider-status reads | Operator bearer protection, consent/availability checks, fixed server-side content, no browser-selected recipient or script. |
| PostgreSQL outreach ledger | Persists one-shot arm and separate reserved attempts before a provider request | Scenario reset, retries or process restart cannot create an uncontrolled duplicate. An ambiguous outcome is not silently retried. |
| Twilio and ElevenLabs | Twilio delivers and reports call/SMS outcomes; ElevenLabs supplies the short configured voice agent | Credentials and provider identifiers stay server-side. Verified provider status, not browser state, determines the displayed outcome. |

The live call completed in the authorized test, and Twilio later marked the SMS undelivered. The one-shot window is spent. The frontend displays historical completion honestly and never treats it as the cue for a new presentation call. A future stage call requires a newly implemented and separately authorized bounded window. See [sanitized evidence](../operations/OUTREACH-001-LIVE-EVIDENCE.md).

## Prepared scenario

One frontend reducer owns Camila's current scenario and its projections to patient, caregiver, Care Team, Care Navigator, Transportation, graph and timeline. A local prepared reply opens separate nurse and transportation tasks. The nurse records a human disposition. The ride plan records an outbound pickup, arrival, return, contact and backup owner. The caregiver sees permitted logistics; Camila acknowledges the current plan version. A later plan failure invalidates that acknowledgment and reopens the blocker. The final **Continuity plan confirmed** state requires the human disposition, complete current plan and current patient acknowledgment; attendance remains unknown.

Historical message/reply rows and the previous CareLink trip are deterministic scenario fixtures with original scenario timestamps. Replay timers can pause, resume, restart and exit without changing the current trip or the real outreach ledger. CareLink providers and drivers in this journey are fictional; no external dispatch or live GPS request occurs. The closing receipt reads current scenario state and links each completed item to its corresponding timeline event. It cannot advance state itself.

## Clinical and model evidence

The selected Epic FHIR Sandbox resources were captured read-only before presentation, saved with source identifiers, capture time and checksum manifests, then displayed locally. The scenario name and treatment details remain separate from actual captured fields. Missing Sandbox data stays missing; production EHR synchronization and writeback do not occur. Additional roster packages are read-only; the prepared Camila case alone carries interactive readiness workflow state. Care Navigator and caregiver views must not expose roster clinical measurements.

The ML notebook trains/evaluates on synthetic data and exports the saved checkpoint scores, factors and two transportation-comparison outputs. The UI reads those exports. The comparison is local view state and does not mutate tasks, care plan, graph or provider activity. Model outputs never diagnose, clear treatment, downgrade a reported symptom or control the human clinical task.

## Scope and verification

`contracts/openapi.yaml` defines the protected API shape. Feature specifications and task reports in `.ai/tasks/` retain acceptance and review history. The [seven-minute demo script](../operations/SEVEN_MINUTE_PRODUCT_DEMO.md) names the actual source disclosures and stage fallback. Browser rehearsal and reset use the prepared state only; a live send requires its own protected command.

Enterprise authentication, multiuser workflow persistence, automatic outreach scheduling, production ML, runtime Epic token lifecycle, real ride adapters and clinical/outcome claims remain outside this demo architecture. The locked [design system](../design/DESIGN_SYSTEM.md) applies to every visible extension.
