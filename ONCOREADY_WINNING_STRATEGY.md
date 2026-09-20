# OncoReady Winning Strategy

**Nexus DevDay — Cancer Care and Prevention Challenge | Ochsner Health | Finals strategy**

## Grounding and evidence boundary

- `[stated]` The field contains nine named competitors. Only BayouCare has directly verified feature-level evidence in the supplied intelligence reports; the other eight are primarily semantic/category reconstructions with explicit confidence limits.
- `[stated]` OncoReady is currently a React/TypeScript/Vite, browser-local product whose real core is a deterministic treatment-readiness state machine: one patient report becomes separate clinical and transportation tasks with owners, deadlines, closure evidence, caregiver minimization, and an audit timeline.
- `[stated]` The current product has no production backend, durable multi-user store, live ML, live SMS/voice, live Epic/Ochsner/FHIR connection, or live transportation booking. Integrations and most enterprise data are synthetic or simulated.
- `[stated]` The semifinal feedback validates the last-minute cancellation/no-show problem and asks for three visible upgrades: transportation fulfillment, department-specific communication, and earlier warning before the patient misses the visit.
- `[inferred]` The strategic question is whether “earlier” can become a credible, inspectable risk-and-intervention mechanism rather than a T−24 self-report. There is not yet evidence that Ochsner lacks an equivalent cross-department closure workflow or that an OncoReady model can be validated with available project data.

✅ Step 0 complete — the two required intelligence reports, authoritative OncoReady product/architecture/specifications, current workflow implementation, and test evidence were reviewed.

---

## 1. Verdict

1. `[inferred]` **OncoReady does not win the final as currently defined.** The legitimacy of the problem is already strong, but the current build is a polished, fixed T−24 workflow over one synthetic case, not an early-warning system.
2. `[inferred]` Its current novelty collapses when BayouCare shows no-show prediction and transportation on the same stage, and when judges recognize that commercial products already predict nonattendance, message patients, refill slots, and arrange rides.
3. `[inferred]` Its current development-difficulty score is the largest liability: the shipped core is browser-local state, fixed routing, hard-coded synthetic timestamps, and one-click simulated transportation rather than a trained model, constraint solver, failure recovery, or verified interoperability artifact.
4. `[inferred]` The single change with the greatest scoring leverage is to turn OncoReady into an **early treatment-continuity control layer**: begin at T−7/T−3, detect a recoverable risk before the transportation cutoff, split the barrier into department-owned rescue work, execute a constraint-aware fallback, and prove closure around the linked treatment event.
5. `[inferred]` If that vertical slice is real, transparent, and rehearsed—while Epic, SMS, transport fulfillment, and clinical authority are described honestly—OncoReady can move from “good scheduling app” to the most operationally credible product in the room.

### Evidence that belongs on stage

- `[stated]` In a randomized intervention across five cancer-center clinics, model-targeted bilingual navigation reduced no-shows among high-risk appointments from **17.5% to 10.2%**; successful contact mattered, so the evidence supports prediction **plus human intervention**, not prediction alone. [Percac-Lima et al., *Cancer*](https://pubmed.ncbi.nlm.nih.gov/25585595/)
- `[stated]` Louisiana Medicaid guidance generally requires routine non-emergency medical transportation to be requested at least **48 hours in advance, excluding weekends**. A T−24 transportation check is therefore operationally late for an important Louisiana pathway. [Louisiana Department of Health](https://www.ldh.la.gov/medicaid/medical-transportation)
- `[stated]` Louisiana's 2022 age-adjusted cancer mortality rate was **160.3 per 100,000**, versus **142.0 nationally**. This establishes local burden; it does not prove OncoReady changes mortality. [Louisiana Department of Health 2024 Health Report Card](https://ldh.la.gov/assets/OPH/Center-PHI/2024_Health_Report_Card_Final.pdf)

---

## 2. Rubric scorecard

The role brief names four judging dimensions. The last three are the final scored rubric; problem legitimacy is included because it controls whether the other scores feel credible.

| Criterion | Current self-score | Target | Gap | Specific lever |
|---|---:|---:|---:|---|
| **Legitimacy of problem** | **5/5** | **5/5** | 0 | `[stated]` Keep the validated problem and show the published predictive-navigation evidence plus Louisiana's 48-hour NEMT constraint. Do not broaden into generic cancer navigation. |
| **Novelty** | **3/5** | **5/5** | 2 | `[inferred]` Stop claiming novelty from prediction, texting, reminders, or rides. Own **regimen-/treatment-chain preservation through department-owned, deadline-bound closure**. |
| **Difficulty of development** | **2/5** | **5/5** | 3 | `[inferred]` Ship a real temporal feature pipeline and synthetic-trained model, real constraint filtering and fallback, event-driven SLA routing, computed metrics, and a validated synthetic FHIR R4 bundle. |
| **Opportunity of impact** | **3/5** | **5/5** | 2 | `[inferred]` Quantify the reachable mechanism: lead time gained, cases surfaced before transport cutoff, time to owner, time to closure, unresolved blockers at T−24/T−12/T−4, and treatment kept/rescheduled/cancelled with reason. |

### Hostile-judge interpretation of the current score

- `[inferred]` **Legitimacy 5/5:** “The judges already told this team the problem matters.”
- `[inferred]` **Novelty 3/5:** “The closure framing is thoughtful, but BayouCare and market vendors already cover prediction, outreach, transport, and care-team workflows.”
- `[inferred]` **Difficulty 2/5:** “This is polished React CRUD around a deterministic reducer; the impressive-looking clinical data and map are fixtures.”
- `[inferred]` **Impact 3/5:** “The opportunity is large, but there is no Ochsner baseline, no local model performance, no real fulfillment, and no measured avoided cancellation.”

---

## 3. Judge feedback traceability table

| Judge request | Current delivery verdict | Feature that fully answers it | Build status | Exact demo moment |
|---|---|---|---|---|
| **Judge 1 — “Get a ride to the facility.”** | `[stated]` **Half-delivered.** The current app lets staff type a vehicle, driver, and pickup time and then marks a simulated ride confirmed; it has no eligibility, capacity, provider failure, or real booking. | `[inferred]` Louisiana-aware transport constraint resolver: payer/broker path, parish/service radius, notice cutoff, mobility, arrival window, provider capacity, failed attempt, fallback, navigator confirmation, patient acknowledgment. | **Must build; not currently shipped. Fulfillment remains simulated.** | **1:45–2:10:** first option fails; two infeasible options show reasons; navigator confirms a viable fallback; graph remains amber until patient receives it. |
| **Judge 1 — “Communicate directly through the app to different hospital departments.”** | `[stated]` **Half-delivered.** The current reducer creates fixed nurse and navigator tasks, but no department receives a message and no acknowledgment/SLA lifecycle exists outside one browser. | `[inferred]` Case-bound department threads for triage, navigation/social work, scheduling, financial clearance, pharmacy/access, and infusion coordination; every thread has recipient, owner, acceptance, deadline, escalation, disposition, and patient delivery. | **Must build; local recipients simulated.** | **0:52–1:18:** Maria's single response splits into two department-owned threads; timers start; original clinical text remains untouched. |
| **Judge 1 — “Address last-minute appointment cancellations.”** | `[stated]` **Half-delivered.** OncoReady reacts when Maria says the ride was cancelled at T−24; it neither predicts late cancellation nor preserves the appointment before she decides to cancel. | `[inferred]` Preserve-first early intervention: T−7/T−3 readiness cadence, transparent outreach-priority score, barrier discovery, rescue before cancellation, human-controlled reschedule only when rescue fails. | **Must build; current trigger is T−24.** | **0:00–0:32:** Maria is surfaced 72 hours early, before the Louisiana transport cutoff closes. |
| **Judge 2 — “Original.”** | `[stated]` **Semifinal validation, now at risk.** The narrow closure graph was original in context, but BayouCare and commercial vendors compress that advantage. | `[inferred]` Reposition from “AI no-show prevention” to **oncology treatment-chain continuity with accountable cross-department rescue**. | **Narrative change plus must-build behavior.** | **0:52–1:18 novelty beat:** one report becomes separate dependencies that cannot disappear into a message inbox. |
| **Judge 2 — “High potential for impact, solving last-minute cancellations.”** | `[stated]` **Potential only.** No current Ochsner baseline or measured outcome exists. | `[inferred]` Evidence-backed mechanism and pilot scorecard: lead time, pre-cutoff detection, contact success, barrier closure, time to owner/action, kept/rescheduled/cancelled disposition, staff touches. | **Metric definitions must build; clinical outcome remains unproven.** | **2:46–2:56:** synthetic case replay shows “detected 67 hours early; 2 accountable owners; 0 unresolved blockers,” explicitly not an outcome claim. |
| **Judge 3 — make the care team aware that patients are not coming.** | `[stated]` **Partially delivered in a simulated workspace.** Staff can see Maria only after her T−24 submission; there is no outbound operational integration. | `[inferred]` Exception-only care-team queue plus department acknowledgment and escalation, designed for SMART/Epic embedding or approved interface integration. | **Queue exists; risk ingestion, department lifecycle, and integration boundary must be added.** | **0:32–1:18:** response creates owned staff work and starts acknowledgment clocks. |
| **Judge 3 — inform the care team earlier so they have time to solve it.** | `[stated]` **Ignored by the current product.** The current window opens at T−24 and depends on Maria volunteering the barrier. | `[inferred]` T−7, T−3, T−1 snapshots; business-day cutoff logic; delivery failure, response latency, transport confirmation, caregiver availability, and explicit barriers as early signals. | **Highest-priority must build.** | **Opening 32 seconds:** the score trajectory shows what was known at each time and why action starts at T−3. |

No judge request is omitted. The ride is not claimed real; department delivery is not claimed connected; the impact metric is not claimed measured.

---

## 4. Competitive field map

### Evidence rule for this section

- `[stated]` means the fact appears in `devdays_2026_competitor_research.md` or `devdays_2026_finalist_intelligence_deep_dive.md`, or is directly verified there from a public artifact.
- `[inferred]` means the product reconstruction follows from the project name, challenge categories, institution context, or common implementation pattern. It is not a claim about private competitor work.
- `[unverified]` means the supplied reports could not resolve the question.

### 4.1 CareCrab — University of Louisiana at Monroe

**Name + name decomposition**

- `[stated]` **Care** implies support, navigation, and companionship.
- `[inferred]` **Crab** invokes the Cancer zodiac symbol and suggests a friendly mascot that makes a frightening journey feel approachable.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Build a friendly cancer companion that translates the treatment journey into plain language, reminders, questions for the care team, and local support resources. Make the mascot the emotional entry point, not the medical authority.

**Most likely product**

- `[inferred]` A patient-facing AI companion with chat, a treatment roadmap, appointment reminders, symptom diary, and resource navigation. A typical student build would combine a React/Next.js interface, hosted data, an LLM, and RAG over approved cancer content.

**Probable primary user**

- `[inferred]` **Patient**, with caregiver as a secondary user.

**Which named solution areas it targets**

- `[inferred]` AI patient navigation; patient/caregiver/care-team connection; possibly rural resource access.

**Likely tech stack and data source**

- `[inferred]` LLM wrapper + RAG on cancer education/resource content + treatment timeline + appointment fixtures; possibly Firebase/Supabase.

**What their 3-minute demo probably shows**

- `[inferred]` New patient asks CareCrab to explain treatment; the app gives a plain-language roadmap, surfaces the next appointment, and recommends resources or questions for the oncologist.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 4/5 | `[inferred]` Confusion and navigation burden are real, but the product risks duplicating MyOchsner and nurse navigation. |
| Novelty | 2/5 | `[inferred]` Friendly LLM companions are crowded. |
| Difficulty | 2/5 | `[inferred]` A chat/RAG wrapper plus timeline is easy to dismiss unless the safety and workflow integration are unusually deep. |
| Impact | 3/5 | `[inferred]` It could improve understanding, but operational or clinical outcomes are hard to attribute. |

**Structural weakness we can exploit**

- `[inferred]` Education and recommendations stop before accountable action or closure.
- `[inferred]` Unsafe-answer and “why not ChatGPT/MyOchsner?” questions can dominate its Q&A.

**Overlap with OncoReady**

- `[inferred]` **Partial collision.** Both may touch symptoms, appointments, transportation resources, and caregiver support. **Flags:** appointments/reminders `[inferred]`; transportation `[inferred]`; care-team messaging `[inferred]`; no-shows/cancellations `[unverified]`. OncoReady can separate itself through fixed-deadline ownership and closure.

**Confidence**

- `[stated]` **Low–medium.** No credible matching public repository was found.

### 4.2 BayouCare — Southeastern Louisiana University

**Name + name decomposition**

- `[stated]` **Bayou** localizes the product to Louisiana; **Care** signals a broad health-service umbrella.
- `[inferred]` The unqualified name implies breadth rather than one workflow.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Build the all-in-one Louisiana cancer platform: prevention, navigation, remote monitoring, predictive operations, treatment support, trials, and survivorship, tied together by one longitudinal patient and clinic dashboard.

**Most likely product**

- `[stated]` This product is directly verified as a full cancer-journey platform spanning prevent → diagnose → plan → treat → survive → support. It includes a personalized roadmap, symptoms/mood, caregiver mode, seven-day risk forecasts, no-show and interruption concepts, counterfactual intervention, care-team operations, prior authorization, trials, survivorship, parish prevention, and multilingual support.

**Probable primary user**

- `[stated]` **Patient and oncology clinician/operations team**, with caregiver and population-health users.

**Which named solution areas it targets**

- `[stated]` All five: AI navigation; predictive analytics/remote monitoring; multi-party connection; rural/underserved access; administrative burden reduction.

**Likely tech stack and data source**

- `[stated]` Public artifacts demonstrate patient and provider dashboards, staged symptom/wearable events, risk scores, Louisiana data views, and ClinicalTrials.gov matching concepts. `[inferred]` The demo likely relies on synthetic patient/EHR data plus web APIs and client-side or lightweight model logic rather than a validated production model.

**What their 3-minute demo probably shows**

- `[stated]` Darlene checks in; a staged 2 a.m. fever escalates to an RN and caregiver; the care-team dashboard changes a risk forecast after transportation; clinic operations show prior authorization/no-show logic; the story ends with survivorship, prevention mapping, and languages.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 5/5 | `[stated]` It touches nearly every named challenge pain point. |
| Novelty | 3/5 | `[inferred]` The integrated breadth is memorable, but each category is commercially crowded. |
| Difficulty | 5/5 | `[stated]` Predictive, remote-monitoring, clinic-operations, trials, mapping, multilingual, and patient features create extreme visible density. |
| Impact | 5/5 | `[inferred]` It can tell a system-wide impact story even if validation depth is questioned. |

**Structural weakness we can exploit**

- `[inferred]` Breadth invites proof questions: which models, APIs, workflows, and outcomes are real and integrated?
- `[inferred]` No single operational job may feel deep enough to change Monday-morning oncology work.

**Overlap with OncoReady**

- `[stated]` **Direct collision.** **Flags:** no-show prediction, treatment interruption, transportation, caregiver involvement, symptoms, care-team dashboard, and clinic operations are all directly reported. OncoReady must win on treatment-event depth, deadlines, failure recovery, privacy, and closure—not feature count.

**Confidence**

- `[stated]` **High/confirmed**, based on a public repository and finals script.

### 4.3 Functional Vital Sign — Edward Via College of Osteopathic Medicine

**Name + name decomposition**

- `[stated]` **Functional vital sign** is a recognized clinical phrase associated with gait speed, mobility, and functional status as measures beyond heart rate, blood pressure, temperature, and oxygen saturation.
- `[inferred]` The name signals objective measurement rather than self-report.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Use a phone camera, wearable, or timed test to measure gait, sit-to-stand, or Timed Up and Go across treatment cycles; detect meaningful decline and place a human-reviewed alert into the oncology workflow.

**Most likely product**

- `[inferred]` A patient performs a short mobility test; pose estimation, inertial sensors, or manual timing produces a functional score and trend against baseline. The care team sees deterioration related to fatigue, neuropathy, frailty, weakness, or fall risk.

**Probable primary user**

- `[inferred]` **Oncology clinician**, with the patient providing measurements.

**Which named solution areas it targets**

- `[inferred]` Predictive analytics and remote monitoring; care-team connection; rural monitoring if phone-based.

**Likely tech stack and data source**

- `[inferred]` Computer vision/pose estimation or wearable IMU stream + time-series trend detection + functional score; possibly validated gait/TUG literature and synthetic patient trends.

**What their 3-minute demo probably shows**

- `[inferred]` Baseline walk or TUG → repeat test → score and trajectory → “decline detected” → clinician dashboard across treatment cycles.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 4/5 | `[inferred]` Functional decline during treatment is clinically plausible, though the exact oncology action must be justified. |
| Novelty | 5/5 | `[inferred]` Objective function is distinct from the field’s navigation portals. |
| Difficulty | 5/5 | `[inferred]` CV/sensors, signal processing, baselines, and clinical interpretation look technically hard. |
| Impact | 4/5 | `[inferred]` Earlier decline detection could matter, but the alert-to-action pathway may be weak. |

**Structural weakness we can exploit**

- `[inferred]` A generic frailty signal may not change a specific oncology decision or treatment event.
- `[inferred]` Hardware, measurement validity, and population-specific clinical validation are difficult to defend.

**Overlap with OncoReady**

- `[inferred]` **Partial collision.** It supplies an upstream clinical signal; OncoReady owns the downstream multi-barrier rescue workflow. **Flags:** no-shows/cancellations—none evident; transportation—none evident; care-team messaging—alerting likely `[inferred]`.

**Confidence**

- `[stated]` **Medium–high/strong inference**, supported by the clinical meaning of the name and VCOM research fit, not a verified build.

### 4.4 Second Line — Southeastern Louisiana University

**Name + name decomposition**

- `[stated]` In oncology, **second-line therapy** follows failed, ineffective, or intolerable first-line treatment.
- `[stated]` In Louisiana culture, a **second line** is a communal parade tradition; the double meaning can support survivorship and community.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Build the transition from active treatment into “the second line of life”: generate a survivorship plan, track late effects and surveillance, connect mental health/financial/rehabilitation support, and include caregivers and peers. An alternate concept is navigation when first-line therapy changes.

**Most likely product**

- `[inferred]` Most likely a survivorship/supportive-care platform with care plans, late-effect monitoring, return-to-work, mental health, fertility, finance, and peer support. A less likely branch is decision support for second-line therapy and trials.

**Probable primary user**

- `[inferred]` **Survivor/patient**, with caregiver and oncology follow-up team.

**Which named solution areas it targets**

- `[inferred]` Patient navigation; patient/caregiver/care-team platform; supportive care.

**Likely tech stack and data source**

- `[inferred]` RAG or templated survivorship-plan generation, patient timeline, guideline content, symptom/late-effect tracking, peer/resource matching.

**What their 3-minute demo probably shows**

- `[inferred]` Treatment history → generated care plan → surveillance and late-effects checklist → mental-health/work/financial resource → community or caregiver handoff.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 4/5 | `[inferred]` Survivorship gaps are real and span years. |
| Novelty | 4/5 | `[inferred]` The Louisiana/oncology double meaning is strong; care-plan software itself is established. |
| Difficulty | 3/5 | `[inferred]` Data synthesis and longitudinal planning can be credible, but a templated/RAG plan may look easy. |
| Impact | 4/5 | `[inferred]` Large time horizon and broad supportive-care need, though less immediate than a missed treatment. |

**Structural weakness we can exploit**

- `[inferred]` Generated plans can become static documents without ownership or follow-through.
- `[inferred]` The product may struggle to prove short-term impact in a three-minute demo.

**Overlap with OncoReady**

- `[inferred]` **None to partial.** Its likely time horizon is months/years after treatment; OncoReady owns days/hours before one treatment. **Flags:** no-shows/cancellations, transportation, and care-team messaging are not evidenced `[unverified]`.

**Confidence**

- `[stated]` **Medium.** The name supports two plausible oncology interpretations; no matching public artifact was verified.

### 4.5 Tomorrow — Southern University

**Name + name decomposition**

- `[stated]` **Tomorrow** is emotional and future-oriented rather than technically descriptive.
- `[inferred]` It can mean prevention today, survivorship after cancer, hope/engagement, or literal next-treatment planning.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Pick one temporal promise: either help a patient take one prevention action today, plan life after treatment, or make tomorrow’s next step unmistakably clear. Build the entire demo around that clock.

**Most likely product**

- `[inferred]` A future-oriented planning or engagement product spanning prevention, survivorship, or “what happens next.” If it literally owns tomorrow’s appointment, it could directly overlap with OncoReady.

**Probable primary user**

- `[inferred]` **Patient**; caregiver may participate.

**Which named solution areas it targets**

- `[inferred]` Most likely AI navigation or patient/caregiver connection; prevention or supportive care are plausible.

**Likely tech stack and data source**

- `[inferred]` Treatment/prevention timeline + reminders + LLM/RAG + motivational or resource content; no reliable implementation evidence exists.

**What their 3-minute demo probably shows**

- `[inferred]` Patient sees “today / tomorrow / next” actions, receives a personalized plan or check-in, and completes one hopeful next step.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 3/5 | `[inferred]` Depends entirely on which interpretation they chose. |
| Novelty | 3/5 | `[inferred]` The brand is memorable; the mechanism is unknown. |
| Difficulty | 3/5 | `[inferred]` Could range from a simple planner to a hard prediction product. |
| Impact | 3/5 | `[inferred]` Emotional potential is high, but evidence cannot be assigned without the wedge. |

**Structural weakness we can exploit**

- `[inferred]` An emotional name can hide an unfocused or generic product.
- `[inferred]` If it means next-step navigation, it enters the most crowded finalist category.

**Overlap with OncoReady**

- `[inferred]` **Unknown; possible direct collision** if the product means “tomorrow’s treatment.” **Flags:** no-shows/cancellations, transportation, and care-team messaging are all `[unverified]`.

**Confidence**

- `[stated]` **Low.** The supplied research calls it the largest unknown.

### 4.6 Project Compass — University of Louisiana at Monroe

**Name + name decomposition**

- `[stated]` **Compass** implies orientation, direction, current position, and the next step.
- `[inferred]` **Project** makes the brand institutional but adds no medical specificity.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Build a cancer journey map that answers three questions: Where am I? What happens next? Who can help? Use an approved knowledge base and patient timeline to produce a personalized next-step checklist.

**Most likely product**

- `[inferred]` An AI cancer navigator with diagnosis explanation, treatment roadmap, appointment organizer, questions for the clinician, care-team directory, and resource recommendations.

**Probable primary user**

- `[inferred]` **Patient**, with navigator/caregiver as secondary users.

**Which named solution areas it targets**

- `[inferred]` AI patient navigation; multi-party connection; possibly rural resource access.

**Likely tech stack and data source**

- `[inferred]` LLM + RAG over trusted cancer/guideline/resource content + patient timeline + appointment fixtures.

**What their 3-minute demo probably shows**

- `[inferred]` Patient opens a journey map, sees current stage and next appointment, asks what to do next, and receives an explanation plus resource/task checklist.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 4/5 | `[inferred]` Cancer-care orientation is a clear need. |
| Novelty | 2/5 | `[inferred]` Several finalists and commercial products occupy navigation. |
| Difficulty | 2/5 | `[inferred]` A timeline and RAG answer are easy to reproduce unless integration and safety are deep. |
| Impact | 3/5 | `[inferred]` Understanding may improve, but execution and closure remain uncertain. |

**Structural weakness we can exploit**

- `[inferred]` It optimizes orientation, not whether a time-sensitive action was owned and completed.
- `[inferred]` It faces direct “why not MyOchsner/nurse navigation?” pressure.

**Overlap with OncoReady**

- `[inferred]` **Partial collision.** Both center appointments and next steps; Compass likely stops at guidance. **Flags:** appointments `[inferred]`; transportation `[inferred]`; care-team contacts/messaging `[inferred]`; no-show/cancellation workflow `[unverified]`.

**Confidence**

- `[stated]` **Medium.** The name strongly fits navigation, but no matching public project was verified.

### 4.7 LASpot — Southeastern Louisiana University

**Name + name decomposition**

- `[inferred]` **LA** likely means Louisiana; **Spot** can mean a location on a map or spotting cancer early.
- `[stated]` The supplied research retains both a screening/resource-locator branch and an early-detection branch, with the locator more likely.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Map screening gaps and help a resident find the nearest eligible screening site, mobile unit, transport path, and follow-up step. If pursuing detection, constrain it to one validated modality and human review.

**Most likely product**

- `[inferred]` A parish/ZIP-based Louisiana screening and resource locator with eligibility, distance, rural-access mapping, and possible mobile-screening routing. An image-based “spot cancer” system is the lower-confidence alternative.

**Probable primary user**

- `[inferred]` **Patient/community member** or public-health navigator.

**Which named solution areas it targets**

- `[inferred]` Rural/underserved access; prevention/screening; possibly AI early detection.

**Likely tech stack and data source**

- `[inferred]` GIS/parish datasets + screening locations + eligibility rules + routing; alternative CV on an imaging modality.

**What their 3-minute demo probably shows**

- `[inferred]` Enter ZIP/parish → visualize a screening gap → select eligible nearby/mobile service → show route and follow-up. The alternative demo would upload an image and flag a finding for human review.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 4/5 | `[inferred]` Rural prevention/access is directly named in the challenge. |
| Novelty | 4/5 | `[inferred]` Louisiana geospatial specificity is more distinct than another navigator. |
| Difficulty | 4/5 | `[inferred]` GIS/routing or CV can look technically strong. |
| Impact | 4/5 | `[inferred]` Screening reach is large, but follow-up closure determines real impact. |

**Structural weakness we can exploit**

- `[inferred]` A locator proves awareness, not completed screening or abnormal-result follow-up.
- `[inferred]` If it is CV, validation, false reassurance, and intended-use questions are severe.

**Overlap with OncoReady**

- `[inferred]` **None to partial.** It likely operates before diagnosis, while OncoReady protects active treatment. **Flags:** transportation/resource routing `[inferred]`; no-shows/cancellations and care-team messaging `[unverified]`.

**Confidence**

- `[stated]` **Low–medium.** The wordplay supports two branches and no matching artifact was found.

### 4.8 Bayou Care Navigator — Louisiana Tech University

**Name + name decomposition**

- `[stated]` **Bayou** supplies Louisiana identity; **Care Navigator** nearly repeats the challenge's “AI-powered patient navigation” category.
- `[inferred]` The name prioritizes local resource navigation over clinical operations.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Build a Louisiana-specific cancer navigator that combines trusted cancer information, local resources, appointments, financial assistance, transportation, and a personalized checklist.

**Most likely product**

- `[inferred]` A patient profile and diagnosis/treatment context feed an AI navigator that produces plain-language explanations, next steps, appointment reminders, and Louisiana resource/transport recommendations.

**Probable primary user**

- `[inferred]` **Patient**, with navigator as escalation.

**Which named solution areas it targets**

- `[inferred]` AI patient navigation; rural/underserved access; patient/caregiver/care-team connection.

**Likely tech stack and data source**

- `[inferred]` LLM + RAG over trusted cancer content and a Louisiana resource database + patient timeline/checklist.

**What their 3-minute demo probably shows**

- `[inferred]` Newly diagnosed patient asks what to do next; the AI returns an appointment/lab checklist, transport and financial resources, and questions for the care team.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 4/5 | `[inferred]` Navigation and local access are explicit challenge needs. |
| Novelty | 2/5 | `[inferred]` The category is crowded in the field and market. |
| Difficulty | 2/5 | `[inferred]` RAG plus resource search looks ordinary without fulfillment or workflow integration. |
| Impact | 3/5 | `[inferred]` Local relevance helps, but recommendations may not become delivered services. |

**Structural weakness we can exploit**

- `[inferred]` A resource recommendation does not prove availability, ownership, or closure.
- `[inferred]` Existing navigation programs and MyOchsner make duplication an immediate objection.

**Overlap with OncoReady**

- `[inferred]` **Partial collision.** Both may touch appointments, resources, transportation, and care-team contacts. **Flags:** transportation `[inferred]`; appointment reminders `[inferred]`; care-team messaging `[inferred]`; no-show/cancellation prediction `[unverified]`.

**Confidence**

- `[stated]` **High category confidence, low feature-level confidence.** No verified repository was found.

### 4.9 Cancer Krewe — University of Louisiana at Lafayette

**Name + name decomposition**

- `[stated]` **Krewe** is a strongly Louisiana-coded organized social group, implying belonging, shared responsibility, and community around the patient.
- `[inferred]` **Cancer Krewe** reframes caregiving as coordinated community action.

**Reconstructed idea we would have recommended to this team**

- `[inferred]` Let a patient form a trusted support krewe, set permissions, and assign rides, meals, childcare, appointment companions, pickups, check-ins, and peer support; use AI only to match needs and prevent caregiver overload.

**Most likely product**

- `[inferred]` A caregiver/community coordination network where the patient invites supporters, posts needs, assigns tasks, and tracks fulfillment. AI may recommend resources, match survivor peers, or summarize unmet needs.

**Probable primary user**

- `[inferred]` **Caregiver and patient**.

**Which named solution areas it targets**

- `[inferred]` Platforms connecting patients/caregivers/care teams; rural/underserved support; supportive care.

**Likely tech stack and data source**

- `[inferred]` Shared task board + invitations/permissions + notifications + community-resource directory + optional matching model.

**What their 3-minute demo probably shows**

- `[inferred]` Patient creates a krewe, invites supporters, posts a ride/meal/childcare need, assigns helpers, and sees completion or a peer match.

**Rubric threat score**

| Criterion | Score | Reason |
|---|---:|---|
| Legitimacy | 4/5 | `[inferred]` Caregiver and practical-support burden is real. |
| Novelty | 4/5 | `[inferred]` The Louisiana metaphor and community model are memorable. |
| Difficulty | 3/5 | `[inferred]` Permissions and coordination are nontrivial, but task assignment can look like consumer groupware. |
| Impact | 4/5 | `[inferred]` It can produce an emotionally powerful human-support story. |

**Structural weakness we can exploit**

- `[inferred]` Volunteer reliability is not clinical accountability; a failed task may have no institutional fallback.
- `[inferred]` Privacy, consent, and oversharing can undermine the caregiver story.

**Overlap with OncoReady**

- `[inferred]` **Partial collision.** Both coordinate caregivers and rides, but OncoReady binds the task to a hospital-owned treatment dependency. **Flags:** rides/transportation `[inferred]`; caregiver messaging `[inferred]`; no-show/cancellation prediction `[unverified]`.

**Confidence**

- `[stated]` **Medium.** The community interpretation is strong but not verified from a public build.

### Collision map

| Solution territory | Crowding | Finalists | Strategic reading |
|---|---|---|---|
| **AI navigator / roadmap / resource finder** | **Very crowded** | CareCrab, Project Compass, Bayou Care Navigator, BayouCare, possibly Tomorrow | `[inferred]` Do not enter this lane. RAG/chat is not a finals differentiator. |
| **Appointments, reminders, and next steps** | **Crowded** | CareCrab, Project Compass, Bayou Care Navigator, BayouCare, possibly Tomorrow | `[inferred]` “Better reminders” will lose novelty immediately. |
| **Transportation/access** | **Crowded but shallow** | BayouCare `[stated]`; CareCrab, Bayou Care Navigator, Cancer Krewe, LASpot `[inferred]` | `[inferred]` Own constraint-aware fulfillment, failure, fallback, and closure—not a ride link. |
| **Caregiver/community coordination** | **Moderately crowded** | Cancer Krewe, BayouCare, CareCrab, possibly Tomorrow | `[inferred]` OncoReady's privacy-minimized caregiver projection is stronger than broad sharing. |
| **Remote/objective monitoring** | **Lightly crowded** | Functional Vital Sign, BayouCare | `[inferred]` Technically impressive but outside OncoReady's wedge. Consume signals later; do not copy. |
| **Survivorship/supportive care** | **Lightly crowded** | Second Line, BayouCare | `[inferred]` Different time horizon; avoid. |
| **Prevention/screening/GIS** | **Lightly crowded** | LASpot, BayouCare | `[inferred]` Different journey stage; avoid. |
| **Treatment-event rescue with department ownership, cutoffs, failure recovery, and closure** | **Field whitespace** | OncoReady; BayouCare overlaps broadly | `[inferred]` This is the position to occupy. Commercial adjacency means the claim must be oncology-specific and execution-deep. |

**Single most contested concept:** `[inferred]` an AI patient navigator that explains care, shows appointments, recommends resources, and connects caregivers. It is the field's default answer and therefore the worst place for OncoReady to expand.

### Three teams most likely to beat OncoReady as it exists today

1. **BayouCare.** `[stated]` It directly covers no-show risk, transportation, symptoms, caregivers, remote monitoring, and clinic operations. `[inferred]` Its sheer demo density makes the current OncoReady build look small unless OncoReady proves deeper workflow mechanics.
2. **Functional Vital Sign.** `[inferred]` A working camera/sensor demonstration would dominate Novelty and Difficulty because judges can see objective measurement and real computation, while current OncoReady looks like form-to-task CRUD.
3. **Cancer Krewe.** `[inferred]` Its Louisiana-native brand and caregiver/community story could create a stronger emotional impact than a synthetic staff dashboard, even with less engineering depth. OncoReady must make Maria's rescue—not the dashboard—the emotional center.

✅ Step 1 complete — all nine competitors were reverse-engineered with required fields, four-factor threat scores, collision flags, confidence ratings, the collision map, and ranked threats.

---

## 5. The kill list

### Critical and High weaknesses that must die before finals

| Severity | Weakness | Concrete failure mode | Specific fix |
|---|---|---|---|
| **Critical** | **No credible “earlier” mechanism** | `[stated]` The current window opens at T−24 and Maria must self-report a cancellation. Judge 3 asked for earlier awareness; Louisiana Medicaid transport may require 48 hours excluding weekends. | `[inferred]` Add T−7/T−3/T−1 feature snapshots, channel-delivery/response signals, explicit transport confirmation, business-day cutoff arithmetic, and an exception at T−3—not first detection at T−1. |
| **Critical** | **Development difficulty looks low** | `[stated]` No backend, database, live ML, real vendor integration, or constraint engine exists. Two hard-coded task types and synthetic actors move through a local reducer. | `[inferred]` Ship a real synthetic-data training pipeline, calibrated logistic baseline/boosted challenger, real inference artifact, transport hard-constraint resolver, event/SLA failure transitions, computed metrics, and validated synthetic FHIR bundle. |
| **Critical** | **Novelty claim is no longer durable** | `[stated]` BayouCare directly includes no-show prediction and transportation. `[stated]` Commercial products already predict nonattendance, message, reschedule, refill, and arrange transport. | `[inferred]` Reframe the wedge as preserving a clinically linked oncology treatment chain through department-owned, deadline-bound rescue and verified closure. Never claim prediction + text + ride is new. |
| **Critical** | **Impact is not measured** | `[stated]` Current enterprise metrics are synthetic fixtures; no Ochsner baseline, avoided cancellation, staff-time saving, or patient outcome exists. | `[inferred]` Show only computed case metrics and published external evidence. Propose a pilot with lead time, pre-cutoff detection, contact, assignment, closure, outcome disposition, staff touches, and subgroup measures. |
| **High** | **Transportation is theater** | `[stated]` Staff type “CareLink Vehicle #402” and click confirm; no provider eligibility, availability, booking cutoff, failed attempt, or contract exists. | `[inferred]` Implement real constraint filtering over explicitly synthetic providers; fail the first attempt; show fallback; require human confirmation and patient acknowledgment. |
| **High** | **Department communication is a browser illusion** | `[stated]` Fixed nurse and navigator assignments are local state; no department receives, accepts, responds, or misses an SLA. | `[inferred]` Build case-bound department threads with sent/received/accepted/actioned/patient-informed/closed states and escalation. Label recipients simulated. |
| **High** | **Clinical surfaces invite the wrong fight** | `[stated]` The current UI exposes detailed drugs, doses, labs, fictional staff credentials, and pre-medication instructions. | `[inferred]` Hide those panels during the pitch. Preserve the patient's words, human review, and a “ready for site review” node; never imply AI clearance or pharmacy authority. |
| **High** | **Rural/equity story is not implemented** | `[stated]` The shipped critical path is a web app with an urban New Orleans persona and simulated med-van. SMS, voice, offline sync, and rural capacity are absent. | `[inferred]` Add numbered SMS/DTMF simulation, “call me,” minimum-data messages, offline-unsent state, caregiver consent, and parish/eligibility-aware transport logic. |
| **High** | **Another-inbox adoption risk** | `[stated]` Ochsner already has MyOchsner, navigators, support services, a cancer help line, and Chemotherapy Care Companion. | `[inferred]` Position OncoReady beside Epic as exception orchestration, not as a new portal. Pilot one infusion cohort, embed/link from the existing staff context, and make every new alert replace a manual chase. |
| **High** | **The product name overstates “ready”** | `[stated]` The current state can reach `PLAN_CONFIRMED` after two staff actions and a patient acknowledgment, without production clinical, lab, authorization, scheduling, or pharmacy truth. | `[inferred]` Define “ready” as **continuity plan confirmed**, never medical clearance. Keep unresolved dependencies visible; use “ready for site review” for downstream authority. |
| **High** | **Demo success is too frictionless** | `[stated]` The current ride goes from unassigned to confirmed in one click and clinical review resolves through one fixed action. | `[inferred]` Demonstrate one failure and one escalation. A system that survives failure appears harder, more credible, and more useful than a perfect scripted path. |

### The case that OncoReady loses

#### 1. Novelty decay — **Critical**

`[inferred]` The semifinal “original” verdict was granted before judges compared all finalists side by side. BayouCare can make that verdict collapse because its verified scope already includes no-show prediction, transportation, caregiver support, symptoms, risk forecasting, and clinic operations. CareCrab, Project Compass, and Bayou Care Navigator may surround the same workflow with navigation, appointments, and resources. Cancer Krewe may own the caregiver/ride story more emotionally.

`[stated]` The commercial attack is worse. Spryt markets prediction, outreach, rescheduling, transport, and staff handoff; Epic/MyChart, Luma, and Artera already cover scheduling and multichannel messaging; Roundtrip, Uber Health, and Lyft cover transport; oncology platforms cover ePRO/navigation. `[inferred]` Therefore the mechanism “predict a no-show, text the patient, and book a ride” is not new. The only defensible novelty is the **oncology-specific control loop**: protect a linked treatment event, split barriers by department, apply cutoffs and escalation, preserve role-specific privacy, and refuse closure until evidence returns.

**Named fix:** `[inferred]` Put the treatment dependency graph—not the reminder, risk score, AI, or ride—at the center. Make the graph temporal and operational: known-at-this-time signals, owners, deadlines, failed actions, fallbacks, delivery, acknowledgment, and closure.

#### 2. Difficulty of development — **Critical**

`[stated]` The current architecture explicitly avoided a backend, database, authentication, live AI, live messaging, and external APIs. That was rational for semifinal reliability but is now a rubric liability. The core reducer creates at most two hard-coded task types with fixed owners, timestamps, due times, vehicle defaults, and patient data. Secondary enterprise cases and many metrics are fixtures. A judge can correctly summarize the build as:

> `[inferred]` “A polished React form writes two objects to local state, staff clicks two buttons, and the UI turns green.”

`[inferred]` An LLM call would not rescue this score; it would make the product look more ordinary. Visible difficulty must come from engineering that changes the workflow:

- `[inferred]` time-correct snapshots at T−7/T−3/T−1 with leakage controls;
- `[inferred]` regularized logistic baseline versus calibrated shallow boosting on a versioned synthetic longitudinal cohort;
- `[inferred]` patient/time split, calibration, precision-at-navigator-capacity, subgroup audit, and model provenance;
- `[inferred]` a transport constraint engine that rejects invalid providers and records failure/fallback;
- `[inferred]` SLA/event orchestration with duplicate/out-of-order guards;
- `[inferred]` a FHIR R4 bundle generated from the same event state and validated as a standards artifact.

**Named fix:** `[inferred]` The 27-second technical drawer in the demo must reveal event IDs, timestamped feature snapshot, model version, constraint rejections, task transitions, caregiver projection, and bundle validation. Every item must be driven by working code, not a slide.

#### 4. Opportunity of impact — **Critical**

`[stated]` Opportunity is supported externally, not proven by OncoReady. The strongest published intervention reduced no-shows from 17.5% to 10.2% among model-identified high-risk oncology appointments when paired with bilingual navigation. That is not OncoReady's result. The current app has no Ochsner no-show rate, late-cancellation rate, average notice, navigator workload, transport-failure rate, or avoided-treatment-delay outcome.

`[inferred]` If asked, “What number would you put on stage?” use exactly two evidence lines and three case metrics:

- `[stated]` **External mechanism evidence:** “In one randomized cancer-center study, targeted predictive navigation reduced high-risk no-shows from 17.5% to 10.2%.”
- `[stated]` **Local operating constraint:** “Louisiana Medicaid routine NEMT generally needs at least 48 hours' notice, excluding weekends.”
- `[inferred]` **Synthetic case replay:** “Detected 67 hours early; 2 accountable departments; 0 unresolved blockers before T−24.” Label all three as synthetic case metrics.

Do not place “lives saved,” “waste eliminated,” “X% fewer cancellations,” or Ochsner ROI on stage.

**Named fix:** `[inferred]` Define a one-service-line pilot and a numerator/denominator for every metric. The primary pilot outcome is **avoidable treatment interruptions resolved before the appointment**, with kept/clinically rescheduled/administratively rescheduled/cancelled/unknown dispositions. Balance it with false-negative clinical signals, alerts per navigator, duplicate touches, overrides, and subgroup performance.

#### 5. Judge-request coverage — **Critical**

- `[stated]` **Judge 1 / ride:** half-delivered. A simulated form value is not a ride. Fix with eligibility, cutoffs, capacity, rejection, fallback, human confirmation, and patient acknowledgment.
- `[stated]` **Judge 1 / direct departments:** half-delivered. A local owner card is not department communication. Fix with a case-bound thread lifecycle and acknowledgment SLA.
- `[stated]` **Judge 1 / last-minute cancellations:** half-delivered. The current product reacts after the patient reports a cancellation at T−24. Fix with preserve-first outreach at T−7/T−3.
- `[stated]` **Judge 2 / original:** the verdict is now fragile. Fix the claim, not the adjective: show treatment-chain rescue that competitors do not demonstrate deeply.
- `[stated]` **Judge 2 / impact:** only potential is established. Fix with published evidence plus honest pilot metrics.
- `[stated]` **Judge 3 / awareness:** partially simulated. Fix with exception ingestion and department acceptance.
- `[stated]` **Judge 3 / earlier:** currently ignored. Fix first; it is the highest-risk miss because it repeats a judge's own idea back to them without having built it.

#### 6. The “earlier” problem — **Critical**

`[stated]` The present answer is blunt: OncoReady knows at T−24, only after Maria opens the app and says her ride was cancelled. It has no risk model, no delivery failure signal, no unconfirmed-transport state before the form, no contact cadence, and no business-day booking deadline. If Maria does not answer, the app learns nothing. If she cancels inside a portal, OncoReady has no live event source.

`[inferred]` The credible mechanism is not clairvoyance. At T−7 the system knows scheduling context and whether a transport plan exists. At T−5/T−3 it knows whether outreach was delivered or answered. At T−3 it can know an explicit barrier, caregiver uncertainty, failed contact, or missed booking cutoff. The model ranks supportive outreach; deterministic barriers override it. A clinical concern routes immediately regardless of score.

**Named fix:** `[inferred]` Show a risk **trajectory**, not a magic probability. Every signal must say “known at this time.” Define the prediction target as `unresolved attendance disruption by the intervention cutoff`, not “bad patient” or “will no-show.”

#### 7. Clinical credibility — **High**

`[stated]` An Ochsner oncologist can reasonably say that MyOchsner already manages appointments and messages, navigators already address social barriers, and Chemotherapy Care Companion already monitors treatment patients and brings data into care-team workflows. The current OncoReady screen also contains detailed synthetic regimen, lab, and advice content that creates more clinical questions than value.

`[inferred]` OncoReady becomes credible only when it admits that it is not the clinical system, portal, symptom-monitor, or transport network. It is a proposed cross-department **exception and closure layer** around a treatment event. The nurse owns clinical disposition. Scheduling owns appointment changes. Pharmacy owns preparation. Navigation owns transport. The app owns the dependency graph, timers, evidence, and patient-visible plan.

**Named fix:** `[inferred]` Ask Ochsner one validating question before the final: “When a patient signals a cross-domain barrier days before infusion, where are ownership, deadline, and closure visible across navigation, nursing, scheduling, and the patient?” If the answer is “already in one queue,” the wedge must narrow to transport cutoff/fallback or integrate into that queue.

#### 8. Data reality — **Critical**

`[stated]` No real Ochsner appointment dataset, intervention history, contact-delivery history, transport status, or labeled no-show/cancellation corpus is present. A synthetic model can prove software plumbing, not predictive validity. Synthetic accuracy is circular if the team writes both the hidden label rule and the model story.

`[inferred]` Required real-world fields would include appointment timestamps/type/site, booking lead time, attendance/early-cancel/late-cancel/no-show disposition, prior attendance history, outreach timestamps and delivery states, transport confirmation and cutoff, caregiver authorization, travel-time band, and staff interventions/outcomes. Protected attributes belong in a restricted audit table; they should not become a reliability penalty.

**Named fix:** `[inferred]` Generate a longitudinal synthetic cohort with repeated patients, timestamped signals, missingness, nonlinear interactions, site effects, and drift. Split by patient and time. Publish a data card and generator seed. Say: “The pipeline is real; the cohort is synthetic; performance is not clinically validated.” Do not show synthetic AUROC as if it were Ochsner accuracy.

#### 10. Equity and rural mandate — **High**

`[stated]` The present hero patient lives in New Orleans, uses the web app, reads detailed healthcare language, and receives a fictional med-van. SMS/voice and low-connectivity behavior are future scope. A rideshare or urban map collapses in rural areas with thin driver supply, long travel, disability needs, payer rules, and advance-notice requirements.

`[inferred]` The correct transport ladder is: patient/caregiver → applicable Ochsner/site resource → Medicaid plan broker or fee-for-service Verida when eligible and before cutoff → parish/senior/disability demand-response → contracted NEMT/rideshare where available → navigator-led site/time/lodging discussion. The product must show why an option is infeasible, not pretend a car appears.

**Named fix:** `[inferred]` Make the patient interaction one question at a time with “Yes / Need help / Call me”; implement numbered SMS and DTMF simulation; use minimum sensitive detail; show “saved, not sent” offline state; retain a human-call escape. Never claim rural access from a map alone.

#### 11. Scope and demo risk — **High**

`[inferred]` The tempting failure is to add model training, SMS, voice, Epic OAuth, transport APIs, multiple departments, FHIR, offline sync, multilingual content, pharmacy, and analytics at once. That creates nine half-features and a brittle final. The emotional stall happens when Maria says “my ride cancelled” and the presenter types a fictional driver into a dashboard; the audience sees make-believe fulfillment.

**Named fix:** `[inferred]` One rescue story, four screens, one failure, one fallback, one closure. Keep all network services off the golden path. Live Twilio and Epic sandbox are optional proof only. Rehearse to 2:45 and maintain a recorded backup.

#### 12. Adoption path — **High**

`[inferred]` The likely economic buyer is a cancer-center operations leader, ambulatory access executive, or population-health/value-based-care leader. The daily owner is nurse navigation/patient navigation or centralized access. Adoption fails if staff get another inbox, if OncoReady cannot write back to the approved system of record, or if departments disagree about who owns each barrier.

`[stated]` Epic supports SMART on FHIR/OAuth, appointment reads/searches, and scheduling interfaces, but an Epic resource in a bundle does not guarantee Ochsner enables a matching write workflow. Ochsner-specific scopes, In Basket/task destinations, identity, consent, and governance remain unknown.

**Named fix:** `[inferred]` Pilot one recurring infusion cohort. Run retrospective validation, then silent prospective scoring, then limited navigator intervention. Embed or deep-link from Epic rather than replace MyOchsner. Measure which calls/spreadsheets/manual reconciliations disappear.

#### 13. Name and narrative — **High**

`[inferred]` “OncoReady” promises that oncology treatment is ready. The current build only proves that a synthetic nurse clicked review, a simulated ride was confirmed, and Maria acknowledged the plan. It does not know lab validity, prior authorization, medication access, orders, pharmacy state, chair capacity, or clinical clearance.

**Named fix:** `[inferred]` Keep the name, but define the product precisely: **OncoReady confirms the continuity plan; clinical and operational departments retain authority over treatment readiness.** The central status should be `CONTINUITY PLAN CONFIRMED`, with downstream nodes such as `READY FOR SITE REVIEW`, never “AI cleared” or “safe to treat.”

### The three reasons we lose

**1. We answered “earlier” with T−24.** `[inferred]` Judge 3 gave the team the highest-value insight: awareness after cancellation is nearly useless. The current build still waits for Maria to volunteer a failure one day before treatment, after important transportation windows may have closed. This makes the final look like the semifinal with prettier UI rather than a response to feedback.

**2. The product looks technically easy when technical difficulty is scored.** `[inferred]` Judges can see a beautiful graph, but the underlying demonstration is a local reducer over fixed data and two clicks. A competitor with CV, a working risk model, GIS optimization, or a real sensor can beat OncoReady even with a weaker problem because the difficulty is visible.

**3. Our originality claim is vulnerable from both sides.** `[inferred]` BayouCare overlaps inside the finalist field, while commercial platforms overlap outside it. If OncoReady says “AI predicts no-shows and books rides,” a well-informed judge can name existing vendors. If it says “closed-loop, regimen-aware department rescue before the transport cutoff,” and proves every state transition, it has a defendable wedge; today it does not.

### Adversarial rubric self-score

| Criterion | Score | Hostile judge's justification |
|---|---:|---|
| Legitimacy | **5/5** | `[inferred]` “Real problem, validated by the semifinal panel and published oncology navigation evidence.” |
| Novelty | **3/5** | `[inferred]` “Good framing, but BayouCare and commercial access/transport vendors already overlap the mechanism.” |
| Difficulty | **2/5** | `[inferred]` “Polished frontend, synthetic local state, fixed rules, no real prediction, optimization, delivery, or interoperability proof.” |
| Impact | **3/5** | `[inferred]` “Potentially important, but no Ochsner baseline, measured outcome, real fulfillment, or quantified pilot result.” |

✅ Step 2 complete — eleven concrete failure dimensions were attacked, four Critical failures were named with fixes, judge asks were graded, and the hostile rubric self-score was recorded.

✅ Step 3 complete — exactly six bounded specialist reviews were incorporated: CLINICAL, COMPETITIVE, PRODUCT-A, PRODUCT-B, ML, and PITCH; no specialist edited repository files.

---

## 6. Repositioned OncoReady

### One-sentence positioning

> `[inferred]` **OncoReady is the early treatment-continuity control layer for oncology: it detects a recoverable threat days before a scheduled treatment, routes each barrier to the accountable hospital department, applies deadline-aware transport and escalation logic, and proves the plan closed without letting AI make clinical decisions.**

### The wedge nobody else in the finalist room clearly owns

`[inferred]` **Preserve the linked treatment event before cancellation.** OncoReady does not optimize a generic appointment. It protects a chain such as readiness outreach → patient response → clinical review → transport → scheduling/authorization → patient delivery and acknowledgment. Every dependency has a human owner, time boundary, failure path, and closure evidence.

### Primary user

`[inferred]` **The oncology navigator or access/operations lead responsible for rescuing at-risk treatment visits.** The patient is the primary beneficiary and signal source; the triage nurse, scheduler, financial navigator, caregiver, and transportation coordinator participate through permissioned work.

### The one problem we solve better than anyone in the room

`[inferred]` **Turn an early warning into verified, cross-department action before the rescue window closes.** Competitors may explain, predict, monitor, recommend, or connect; OncoReady must show which dependency failed, who accepted it, what was attempted, what fallback fired, and whether the patient received a workable plan before the treatment deadline.

### Market-defensible differentiation

`[stated]` Prediction + messaging + ride orchestration already exists commercially; Epic/MyChart already handles appointments and communications; NEMT platforms already fulfill rides; oncology platforms already collect symptoms. `[inferred]` OncoReady should integrate with those systems and own **decisioning, priority, cross-department state, treatment-chain semantics, and closure evidence**. Avoid “first,” “only,” and “no competitor does this.”

### What OncoReady is not

- `[inferred]` Not another patient portal, cancer chatbot, education companion, symptom-monitoring platform, scheduling tool, rideshare button, or generic no-show score.
- `[inferred]` Not a clinical triage system, treatment recommender, pharmacy authority, autonomous scheduler, or medical-clearance engine.
- `[inferred]` Not a claim that synthetic model performance predicts Ochsner patients.

---

## 7. Feature spec

### Must build for the final

#### M1. Appointment-relative early-warning timeline

- `[inferred]` Create T−7, T−3, and T−1 snapshots for one treatment event. T−24 becomes confirmation, not first detection.
- `[inferred]` Compute the intervention cutoff from transport notice rules and business days; show the cutoff on the staff surface.
- `[inferred]` Show “known at this time” for every signal so the lead-time claim is inspectable.
- `[inferred]` Direct reported barriers override the score: clinical concern → nurse immediately; ride cancelled → transport work immediately; missed cutoff → escalation immediately.

**Acceptance proof:** `[inferred]` Maria enters the exception queue at least 72 synthetic hours before treatment, and the UI identifies the timestamped signal that changed priority.

#### M2. Real, bounded outreach-priority model over explicitly synthetic data

- `[inferred]` Unit: one scheduled oncology encounter.
- `[inferred]` Target: `unresolved attendance disruption by the intervention cutoff`, not a clinical outcome and not “noncompliant patient.”
- `[inferred]` Baseline: regularized logistic regression with missingness indicators.
- `[inferred]` Challenger: shallow gradient-boosted trees with calibration. Use it only if it materially improves calibration or precision at navigator capacity without worsening subgroup behavior.
- `[inferred]` Features available at the snapshot: prior attendance/early-cancel/late-cancel counts; booking lead time; visit type/site/time; distance/travel band; transport confirmation; response latency; delivery failure; caregiver availability; channel preference; time remaining; unresolved access barriers.
- `[inferred]` Exclude post-cutoff outcomes, final cancellation reason, ride assigned after scoring, notes created after the visit, and any timestamp that cannot be reconstructed.
- `[inferred]` Model output controls supportive outreach ordering only. It cannot deny, delay, cancel, overbook, or clinically clear care.

**Validation proof:** `[inferred]` Versioned longitudinal synthetic cohort; patient- and time-separated evaluation; calibration plot/Brier score; precision and recall among top `K` outreach capacity; subgroup audit by rurality, age band, language/channel, digital access, transport need, and service line; data card and model version visible. Synthetic metrics remain illustrative.

#### M3. Multichannel readiness access using one workflow

- `[inferred]` Web: one question per screen; “Ready / Need help / Call me.”
- `[inferred]` SMS simulator: minimal-detail numbered reply—`1 ready`, `2 need a ride`, `3 call me`, `4 scheduling help`, `9 repeat`.
- `[inferred]` Voice/DTMF simulator: same choices, replay, slow appointment time, `0` for a human callback.
- `[inferred]` Delivery lifecycle: queued → delivered/undelivered → answered/completed → response/opt-out. Failed SMS triggers consented voice/caregiver/staff-call fallback; silence never means low risk or cancellation.
- `[inferred]` Offline web state must say “Saved on this device — not sent yet,” with retry and phone fallback.

**Acceptance proof:** `[inferred]` One undelivered SMS event produces a fallback outreach task and the golden path still works without network access.

#### M4. Department-owned case threads

| Patient need | Primary department | Fallback |
|---|---|---|
| New symptom/treatment concern | Oncology triage | Approved central/urgent pathway |
| Ride/mobility barrier | Navigation/social work | Navigator lead |
| Cancellation/timing conflict | Scheduling | Service-line operations |
| Cost/coverage/prior authorization | Financial clearance/access | Navigator |
| Medication access | Oncology pharmacy/access | Navigator |
| Lab/order readiness | Infusion coordination/ordering team | Service-line operations |
| Ambiguous/multiple need | Central navigator manual split | Supervisor after SLA |

- `[inferred]` State: draft → sent → department received → owner assigned → needs information/accepted → action recorded → patient informed → patient acknowledged → closed; SLA miss → escalated.
- `[inferred]` Original patient text remains immutable and visible. Generated or structured summaries are secondary and labeled.
- `[inferred]` Patients choose plain-language needs, not hospital departments.

**Acceptance proof:** `[inferred]` Maria's single response creates distinct clinical and transport threads; each has a different owner, deadline, and closure rule; an out-of-order “close” is rejected.

#### M5. Louisiana-aware transportation constraint resolver

- `[inferred]` Hard constraints: service parish/radius, payer/broker eligibility, advance-notice cutoff, operating hours, arrival window, ambulatory/wheelchair need, escort/accompaniment, capacity/confirmation, pickup handoffs.
- `[inferred]` Lifecycle: unsearched → options found → requested → provisional → confirmed, plus no eligible option, provider failed, and reopened states.
- `[inferred]` Demonstrate three synthetic options: one outside coverage, one unable to meet accessibility/arrival time, one feasible. The feasible provider first returns a simulated failure; the engine activates a fallback.
- `[inferred]` A suggestion never closes the blocker. Human navigator confirmation and patient acknowledgment are required.
- `[inferred]` If no option survives, keep the event at risk and open a human scheduling/navigation decision. Never autonomously reschedule treatment.

**Acceptance proof:** `[inferred]` The UI explains every rejection and records the failed attempt before fallback; all providers and capacity are labeled synthetic.

#### M6. Exception-only care-team workspace

- `[inferred]` Queue by **intervention priority**, not clinical severity: transparent disruption score + time pressure + recoverability, with hard barriers always surfaced.
- `[inferred]` Show treatment countdown, risk trajectory, top contributors, freshness, last contact, blockers, owner/SLA, transport cutoff, and next permitted action.
- `[inferred]` “Why flagged?” exposes precise events, feature values, score version, and limitations.
- `[inferred]` Keep the current Treatment Readiness Graph, but add time, delivery state, failed attempts, and closure evidence to each edge.

**Acceptance proof:** `[inferred]` Changing one event updates queue, case, graph, patient, caregiver, timeline, and computed metrics from one source of truth.

#### M7. Failure, escalation, and recovery

| Failure | Required behavior |
|---|---|
| Model unavailable/malformed | `[inferred]` Run universal readiness cadence and deterministic routing; show “score unavailable,” never “low risk.” |
| Missing/stale feature | `[inferred]` Show timestamp and missingness; no false reassurance. |
| SMS undelivered / voice unanswered | `[inferred]` Use consented fallback or create staff-call work; keep unresolved. |
| Clinical text appears | `[inferred]` Preserve verbatim and route to human; no generative clinical reply. |
| Ambiguous department | `[inferred]` Route to central navigator/manual split. |
| Department misses SLA | `[inferred]` Escalate to configured supervisor/fallback queue. |
| Provider unavailable / provisional ride cancelled | `[inferred]` Record attempt, reopen blocker, apply next feasible option. |
| Appointment changes | `[inferred]` Invalidate old cutoff/score/transport window and recompute. |
| Duplicate/out-of-order callback | `[inferred]` Ignore through idempotency key/version guard. |
| Epic unavailable | `[inferred]` Use cached/synthetic appointment with stale-source banner. |
| Caregiver consent missing/revoked | `[inferred]` Send nothing; remove caregiver projection. |

#### M8. Computed operational evidence and validated FHIR artifact

- `[inferred]` Compute from events: lead time at first actionable signal, time to owner, time to acceptance, time to first action, time to closure, unresolved blockers at checkpoints, SLA breaches, contact attempts, patient acknowledgment, and final disposition.
- `[inferred]` Generate a synthetic FHIR R4 bundle from the same case state using `Patient`, `Appointment`, `QuestionnaireResponse`, `Task`, `Communication`, `RelatedPerson`, consent representation, and `Provenance` as applicable.
- `[inferred]` Show actual validator output and the exact mapping. Valid FHIR does not equal Epic writeback.

**Acceptance proof:** `[inferred]` The downloaded/replayed bundle passes the selected validator, and every metric changes only when the underlying event changes.

#### M9. Safety and truth as visible features

- `[stated]` Clinical concerns remain human-owned and verbatim; AI cannot diagnose, downgrade urgency, change treatment, determine emergency disposition, or mark medical readiness.
- `[inferred]` Every adapter is visibly `local simulation`, `vendor sandbox`, or `live`; the final build should have no unlabeled external-looking success.
- `[inferred]` Caregiver projection is allowlisted at the data-model level and tested for absence of clinical text in visual, accessible, search, export, and message outputs.
- `[inferred]` Every risk view says `outreach priority—not clinical risk`; patient-facing copy never says “AI thinks you will miss.”

### Nice to have

1. `[inferred]` Read-only Epic public-sandbox SMART launch and `Appointment` retrieval with offline fixture fallback.
2. `[inferred]` Twenty to fifty seeded cases using the actual model/queue pipeline rather than fixture-only metrics.
3. `[inferred]` Capacity slider that recomputes support allocation under ride and navigator limits, with no patient silently dropped.
4. `[inferred]` Bounded NLP extraction from an SMS/voice transcript into an allowlisted schema with confidence and evidence spans. Low confidence or symptoms go to human review; the extractor cannot change workflow state.
5. `[inferred]` A grounded resource-response draft using only a versioned directory with source, geography, eligibility, hours, and last-reviewed date. No verified match → refusal and navigator escalation.
6. `[inferred]` Pharmacy node labeled “ready for site review,” never “safe to compound.”
7. `[inferred]` Reviewed Spanish nonclinical prompts and printable readiness packet.

### Out of scope

- `[inferred]` Production Ochsner/Epic connection, arbitrary Epic Task/In Basket writeback, real PHI, or production authentication/authorization.
- `[inferred]` Live NEMT/rideshare marketplace, payment, eligibility determination, capacity guarantee, or claim of a booked real ride.
- `[inferred]` Deep neural networks, EHR transformers, reinforcement learning, causal uplift claims, wearables, imaging AI, or a generic oncology chatbot.
- `[inferred]` Autonomous clinical triage, diagnosis, prognosis, medication advice, treatment change, appointment cancellation/rescheduling, overbooking, or pharmacy decision.
- `[inferred]` Screening, survivorship, trials, social feed, medication tracker, broad ePRO, or all-journey navigation.
- `[inferred]` Claims of accuracy, fairness, reduced no-shows, saved money, saved drugs, improved survival, HIPAA compliance, FDA clearance, or production readiness without appropriate evidence.

### AI safety design

- `[inferred]` **Rule-first:** clinical/symptom inputs bypass generative steps and create a human task.
- `[inferred]` **Model-limited:** prediction orders supportive outreach only; deterministic barriers and human decisions remain authoritative.
- `[inferred]` **Schema-bound:** optional LLM/NLP returns allowlisted fields, confidence, and evidence span; invalid/unsupported values are rejected.
- `[inferred]` **Grounded:** resource retrieval uses a versioned, approved directory; every result shows source and effective date.
- `[inferred]` **Refusal:** no verified option → “I cannot confirm an eligible option; I sent this to a navigator.”
- `[inferred]` **Human-in-the-loop:** no clinical message, transport commitment, financial action, or appointment change leaves the system without staff approval.
- `[inferred]` **Auditable:** input, feature cutoff, model/rule version, recommendation, override, action, delivery, acknowledgment, and disposition are logged.
- `[stated]` These controls align with the human control, transparency, safety, accountability, and ongoing assessment principles described by [WHO](https://www.who.int/news/item/28-06-2021-who-issues-first-global-report-on-artificial-intelligence-ai-in-health-and-six-guiding-principles-for-its-design-and-use) and with NIST's warning that generative AI confabulation is an inherent risk. [NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)

---

## 8. Architecture

### Minimum credible finals architecture

```text
Synthetic appointment replay / optional Epic public sandbox read
                              │
                              ▼
                 Event intake + normalizer
             timestamp • provenance • idempotency
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
 T−7/T−3/T−1 feature builder          Deterministic barrier overrides
          │                                       │
          ▼                                       │
 Calibrated outreach-priority model               │
          └───────────────────┬───────────────────┘
                              ▼
              Intervention/routing policy engine
       cadence • department/SLA • transport cutoffs
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
 Department threads   Transport constraint   Channel simulator
 + escalation         resolver + fallback    web/SMS/DTMF
          └───────────────────┬───────────────────┘
                              ▼
              Append-only workflow event state
                              │
      ┌───────────┬───────────┼───────────┬────────────┐
      ▼           ▼           ▼           ▼            ▼
 Staff queue   Patient     Caregiver    Readiness    Metrics/FHIR
 + case        plan        allowlist    graph        packet
```

### Component decisions

| Component | Finals choice | Why |
|---|---|---|
| Runtime | `[inferred]` Retain React + TypeScript + Vite, local deterministic critical path. | Minimizes demo failure while extending the real state machine. |
| Synthetic data/training | `[inferred]` Versioned offline generator and training/evaluation pipeline; export model artifact and metadata for browser inference. | Makes the feature pipeline and training real without pretending the cohort is clinical data. |
| Model | `[inferred]` Regularized logistic baseline; calibrated shallow gradient boosting only as challenger. | Interpretability, calibration, and small tabular-data realism beat deep-learning theater. |
| Persistence | `[inferred]` Versioned local event store for finals; durable server store deferred. | Supports deterministic reset and replay; production multi-user audit would require a backend/database. |
| Routing | `[inferred]` Typed deterministic policy table + state machine, not LLM-controlled. | Consequential ownership stays explainable and testable. |
| Transport | `[inferred]` Pure constraint-filter/ranking module over synthetic resources, with attempt and fallback events. | Real algorithmic behavior; no fake booking contract. |
| SMS/voice | `[inferred]` Local delivery/callback simulator; optional live team-phone spike below the cut line. | Shows channel behavior without credential/network risk. |
| Interoperability | `[inferred]` Typed FHIR mapping + generated/validated synthetic bundle; optional read-only Epic sandbox. | Credible contract without claiming Ochsner connectivity or unsupported writeback. |
| LLM/RAG | `[inferred]` Optional bounded extractor/drafter only; not on critical path. | Avoids crowded, unsafe, and brittle chatbot positioning. |

### Core data model

```text
Patient(id, preferredLanguage, consentedChannels, accessNeeds)
CaregiverGrant(patientId, granteeId, allowedFields, channels, revokedAt)
TreatmentEvent(id, appointmentRef, site, serviceLine, scheduledAt, cutoffs[])
SignalEvent(id, treatmentId, type, source, occurredAt, receivedAt,
            payload, provenance, idempotencyKey)
RiskSnapshot(id, treatmentId, horizon, score, tier, modelVersion,
             featureSnapshot, explanations, generatedAt, synthetic)
Barrier(id, treatmentId, category, verbatimText, detectedAt, status)
WorkItem(id, barrierId, department, owner, dueAt, state,
         escalationTarget, resolutionEvidenceId)
ConversationThread(id, barrierId, department, acknowledgmentDueAt, state)
Message(id, threadId, senderRole, channel, body, deliveryStatus,
        externalRef, synthetic)
TransportNeed(treatmentId, pickupWindow, mobilityNeeds, payerPath)
TransportOption(providerRef, coverage, eligibility, cutoff,
                accessibility, capacity, rankReason, synthetic)
TransportAttempt(optionId, attemptedAt, outcome, evidence)
ConsentRecord(patientId, scope, channel, effectiveAt, revokedAt)
WorkflowEvent(id, aggregate, actor, action, before, after,
              occurredAt, correlationId)
ModelArtifact(version, featureSchemaVersion, trainingDataKind,
              trainedAt, calibration, evaluationSummary)
```

### Data flow

1. `[inferred]` An appointment opens a T−7 window; the system calculates transport and outreach cutoffs.
2. `[inferred]` Delivery, response, explicit barrier, caregiver, and operational events enter with occurrence time and provenance.
3. `[inferred]` The feature builder freezes what was knowable at each horizon; deterministic overrides bypass the model when a barrier is explicit.
4. `[inferred]` The model creates a support-priority snapshot; the policy engine decides outreach cadence and department work, not clinical action.
5. `[inferred]` The transport resolver filters and ranks options; navigator actions and provider outcomes append events.
6. `[inferred]` Queue, threads, patient plan, caregiver allowlist, graph, metrics, and FHIR packet derive from the same event state.
7. `[inferred]` Closure requires department disposition, patient delivery, and patient acknowledgment; unresolved or changed dependencies reopen the plan.

### Model validation and monitoring

- `[inferred]` Split by patient and time; train on earlier periods, calibrate on the next, evaluate on the latest.
- `[inferred]` Report PR-AUC, Brier score, calibration intercept/slope, precision/recall at top `K`, and workload—not a single accuracy number.
- `[inferred]` Compare with contact-all, contact-none, and a deterministic barrier rule.
- `[inferred]` Audit subgroup calibration, false negatives, and assignment rate; show sample sizes and do not infer from tiny cells.
- `[inferred]` Log model version, cutoff, available features, recommendation, human override, and final disposition.
- `[inferred]` Monitor missingness, category frequency, score distribution, subgroup errors, workload saturation, and mature-label calibration. Drift triggers review, not automatic retraining.
- `[stated]` TRIPOD+AI emphasizes transparent reporting of discrimination, calibration, utility, and subgroup performance. [TRIPOD+AI](https://www.bmj.com/content/385/bmj-2023-078378)

### Epic feasibility

- `[stated]` Epic publicly supports SMART on FHIR/OAuth and sandbox testing, and exposes appointment read/search capabilities. [Epic developer resources](https://open.epic.com/DeveloperResources), [Epic FHIR catalog](https://open.epic.com/Clinical/FHIR?whereTo=patient)
- `[stated]` Epic scheduling interfaces can exchange new, updated, cancelled, rescheduled, and no-show events, but customer enablement and workflow configuration are separate implementation work. [Open Epic scheduling](https://open.epic.com/Scheduling/HL7v2)
- `[inferred]` Finals boundary: real typed adapter, synthetic/sample response, generated bundle, and optional public-sandbox appointment read. Do not claim an Ochsner launch, patient match, In Basket task, scheduling write, or department writeback.
- `[unverified]` Ochsner-specific scopes, launch mode, write path, task destination, identity, consent, security review, and interface ownership have not been confirmed.

### Honest real-versus-simulated statement

| Capability | Real for finals | Simulated / not claimed |
|---|---|---|
| Workflow state machine, guarded transitions, event replay | **Real** | — |
| T−7/T−3/T−1 snapshots and cutoff arithmetic | **Real** | Input cohort and case are synthetic |
| Model training, evaluation, artifact, browser inference | **Real pipeline** | Accuracy is not clinically validated; records are synthetic |
| Department routing, thread states, SLA/escalation | **Real local behavior** | Departments/recipients are simulated |
| Web/SMS/voice presentation and delivery-state transitions | **Real local behavior** | Carrier delivery and phone call are simulated unless an optional live proof runs |
| Transport constraints, rejection reasons, fallback | **Real logic** | Providers, capacity, booking, vehicle, and fulfillment are synthetic |
| Caregiver data minimization | **Real local projection and tests** | Production authorization is not present |
| Metrics and audit trail | **Real computation over synthetic events** | No measured Ochsner outcome |
| FHIR bundle generation and validation | **Real standards artifact** | No Ochsner/Epic writeback |
| Epic appointment read | Optional public sandbox | No live Ochsner connection |
| Clinical judgment and treatment readiness | Human role preserved in workflow | No real clinician, protocol, medical clearance, or outcome |

### Fallback philosophy

`[inferred]` The demo must work completely with network disabled. If model inference fails, universal outreach and deterministic routing continue. If an optional LLM fails, the workflow continues. If Epic is unavailable, the cached synthetic appointment is visibly stale. If transport has no feasible option, the graph stays at risk and escalates. Failure is a product state, not a presenter disaster.

---

## 9. Design direction

### Design thesis

`[inferred]` Preserve OncoReady's established **Clinical Glass / Continuity Aurora** identity, but strip the final demonstration down to causal operations. The interface should feel calm, accountable, and human—not futuristic, alarmist, or “AI-powered.” Motion communicates only four things: signal arrival, work split, failure/fallback, and convergence to closure.

### UI principles

1. **Time before everything.** `[inferred]` Every staff screen starts with treatment time remaining and the next rescue deadline.
2. **Cause before score.** `[inferred]` Show the known signals and timestamps before an outreach-priority number.
3. **Owner before status.** `[inferred]` “Accepted by Navigation, due 11:00” is more useful than “In progress.”
4. **Evidence before green.** `[inferred]` A sent message, recommended resource, or provisional ride is not closure.
5. **One patient action at a time.** `[inferred]` Large, plain-language choices; “Call me” is first-class.
6. **Human authority in the label.** `[inferred]` Use “Nurse review pending,” “Navigator confirmed,” and “Ready for site review,” never “AI cleared.”
7. **Non-color meaning.** `[stated]` Retain explicit icon/text labels, keyboard access, visible focus, reduced-motion equivalence, and large patient targets.
8. **Truth at the point of action.** `[inferred]` Synthetic/simulated/sandbox labels appear beside the score, provider, message, and interoperability proof—not in a buried disclaimer.

### Four screens only

#### Screen 1 — Early-warning queue

- `[inferred]` Hero line: `Maria Hernandez • infusion in 72 hours • support intervention needed`.
- `[inferred]` Left: countdown and transport cutoff.
- `[inferred]` Center: risk trajectory from T−7 to T−3 with “known at this time.”
- `[inferred]` Right: three contributors, data freshness, model version, and `synthetic outreach model—not clinical risk`.
- `[inferred]` Primary action: **Open rescue plan**.

#### Screen 2 — Patient readiness response / channel rail

- `[inferred]` One simple question: “Can you get to this appointment?” followed by “Do you need the care team to call you?”
- `[inferred]` Show web, numbered SMS, and voice/DTMF as three views of the same state—not three different products.
- `[inferred]` Preserve exact clinical words; do not collect a long medical narrative over generic SMS.

#### Screen 3 — Treatment Rescue Workspace

- `[inferred]` Treatment event in the center; clinical and transport branches on either side.
- `[inferred]` Each branch shows department, owner, deadline, current state, next allowed action, escalation, and closure evidence.
- `[inferred]` Transport drawer shows candidate, rule, pass/fail, attempt, and fallback. Department thread shows receipt/acceptance/disposition.
- `[inferred]` A narrow causal timeline sits below. Do not compete with broad analytics, detailed regimen tables, or enterprise navigation.

#### Screen 4 — Confirmed continuity plan

- `[inferred]` Maria sees what changed, who handled it, pickup/next step, and what she must do.
- `[inferred]` Ana's caregiver card shows only authorized pickup detail.
- `[inferred]` A compact proof area shows detected lead time, owners, unresolved blockers, and FHIR validation; the emotional image remains Maria's workable plan.

### Accessibility and rural access

- `[inferred]` Plain language, one question per view, large targets, high contrast, icons plus words, no color-only state, screen-reader order, and reduced motion.
- `[inferred]` SMS: `1 Ride is set / 2 I need a ride / 3 Call me / 9 Repeat`; no cancer type, medication, symptom, or detailed disposition in the message.
- `[inferred]` Voice: keypad input, replay, slow appointment time, human callback, no speech-recognition dependency.
- `[inferred]` Low bandwidth: the flow works without map tiles, portraits, canvas, blur, or animation; text and status remain complete.
- `[inferred]` Offline: `Saved on this device — not sent yet`, timestamp, retry, and telephone fallback; never show submitted until acknowledged.
- `[inferred]` Language: only human-reviewed nonclinical translations; urgent/clinical translation stays human-mediated.
- `[inferred]` Transportation: parish, eligibility, operating hours, accessibility, and booking cutoff drive the solver; rideshare is one possible adapter, never the default promise.

### Visual tone

- `[stated]` Retain indigo action, amber unresolved, mint closed, and soft clinical surfaces from the design system.
- `[inferred]` Reserve red for a true SLA breach or institution-approved urgent state, not general patient “risk.”
- `[inferred]` Suppress landing-page decoration during the live demo. No map animation, long scroll, parallax, metric carousel, or module tour.
- `[inferred]` The unforgettable visual is the split-and-reconverge graph, not an AI sparkle, neural-network diagram, or chatbot typing animation.

---

## 10. Demo script

### Three-minute beat-by-beat script

| Time | Screen/action | Presenter words | Rubric job |
|---|---|---|---|
| **0:00–0:12** | Open directly on Maria's treatment anchor: `Infusion in 72 hours • continuity risk detected`. | “Maria's treatment is still three days away. That is the point: OncoReady finds the risk while the team still has time to change the plan.” | `[inferred]` Answers Judge 3 immediately; establishes urgency without day-of theater. |
| **0:12–0:32** | Expand **Why now**: unconfirmed transport, undelivered first check, response latency, travel burden. Synthetic/outreach-only label is visible. | “A transparent outreach-priority model combines time, contact, and access signals. It does not predict cancer outcomes or cancel care; it tells the team whom to contact first.” | `[inferred]` Early-warning and difficulty. |
| **0:32–0:52** | Channel rail: SMS delivery fails; voice/DTMF fallback reaches Maria. She selects `need a ride` and asks for a nurse callback. | “Maria does not need a new app. She can answer by web, numbered text, or a short call. Her exact clinical words are preserved.” | `[inferred]` Rural/older-adult access; failure recovery. |
| **0:52–1:18 — NOVELTY BEAT** | The response splits on the Treatment Readiness Graph: clinical → oncology triage; transport → navigation. Owners, departments, deadlines, and escalation clocks appear. | “This is not a reminder. One patient response becomes separate department-owned rescue work, each with an owner, deadline, escalation path, and proof required before the plan can close.” | `[stated]` Builds on the real split; `[inferred]` adds department lifecycle. |
| **1:18–1:45 — DIFFICULTY BEAT** | Open the 27-second **Continuity Engine** drawer: timestamped signal → feature snapshot/model version → typed tasks → transport cutoff → event IDs → privacy projection → FHIR validation badge. | “Under this view is a temporal feature pipeline, a guarded event state machine, and a constraint engine. Every surface is derived from the same events; the cohort is synthetic, and this is not connected to Ochsner.” | `[inferred]` Makes hard engineering visible and truthful. |
| **1:45–2:10 — UNFORGETTABLE MOMENT** | Transport candidate A fails coverage; B fails accessibility/arrival; C is requested but provider returns unavailable; configured fallback activates and navigator confirms it. | “A recommendation is not resolution. OncoReady records why options fail, activates the next eligible path, and keeps the treatment at risk until a human confirms the plan.” | `[inferred]` Technical constraint/fallback proof and Judge 1 ride coverage. |
| **2:10–2:30** | Triage accepts untouched text and records a disposition. Optional pharmacy node changes only to `Ready for site review`. | “Clinical judgment stays with the oncology team. OncoReady preserves Maria's words and coordinates readiness before the site's own decision.” | `[stated]` Human clinical authority. |
| **2:30–2:46** | Side-by-side: Maria gets the full plan; Ana gets transportation only. Maria acknowledges with one tap/numbered reply. | “Maria sees one workable plan. Her caregiver sees the ride—but not the symptom report or nurse note.” | `[stated]` Privacy and patient closure. |
| **2:46–2:56** | Graph converges to `CONTINUITY PLAN CONFIRMED`. Metrics: `67h early • 2 owners • 0 unresolved blockers`, labeled synthetic replay. | “The team learned early, the right departments acted, and the case closed while there was still time.” | `[inferred]` Emotional peak and impact mechanism. |
| **2:56–3:00** | Freeze on treatment anchor and tagline. | “OncoReady catches what could derail the next treatment, gives it an owner, and closes the loop before the patient reaches the chair.” | `[inferred]` Retellable finish. |

### Emotional peak

`[inferred]` The emotional peak is not the score or the green graph. It is Maria receiving one simple plan after the audience has watched several invisible departments do coordinated work on her behalf.

### Novelty beat

`[inferred]` One mixed patient response becomes independently owned hospital dependencies with different privacy, deadlines, failure paths, and closure rules, then reconverges on one treatment event.

### Difficulty beat

`[inferred]` The transport resolver explains infeasible choices and survives a provider failure while the temporal risk snapshot, SLA thread, caregiver allowlist, metrics, and FHIR packet remain consistent from one event log.

### Slide sequence

1. **Tomorrow is too late.** `[inferred]` One treatment in 72 hours; problem is preserving the treatment chain, not remembering the appointment.
2. **Find the recoverable risk early.** `[inferred]` Four signal families; outreach priority, not clinical prediction; cite 17.5% → 10.2% external navigation evidence and Louisiana's 48-hour NEMT rule.
3. **Live demo: detect → split → rescue → confirm.** `[inferred]` Stay inside the product; do not return to slides mid-flow.
4. **Why this is hard and credible.** `[inferred]` Temporal model, event state machine, constraint fallback, privacy projection, validated FHIR artifact, honest Epic boundary.
5. **Pilot question.** `[inferred]` Ask Ochsner to validate one infusion cohort, data availability, current ownership gap, transport resources, and the pilot scorecard—do not claim outcome.

### Demo safeguards

- `[inferred]` Start from deterministic reset; rehearse to 2:45; leave 15 seconds for latency or room reaction.
- `[inferred]` Keep all network services optional; record a backup run.
- `[inferred]` Hide regimen doses, detailed labs, broad enterprise modules, landing scroll, animated map, and generic dashboards.
- `[inferred]` Remove or relabel “live,” “real-time,” “automated transit API,” and “Epic integration” unless the exact behavior exists.

---

## 11. Judge Q&A

### 1. “How is this different from a reminder system?”

`[inferred]` “A reminder sends information and stops. OncoReady detects a recoverable risk days earlier, shows why the case surfaced, turns one response into separate department-owned tasks, applies deadlines and fallback logic, preserves clinical authority, limits caregiver data, and refuses to call the continuity plan confirmed until the required human actions and patient acknowledgment are recorded.”

### 2. **Question we most want to avoid #1:** “Is your prediction real, and how accurate is it?”

`[inferred]` “The training, inference, calibration, and evaluation pipeline are real, but the longitudinal cohort is synthetic. We will not quote synthetic accuracy as clinical performance. The score prioritizes supportive outreach only; explicit barriers override it. A real pilot requires retrospective Ochsner-approved data mapping, patient/time validation, subgroup audit, and prospective silent-mode evaluation before intervention.”

`[unverified]` Ochsner access to the required appointment, outreach, transport, and disposition fields has not been confirmed.

### 3. **Question we most want to avoid #2:** “Are you integrated with Epic or Ochsner?”

`[inferred]` “No live Ochsner connection is claimed. We generate and validate a synthetic FHIR R4 readiness packet, and if the optional proof is complete we can read an appointment from Epic's public sandbox. Epic supports SMART/FHIR and scheduling interfaces, so the boundary is plausible; Ochsner scopes, identity, workflow destinations, writeback, and governance require partner approval.”

### 4. “Is that ride actually booked, and what happens where rideshare does not operate?”

`[inferred]` “The finals transport adapter is simulated. What is real is the cutoff calculation, eligibility and accessibility filtering, rejection reasons, attempt history, fallback, human confirmation, and patient acknowledgment. Production resources would combine applicable Ochsner/site options, Louisiana Medicaid brokers, parish/senior/disability transit, contracted NEMT, and rideshare only where eligible and available. We do not claim a vendor contract.”

### 5. “Why would Ochsner need this if MyOchsner already handles appointments and messages?”

`[inferred]` “MyOchsner is an existing channel, and OncoReady should use it rather than replace it. The gap we are testing is cross-department treatment-event orchestration: an early signal becomes multiple owned dependencies, each has a deadline and closure evidence, and patient/caregiver views stay synchronized without sharing the same data. If Ochsner already closes that exact loop in one workflow, OncoReady should integrate into it or narrow to the transport-cutoff/fallback layer.”

### 6. “How are you different from BayouCare?”

`[inferred]` “BayouCare covers the whole cancer journey. OncoReady intentionally protects one high-value operational moment: the next scheduled treatment. We go deeper on time cutoffs, departmental ownership, failed attempts, fallback, privacy, patient acknowledgment, and an auditable closure state. We are smaller by design and must prove every transition.”

### 7. “Won't a no-show score punish rural, poor, disabled, or older patients?”

`[inferred]` “It must not. The model can only increase supportive outreach; it cannot reduce access, deny a slot, overbook against a patient, or label them noncompliant. We separate eligibility fields from reliability assumptions, audit subgroup calibration and false negatives, expose contributors, preserve deterministic barrier overrides, and require human review. Removing protected fields alone does not remove proxy bias, so local evaluation is mandatory.”

### 8. “Who buys this, and what does Ochsner have to change?”

`[inferred]` “The likely buyer is cancer-center operations, ambulatory access, or population health; the daily owner is oncology navigation or centralized access. Start with one recurring infusion cohort and embed/deep-link from the existing Epic context. Ochsner must validate the data feed, department owners, escalation rules, consent/channel policy, transport directory, and writeback destination. The business case is prevented treatment interruptions and navigator capacity—not another patient app.”

---

## 12. Build plan

**Planning assumption:** `[inferred]` Three capable student engineers plus one design/pitch owner; estimates are engineer-hours, not calendar promises. The current React workflow and design system are retained.

| Order | Work item | Output | Estimate |
|---:|---|---|---:|
| 1 | Freeze final claim, treatment cohort, scenario clock, and truth labels | One written acceptance path: T−7 → T−3 response → split → failure/fallback → closure | 2 h |
| 2 | Extend domain/events and invariants | `SignalEvent`, `RiskSnapshot`, `Barrier`, `WorkItem`, thread/message, transport option/attempt, consent, model artifact; invalid-transition/idempotency guards | 5–7 h |
| 3 | Build versioned synthetic longitudinal cohort | Repeated patients, timestamped signals, missingness, rural/urban access, transport, intervention history, outcomes, drift, generator seed/data card | 4–6 h |
| 4 | Train/evaluate/export model | Logistic baseline, shallow boosting challenger, patient/time split, calibration, top-K workload and subgroup report, exported artifact | 5–8 h |
| 5 | Implement appointment-relative clock and feature snapshots | T−7/T−3/T−1, business-day cutoff, “known at this time,” deterministic overrides | 4–5 h |
| 6 | Implement department threads and SLA escalation | Plain-language route → department acceptance → disposition → patient delivery → closure; failure and supervisor path | 5–7 h |
| 7 | Implement transport constraint/fallback engine | Three synthetic providers, hard filters, rejection explanations, failed attempt, fallback, human confirmation | 5–7 h |
| 8 | Build SMS/voice/offline simulator | Delivery/callback lifecycle, numbered response, DTMF, opt-out, fallback, saved-not-sent state | 4–6 h |
| 9 | Integrate four-screen UI | Early queue, patient/channel response, Rescue Workspace, confirmed plan; exact demo motion only | 6–9 h |
| 10 | Compute operational metrics and FHIR R4 packet | Event-derived metrics, bundle generation, validator evidence, downloadable/readable readiness packet | 4–6 h |
| 11 | Test failure and privacy boundaries | Model unavailable, stale feature, duplicate event, undelivered SMS, SLA miss, no transport, changed appointment, revoked caregiver, clinical exclusion | 5–7 h |
| 12 | Rehearse and harden | Deterministic reset, network-off run, recorded backup, 2:45 script, Q&A proof screenshots | 4–6 h |

**Must-build total:** `[inferred]` approximately **53–76 engineer-hours**. With three builders on frozen interfaces, this is aggressive but feasible; with fewer people or less than two focused days, the scope must cut at the line below.

### Cut line

> **Everything below this line is expendable and must not threaten the early-warning, department-ownership, transport-failure, privacy, and closure path.**

| Drop order | Optional work | Estimated additional effort |
|---:|---|---:|
| 1 | Live Epic sandbox OAuth/appointment read | 4–12 h plus registration uncertainty |
| 2 | Live Twilio test-number SMS/voice | 6–10 h plus account, number, consent, webhook, and network risk |
| 3 | Capacity-allocation slider/optimizer | 4–6 h |
| 4 | Bounded LLM/NLP transcript extraction | 5–8 h plus evaluation and fallback |
| 5 | Second rural case / 20–50 interactive cases | 4–8 h |
| 6 | Reviewed Spanish scripts | 3–5 h plus human review |
| 7 | Pharmacy review node | 2–3 h |
| 8 | Animated map, extra dashboard, landing enhancements | **Drop without regret** |

### If the model pipeline cannot be completed honestly

`[inferred]` Ship a transparent deterministic support-priority policy with timestamped signals, cutoff logic, tests, and provenance. Do not hand-type probabilities or display a fake “AI risk score.” A real constraint/failure workflow scores better than fabricated ML.

---

## 13. Assumptions and open risks

### Evidence-backed pain points ranked by patient impact × demoability

| Rank | Pain point | Impact × demoability | Evidence and strategic use |
|---:|---|---|---|
| 1 | Targeted high-risk navigation can reduce missed oncology visits | 5 × 5 | `[stated]` 17.5% → 10.2% in one randomized cancer-center intervention. Use to support model + human navigation, not an OncoReady outcome claim. [Source](https://pubmed.ncbi.nlm.nih.gov/25585595/) |
| 2 | Transportation directly interrupts repeated cancer care | 5 × 5 | `[stated]` NCI describes patients skipping, delaying, or stopping care due to transport, distance, illness, work, and childcare. Use to justify early constraint resolution. [Source](https://www.cancer.gov/news-events/cancer-currents-blog/2024/cancer-disparities-transportation-food-housing) |
| 3 | Treatment delay can be clinically consequential | 5 × 4 | `[stated]` A 34-study meta-analysis found higher mortality associated with four-week delays across multiple indications; do not equate one missed visit with that effect. [Source](https://www.bmj.com/content/371/bmj.m4087) |
| 4 | Rural Louisiana combines burden with access, transport, poverty, and literacy barriers | 5 × 5 | `[stated]` LDH identifies those factors and reports about 1.2 million rural residents. Use to require SMS/voice and non-rideshare pathways. [Source](https://ldh.la.gov/assets/docs/LegisReports/SR77_2022RS/SR77_2022RS_LDHReport.pdf) |
| 5 | Illness/toxicity can make attendance clinically unsafe | 5 × 4 | `[stated]` Cancer programs report illness, hospitalization, toxicity, transport, and conflicting appointments among missed-treatment reasons. Use to route symptoms to humans before transport. [Source](https://pmc.ncbi.nlm.nih.gov/articles/PMC13210055/) |
| 6 | Financial, work, childcare, and caregiver barriers interact | 5 × 4 | `[stated]` NCI documents lost wages, caregiver cost, distance, time off, and childcare burdens. Use multiple barrier categories without building a broad navigator. [Source](https://www.cancer.gov/about-cancer/managing-care/track-care-costs/financial-toxicity-pdq) |
| 7 | No-show burden varies by modality and denominator | 5 × 4 | `[stated]` Reported rates vary sharply across radiation/infusion cohorts and appointment-level versus patient-level definitions. Use treatment-specific thresholds; never publish one universal oncology rate. [Source](https://pmc.ncbi.nlm.nih.gov/articles/PMC10824376/) |
| 8 | Caregiver contact can be operational infrastructure | 4 × 4 | `[stated]` NCI describes caregivers arranging appointments/transport and reporting problems; family contact was associated with lower no-show in the navigation study. Use patient-authorized caregiver fallback. [Source](https://www.cancer.gov/about-cancer/coping/family-friends/family-caregivers-pdq) |
| 9 | Outreach is hard to own and document at scale | 4 × 5 | `[stated]` Programs report undocumented outreach, unclear responsibility, time burden, and difficulty reaching patients. Use owner/SLA/attempt evidence. [Source](https://pmc.ncbi.nlm.nih.gov/articles/PMC13210055/) |
| 10 | Ochsner already has substantial digital and navigation capability | 4 × 5 | `[stated]` Ochsner publicly describes MyOchsner, navigation, social/financial support, a cancer help line, and Chemotherapy Care Companion. Use an exception/closure wedge, not duplication. [Cancer care](https://www.ochsner.org/services/cancer-care/), [resources](https://www.ochsner.org/services/cancer-care/cancer-resources/) |

### Confirmed assumptions we are choosing for strategy

- `[inferred]` One recurring infusion cohort is the best first pilot because treatment is time-bound and repeated, but the exact Ochsner cohort must be selected with a workflow owner.
- `[inferred]` A locally deterministic demo with real model/constraint/event artifacts is more credible than a network-dependent stack of thin integrations.
- `[inferred]` Department ownership and transport failure/fallback create more visible difficulty than a generic LLM.
- `[inferred]` The product should preserve appointments before cancellation; schedule recovery/waitlist refill is secondary.
- `[inferred]` The semifinal's original closure concept is worth retaining only if lead time and failure recovery become real.

### Open risks

1. `[unverified]` **Ochsner workflow gap:** It is not confirmed that cross-domain pre-treatment exceptions lack one existing owner/queue/closure view.
2. `[unverified]` **Data access:** It is not confirmed that Ochsner can provide the historical timestamps, contact outcomes, transport state, interventions, and final dispositions needed for retrospective validation.
3. `[unverified]` **Epic write path:** Exact SMART launch, scopes, patient matching, In Basket/task destination, scheduling interface, and durable writeback are not known.
4. `[unverified]` **Transportation inventory:** The team has no verified live resource capacity, Ochsner transport contracts, or provider API; finals capacity must remain synthetic.
5. `[unverified]` **Model generalizability:** Synthetic behavior does not establish Louisiana oncology calibration, subgroup fairness, intervention benefit, or drift tolerance.
6. `[unverified]` **Staff capacity:** The navigator outreach limit, acceptable false-positive workload, and escalation coverage are unknown.
7. `[unverified]` **Clinical ownership:** Site-specific clinical concern language, response times, after-hours paths, pharmacy-review boundary, and treatment-readiness authority require approval.
8. `[unverified]` **Channel consent and policy:** SMS/voice consent, minimal-content rules, caregiver communication, STOP behavior, and protected-app handoff require institutional validation.
9. `[unverified]` **Outcome economics:** Cost per missed infusion, drug-waste exposure, recovered capacity, and navigator labor savings cannot be claimed without local data.
10. `[unverified]` **Finalist uncertainty:** Eight competitors remain inferred from names/categories; their actual finals builds may differ materially from this map.

### Claims discipline

- `[stated]` A no-show, advance cancellation, late cancellation, clinically necessary delay, and treatment interruption are different outcomes. The product and model must keep them distinct.
- `[stated]` The 6%–8% mortality-hazard figure concerns a four-week surgical delay in specified indications; it does not mean one missed visit raises mortality by 6%–8%.
- `[stated]` Published predictive-navigation benefit came from a model combined with bilingual human outreach at one cancer center; software alerts alone were not the intervention.
- `[inferred]` Stage language should say **“support priority,” “synthetic case replay,” “simulated fulfillment,” “validated FHIR artifact,”** and **“proposed Epic integration boundary.”**
- `[inferred]` Stage language must not say **“clinically validated,” “prevents cancellations,” “predicts Ochsner patients,” “books a real ride,” “integrated with Ochsner,” “HIPAA compliant,” “AI triage,”** or **“treatment medically ready.”**

### The three decisions with the least certainty

1. **Whether to lead with a trained synthetic model at all.** `[inferred]` It improves visible difficulty but can damage credibility if judges focus on synthetic labels. The safer fallback is a transparent temporal policy; the stronger upside is a real, carefully caveated pipeline.
2. **Whether Epic public-sandbox work is worth finals time.** `[inferred]` A successful read makes interoperability tangible; an OAuth/configuration rabbit hole adds little user value and must stay below the cut line.
3. **Whether the primary cohort should be infusion.** `[inferred]` It creates the strongest treatment-chain story, but Ochsner may reveal that radiation, diagnostics, or another service line has the larger preventable interruption gap.

### Source register

**Repository intelligence**

- `devdays_2026_competitor_research.md`
- `devdays_2026_finalist_intelligence_deep_dive.md`
- `docs/PROJECT.md`
- `docs/architecture/SYSTEM.md`
- `docs/features/CORE-001.md`
- `ProjectRaw/DEV_DAYS_CANCER_MASTER_PLAN.md`
- Current `frontend/src/state/workflowState.ts`, workflow types/components, and smoke/component tests.

**Clinical and Louisiana evidence**

- [Predictive navigation randomized intervention](https://pubmed.ncbi.nlm.nih.gov/25585595/)
- [Cancer treatment delay meta-analysis](https://www.bmj.com/content/371/bmj.m4087)
- [NCI social needs and transportation](https://www.cancer.gov/news-events/cancer-currents-blog/2024/cancer-disparities-transportation-food-housing)
- [LDH cancer-care coordination report](https://ldh.la.gov/assets/docs/LegisReports/SR77_2022RS/SR77_2022RS_LDHReport.pdf)
- [LDH medical transportation](https://www.ldh.la.gov/medicaid/medical-transportation)
- [Ochsner cancer care](https://www.ochsner.org/services/cancer-care/)
- [Ochsner cancer resources](https://www.ochsner.org/services/cancer-care/cancer-resources/)

**Commercial and interoperability evidence**

- [Spryt](https://spryt.com/) and [Google Cloud case study](https://cloud.google.com/customers/spryt)
- [Epic appointment scheduling](https://www.epic.com/software/appointment-scheduling/), [patient experience](https://www.epic.com/software/patient-experience/), [FHIR catalog](https://open.epic.com/Clinical/FHIR?whereTo=patient), and [scheduling interfaces](https://open.epic.com/Scheduling/HL7v2)
- [Ochsner MyOchsner guide](https://www.ochsner.org/my-ochsner/how-to-use-myochsner/)
- [Luma Health](https://go.lumahealth.io/patient-success-platform/patient-scheduling/), [Artera](https://artera.io/wp-content/uploads/2022/10/Artera-ONE-PAGER.pdf), and [Roundtrip](https://roundtriphealth.com/reducing-no-shows/)
- [Navigating Care](https://www.navigatingcare.com/), [Carevive](https://www.healthcatalyst.com/products/carevive-by-health-catalyst-oncology-suite), and [Reimagine Care](https://reimaginecare.com/solutions/symptom-management/)

✅ Step 4 complete — the winning position, score levers, judge traceability, competitive map, kill list, feature set, architecture, safety boundary, design, three-minute demo, Q&A, build cut line, and open-risk register are specified.
