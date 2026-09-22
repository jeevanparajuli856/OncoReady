# OncoReady System Architecture

## Active scope

[ADR-0004](../adr/ADR-0004-two-day-demo-scope.md) supersedes the earlier full-product launch architecture for the two-day demonstration. Retain the completed Railway foundation and approved visual system. Build a shared frontend scenario and the smallest protected server boundary for one real SMS and one short call.

This describes the target of the revised tasks, not a claim that they are implemented. Full workflow persistence, online model inference, automatic outreach scheduling and runtime Epic sync are deferred.

## Existing deployment

The human confirms web at **https://app.oncoready.me** and API at **https://api.oncoready.me** on Railway. Reuse these origins. Review actual CORS/session behavior and exact callback URLs during OUTREACH implementation; this document does not certify current availability or invent callback endpoints.

## Components and data flow

| Component | Responsibility | Data/source |
|---|---|---|
| Existing React frontend | Polished role views, graph, timeline and chosen interactions | One versioned scenario state |
| Scenario assets | Initial state, checkpoints, prepared insights, synthetic CareLink records | Reviewed repository assets; never secrets |
| Epic capture | Retrieve selected authorized Sandbox resources before recording; normalize for display | Actual read-only responses plus capture manifest |
| Offline ML evidence | Dataset, data dictionary, lightweight training/evaluation notebook and exported outputs | Synthetic data; no model required |
| Minimal FastAPI adapter | Validate operator action; send one fixed SMS/call; normalize verified outcome | Server-side credentials and one allowed test recipient |
| Existing PostgreSQL | Persist live-attempt reservation/result and limits across resets/restarts if needed by adapter | Small delivery ledger; reuse existing infrastructure |
| Recording package | Main walkthrough, call fallback, checkpoint/asset manifest | Local video/audio available without network |

Prepared outreach events include planned-at/due-at, original sent text, reply text/time, follow-up changes and scenario provenance. A scheduled-history row is not evidence that a backend scheduler executed.

A separate historical CareLink trip supports timed local replay: requested → accepted → driver assigned → arriving → pickup confirmed/completed. Preserve original event timestamps alongside playback progress. Pause/resume/restart affect only that replay state; cancel timers on exit/reset. Keep historical trip identity, driver/map fixtures, current trip, current acknowledgment and live ledger isolated. No GPS or provider connection is implied.

Prepared UI transitions never call a provider. Only an explicitly armed and protected live command crosses the external boundary. No API methods are invented here: OUTREACH defines and validates its small contract during PLANNING before implementation.

## Frontend scenario boundary

Reuse existing state machinery before introducing a new abstraction. One store drives patient, caregiver, staff, CareLink, graph, timeline and scenario counts. Commands perform concrete visible transitions; read-only context and prepared insight assets are separate.

Required states: initial risk → exact reply → distinct clinical/transport tasks → human clinical disposition → primary ride failure → backup plan → current-plan acknowledgment → confirmed continuity. A changed/failed plan invalidates the previous acknowledgment. Open clinical work or absent outbound/return logistics prevents confirmation.

Keep private presenter checkpoints/reset separate from patient-facing actions. In-memory state or small local persistence is sufficient; deterministic reset restores scenario state. Browser refresh behavior and persona switches must be documented and rehearsed. Prefer one browser context for the recording; cross-device collaboration is deferred.

Local persona selection is a presentation mechanism, not authentication. It cannot grant access to live delivery controls, provider credentials, a capture tool, or any protected backend data.

## Approved impact behavior

The graph, owner/next-action/due-time treatment and closing receipt are projections of the shared current scenario. A graph animation or receipt cannot advance state on its own. Use existing motion and equivalent readable reduced-motion states.

RIDE adds a narrow caregiver-seen event for permitted logistics, recording actor, current plan version and scenario time. It cannot assign a driver, expose clinical data, substitute for patient acknowledgment or change the existing confirmation rule. A plan change invalidates both acknowledgments as applicable. The patient finish uses the current plan for pickup, return and contact, never historical replay data.

ML's Why flagged? detail reads exported factors/values. The supportive next action is a documented workflow suggestion unless separately proven model-derived. The what-if toggles two exported rows from the same model, changing transportation availability only; it is isolated local view state. Exiting/resetting the comparison returns to the actual scenario without altering graph, tasks or provider activity.

EVIDENCE derives receipt items from current barrier/plan/acknowledgment state and resolves each item to its supporting event IDs. Reopening a blocker invalidates the corresponding success item. No duplicate metric store or reporting backend is needed.

## Epic capture boundary

The human selected **real Epic Sandbox JSON**, not invented Epic records. Inspect available authorized access and actual resource contents. Capture only what the story displays: patient context and available treatment/appointment, medication or lab details. Do not require all previously listed FHIR resource families.

Preserve actual resource IDs/types, original clinical dates, capture time, source environment and non-secret request metadata. Save a reviewed minimum snapshot and checksum manifest; no OAuth tokens, secrets or unexpected real-person content. The UI must indicate missing fields rather than generate replacements attributed to Epic.

Camila is a presentation alias unless the actual retrieved record establishes that name. If the selected Sandbox record differs, record the alias mapping in evidence and do not rewrite source facts. Generated scenario treatment dates remain visibly separate from captured source dates.

The recording loads captured data locally and labels its connection state as captured Sandbox data. “Live” requires an actual current successful request. No writeback, production record, partnership or customer connection is implied.

Only synthetic and reviewed publishable Sandbox assets may be browser-served; UI role filtering is not confidentiality protection. If terms or data review do not permit distribution, serve the capture through an authorized server boundary or use a restricted recording environment. Do not silently bundle restricted content.

## Prepared ML boundary

A small documented synthetic dataset and executable notebook demonstrate offline training and held-out evaluation of a lightweight model. Export actual scenario predictions and honest explanatory factors into versioned JSON consumed by the UI. Do not hand-edit scores to force the story. Show model capability and limits on synthetic data, not clinical validation; do not label ordinary feature contributions as SHAP.

Record dataset/split seed, feature schema, model identity and export time. Patient-separated evaluation, a simple baseline and leakage checks keep the demonstration credible without a large training platform. No runtime ML inference or training is required for the site to load, for the phone call, or for closure. Explicit patient concerns route through human-owned work regardless of prepared scores.

## Live communication boundary

One consenting test recipient, fixed reviewed message/audio, private operator activation, server-only credentials, bounded attempt/duration/cost limits, duplicate protection and verified provider outcomes are required. Reuse existing server protection where suitable; do not add a full identity platform.

The frontend cannot submit arbitrary recipients or scripts, override limits, or supply trusted success states. A backend reservation/ledger survives scenario reset and server restart. Validate callbacks against current official provider documentation and correlate them to the intended attempt/account. Unknown outcome is not success and does not trigger blind retry.

The live action is manually triggered; no trained model, four-hour cadence, automatic scheduler or outbox campaign is needed. Ordinary tests/replay must make zero paid calls. Live smoke checks are separate and bounded. See [OUTREACH_TEST_DELIVERY](../operations/OUTREACH_TEST_DELIVERY.md).

## CareLink and clinical boundaries

CareLink transitions are synthetic local coordination events. Staff and transportation actions produce consistent views; caregiver receives only allowed logistics. No actual ride, funding authorization, GPS feed or Uber call occurs.

Preserve the patient's original words for staff review. Transportation/caregiver displays omit the clinical concern. Patient may see their own submission. No autonomous diagnosis, triage, clinical clearance or treatment change. The final state means the coordination plan is acknowledged, not that treatment occurred.

## Contracts, tests and review

Use a formal contract for the real frontend/backend delivery boundary and any necessary capture service. Local component props and scenario files need typed schemas, not a new server API. Architecture reports must select actual impacts and controls; proposed task specs are not approval.

Use smoke checks for prepared assets and simple navigation, targeted state tests for closure/recovery, outreach history and dispatch replay isolation, and independent targeted/security review for live side effects. Required repository verification is retained; this scope cut does not disable existing configured checks or alter completed RAIL evidence.

Frontend design work is compatibility/extension inside the locked system. Before/after screenshots, keyboard behavior, readable states, responsive layout and reduced-motion support protect the visible result.

## Deferred architecture

Durable clinical workflow engine, multiuser authorization, full SMART token lifecycle, broad clinical normalization, automatic scheduling, production models, live transport adapters, FHIR validation and enterprise observability remain future tasks. Do not build them merely because earlier launch documents required them.
