# LAUNCH-001 — Finals Treatment Continuity Launch

## User-visible outcome

Maria's early readiness response becomes durable, separately owned clinical, transportation, and callback work. Staff and the CareLink coordinator can act on those dependencies, Ana receives only authorized transportation logistics, and Maria can acknowledge a complete outbound-and-return plan before the treatment dependency is shown as confirmed.

The finished journey joins the public product story, pricing, role entry, patient, staff, caregiver, and transportation workspaces, controlled live communication/dispatch evidence, an event-derived readiness graph and timeline, validated FHIR evidence, and a staff-only supportive-outreach explanation. It does not imply production identity, Ochsner connectivity, clinical validation, or autonomous clinical authority.

## Product and demonstration impact

LAUNCH-001 replaces CORE-001's browser-local workflow authority with a persisted, inspectable treatment-continuity loop. One causal event history must explain what was known, who owned each dependency, what external action occurred, how a failure was recovered, what Maria acknowledged, and why the continuity plan is or is not confirmed.

The demonstration-critical journey is:

```text
public landing and pricing
  → local role-entry gateway
  → T−3 readiness response
  → clinical + transportation + callback work
  → authenticated SMS/voice outcomes
  → staff ownership and SLA
  → CareLink eligibility, dispatch, failure, and backup
  → transportation-only caregiver projection
  → Maria acknowledges the current complete plan
  → graph, timeline, metrics, FHIR, and staff-only priority evidence agree
```

## In scope

- Remove the patient record/workspace preview from the public surface; add centrally configured pilot pricing and `/access`, `/patient`, `/caregiver`, `/staff`, and `/transport` routes.
- Preserve React, TypeScript, Vite, the established design system, accessibility, responsive behavior, reduced-motion equivalence, and deterministic reset while replacing browser-local domain authority with generated-client API state.
- Add TypeScript Vercel Node.js Functions for commands, role-filtered projections, provider initiation and webhooks, metrics, FHIR evidence, and ML inference/explanation.
- Add Supabase PostgreSQL migrations for append-only workflow events, current projections, scheduled actions, transactional outbox, idempotency records, callback receipts, and deterministic finals seed/reset.
- Use a protected Vercel Cron invocation to run one short, idempotent scheduler/outbox tick. The tick uses a PostgreSQL advisory lock, durable claims, bounded batches, and leases so overlapping or retried invocations do not create parallel scheduler authority. The finals deployment requires the Vercel plan that supports the selected per-minute cadence.
- Implement deterministic T−7/T−3/T−1 cadence, business-day transportation cutoffs, department ownership, SLAs, escalation, appointment-change invalidation, closure guards, correlation, causation, aggregate versions, and idempotency.
- Integrate one allowlisted Twilio SMS path and one bounded ElevenLabs-through-Twilio voice path. Persist only authenticated provider outcomes; do not store voice transcripts or audio by default.
- Implement CareLink Partner Dispatch as the only active transportation provider, including eligibility, accommodations, outbound and return plans, offer, assignment, patient notification, acknowledgment, failure, backup, escalation, and completion.
- Generate operational metrics and a FHIR R4 bundle from the same persisted events. Display `Validated` only when the current evidence artifact matches a passing report from the pinned validator.
- Train/evaluate LightGBM, sigmoid calibration, and SHAP offline in Python, then export one versioned, immutable artifact set for deterministic TypeScript runtime inference and explanation. Deterministic routing and universal cadence remain authoritative.
- Keep deterministic, visibly truthful recovery for every network dependency without converting failure into provider success.

## Out of scope

- Production authentication, OAuth, identity verification, real PHI, production hospital data, Ochsner/Epic connectivity, SMART on FHIR, writeback, or compliance certification.
- Autonomous symptom triage, diagnosis, treatment clearance, treatment modification, treatment cancellation/rescheduling, transportation eligibility decisions by ML, or any patient-facing risk score.
- Uber Health or Lyft Concierge credentials, requests, callbacks, assignment, or active-trip status. They may appear only as disabled planned adapters outside Maria's active workflow.
- FastAPI, a continuously running application server/worker, Redis, Kafka, Celery, microservices, a general-purpose workflow platform, realtime infrastructure, multi-tenant administration, production autoscaling, or speculative analytics.
- Arbitrary phone numbers, destinations, providers, scenarios, scripts, model uploads, or executable artifacts in the controlled finals environment.

## Architecture impact

- **Database:** Add Git-tracked Supabase PostgreSQL migrations. `workflow_events` is the immutable business record; projections are rebuildable/read-optimized state. Scheduled actions, transactional outbox rows, callback receipts, and idempotency records share the database transaction boundary.
- **Backend:** Add stateless TypeScript Vercel Node.js Functions with thin HTTP/webhook handlers and shared domain/application modules for deterministic commands, event append, projection updates, role-filtered reads, provider adapters, evidence generation, and versioned artifact inference.
- **Frontend:** Materially change public/access/workspace routes and replace direct reducer mutations with a generated OpenAPI client. The frontend may retain presentation-only state but must render server-derived, role-filtered projections and explicit loading, degraded, conflict, pending, and retry states.
- **Frontend design:** Required. This introduces a new access journey, transportation workspace, persisted communication/dispatch states, failure recovery, and evidence/ML presentation. Exact visual and motion choices remain with the frontend specialist inside the established design system and product constraints.
- **Infrastructure:** Deploy the React application and Vercel Functions on Vercel, connect to one Supabase development/finals database through the supported pooled transactional path, configure a protected Vercel Cron tick, expose HTTPS provider webhooks, and store server-only secrets, allowlists, limits, and kill switches. Use the Vercel plan required for the approved per-minute cron schedule; add no queue/cache service.

The approved long-lived decision is recorded in `docs/adr/ADR-0001-vercel-event-boundary.md`.

## Contract impact

A formal contract is required because database, backend, and frontend specialists implement independent sides of stable HTTP and event boundaries.

- `contracts/openapi.yaml` is authoritative for HTTP commands, queries, webhooks, shared schemas, error responses, expected-version conflicts, and idempotency behavior.
- `contracts/events/*.schema.json` is authoritative for the event envelope and typed workflow payloads consumed by persistence, projections, fixtures, and tests.
- `.ai/tasks/LAUNCH-001/task.json` must register every governed contract before `BUILD_READY`.
- Frontend types/client code must be generated from the committed OpenAPI contract; server boundary models, fixtures, and mocks must validate against it.
- This feature document describes behavior only. It does not redefine wire shapes. Any implementation-blocking mismatch requires `CONTRACT_CHANGE_REQUIRED` and orchestrator reconciliation.

## Test depth

**FULL.** LAUNCH-001 crosses persisted workflow state, privacy-filtered projections, serverless concurrency, high-consequence external actions, signed webhooks, deterministic scheduling, FHIR validation, and a cross-language ML artifact. Independent testing must cover the complete journey, cross-component contracts, regression of existing product surfaces, and meaningful security/degraded boundaries. Unavailable required checks fail rather than skip.

Minimum evidence includes contract validation and generated-client freshness; migration reset/seed, constraints, event ordering, optimistic concurrency, projection consistency, idempotency, cron overlap, claim lease, and outbox tests; TypeScript function/domain tests; signed/replayed/out-of-order webhook tests; provider allowlist and kill-switch tests; complete and failed CareLink journeys; reset-with-no-external-actions proof; responsive/keyboard/reduced-motion Playwright coverage; caregiver data-exclusion checks; pinned FHIR validation; Python training/evaluation reproducibility and leakage tests; Python-to-TypeScript inference/SHAP parity fixtures; artifact-mismatch fallback; and network-disabled recovery without false success.

## Security risk

**HIGH; dedicated security review required.** Although the finals environment contains controlled illustrative data rather than real PHI, the slice introduces server-side secrets, externally reachable serverless functions, external SMS/voice/transport actions, signed webhooks, role-dependent projections, free text, a destructive reset capability, cron invocation, and clinical-context claims.

Required controls are server-enforced scenario and actor/action allowlists; fixed phone/pickup/destination/provider configuration; restrictive CORS; request-size/rate limits; authenticated raw-request webhook verification before parsing; cron-secret authentication; replay/idempotency protection; aggregate-version guards; parameterized transactional persistence through a bounded Supabase pooler connection; inert text rendering; server-derived caregiver minimization; least-privilege database/provider credentials; redacted logs; external-action kill switches; and reset that cannot enqueue or send external work. Local branded role entry must never be represented as production authentication or used with real/protected data.

## Dependencies

- Reconciled `docs/PROJECT.md`, `docs/architecture/SYSTEM.md`, `.ai/project.json`, this feature, the approved ADR, and a LAUNCH-001 task whose contract list names the governed OpenAPI/event schemas.
- Committed, validated contracts before backend/frontend implementation worktrees are created.
- Vercel deployment access and a plan that supports the approved per-minute cron cadence; server-only environment configuration for cron authentication and the public deployment origin.
- Supabase development/finals database access, pooled transactional connection configuration suitable for Vercel Functions, and local migration/reset tooling.
- Twilio development account, Messaging Service, SMS-capable number, auth token, allowlisted and consented team-controlled E.164 recipient, and approved minimal-detail scripts.
- ElevenLabs key, bounded agent, linked Twilio number, webhook secret, approved disclosure/script, and the same consented recipient.
- Fixed CareLink scenario/provider record, coordinator path, pickup/destination, arrival window, and outbound/return configuration.
- Pinned FHIR R4 validator available in verification/freeze tooling, with validation reports bound to the exact generated artifact hash.
- Versioned offline Python ML toolchain plus a reviewed export format and TypeScript parity fixtures.
- Human-supplied credentials and external access remain genuine blockers for live-provider proof; they must not be substituted with fabricated success.

## Acceptance criteria

1. The public landing DOM, accessibility tree, and searchable content contain no Maria record, MRN, regimen, facility record, readiness graph, or workspace preview.
2. Pricing is sourced from one configuration and presents `$18,000/year`, `$1,500/month billed annually`, and custom pricing for larger programs, with no self-serve checkout claim.
3. Google opens `/patient`, Microsoft `/caregiver`, Apple `/staff`, and email `/transport` without collecting credentials or making an identity-provider request; invalid local route/session state returns safely to `/access`.
4. Maria's T−3 submission preserves her clinical words and creates separately owned clinical, transportation, and callback work with deadlines. Explicit barriers bypass ML ordering.
5. Every accepted command appends a versioned event and updates its projections/scheduled/outbox records atomically, rejects invalid or stale transitions, and returns the prior semantic result for a repeated idempotency key.
6. Patient, staff, caregiver, transport, readiness graph, timeline, metrics, and evidence views derive from the same persisted event history and remain consistent after refresh.
7. The authenticated Vercel Cron tick is bounded and idempotent. Concurrent/retried ticks result in one active scheduler authority, stale claims recover safely, and an uncertain provider-send result is reconciled or escalated rather than blindly resent.
8. Twilio and ElevenLabs live statuses appear only after valid signed webhooks. Invalid signatures, duplicate/out-of-order callbacks, STOP, no-answer, and provider failure remain safe, visible, and idempotent.
9. CareLink records notice cutoff, eligibility/funding, service area, accommodations, outbound/return plans, offer, acceptance, assignment, notification, acknowledgment, failure, backup, escalation, and completion as distinct states.
10. Assignment alone cannot close transportation. Provider failure or appointment change reopens/invalidates dependent work, and Maria's acknowledgment of the complete current plan is required for closure.
11. Uber Health and Lyft Concierge remain disabled and cannot produce credentials, network actions, callbacks, assignment, or active-trip status.
12. Ana's server-derived projection contains only authorized transportation logistics; clinical text, nurse details, internal notes, and model output are absent from API responses, visual/accessibility/search/export surfaces, logs, and outbound caregiver content.
13. A clearly non-urgent clinical concern remains under human authority. Neither generic acknowledgment nor an ML/provider outcome may create medical clearance or resolve an undisposed urgent concern.
14. Metrics change only with source events. The FHIR bundle is generated from the scenario, its validator report is inspectable and hash-bound, and `Validated` appears only for an exact artifact with a passing pinned-validator report; no Epic/Ochsner connection is implied.
15. Offline Python produces the LightGBM model, sigmoid calibrator, feature schema, explanation metadata, seed, training timestamp, and evaluation manifest. TypeScript runtime outputs match reviewed Python golden vectors within defined tolerances; mismatch, stale, or malformed artifacts show `Score unavailable` without weakening deterministic outreach.
16. Reset restores the exact starting scenario, projections, schedule, and presentation route while producing no SMS, call, transport request, provider webhook, or outbox send.
17. Network/provider/validator/model failure never becomes false success. The affected dependency stays unresolved or unavailable and the documented deterministic/manual recovery remains operable.
18. Required frontend states are complete at mobile and presentation widths, keyboard operable, semantic, visibly focused, non-color-dependent, and equivalent under reduced motion.
19. The Vercel production build, function routing, deep links, webhook raw-body handling, cron authentication/cadence, environment checks, and Supabase connection behavior pass preflight in the controlled deployment.
20. FULL independent testing, repository verification on the integrated commit, focused HIGH-risk security approval on that verified commit, final review approval, five consecutive rehearsals including one failure run, and human merge are required before `DONE`.
