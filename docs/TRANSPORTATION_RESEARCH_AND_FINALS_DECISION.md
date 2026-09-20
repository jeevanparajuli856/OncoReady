# Oncology Transportation Research and Finals Decision

**Status:** Proposed for human approval  
**Research date:** September 20, 2026  
**Planning branch:** `feature/PLAN-001-launch-roadmap`  
**Decision scope:** Transportation strategy for the Nexus DevDay final and the first launch-oriented vertical slice  
**Implementation state:** Planning only; this document does not authorize production code or a claim of live Ochsner, Uber, or Lyft integration.

## 1. Executive decision

Build **OncoReady Transportation Partner Dispatch** as the required finals capability. Keep Uber Health and Lyft Concierge behind a narrow provider boundary and activate one only if approved credentials arrive before the integration freeze and the complete provider path passes rehearsal.

This is a hybrid product decision, not a proposal to operate an OncoReady driver fleet:

- OncoReady owns early detection, eligibility and accommodation capture, deadlines, assignment, patient/caregiver communication, exception recovery, evidence, and closure.
- A hospital team, local NEMT organization, community program, Uber Health, or Lyft Concierge may fulfill the ride.
- The finals journey must remain complete when neither Uber nor Lyft grants access.
- The product must never display Uber or Lyft as the provider unless the corresponding API interaction actually occurred.

### Why this is the best finals choice

1. Vendor approval is outside the team's control and therefore cannot be on the critical presentation path.
2. The differentiated problem is transportation readiness and closed-loop recovery, not the commodity act of requesting a car.
3. A real partner-dispatch workflow strengthens the existing transportation-coordinator persona and proves multi-role state propagation.
4. The same workflow remains useful when fulfillment comes from Medicaid brokers, hospital vans, community programs, NEMT companies, family, Uber Health, or Lyft Concierge.
5. External credentials can improve the final, but their absence will not reduce the product to a static screen or fake success.

## 2. Research boundary

The evidence below establishes transportation as a material cancer-care access and operations problem. Public sources do **not** disclose Ochsner's oncology-specific no-show rate, navigator time per ride, current dispatch software, transportation vendor contracts, or use of Uber Health/Lyft. Those items remain discovery questions and must not be presented as known Ochsner facts.

The product implications in this document are reasoned recommendations derived from the cited evidence. They are not claims that Ochsner has approved the workflow.

## 3. Documented Ochsner and Gulf South pain

| Documented pain | Evidence | Product significance |
|---|---|---|
| Rural and low-vehicle-access communities | Ochsner's Acadiana assessment describes transportation as a dominant access issue and reports that roughly 7% to almost 12% of households across area parishes lack access to a vehicle. Rural participants described patients arriving by ambulance as their only transportation and then lacking a way home or to follow-up care. [Ochsner Lafayette General CHNA](https://ochsner-craft.s3.amazonaws.com/www/static/OLG-Full-CHNA-Report-Released-1-3-2022_1.pdf) | The workflow must cover outbound and return transportation, not merely a one-way ride request. |
| Transportation access remains persistently difficult | In the Greater New Orleans assessment, 10.1% of respondents selected transportation access as a leading social problem. Among respondents concerned about it, 32.6% said it had worsened and 56.6% said it had stayed the same. A health-system leader identified transportation, financial strain, and weak social support as major drivers of access barriers. [Greater New Orleans CHNA](https://ochsner-craft.s3.amazonaws.com/www/static/GNO_CHNA_Final_12.13.24.pdf) | A one-time directory or referral is insufficient; the center needs accountable follow-through. |
| Public transit and medical transport are distinct barriers | Ochsner LSU Health's Shreveport assessment explicitly identifies public transportation and medical transport as access barriers, with older adults and people with disabilities experiencing greater difficulty. [Ochsner LSU Health Shreveport CHNA](https://www.ochsnerlsuhs.org/content/uploads/Shreve-CHNA-2024-7.15.pdf) | Vehicle type, mobility needs, transfer assistance, and escort requirements must be captured before assignment. |
| Assistance is publicly described at the location level | Ochsner Cancer Center of Acadiana–New Iberia advertises courtesy transportation when needed, while other Ochsner community material describes different local support arrangements. [Ochsner New Iberia](https://www.ochsner.org/locations/ochsner-cancer-center-of-acadiana-new-iberia/) | Publicly visible resources appear location-specific, so OncoReady should orchestrate multiple pathways rather than assume one enterprise-wide ride source. |
| Specialized care creates travel burden | Ochsner stated that the new Monroe cancer center is intended to reduce residents' need to travel for cancer services. [Ochsner LSU Health Monroe announcement](https://news.ochsner.org/news-releases/ochsner-lsu-health-monroe-purchases-property-for-new-cancer-center/) | Treatment location and service availability are part of transportation readiness, especially for specialized care. |
| Community screening and specialty access are affected | Ochsner Medical Center–Hancock's 2025 assessment states that transportation barriers continue to limit timely care and that breast and colorectal screening rates remain below national benchmarks. [Ochsner Hancock CHNA](https://ochsner-craft.s3.amazonaws.com/www/static/Ochsner-Medical-Center-Hancock-Community-Health-Needs-Assessment-2025.pdf) | The same orchestration mechanism can later support screening and diagnostic follow-up, but the finals scope should stay on one treatment event. |

## 4. Louisiana authorization and service constraints

Transportation is not interchangeable across patients:

- Louisiana Medicaid directs members to the transportation broker associated with their health plan and generally requires at least 48 hours' notice, excluding weekends. [Louisiana Department of Health medical transportation](https://www.ldh.la.gov/medicaid/medical-transportation)
- Brokers review eligibility and medical-facility addresses, select the least costly suitable option, and must accommodate ambulatory, wheelchair, transfer, or other required service levels. [Louisiana Medicaid scheduling and authorization](https://www.ldh.la.gov/assets/medicaid/RFP_Documents/Transportation/Medicaid_Services_Manual.pdf)
- Louisiana standards allow as much as two hours after an appointment concludes or after a will-call request for return pickup. [Louisiana NEMT provider responsibilities](https://ldh.la.gov/assets/medicaid/PC-PM/8.7.23/MedicalTransportation10.4NEMT-ProviderResponsibilities08.07.23.pdf)

These rules produce a product requirement: transportation risk must be identified before the authorization cutoff, and the plan must account for treatment end-time uncertainty and a safe return trip.

## 5. Evidence from other cancer centers

| Center or study | Finding | Lesson for OncoReady |
|---|---|---|
| American College of Surgeons national collaborative | Across 194 accredited cancer programs and 99,057 scheduled radiotherapy patients, transportation was the most frequently addressed barrier at 62.3%. Patient-level missed-treatment rates fell from 8.3% to 5.0% during the quality-improvement collaborative. [Published abstract](https://pubmed.ncbi.nlm.nih.gov/41217348/) | Transportation is a common system-level oncology barrier, and workflow changes are measurable. |
| University Hospitals Seidman Cancer Center | Hospital-provided rideshare users achieved a 97.3% course-completion rate versus 85.4% among non-users. For high-use patients, average rideshare cost was $362 while average treatment revenue potentially facilitated was $12,923. Eligibility still required social-work assessment after family, insurance, charity, transit, lodging, and fuel options were considered. [UH Seidman](https://www.uhhospitals.org/for-clinicians/articles-and-news/articles/2023/01/hospital-provided-rideshare-at-uh-seidman-boosts-radiation-therapy-completion-rates) | The value case includes treatment completion, capacity utilization, and navigation efficiency—not only ride cost. |
| Fred Hutch/UW Medicine | Their colonoscopy work identifies both transportation and a responsible escort as completion barriers after sedation. The operating model includes staff-arranged rides, tracking, billing, and safe handoff. [Fred Hutch](https://www.fredhutch.org/en/news/spotlight/2022/06/ccg-bellbrown-frhs.html) | A car is not sufficient when discharge policy or clinical condition requires an escort or handoff. |
| MD Anderson | Internal patient transportation requests include origin, destination, required equipment, and other details; an escort handles about 17 internal transports per shift. [MD Anderson](https://www.mdanderson.org/cancerwise/what-does-a-patient-escort-do-to-help-cancer-patients-during-treatment.h00-159306990.html) | Arrival at the campus is not the end of the transportation chain; mobility and correct-destination handoff matter. |
| American Cancer Society Road To Recovery | Rides require advance coordination and depend on volunteer availability. ACS states that it does not currently have enough volunteers to fulfill every request, and safety/eligibility restrictions apply. [Rider program](https://www.cancer.org/support-programs-and-services/road-to-recovery.html) and [volunteer capacity](https://www.cancer.org/involved/volunteer/road-to-recovery.html) | The workflow needs provider alternatives and explicit failure recovery instead of assuming a referral equals a confirmed ride. |

## 6. The actual institutional pain

The research supports nine linked problems:

1. Transportation need is often discovered after the useful authorization window.
2. Staff must determine eligibility, funding source, service level, escort need, and provider availability.
3. Repeated radiation or infusion visits magnify small reliability failures.
4. A confirmed outbound ride does not guarantee a safe return ride.
5. Treatment duration can change after labs, pharmacy preparation, reactions, or clinical review.
6. Patients, caregivers, navigators, dispatchers, and clinical teams hold different fragments of the plan.
7. Cancellations and no-provider outcomes require a backup path before the treatment cutoff.
8. Referral, request, assignment, arrival, treatment completion, and patient acknowledgment are different states and should not be collapsed into `ride confirmed`.
9. Centers need evidence connecting interventions with treatment completion, navigator workload, and recovered capacity.

The core product statement should therefore be:

> OncoReady identifies transportation risk before cancer treatment, matches the patient to an appropriate fulfillment pathway, coordinates every accountable handoff, and keeps the treatment at risk until the patient and responsible team confirm the plan.

## 7. Options considered

Scores are planning judgments on a 1–5 scale, not vendor performance claims.

| Criterion | Weight | OncoReady Partner Dispatch | Uber Health | Lyft Concierge |
|---|---:|---:|---:|---:|
| Can be completed without external approval | 30% | 5 | 2 | 3 |
| Finals reliability and reset control | 25% | 5 | 3 | 3 |
| Demonstrates OncoReady differentiation | 20% | 5 | 3 | 3 |
| Truthful end-to-end operating behavior | 15% | 4 | 5 | 5 |
| Immediate network scale | 10% | 2 | 5 | 5 |
| **Weighted result** | **100%** | **4.55** | **3.20** | **3.50** |

### Option A — OncoReady Transportation Partner Dispatch

**Decision:** Required primary path.

This option uses a real persisted dispatch lifecycle, a controlled transportation coordinator, an assigned driver/vehicle record, route and timing information, real Twilio/ElevenLabs communication, failure recovery, and cross-role projections. It does not claim that OncoReady operates a commercial fleet or that an external rideshare provider accepted the trip.

### Option B — Uber Health

**Decision:** Preferred optional adapter if access is approved early enough.

Uber Health is the strongest healthcare-branded fulfillment fit, but sandbox access can require application whitelisting. Its absence must not block the final. [Uber Health sandbox guide](https://developer.uber.com/docs/health/guides/sandbox)

### Option C — Lyft Concierge

**Decision:** Secondary optional adapter and parallel access request.

Lyft Concierge supports organization-requested rides for people who do not need a Lyft account. Lyft Business advertises no subscription or minimum spend, but API/program setup and safe testing still introduce external dependency and live-ride risk. [Lyft Concierge API overview](https://help.lyft.com/business/hc/en-us/articles/360001599667-Concierge-API-overview) and [API client connection](https://help.lyft.com/business/hc/en-us/articles/8587470351891-Managing-your-API-client-and-program-connections)

### Rejected approach — Wait for a vendor before building transportation

This creates schedule risk, makes the transportation persona superficial, and confuses OncoReady's differentiator with a single vendor's ride-booking API.

## 8. Minimum finals transportation slice

### User-visible outcome

A transportation risk identified before Maria's infusion becomes a funded, accommodation-aware request; CareLink accepts and assigns it; Maria and Ana receive the permitted logistics; a dispatch failure visibly reopens the blocker; the coordinator activates a backup; and Maria's acknowledgment closes the transportation dependency.

### Required workflow states

```text
need_detected
  → eligibility_reviewed
  → request_ready
  → offered
  → accepted
  → driver_assigned
  → patient_notified
  → patient_acknowledged
  → en_route
  → arrived
  → picked_up
  → completed

offered / accepted / driver_assigned
  → declined / cancelled / provider_unavailable
  → backup_required
  → re-offered or escalated_to_navigator
```

`requested`, `accepted`, `assigned`, `patient acknowledged`, and `completed` must remain distinct. The treatment-readiness blocker closes only after the selected policy's evidence is present; for the finals story, that means assignment plus patient acknowledgment before treatment.

### Minimum data

- treatment arrival window and transportation cutoff;
- pickup and destination;
- outbound and return plan;
- ambulatory, wheelchair, transfer, or escort requirements;
- funding/eligibility pathway;
- provider and provider mode;
- driver/vehicle assignment;
- patient and caregiver notification permissions;
- provider, patient, and staff acknowledgments;
- failure reason, backup decision, timestamps, correlation ID, and closure evidence.

### Minimum provider boundary

Keep the boundary small enough for the first slice:

```text
estimate(request)      optional by provider
create(request)
status(externalId)
cancel(externalId)
normalize(event)
```

Required finals implementation:

```text
TRANSPORT_PROVIDER=partner_dispatch
```

Conditional implementations:

```text
TRANSPORT_PROVIDER=uber_health
TRANSPORT_PROVIDER=lyft_concierge
```

Do not build all three adapters speculatively. Build `partner_dispatch`, freeze the normalized ride-event contract, and implement at most one external adapter if credentials are available.

## 9. Architecture and execution controls for the future RIDE-001 task

These controls are proposed and become authoritative only after source-of-truth reconciliation and task creation.

| Control | Decision |
|---|---|
| Database impact | Yes—ride request, assignment, event, acknowledgment, and failure evidence must persist |
| Backend impact | Yes—commands, provider adapter, callbacks, allowlists, and idempotency |
| Frontend impact | Yes—staff, transportation, patient, caregiver, graph, and timeline projections |
| Frontend design required | Yes—the transportation workspace is a signature finals surface |
| Infrastructure impact | Yes—public HTTPS callbacks for Twilio/ElevenLabs and an optional provider |
| Contract required | Yes—a stable normalized transportation command/event boundary is shared across frontend, backend, and optional providers |
| Test depth | TARGETED—protect the full journey, failure/retry, idempotency, and caregiver data boundary |
| Security risk | HIGH if real SMS/voice or external ride actions are enabled; require a focused security review |

## 10. Demo-critical acceptance criteria

- A transport barrier creates a separately owned transportation request with an accountable deadline.
- The coordinator reviews mobility, escort, outbound, return, and funding/eligibility information before offering the request.
- CareLink can accept, decline, assign a driver/vehicle, cancel, and activate a backup.
- Each action creates a durable event and updates staff, transportation, patient, caregiver, graph, and timeline views consistently.
- Twilio and ElevenLabs contact only the allowlisted finals phone; provider actions accept only the configured pickup and destination.
- A decline, cancellation, no-provider result, callback failure, or appointment change reopens or preserves the blocker.
- Ana receives transportation logistics only; no patient clinical concern or nurse text reaches her view or outbound content.
- Maria must acknowledge the selected plan before the finals readiness dependency closes.
- Network failure never becomes silent success. The deterministic recovery is labeled as an ordinary operational fallback state in the workflow and remains explainable in technical documentation.
- Provider branding and provider-specific statuses appear only when backed by that provider's actual response or verified callback.
- Reset restores the exact finals scenario without triggering another SMS, call, or external trip.

## 11. External-provider adoption gate

An external adapter may replace `partner_dispatch` in the primary presentation only when all conditions are true:

1. Approved credentials and the correct test environment are available at least five business days before the integration freeze.
2. Create, status, failure/cancel, retry or recovery, and callback authentication work end to end.
3. The provider path passes at least five consecutive rehearsals without manual database repair.
4. The provider kill switch, destination allowlist, idempotency, and reset behavior pass targeted tests.
5. A network-disabled rehearsal still completes through the documented recovery path without claiming vendor success.

If any condition fails, the final uses `partner_dispatch`. This is a quality decision, not a downgrade.

## 12. Recommended implementation order

1. Human approves this decision and the roadmap is reconciled with `docs/PROJECT.md`, `docs/architecture/SYSTEM.md`, and `.ai/project.json`.
2. Create the formal RIDE-001 feature/task artifacts and shared normalized transport contract.
3. Implement the Partner Dispatch vertical slice across persistence, backend, transportation workspace, patient/caregiver projections, graph, and timeline.
4. Connect Twilio SMS and ElevenLabs voice outcomes to the same transportation events.
5. Rehearse decline, cancellation, provider unavailable, return pending, backup assignment, and acknowledgment.
6. Continue Uber Health and Lyft Concierge access requests in parallel.
7. Add at most one external adapter after the core path is stable and only if the adoption gate passes.
8. Preserve LightGBM/SHAP for the ending stage, after the workflow event schema is stable.

## 13. Ochsner discovery questions

Before making Ochsner-specific ROI or workflow claims, validate:

1. What percentage of infusion and radiation absences or delays are attributed to transportation by site and service line?
2. When is transportation need screened, by whom, and where is the answer recorded?
3. Which Medicaid brokers, local NEMT providers, hospital vehicles, charities, and rideshare programs are used at each location?
4. What mobility, escort, infection-control, and discharge restrictions most often invalidate an otherwise available ride?
5. How are uncertain treatment end times and return rides handled today?
6. How many calls or minutes does navigation spend resolving one transportation barrier?
7. What constitutes a confirmed plan and who has authority to close the barrier?
8. Which events could be read from or written to the existing Ochsner/Epic workflow in a future pilot?

## 14. Final recommendation for the pitch

Do not pitch OncoReady as a ride-booking product. Pitch it as the treatment-continuity orchestration layer:

> A ride vendor can provide a car. OncoReady determines whether the patient can use it, whether it is funded and confirmed in time, whether a safe return and caregiver handoff exist, who owns a failure, and whether the treatment dependency truly closed.

That framing remains accurate whether CareLink, a Medicaid broker, a hospital vehicle, Uber Health, Lyft Concierge, or another NEMT partner performs fulfillment.
