# OncoReady Product Definition

> Classification labels:
> - **Confirmed** — explicitly approved product or delivery direction
> - **Assumption** — a working premise that still needs external validation
> - **Recommendation** — a selected implementation choice for this launch
> - **Open question** — a material unknown that does not authorize invented behavior

## 1. Product identity

### Product name

**OncoReady — Treatment Readiness and Continuity Loop**

### One-sentence description

OncoReady detects threats to an upcoming oncology treatment early, gives every dependency a human owner and deadline, executes bounded recovery actions, and proves the continuity plan closed.

### Status

**Confirmed:** the completed CORE-001, LAND-001, and UI-001 frontend foundation is the starting point. `LAUNCH-001 — Finals Treatment Continuity Launch` is the approved next vertical slice.

### Product presentation rule

Present OncoReady as the treatment-continuity product it is. Do not call user-facing surfaces a prototype, demo, toy, practice app, or portfolio project. Do not claim production Ochsner/Epic connectivity, real authentication, HIPAA compliance, clinical validation, real patient use, approved Uber Health or Lyft Concierge access, or measured outcomes.

## 2. Problem and opportunity

### Confirmed

- Transportation, medication access, cost, caregiving, communication, and clinical concerns can disrupt time-sensitive cancer treatment.
- A reminder or referral is not closure. The useful unit of work is a treatment-anchored dependency with an owner, deadline, action, acknowledgment, fallback, and closure evidence.
- Clinical and practical concerns require different human owners and rules while remaining visible in one continuity plan.
- Ochsner already has navigation, portal communication, supportive services, urgent clinical pathways, virtual care, and Chemotherapy Care Companion. OncoReady must orchestrate and expose accountable handoffs rather than pretend to replace those systems.

### Assumptions

- Cross-domain pre-treatment concerns do not always share one visible, appointment-specific resolution plan.
- Earlier outreach at T−7, T−3, and T−1 can create enough lead time to recover a practical barrier before a treatment cutoff.
- A focused Small Infusion Center Pilot can establish buyer value before broader health-system configuration.

## 3. Intended users and outcomes

| Actor | Need | Desired outcome |
|---|---|---|
| Patient receiving active treatment | Low-friction readiness outreach and a visible plan | Know who is helping, what happens next, and whether the continuity plan is confirmed |
| Authorized caregiver | Only the logistics the patient permits | Help with transportation without blanket clinical access |
| Oncology navigator | Prioritized, deadline-aware practical work | Resolve or escalate a barrier before the treatment cutoff |
| Triage nurse | Original patient wording through a human-controlled pathway | Review and disposition the concern without automated clinical judgment |
| Transportation coordinator | Eligibility, trip requirements, assignment, failure, and return-plan context | Fulfill or recover one controlled CareLink partner trip |
| Operations leader | Event-derived workload and closure evidence | Inspect lead time, ownership, aging, attempts, blockers, and final disposition |

### Primary product outcome

Maria's T−3 response creates separately owned clinical, callback, and transportation work; verified communication and CareLink actions advance the same durable workflow; Ana receives only authorized logistics; Maria acknowledges the recovered plan; and the graph, timeline, metrics, and FHIR artifact agree.

## 4. Signature launch journey

```text
Public landing and focused pilot pricing
  → branded local role-entry gateway
  → T−3 Twilio readiness outreach to one allowlisted test phone
  → Maria replies that she needs a ride and requests a call
  → deterministic rules create clinical, callback, and transport work
  → bounded ElevenLabs call through Twilio returns a verified outcome
  → staff sees owners, SLA, cutoff, channel history, and early-warning evidence
  → CareLink Partner Dispatch records eligibility, outbound/return plan, assignment, failure, and backup
  → Ana sees transportation logistics but no clinical or nurse-only text
  → Maria acknowledges the recovered plan
  → graph, timeline, metrics, and FHIR evidence resolve from the same events
  → staff may inspect a calibrated supportive-outreach score and SHAP explanation
```

### Hero moment

One low-friction patient response visibly splits into the right human-owned work, survives a transportation failure, and closes only when the patient acknowledges the recovered continuity plan.

### Demo-critical path

Preflight → reset/reseed → public page → access mapping → patient response → durable work split → authenticated communication callbacks → staff review → CareLink failure/recovery → caregiver projection → patient acknowledgment → confirmed graph/timeline/metrics → validated FHIR evidence → supportive-outreach explanation.

### Failure states that must feel complete

- Invalid or duplicate commands return stable errors and do not create duplicate events.
- Undelivered SMS or failed/no-answer voice outreach stays unresolved and creates the approved fallback work.
- Invalid webhook signatures are rejected without changing workflow state.
- Provider decline, cancellation, unavailable capacity, stale assignment, or missing return plan keeps transportation at risk and enables backup or human escalation.
- Missing or incompatible ML artifacts display `Score unavailable`; deterministic routing continues.
- Failed FHIR validation is inspectable and never displays `Validated`.
- Reset restores the known scenario without sending a message, placing a call, or creating a trip.

## 5. Product impression strategy

### First 30 seconds

Viewers should understand that tomorrow's treatment has recoverable dependencies and that OncoReady turns them into accountable, time-bound action rather than another message or dashboard.

### Visual and interaction hook

The established Clinical Glass / Continuity Aurora system remains authoritative. The Treatment Readiness Graph anchors the upcoming treatment and shows unresolved dependencies, owners, deadlines, actions, fallbacks, and proof of closure. Exact composition, motion, responsive behavior, and component expression remain the frontend specialist's responsibility through the required design gate.

### Data-storytelling hook

An append-only event timeline makes causality inspectable from signal through assignment, communication, dispatch recovery, patient acknowledgment, and closure. Metrics and FHIR evidence are projections of those events rather than separately staged numbers.

### Experience principles

- Calm urgency: make cutoffs and SLAs legible without increasing anxiety.
- Human authority: consequential clinical and operational decisions remain assigned to people.
- Closure over referral: sent, assigned, and acknowledged are different states.
- One clear action: reduce cognitive load for patient and caregiver surfaces.
- Truthful evidence: show provider success only when a verified callback or disclosed deterministic replay supports it.
- Data minimization: each role receives only what it needs.

## 6. Launch scope

### In scope for LAUNCH-001

- Public landing privacy cleanup, `Pricing` navigation, and centrally configured Small Infusion Center Pilot pricing.
- Local branded role mapping: Google → patient, Microsoft → caregiver, Apple → staff, email → transportation.
- React + TypeScript role workspaces integrated through generated OpenAPI types/client.
- One TypeScript Vercel application deployment containing the Vite frontend and Node.js Functions for commands, projections, provider callbacks, metrics, FHIR, and ML inference.
- Supabase PostgreSQL append-only workflow events, projections, outbox, scheduling, callback receipts, idempotency, deterministic seed, and safe reset.
- T−7/T−3/T−1 outreach timing, business-day transportation cutoff, separate clinical/transport/callback work, SLA and escalation.
- Twilio SMS and ElevenLabs voice through Twilio, bounded to one allowlisted team-controlled number.
- Custom CareLink Partner Dispatch workflow with eligibility, outbound/return plan, assignment, failure/recovery, notification, and patient acknowledgment.
- Event-derived operational metrics and a generated FHIR R4 artifact validated by a pinned validator.
- A calibrated LightGBM supportive-outreach classifier with SHAP explanation, implemented last and never used for clinical or access decisions.
- Deterministic offline/replay recovery, production-quality responsive presentation, accessibility, reduced motion, FULL testing, exact-commit verification, focused security review, and final review.

### Explicit non-goals

- Production authentication, SMART-on-FHIR, Ochsner/Epic writeback, production PHI, or real patient care.
- Autonomous diagnosis, triage, treatment clearance, cancellation, rescheduling, or transport eligibility decisions.
- Uber Health or Lyft Concierge implementation, credentials, live-looking assignment, or callback state; they remain planned adapters only.
- Self-serve checkout, billing, CRM, a statewide resource marketplace, a fleet operation, or broad hospital analytics.
- Redis, Kafka, Celery, microservices, Kubernetes, generalized workflow engines, or infrastructure that does not strengthen the finals journey.
- Additional patient journeys or broad admin/configuration depth before the Maria path is reliable.

## 7. Core engineering capability

### Authoritative mechanism

A typed, deterministic workflow command model appends versioned events and derives server-side role projections. Guarded transitions, expected aggregate versions, idempotency keys, authenticated callbacks, scheduled actions, and transactional outbox delivery keep the graph, queues, communications, caregiver view, transportation state, evidence, and audit history consistent.

### Runtime shape

```text
React + TypeScript + Vite role workspaces
  → generated client from contracts/openapi.yaml
  → TypeScript Vercel Node.js Functions in the same Vercel project
  → Supabase Cron invokes the authenticated bounded Vercel scheduler/outbox tick
  → provider adapters: Twilio, ElevenLabs, CareLink Partner Dispatch
  → Supabase PostgreSQL events, projections, outbox, scheduled work, callback receipts
  → event-derived metrics, FHIR bundle/report, and versioned exported ML artifacts
```

### Minimum infrastructure

| Subsystem | Decision | Product reason |
|---|---|---|
| Frontend | React + TypeScript + Vite | Preserve the completed experience and design system |
| Server runtime | TypeScript Vercel Node.js Functions | One-language command/query/callback boundary in the same Vercel deployment |
| Database | Supabase PostgreSQL via Git-tracked migrations | Durable cross-role state, event history, idempotency, scheduling, and reset |
| Worker | Supabase Cron (`pg_cron` + `pg_net`) plus an authenticated Vercel tick and bounded database claims | Per-minute deadline and delivery behavior without a long-running server, queue platform, or paid Vercel scheduler |
| External providers | Twilio, ElevenLabs, configured CareLink partner workflow | Real controlled communication and transportation proof |
| ML | Offline Python LightGBM/calibration/SHAP build; versioned runtime export consumed by TypeScript | Preserve the approved real pipeline while keeping the deployed application runtime in one Vercel project |

## 8. Contract and source-of-truth policy

- `contracts/openapi.yaml` is authoritative for HTTP commands, queries, callbacks, errors, and shared boundary schemas.
- `contracts/events/*.schema.json` is authoritative for workflow event envelopes and payloads.
- `.ai/tasks/LAUNCH-001/task.json` records the governed contract files and role write permissions.
- Frontend consumes generated contract types/client; backend boundary models implement the contract exactly.
- Database internals may add fields but may not redefine public event meaning.
- A worker that needs an incompatible endpoint, event, enum, or required field stops with `CONTRACT_CHANGE_REQUIRED`.

## 9. Trust boundaries and safety

### Controlled finals environment

- Only controlled illustrative data is permitted; no real PHI.
- Local role-entry buttons do not authenticate users. The server-managed finals scenario token and action allowlists are environment controls, not production authorization.
- The allowlisted phone, pickup, destination, provider, origin set, rate limits, request-size limits, and external-action kill switches are server-managed.
- Twilio callbacks require official raw-request signature verification; ElevenLabs callbacks require HMAC verification.
- Patient text remains inert, preserved verbatim, and routed to a named human pathway. No AI sets clinical urgency or closes clinical work.
- Caregiver projections are allowlisted server-side and exclude clinical content from visual, accessibility, search, export, and outbound surfaces.
- Secrets remain server-side and outside Git, logs, reports, screenshots, and frontend bundles.

### Security classification

`LAUNCH-001` is **HIGH** risk for the governed workflow because it introduces externally triggered callbacks, controlled real messages/calls, privileged reset/reseed, provider actions, and data-minimization boundaries. A dedicated security review is required even though the scenario data is illustrative.

## 10. Reliability, accessibility, and performance

- The primary journey must remain repeatable after deterministic reset and across refresh/deep links.
- External network failure may delay or degrade the journey but must never silently become success.
- Every mutation is guarded by idempotency and expected version where applicable.
- Callback retries and out-of-order delivery cannot duplicate or regress workflow state.
- Semantic structure, keyboard operation, visible focus, sufficient contrast, large patient/public controls, non-color cues, and reduced-motion equivalence are required.
- Patient surfaces are complete at 320px/mobile widths; operational workspaces are complete at presentation-laptop widths.
- The existing continuity field remains capped, offscreen/hidden-pausing, and static under reduced motion.

## 11. Commercial boundary

### Confirmed launch pricing

- **Small Infusion Center Pilot:** `$18,000/year` (`$1,500/month`, billed annually).
- Larger oncology programs and health systems: **Custom pricing**.
- Carrier, voice, and transportation charges are usage-based and separate.
- No self-serve checkout: use `Request a pilot` and `Talk to us`.

This price is a positioning hypothesis, not a validated industry or Ochsner price.

## 12. Delivery map

### Governed launch task

`LAUNCH-001` integrates seven ordered capability milestones inside one end-to-end slice:

| Order | Milestone | Outcome |
|---:|---|---|
| 1 | LAND | Public privacy, pricing, and local role entry |
| 2 | FLOW | Durable early warning, ownership, deadlines, and closure |
| 3 | SMS | Allowlisted Twilio readiness messaging and verified callbacks |
| 4 | VOICE | Bounded ElevenLabs fallback through Twilio |
| 5 | RIDE | CareLink Partner Dispatch, failure/recovery, and acknowledgment |
| 6 | EVIDENCE | Event-derived metrics and validated FHIR R4 artifact |
| 7 | ML | Calibrated supportive-outreach score and SHAP explanation |

### Timebox

**Confirmed:** the implementation map uses two 16-hour coding days (32 coding hours per implementation specialist), followed by one protected finalization day with no planned feature development. The long days increase available execution time; they do not relax contract, security, verification, or truthfulness gates.

Detailed ownership and hour-by-hour sequencing live in [`LAUNCH_SPRINT.md`](./LAUNCH_SPRINT.md). [`LAUNCH_ROADMAP.md`](./LAUNCH_ROADMAP.md) remains the approved rationale and milestone map.

## 13. Stop condition

Stop adding scope when the one finals journey is visually complete, genuinely event-driven, repeatable after reset, truthful about integrations and authority, and protected by the selected gates. Do not spend remaining time on generalized infrastructure, extra personas, decorative dashboards, speculative adapters, or production hardening unrelated to an acceptance criterion or material risk.

## 14. Definition of launch success

- A viewer can retell the patient, threat, mechanism, owner, recovery, and outcome after one viewing.
- Public pages expose no patient record and pricing/access entry are coherent.
- The same persisted events drive every relevant role projection, graph state, timeline entry, metric, and FHIR artifact.
- Live-looking provider states are backed by authenticated callbacks; replay states are distinguishable in evidence.
- CareLink assignment alone cannot close transportation; Maria's acknowledgment is required.
- Ana receives authorized transportation logistics and no clinical content.
- ML is reproducible, calibrated, inspectable, safely unavailable when invalid, and limited to supportive-outreach ordering.
- FULL tests, current verification, required security review, final review, five rehearsals, and the backup recording pass before merge.

## 15. Open questions

| ID | Question | Why it matters | Blocks LAUNCH-001 planning? |
|---|---|---|---|
| Q-001 | Which production identity, consent, and authorization model would Ochsner approve? | Required before real users or PHI | No; production use remains out of scope |
| Q-002 | Which clinical concern categories, owners, SLAs, and escalation language are approved? | Required before clinical deployment | No; finals concern remains clearly non-urgent and illustrative |
| Q-003 | Which existing Ochsner staff surface should OncoReady replace or augment? | Prevents another inbox | No |
| Q-004 | Are Twilio, ElevenLabs, Supabase DEV, and callback-domain credentials available by Day 1 H2? | Required for live external proof | No for contract planning; yes for corresponding implementation gates |

## 16. Approved decisions

| ID | Decision | Status |
|---|---|---|
| D-001 | Preserve React, TypeScript, Vite, and the established design system | Confirmed |
| D-002 | Deploy the Vite frontend and TypeScript Vercel Node.js Functions as one Vercel project backed by Supabase PostgreSQL event state | Confirmed |
| D-003 | Use Supabase Free Cron to invoke an authenticated Vercel Hobby tick with bounded PostgreSQL outbox/scheduler claims; do not add a persistent app server, Redis, Kafka, Celery, or microservices | Confirmed; amended 2026-09-20 |
| D-004 | Use CareLink Partner Dispatch as the only active finals transportation path | Confirmed |
| D-005 | Keep Uber Health and Lyft Concierge as visibly planned, disconnected adapters | Confirmed |
| D-006 | Use one allowlisted team-controlled phone for Twilio and ElevenLabs proof | Confirmed, credentials pending human supply |
| D-007 | Implement LightGBM calibration and SHAP last, after workflow/contracts are stable | Confirmed |
| D-008 | Execute two 16-hour coding days, then protect Day 3 for freeze/rehearsal/recording/submission | Confirmed |
