# Lead A — Clinical & Evidence Report

**DevDays 2026 Cancer Care and Prevention Challenge**  
**Evidence cutoff:** August 22, 2026  
**Independence:** Synthesizes only Lead A's 15 isolated lanes; no Lead B material was inspected.

## 1. Decision

### Selected problem

During active treatment, worsening symptoms and practical barriers can emerge between visits through different channels. When they jointly threaten an imminent infusion, radiation session, procedure, or follow-up, staff need one owned workflow that resolves both before care is disrupted.

This is a **HYPOTHESIS about Ochsner**, not a verified workflow deficiency. Ochsner publicly offers MyOchsner, navigation, multidisciplinary cancer care, virtual care, supportive services, and trials [R4–R8]. Public sources do not show whether symptoms, transportation/financial barriers, caregiver input, staff ownership, and closure are unified around an upcoming treatment.

### Winner: Treatment Continuity Copilot

**One sentence:** Before each cancer treatment, a two-minute text or voice check finds symptoms and real-life barriers that could derail care, routes each to the accountable human, and confirms resolution.

- **VERIFIED:** Electronic patient-reported symptom monitoring with staff response improves symptom control, physical function, quality of life, and some utilization outcomes [R9–R11].
- **INFERENCE:** Combining clinical and practical risks around a specific treatment is more useful and demonstrable than another portal, directory, or survey.
- **DESIGN:** Rules govern red flags; AI may extract free text and summarize but never diagnose, prescribe, alter treatment, or downgrade escalation.
- **HYPOTHESIS:** Ochsner has an unmet cross-channel closure gap.

### Backups

1. **Navigator Closure Graph:** identifies overdue supportive-care referrals, unanswered tasks, and approaching treatments; safest operational pivot.
2. **Louisiana Cancer Continuity Wallet:** offline/SMS treatment summary, medications, contacts, caregiver permissions, and disaster relocation handoff; strongest Louisiana-specific pivot.

## 2. Competition facts and urgent unknowns

- **VERIFIED:** Draft prototype due August 23 at 11:59 p.m.; virtual semifinals August 26–27; finalists notified August 31; finals September 25, 11:30 a.m.–5:00 p.m. [R1].
- **VERIFIED:** Top ten compete for $10,000 total; current split is unpublished [R1–R2].
- **VERIFIED:** Nexus expects a functional solution and impactful live demo [R1].
- **CRITICAL UNKNOWN:** The linked live form is an individual interest form with no prototype field; confirm the separate submission route immediately [R3].
- **UNKNOWN:** Current rubric, judges, mentors, pitch length, team cap, adviser requirement, IP terms, Ochsner data access, and prize split.

## 3. Evidence ledger

| Label | Claim | Evidence / caveat | Confidence | Metric |
|---|---|---|---:|---|
| VERIFIED | Ochsner already provides portal, navigation, multidisciplinary/supportive/virtual cancer care | Public Ochsner pages; availability may vary [R4–R8] | High for existence | Do not duplicate |
| VERIFIED | ePRO plus staff response improves outcomes in studied oncology settings | PRO-TECT/Basch trials [R9–R11] | High for mechanism | Completion, response, symptom control |
| VERIFIED | Four-week treatment delays correlate with higher mortality hazards across studied contexts | Heterogeneous observational meta-analysis [R12] | Moderate-high | Continuity matters; no lives-saved claim |
| VERIFIED | A rideshare offer alone did not reduce missed visits in one Medicaid primary-care RCT | Not oncology [R13] | High for that setting | Fulfillment, not offer |
| VERIFIED | Rural counties nationally have higher cancer death rates and slower improvement | Does not prove Louisiana/Ochsner causality [R14] | High nationally | Stratify access/outcomes |
| VERIFIED | Louisiana has registry, stage, mortality, rurality, and small-area mapping assets | LTR [R15–R17] | High | Pilot targeting |
| INFERENCE | Closure is the key failure, not screening alone | ePRO benefit depends on response; resource platforms already screen/match | Moderate-high | Signal-to-resolution |
| HYPOTHESIS | Ochsner reconciles symptom and social-barrier signals manually or separately | No public workflow evidence | Unknown | Mentor go/no-go |
| DESIGN | Rules control safety; AI supports language/workflow | Dataset and safety limits [R18–R23] | Strong judgment | Rule recall, summary accuracy |

Discarded claims: Ochsner lacks oncology monitoring; rural Ochsner patients have higher interruption rates; the prototype predicts hospitalization; rides automatically prevent missed care; the product improves survival.

## 4. Ochsner duplication guard

| Existing capability | Avoid | Proposed delta, still unverified |
|---|---|---|
| MyOchsner appointments/messages/results [R5] | New portal/calendar/chat | Low-bandwidth intake linked to an owned closure task |
| Cancer navigation/supportive care [R6] | “We provide navigation” | Prioritization, less duplication, verified closure |
| Multidisciplinary Ochsner MD Anderson care [R4] | Replacing coordination | Route between-visit risks to the existing role |
| Virtual/Connected Health [R7] | Generic telehealth/RPM | Pre-treatment oncology continuity if absent |
| Trials [R8] | Claiming data/trial access | Future integration only |

**First Ochsner question:** “When a patient has worsening symptoms and a transportation or financial barrier before tomorrow's treatment, where are those signals seen together, who owns each action, and how is closure measured?”

## 5. Diverse concepts and /100 rubric

Rubric weights: alignment 12; impact 16; novelty 15; safety/feasibility 12; demo 10; equity 10; workflow 7; scale/ROI 5; technical depth 5; clarity 8. This is **not an official DevDays rubric**.

| Concept | Precise mechanism | Total |
|---|---|---:|
| Treatment Continuity Copilot | Pre-treatment symptom+barrier check, accountable routing, closure | **86** |
| Navigator Closure Graph | Flags overdue referrals/tasks near treatment milestones | **81** |
| Diagnosis Loop Tracker | Tracks abnormal finding through completed staging | **79** |
| Rural Logistics Orchestrator | Appointment-aware ride/lodging/resource fulfillment | **78** |
| Symptom Safety Loop | Validated ePRO with nurse escalation | **78** |
| Cancer Continuity Wallet | Offline disaster/transfer treatment record and contacts | **78** |
| Caregiver Relay | Consented caregiver tasks and confirmation | **74** |
| Survivorship Handoff | Structured oncology-to-PCP surveillance closure | **66** |
| Oncology Admin Copilot | Grounded message/note summary and task drafting | **65** |

Winner criterion scores: 11/12 alignment, 14/16 impact, 10/15 novelty, 10/12 feasibility, 10/10 demo, 9/10 equity, 6/7 workflow, 4/5 scale, 4/5 technical depth, 8/8 clarity. Novelty and workflow scores remain capped until Ochsner validates the gap.

## 6. Five-person simulated jury

| Juror | Ranking | Yes | No / question |
|---|---|---|---|
| Oncology clinician | Continuity; Diagnosis; Closure | Evidence-backed monitoring with human control | Who reviews clinical alerts, and when? |
| Navigator/operations | Closure; Continuity; Logistics | Makes hidden work owned/measurable | Which existing task does it replace? |
| Health-system IT | Closure; Continuity; Wallet | FHIR/task model is credible | Is Epic already configured for this? |
| Innovation/business | Continuity; Wallet; Diagnosis | Retellable wedge and reusable engine | Why cannot Epic/Canopy add it? |
| Patient/caregiver | Continuity; Logistics; Wallet | One text finds the right department | How do I know a human responded? |

**Result:** The winner is broadly strongest, but operations favors Closure Graph. Therefore the MVP must visibly consolidate work, not create another inbox.

## 7. Convergence and disagreement

**Convergence:** narrow closed loops beat whole-journey platforms; existing portals/ePRO/navigation/resource products kill generic novelty; SMS/voice, caregiver consent, named ownership, synthetic-data honesty, and visible closure are mandatory.

**Tension:** clinical evidence is strongest for symptom-only ePRO, while competitive differentiation requires symptom-plus-barrier orchestration. Disaster continuity is locally powerful but less evidence-backed. Diagnosis tracking may have major impact, but exact scope and Ochsner leakage are unverified.

## 8. Workflow, architecture, MVP, and demo

### Workflow

1. Treatment 48–72 hours away triggers SMS, voice, or PWA check-in.
2. Selected PRO-CTCAE symptoms plus transport, cost, medication, and caregiver barriers are captured [R18].
3. Deterministic rules route red flags; transparent priority uses severity, treatment proximity, barrier status, and missing response.
4. Triage owns clinical issues; navigation owns practical issues.
5. Patient/caregiver receives an update; staff and patient confirm closure.

### Architecture

Patient/caregiver channel → API/workflow state machine → rules engine → optional constrained summarizer → triage/navigator queue → resource matcher → Task closure → metrics/audit.

Use Synthea/SMART synthetic FHIR data [R19–R20]. Production path uses FHIR R4/US Core/SMART with Patient, RelatedPerson, Consent, Appointment, QuestionnaireResponse, Observation, Task, Communication, PractitionerRole, Provenance, and AuditEvent [R21–R23]. No Ochsner connection is claimed.

### Draft MVP

One composite synthetic patient: rural, infusion tomorrow, worsening diarrhea, cancelled ride. Show real form submission, rule explanation, one clinical task, one navigation task, resource action, confirmation, and closure. Label all data simulated.

### Finals/demo

Add caregiver, SMS/voice, FHIR export, 20–50 seeded cases, FIFO-versus-priority comparison, unavailable-resource and low-connectivity paths. Run locally; no live LLM/maps/SMS; include reset, screenshots, and backup video.

**Visible magic:** two hidden risks become one explained, owned workflow, ending with confirmed action.

## 9. Evaluation

- **Technical:** rule correctness/recall, duplicate suppression, routing, NLP precision/recall if used, summary factuality/abstention, resource eligibility, FHIR validation, latency.
- **Usability:** check-in under two minutes; urgent-instruction comprehension; staff locates reason/action/owner within ten seconds; caregiver consent/revocation; low-connectivity completion; trust and burden.
- **Pilot:** completion, signal-to-review/resolution, alerts and staff minutes per 100 patients, duplicate contacts, resource closure, treatment kept/delayed/cancelled/rescheduled, exploratory acute-care use.
- **Equity:** stratify by rurality/travel time, race, insurance, language, disability, device/channel, and caregiver availability.

## 10. Safety, equity, adoption, and kill criteria

### Minimum safety

No diagnosis, prescribing, treatment modification, or autonomous emergency disposition. AI cannot downgrade rules. Show source, time, reason, and uncertainty. Name the responder and response window; show monitoring hours/after-hours path. Synthetic data only. Granular caregiver consent. Fail safely on missing data, duplicates, downtime, and unavailable staff [R24–R25].

### Equity

No required app, wearable, password, continuous broadband, or color-only meaning. Provide SMS/voice/human fallback, plain language, screen-reader/keyboard access, patient-controlled caregiver delegation, and verified resource availability [R26–R27].

### Adoption

Buyer: ambulatory oncology/Ochsner MD Anderson operations. Owner: triage/navigation leader. Pilot one site/service line for 8–12 weeks. ROI remains a **HYPOTHESIS**: staff time and duplicate work avoided, fewer wasted appointment/rescheduling cycles, faster use of existing services, and exploratory avoided acute care minus integration/training/response capacity.

### Kill if

Ochsner already closes the same loop; no named owner/capacity; prototype is only form+dashboard; PHI is required to demonstrate; workload increases; resources cannot be fulfilled; AI controls urgent decisions; demo cannot close the loop; or novelty remains “combined features.”

## 11. Likely Q&A

**Why not MyOchsner?** It is a likely production surface. The unverified delta is cross-domain, imminent-treatment prioritization and confirmed closure.

**Why not Canopy/Carevive/Thyme Care?** They commoditize components [R28–R30]. Our only defensible delta is low-bandwidth, appointment-specific clinical+practical orchestration; pivot if diligence disproves it.

**Where is the data?** NCI instruments, Synthea/SMART synthetic records, and public Louisiana context; no Ochsner data.

**Who acts?** Triage for symptoms, navigation for barriers; exact Ochsner RACI is a pilot prerequisite.

**What if AI is wrong?** Rules remain authoritative; AI is optional, source-linked, and can abstain.

**Does it improve survival?** Not a prototype claim. Measure workflow and continuity proxies prospectively.

**Why Louisiana?** Low-bandwidth, caregiver, travel/resource-capacity, and outage-resilient design; local burden targeting uses LTR.

**Can it be built?** Yes: one deterministic golden path now; caregiver, FHIR, failure modes, and evaluation by finals.

## 12. Sources

- **R1** https://www.nexusla.org/programs/devdays
- **R2** https://www.linkedin.com/company/nexusla
- **R3** https://form.jotform.com/261947954908172
- **R4** https://www.ochsner.org/services/ochsner-md-anderson-cancer-center
- **R5** https://www.ochsner.org/patients-visitors/myochsner
- **R6** https://www.ochsner.org/services/cancer-services
- **R7** https://www.ochsner.org/services/connected-health
- **R8** https://research.ochsner.org/clinical-research/clinical-trials
- **R9** https://jamanetwork.com/journals/jama/fullarticle/2789896
- **R10** https://ascopubs.org/doi/10.1200/JCO.2015.63.0830
- **R11** https://jamanetwork.com/journals/jama/fullarticle/2630818
- **R12** https://www.bmj.com/content/371/bmj.m4087
- **R13** https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2678828
- **R14** https://www.cdc.gov/mmwr/volumes/66/ss/ss6614a1.htm
- **R15** https://publichealth.lsuhsc.edu/louisiana-tumor-registry/
- **R16** https://louisianatumorregistry.lsuhsc.edu/louisiana-master/docs/index.html
- **R17** https://publichealth.lsuhsc.edu/louisiana-tumor-registry/data-usestatistics/louisiana-data-interactive-statistics/default.aspx
- **R18** https://healthcaredelivery.cancer.gov/pro-ctcae/
- **R19** https://synthetichealth.github.io/synthea/
- **R20** https://launch.smarthealthit.org/
- **R21** https://hl7.org/fhir/R4/
- **R22** https://www.hl7.org/fhir/us/core/
- **R23** https://hl7.org/fhir/smart-app-launch/
- **R24** https://www.hhs.gov/hipaa/for-professionals/privacy/index.html
- **R25** https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- **R26** https://www.w3.org/TR/WCAG22/
- **R27** https://health.gov/healthliteracyonline/
- **R28** https://www.canopycare.us/
- **R29** https://www.carevive.com/
- **R30** https://www.thymecare.com/

## Bottom line

Build the Treatment Continuity Copilot as a rules-first, low-bandwidth, closed-loop workflow. It has the best combined clinical evidence, equity, demoability, and human clarity. Its Ochsner gap and novelty remain unverified; mentor workflow validation is the decisive go/no-go gate.
