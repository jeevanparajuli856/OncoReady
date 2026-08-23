# Lead B Competition Innovation Report

**Nexus Louisiana DevDays Cancer Care and Prevention Challenge — Ochsner Health**  
**Research cut:** August 22, 2026  
**Decision:** Conditional go on a closed-loop cancer continuity engine; validate the handoff gap with Ochsner before expanding the build.

## 1. Executive recommendation

### DESIGN — winning concept

Build **ContinuityLoop**, an auditable coordination layer that turns a patient or caregiver concern into the right owned action, confirms acknowledgment, and shows when the loop is closed.

> **One-sentence value proposition:** Cancer care can break between visits; ContinuityLoop turns each patient or caregiver barrier into an owned, acknowledged action across the services Ochsner already provides.

The narrow MVP wedge is **administrative and logistical continuity at care transitions**: new diagnosis, treatment start, appointment change, discharge, and survivorship handoff. It does not diagnose, prescribe, alter chemotherapy, or replace MyOchsner, nurse navigation, the cancer help line, or Chemotherapy Care Companion.

The visible demo moment is not a chatbot response. A fictional rural patient submits one overwhelmed message containing an urgent symptom and a transportation failure. Deterministic safety logic routes the symptom to the existing urgent pathway; the transportation need becomes a navigator-owned task; an authorized caregiver receives a minimal update; the final timeline proves both items were acknowledged and resolved.

### INFERENCE — why this can win

- The concept addresses a severe Louisiana context while remaining understandable in 20 seconds.
- It augments Ochsner's substantial existing services instead of duplicating them.
- Its novelty is the **closed-loop orchestration mechanism**, not AI.
- It is technically meaningful but buildable with synthetic data, FHIR-shaped interfaces, deterministic rules, a state machine, and constrained AI assistance.
- It supports low-bandwidth patients and caregivers through a PWA, SMS, phone fallback, and assisted navigation.
- It creates measurable pilot proxies: time to assignment, time to closure, unresolved tasks, duplicated touches, missed appointments, and navigator handling time.

### HYPOTHESIS — decisive uncertainty

The central whitespace—patient needs that cross services but lack a visible owner or confirmed resolution—is strongly plausible but **not yet verified inside Ochsner**. Ask an Ochsner mentor:

> “Where today can a patient need be documented but still lack a visible owner and confirmed resolution?”

If the answer is “nowhere” or “our current queue already does this,” pivot to Backup 1, disaster-resilient continuity, or Backup 2, transportation closure.

## 2. Competition constraints

### VERIFIED

- The challenge asks for an innovative solution improving the cancer journey from diagnosis through treatment, survivorship, and supportive care.
- Eligible participants are current engineering, computer-science, and business students at four-year Louisiana universities, plus graduates of those programs within the last 12 months.
- The draft prototype deadline is **August 23, 2026 at 11:59 p.m.**; virtual semifinals are August 26–27; finalists are notified August 31; finals are September 25.
- The top ten teams compete for $10,000 in total prizes. DevDays describes a 12-week research, prototype, testing, refinement, and live-demo process.

Source: https://www.nexusla.org/programs/devdays

### DESIGN — immediate submission controls

Before further product work, capture the submitted form confirmation, verify every team member's eligibility, and archive the exact draft submitted. The public page does not publish a complete rubric, team-size rule, submission-field list, or IP terms; read those directly in the acceptance form and do not infer them.

## 3. Evidence ledger

| Status | Material claim | Evidence | Confidence | Competition implication |
|---|---|---|---:|---|
| VERIFIED | Louisiana bears an estimated 27,260 new cancer cases and 9,284 cancer deaths annually. | Louisiana Tumor Registry / State Cancer Profiles | High | Use the burden to establish urgency, not to claim product impact. |
| VERIFIED | Rural cancer mortality is reported at 187.5 versus 160.8 in urban populations. | Louisiana cancer-burden lane; government registry sources | High | Rural resilience must be visible in the product, not a slide-only claim. |
| VERIFIED | 72.1% of Louisiana lung cancers are diagnosed at late stage. | Louisiana cancer-burden lane; registry data | High | Reinforces urgency but does not prove a continuity engine will change stage at diagnosis. |
| VERIFIED | Cancer journeys commonly fail at referrals, appointments, symptom escalation, information overload, transportation, financial support, caregiver coordination, and survivorship transitions. | Patient-journey lane; NCI and clinical literature | High | Choose one transition-centered wedge rather than cover the entire journey. |
| VERIFIED | Electronic patient-reported outcomes, navigation, transportation support, and timely follow-up have credible evidence behind their underlying mechanisms. | Clinical-evidence lane; peer-reviewed trials and guidance | High | Build on proven mechanisms, but make no outcome claim from a prototype. |
| VERIFIED | Ochsner already offers nurse navigation, MyOchsner, virtual care, Chemotherapy Care Companion, social work, financial support, urgent contact pathways, and survivorship/support services. | Ochsner official service pages | High | Generic navigation, portal, ePRO, or resource-directory pitches are duplicative. |
| VERIFIED | Generic cancer navigation, ePRO/RPM, referral, trial matching, and administrative copilots are crowded categories. | Competitive/prior-art lane | High | Novelty must be a defensible workflow delta, not “AI-powered.” |
| VERIFIED | FHIR R4 and mCODE provide a credible future data-contract path; Synthea can generate synthetic FHIR records for a prototype. | HL7, mCODE, Synthea | High | Build the demo without claiming production Ochsner integration. |
| VERIFIED | FDA's non-device CDS exclusion is clinician-facing and does not comfortably cover patient-facing, time-critical clinical recommendations. | FDA 2026 CDS guidance and FAQ | High | Keep the MVP administrative/logistical; use deterministic urgent routing and human authority. |
| VERIFIED | HIPAA-regulated cloud/AI vendors handling PHI generally require appropriate BAAs; security requires risk analysis, access, audit, integrity, authentication, and transmission safeguards. | HHS OCR / eCFR | High | Synthetic data only for the demo; production requires privacy/security governance. |
| INFERENCE | Cross-service handoff closure is Ochsner whitespace. | Synthesis across journey, Ochsner capability, and competitive lanes | Medium | This is the concept's go/no-go validation question. |
| INFERENCE | Administrative-logistics orchestration will face less FDA exposure than clinical prediction or treatment advice. | FDA intended-use framework | High | Preserve claims and product boundaries throughout pitch and UI. |
| HYPOTHESIS | Closed-loop orchestration will reduce navigator handling time and unresolved tasks. | Mechanism is plausible; no local baseline | Medium | Measure in an assisted pilot; do not claim savings yet. |
| HYPOTHESIS | Low-bandwidth and caregiver modes will improve completion for rural patients. | Access and caregiver evidence supports design need | Medium | Test completion and errors by channel and subgroup. |

### Contradictions and gaps

1. Ochsner's public pages establish extensive services but cannot reveal internal task-closure failure rates.
2. Evidence for ePRO or navigation outcomes does not transfer automatically to this product.
3. No Ochsner production API, PHI, workflow approval, staffing commitment, or local ROI baseline is available.
4. Public competition materials do not establish a formal judging rubric.
5. Rural mortality and late-stage diagnosis establish inequity, but the MVP is not a screening or diagnostic intervention.

## 4. Opportunity map and eight concepts

### Concept 1 — ContinuityLoop: closed-loop barrier orchestration

- **Target:** patients, caregivers, navigators, social workers.
- **Problem:** concerns and cross-service barriers can be documented without visible ownership or resolution.
- **Mechanism:** intake → deterministic safety screen → structured barrier classification → owned task → acknowledgment → resolution timeline.
- **Data:** patient/caregiver report, appointment/task status, approved resource directory; synthetic FHIR for demo.
- **Metric:** time to assignment/closure, unresolved-task rate, navigator minutes, missed appointments.
- **MVP:** one end-to-end rural treatment-start scenario.
- **Differentiator:** auditable closure across services.
- **Biggest risk:** the internal gap may already be solved.

### Concept 2 — StormBridge: disaster-resilient oncology continuity

- **Target:** patients receiving time-sensitive treatment during hurricanes, outages, or displacement.
- **Problem:** communication, transportation, medication information, and treatment-location continuity fail during disruption.
- **Mechanism:** offline care snapshot, disruption-aware tasking, alternate-site/resource routing, caregiver notification.
- **Metric:** successful contact, rescheduling time, acknowledged continuity tasks.
- **MVP:** simulated storm disrupts an infusion appointment; the system reconstitutes an actionable plan.
- **Differentiator:** Louisiana-specific continuity under disaster conditions.
- **Biggest risk:** operational data and emergency-governance dependencies.

### Concept 3 — RideClosed: transportation-to-treatment closure

- **Target:** rural/underserved patients and resource coordinators.
- **Problem:** a referral or ride suggestion does not prove the patient can reach treatment.
- **Mechanism:** eligibility-aware resource matching plus confirmation, fallback, and appointment linkage.
- **Metric:** confirmed rides, time to match, completed appointments.
- **MVP:** transport failure → matching → coordinator approval → patient confirmation.
- **Differentiator:** closes the ride loop rather than listing resources.
- **Biggest risk:** resource capacity and eligibility data become stale.

### Concept 4 — NavigatorFlow: oncology administrative workbench

- **Target:** nurse navigators and support staff.
- **Problem:** manual review, repeated outreach, and fragmented task prioritization consume time.
- **Mechanism:** summarize approved inputs, deduplicate tasks, prioritize work, draft outreach for approval.
- **Metric:** handling time, touches per case, duplicate work.
- **MVP:** morning queue compressed into an explainable worklist.
- **Differentiator:** oncology-specific orchestration with auditability.
- **Biggest risk:** crowded copilot category and another inbox.

### Concept 5 — CareCircle: permissioned caregiver relay

- **Target:** patients and remote caregivers.
- **Problem:** caregivers lack current, appropriately permissioned next steps.
- **Mechanism:** granular delegation, role-specific updates, shared tasks, revocation.
- **Metric:** task completion, duplicated calls, comprehension.
- **MVP:** patient authorizes daughter for appointments and transport but not clinical notes.
- **Differentiator:** privacy-aware task delegation rather than record sharing.
- **Biggest risk:** identity, proxy authority, and adoption complexity.

### Concept 6 — OncoSignal: ePRO symptom escalation

- **Target:** patients on chemotherapy and oncology nurses.
- **Problem:** symptoms worsen between visits.
- **Mechanism:** structured ePRO collection with urgent escalation and nurse queue.
- **Metric:** report completion, escalation time, acute utilization.
- **MVP:** symptom report routes to nurse review.
- **Differentiator:** weak at Ochsner because Care Companion already overlaps.
- **Biggest risk:** duplication, alert burden, clinical liability, regulatory exposure.

### Concept 7 — TrialPath: referral-to-trial closure

- **Target:** patients, research coordinators, referring clinicians.
- **Problem:** apparent eligibility does not guarantee completed trial referral.
- **Mechanism:** transparent prescreen, coordinator review, missing-data request, referral tracking.
- **Metric:** completed prescreens and time to coordinator decision.
- **MVP:** synthetic patient → candidate trial → human-reviewed referral.
- **Differentiator:** closure rather than matching alone.
- **Biggest risk:** crowded matching market and rapidly changing eligibility.

### Concept 8 — CancerGuide: generic AI navigator

- **Target:** patients and caregivers.
- **Problem:** information overload.
- **Mechanism:** conversational education, reminders, and resource links.
- **Metric:** comprehension and engagement.
- **MVP:** chatbot journey.
- **Differentiator:** none defensible.
- **Biggest risk:** commodity product, hallucination, Ochsner duplication.

## 5. Weighted working rubric

This is a research-derived rubric, not an official DevDays rubric.

| Concept | Align 12 | Impact 16 | Novelty 15 | Safety 12 | Demo 10 | Equity 10 | Workflow 7 | Scale 5 | Tech 5 | Clarity 8 | **Total** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ContinuityLoop | 11 | 14 | 13 | 11 | 9 | 9 | 6 | 4 | 4 | 8 | **89** |
| StormBridge | 10 | 14 | 14 | 10 | 8 | 10 | 5 | 4 | 4 | 8 | **87** |
| RideClosed | 10 | 12 | 10 | 12 | 9 | 10 | 6 | 4 | 3 | 8 | **84** |
| CareCircle | 10 | 11 | 10 | 10 | 9 | 9 | 5 | 4 | 3 | 8 | **79** |
| NavigatorFlow | 9 | 13 | 9 | 11 | 8 | 6 | 7 | 5 | 4 | 6 | **78** |
| OncoSignal | 11 | 14 | 6 | 8 | 8 | 7 | 5 | 4 | 5 | 7 | **75** |
| TrialPath | 9 | 11 | 6 | 11 | 8 | 6 | 6 | 4 | 4 | 6 | **71** |
| CancerGuide | 9 | 9 | 3 | 7 | 9 | 7 | 4 | 4 | 3 | 8 | **63** |

**Score rationale:** ContinuityLoop wins across stakeholder value, demo clarity, and safe technical depth but loses points until the gap is validated. StormBridge is highly differentiated and locally resonant but operationally harder. RideClosed is safe and concrete but narrower and dependent on current resource capacity. CareCircle has human value but complex permissions. NavigatorFlow has a plausible ROI story but is crowded and less emotionally legible. OncoSignal rests on strong clinical evidence but duplicates an Ochsner capability. TrialPath is crowded and data-sensitive. CancerGuide is clear but generic and unsafe if overclaimed.

## 6. Five-person simulated jury

| Juror | Ranking | Strongest “yes” | Strongest “no” | Question |
|---|---|---|---|---|
| Oncology clinician | ContinuityLoop, StormBridge, RideClosed | Separates urgent safety routing from administrative action. | Unvalidated rules or ambiguous after-hours coverage create liability. | “Who acts, by when, and what happens if nobody acknowledges?” |
| Nurse navigator / operations | ContinuityLoop, RideClosed, NavigatorFlow | Could stop repeated chasing and make ownership visible. | Another queue or duplicate documentation will be rejected. | “Which current clicks, calls, or spreadsheets disappear?” |
| Digital / IT leader | ContinuityLoop, StormBridge, NavigatorFlow | Modular state machine, audit trail, synthetic demo, FHIR boundary. | Identity, integration, PHI vendors, and support burden are understated. | “Can it work safely before full EHR integration?” |
| Innovation / business judge | StormBridge, ContinuityLoop, RideClosed | Louisiana-specific mechanism with a memorable demo. | ROI is hypothetical and category language can sound broad. | “What is novel enough to buy rather than build internally?” |
| Patient / caregiver | RideClosed, ContinuityLoop, CareCircle | Shows who is helping and whether the problem is solved. | Too many alerts or technical language increase anxiety. | “Can I use it by text or phone, and can my daughter help?” |

**Jury result:** ContinuityLoop has the strongest cross-juror performance. StormBridge creates the largest novelty and Louisiana advantage. RideClosed is the clearest safe fallback.

## 7. Winning concept specification

### VERIFIED — Ochsner duplication guard

Ochsner already has people and channels that perform navigation, symptom monitoring, virtual care, social support, financial support, and survivorship. ContinuityLoop must not claim these as new. Its sole defensible delta is making a cross-service concern **owned, time-bound, acknowledged, and visibly resolved**.

### HYPOTHESIS — novelty claim to validate

> Existing portals, navigators, monitoring programs, and resource services each support portions of the cancer journey, but they may not expose shared ownership and confirmed closure when a need crosses services. ContinuityLoop adds a low-bandwidth, auditable orchestration layer, enabling measurable reduction in unresolved tasks and coordination effort in Louisiana oncology workflows.

The words “may” and “hypothesis” remain until an Ochsner operator confirms the gap.

### DESIGN — golden-path demo

Use a clearly labeled fictional composite: **Denise, 62, lives in rural Louisiana and is beginning chemotherapy; her daughter Maya lives two hours away.**

1. Denise sends a low-bandwidth check-in: she feels feverish and her ride for tomorrow has fallen through.
2. Deterministic, oncology-approved demo rules recognize the urgent phrase; the LLM does not determine urgency.
3. The interface shows approved urgent-contact guidance and creates a nurse-review item linked to Ochsner's existing urgent pathway.
4. A separate transportation task is routed to the navigator with reason, due time, and suggested resources.
5. The navigator approves the outreach and confirms a ride.
6. Maya receives only the update Denise authorized.
7. The timeline shows nurse acknowledgment, transportation confirmation, patient receipt, and final closure.

The demo should include one controlled failure: the AI summarizer times out, yet the raw patient report and deterministic workflow still reach the queue.

### DESIGN — architecture

```text
Patient/caregiver PWA ── SMS/phone-assisted fallback
             │
Identity, consent, proxy and API layer
             │
Workflow state machine ─ deterministic safety rules
       │                 ├ constrained classifier/summarizer
       │                 └ approved resource matcher
PostgreSQL + durable queue + append-only audit events
             │
Navigator dashboard / structured export
             │
FHIR R4 + mCODE adapter boundary (future Ochsner integration)
```

The LLM returns schema-constrained administrative categories and summaries from a clinician-approved corpus. It cannot diagnose, prescribe, change urgency, or close tasks. High-risk inputs bypass it. The system records input, rule/model version, source, reviewer, override, delivery, acknowledgment, and disposition.

### DESIGN — 48-hour prototype versus finals

**Draft prototype:** responsive PWA, three synthetic personas, one real intake, deterministic rule execution, task creation, navigator approval, caregiver permission, and closure timeline. Seed the database; cache approved content; provide deterministic fallbacks. Simulate and label Ochsner branding, FHIR connection, SMS delivery, staff identity, clinical protocol, and outcomes.

**Finals build:** SMART/FHIR sandbox launch, role-based login, proxy revocation, configurable rules, retry/acknowledgment logic, offline draft capture, bilingual reviewed content, evaluation dashboard, and normal/failure demo paths. Do not make the demo dependent on production APIs or live model availability.

## 8. Safety, privacy, equity, and claims

### DESIGN — hard red lines

- Never diagnose cancer, recommend or alter treatment, change chemotherapy, tell a patient to delay care, or autonomously suppress/close a red flag.
- Urgent routing uses approved deterministic rules, a named queue, explicit response expectations, and fallback instructions.
- Consequential actions require human approval.
- No PHI enters an uncontracted model or analytics vendor; no PHI is reused for model training or advertising.
- Do not claim “HIPAA certified,” “FDA approved,” “bias-free,” “clinically validated,” “prevents hospitalization,” “improves survival,” “24/7 monitored,” or “replaces navigators.”

### DESIGN — equity and human experience

- Text-first PWA, save/resume, delayed sync, minimal-data SMS, phone/assisted fallback, and printable plan.
- One question and action per screen; plain language; concrete dates; icons plus text; never color alone.
- Keyboard, screen-reader, zoom, contrast, captions, large touch targets, and no timed input, using WCAG 2.2 as the benchmark.
- Professional review of translated clinical content; no live machine translation for urgent instructions.
- Separate caregiver identity with granular permission, visible sharing, and revocation.
- Track completion, errors, and response time by rurality, language, age, disability/accessibility mode, and channel.

## 9. Pilot, metrics, and ROI

### DESIGN — assisted pilot

Pilot at one cancer center, one treatment cohort, 2–4 navigators, and approximately 50–100 consenting patients for 6–8 weeks. Begin with two weeks of shadow mode, then staff-approved assisted operation. Review false positives/negatives, unowned work, alert burden, patient reachability, and staff time weekly.

### HYPOTHESIS — measurable value

Primary metrics are barrier-to-assignment time, barrier-to-resolution time, percentage acknowledged/closed within SLA, unresolved tasks after seven days, navigator minutes and touches per case, resource connection completion, and missed/cancelled treatment appointments. Safety balancing measures are urgent-event misses, duplicate work, overrides, alerts per navigator, and after-hours escalations.

Use operational capacity—not reimbursement—as the base ROI:

`annual value = navigator minutes avoided × loaded labor cost + validated no-show cost avoided + duplicate outreach avoided − software/integration/support cost`

Every input requires Ochsner baseline data. CMS remote-monitoring reimbursement should not be used unless the deployed service actually meets connected-device, monitoring, clinical-work, consent, and billing requirements.

## 10. Kill criteria and pivot plan

Kill or pivot ContinuityLoop if:

1. No navigator or mentor confirms a meaningful unowned-handoff problem.
2. MyOchsner, Care Companion, or an internal queue already supplies shared ownership and closure.
3. Alerts lack one accountable role, response time, and fallback.
4. The pilot adds documentation or another inbox without removing work.
5. The demo depends on live Ochsner PHI, production integration, or perfect internet.
6. AI makes clinical decisions or the demo hides failure modes.
7. Rural patients cannot complete the core flow through low-bandwidth or assisted channels.
8. ROI depends on reimbursement or outcome claims rather than measured operational proxies.

### Backup 1 — StormBridge

Pivot to disaster-resilient oncology continuity if Ochsner validates disruption planning as an unmet operational need. It offers the strongest Louisiana-specific novelty but needs emergency-management ownership and alternate-site data.

### Backup 2 — RideClosed

Pivot to transportation-to-treatment closure if the broad handoff layer is duplicative. It is safer, concrete, emotionally clear, and measurable, but requires locally verified eligibility, capacity, and fallback resources.

## 11. Pitch choreography and likely Q&A

### DESIGN — three-minute narrative

1. **Human problem:** “Cancer care can break between visits, especially when distance, side effects, and multiple services collide.”
2. **Denise's message:** show symptom plus lost ride.
3. **Visible magic:** one message becomes two correctly owned workflows.
4. **Human authority:** nurse/navigator reviews; the system shows why, who, when, and status.
5. **Closure:** Denise and Maya see only what they need; the timeline proves completion.
6. **Technical confidence:** state machine, deterministic safety, constrained AI, audit, low-bandwidth design, FHIR boundary.
7. **Honest ask:** validate the handoff gap and run an assisted pilot measuring closure and staff time.

### Likely questions

**Why not MyOchsner?** MyOchsner is a channel. ContinuityLoop's hypothesized delta is cross-service ownership, response expectations, and confirmed closure; Ochsner must validate that delta.

**Why not Care Companion?** Care Companion monitors selected physiologic data. This MVP focuses on administrative/logistical barriers and transitions, routing urgent symptoms to existing pathways rather than creating another monitoring program.

**Where does the data come from?** The demo uses labeled synthetic FHIR-shaped records and approved public resources. Production would require Ochsner governance and a FHIR/mCODE adapter; no production access is claimed.

**What if the model is wrong?** It cannot set clinical urgency. Deterministic approved rules run first; people approve consequential actions; the workflow survives model failure; every step is audited.

**Who owns it Monday morning?** Oncology navigation operations, with a nursing clinical owner and IT/privacy partners. If that owner is not named, the concept is not pilot-ready.

**What outcome changes?** The prototype claims no clinical outcome. The pilot tests faster ownership and closure, fewer unresolved tasks and duplicated touches, and acceptable safety/burden measures.

## 12. Source appendix

### Competition and Ochsner

- https://www.nexusla.org/programs/devdays
- https://www.ochsner.org/services/cancer-care/
- https://www.ochsner.org/services/cancer-care/cancer-resources/
- https://www.ochsner.org/services/cancer-care/cancer-services/

### Louisiana and cancer evidence

- https://sph.lsuhsc.edu/louisiana-tumor-registry/
- https://statecancerprofiles.cancer.gov/
- https://www.cancer.gov/about-cancer/coping/caregiver-support
- https://doi.org/10.1001/jama.2017.7156

### Interoperability and synthetic data

- https://hl7.org/fhir/R4/
- https://hl7.org/fhir/us/mcode/
- https://hl7.org/fhir/smart-app-launch/
- https://github.com/synthetichealth/synthea

### Safety, privacy, security, and accessibility

- https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- https://www.fda.gov/medical-devices/software-medical-device-samd/clinical-decision-support-software-frequently-asked-questions-faqs
- https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/minimum-necessary-requirement/index.html
- https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html
- https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html
- https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312
- https://www.nist.gov/itl/ai-risk-management-framework
- https://www.w3.org/TR/WCAG22/

### Reimbursement boundary

- https://www.cms.gov/medicare/coverage/telehealth/remote-patient-monitoring
- https://www.cms.gov/medicare/payment/fee-schedules/physician/care-management

---

## Final decision

**Proceed with ContinuityLoop for the draft prototype, but keep the build deliberately narrow and the pitch conditional.** The concept earns its lead only if Ochsner confirms that cross-service oncology needs can lack visible ownership or verified closure. Submit a functioning golden path now; use mentor access to validate the gap before finals; pivot quickly to StormBridge or RideClosed if the duplication guard fails.
