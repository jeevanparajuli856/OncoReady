# DevDays 2026 Cancer Care & Prevention — Finalist Intelligence Deep Dive

**Prepared for:** OncoReady team  
**Date:** September 18, 2026  
**Competition:** Nexus Louisiana DevDays — Cancer Care & Prevention Challenge  
**Healthcare partner:** Ochsner Health  
**Goal:** Use public evidence, repository traces, challenge structure, clinical prior art, naming semantics, and implementation footprints to estimate what each finalist is likely building and identify the highest-value upgrades for OncoReady before finals.

---

## 0. Executive conclusion

The field appears to be clustering into a small number of predictable product archetypes:

1. **AI cancer navigator / patient companion**
2. **Broad cancer-journey platform**
3. **Remote monitoring / predictive risk**
4. **Survivorship / supportive care**
5. **Community/caregiver coordination**
6. **Screening / prevention / geographic access**
7. **Treatment-event operations**

The strongest directly verified competitor is **BayouCare**. Its public repository exposes an unusually complete finals strategy: patient navigation, symptoms, remote monitoring, risk forecasting, no-show prediction, transportation, prior authorization, clinical-trial matching, survivorship, parish-level prevention, multilingual support, and a clinic-operations dashboard.

The most important strategic conclusion is **not** to copy that breadth.

OncoReady's strongest defensible position is:

> **Treatment-event readiness: identify what can derail the next infusion, separate clinical from logistical barriers, assign each to the right human, track deadlines, and prove closure before the treatment event.**

This is materially different from "AI cancer navigation."

The current OncoReady repository already contains a strong core:
- T-24h readiness workflow
- split clinical vs transportation tasks
- named human ownership
- Treatment Readiness Graph
- caregiver minimum-necessary projection
- append-only causal event timeline
- SLA concepts
- staff/patient/caregiver views
- deterministic safety routing
- explicit prohibition on autonomous clinical triage

The largest remaining competitive risk is **credibility depth**, not feature count. Several currently advertised concepts are still simulated or future scope. The upgrade plan in this report therefore prioritizes:

1. validated synthetic FHIR export;
2. real computed operational metrics from the event log;
3. failure-path/escalation behavior;
4. a truthful pharmacy/compounding readiness gate;
5. multi-case operational proof;
6. low-connectivity proof;
7. tightening any UI language that could imply live SMS, live transport APIs, or production integrations.

---

# 1. What the official challenge actually incentivizes

The official Nexus page frames the problem around barriers across diagnosis, treatment, survivorship, supportive care, rural access, and administrative burden.

Its suggested solution areas are almost a blueprint for the finalist landscape:

- AI-powered patient navigation
- predictive analytics / remote monitoring
- patient-caregiver-care-team communication
- rural and underserved access
- transportation support
- AI-enabled administrative burden reduction

The official launch article adds:
- prevention
- screening
- early detection
- emotional/social/financial resources

This matters because many teams could independently arrive at very similar ideas without copying each other.

### Primary official sources

- Nexus DevDays page:  
  https://www.nexusla.org/programs/devdays
- Ochsner/Nexus challenge launch:  
  https://www.nexusla.org/articles/nexus-louisiana-and-ochsner-health-launch-devdays-cancer-care-prevention-challenge
- Submission form:  
  https://form.jotform.com/261948001315148

---

# 2. Important finding about submission URLs and archives

The public submission form asks teams to provide:

- project name
- ~100-word project description
- project upload such as recorded demo, prototype, mock-up, model, or presentation
- an **optional shareable hyperlink** if the team prefers to submit by link

The user reports that semifinal teams had to open/use their web app URL during judging. That is consistent with the competition requiring a functioning demo, but the public form itself does **not** say every team had to submit a permanent public URL.

## Why a live semifinal URL may no longer be discoverable

A functioning semifinal web app does **not** imply that Wayback Machine or search engines captured it.

Common reasons:

- Vercel preview URLs are ephemeral or hard to guess.
- Netlify/Vercel projects can have `noindex`.
- The app may require login.
- The app may be deployed under a teammate's unrelated username.
- The repository may be private.
- Search engines may never have crawled the deployment.
- Wayback does not automatically archive every public URL.
- Cloudflare / robots rules may prevent archival.
- Teams may have submitted Google Drive, YouTube, Figma, Lovable, Bolt, Replit, Render, Railway, Firebase, Supabase-hosted frontends, or temporary preview links rather than a memorable domain.

## Archive/footprint searches performed

The research pass included:

- exact finalist-name web search
- exact finalist-name GitHub repository search
- GitHub global code search
- GitHub recent commit search
- challenge-specific phrase searches
- university-name + DevDays + cancer searches
- Vercel / Netlify / `pages.dev` / `github.io` footprint searches
- recent LinkedIn/public social indexing
- URLScan-style indexed footprint searches
- likely slug variants
- direct Wayback CDX attempts

### Result

Only two non-OncoReady challenge applications were directly tied to this exact challenge with high confidence:

1. **BayouCare** — confirmed finalist
2. **Elpis** — confirmed challenge project, but not on the finalist schedule

For the other named finalists, no publicly verifiable repository/deployment was discovered in this pass.

That absence should **not** be interpreted as weakness.

---

# 3. Evidence classification used in this report

### CONFIRMED
Direct repo, app, university announcement, official competition source, or explicit project artifact.

### STRONG INFERENCE
Multiple independent clues align: clinical terminology + challenge category + institution capabilities + naming semantics.

### MODERATE INFERENCE
Project name strongly implies a category and aligns with the challenge, but no implementation evidence is public.

### SPECULATIVE
Multiple plausible meanings remain; use only for defensive preparation.

---

# 4. Finalist map

| Project | University | Most likely wedge | Confidence | Direct overlap with OncoReady |
|---|---|---|---|---|
| CareCrab | ULM | Friendly patient companion / navigator | Moderate inference | Medium |
| BayouCare | Southeastern | Entire cancer journey + predictive + provider ops | **Confirmed** | **High** |
| Functional Vital Sign | VCOM | Objective function/gait/frailty monitoring | **Strong inference** | Medium |
| Second Line | Southeastern | Survivorship/supportive care OR second-line therapy navigation | Strong–moderate | Low–Medium |
| OncoReady | ULM | Next-infusion readiness / closed-loop operations | Confirmed | — |
| Tomorrow | Southern | Future-facing treatment planning, prevention, or survivorship | Speculative | Unknown |
| Project Compass | ULM | Cancer navigation / "what happens next?" | Moderate inference | Medium |
| LASpot | Southeastern | Louisiana screening/resource locator OR early detection | Moderate-low | Low |
| Bayou Care Navigator | Louisiana Tech | AI patient navigation + Louisiana resources | Strong category inference | Medium |
| Cancer Krewe | UL Lafayette | Community/caregiver/peer support | Moderate inference | Low |

---

# 5. BayouCare — the competitor we can actually reverse engineer

## Evidence level: CONFIRMED

Public repo:

https://github.com/DanOhsaka/bayoucare

Important files:

- Project description:  
  https://github.com/DanOhsaka/bayoucare/blob/main/PROJECT-DESCRIPTION.md
- Finals demo script:  
  https://github.com/DanOhsaka/bayoucare/blob/main/demo-script.html
- Competitor simulation:  
  https://github.com/DanOhsaka/bayoucare/blob/main/COMPETITOR-IDEAS.md
- Challenge brief:  
  https://github.com/DanOhsaka/bayoucare/blob/main/CHALLENGE-BRIEF.md

## Product model

BayouCare explicitly positions itself as:

```text
Prevent
  ↓
Diagnose
  ↓
Plan
  ↓
Treat
  ↓
Survive
  ↓
Support
```

## Confirmed capabilities

### Patient journey
- personalized roadmap
- plain-language diagnosis/pathology explanation
- daily symptom check-ins
- mood check
- caregiver profile
- shared journey

### Predictive analytics
- seven-day risk forecast
- no-show risk
- treatment-interruption concepts
- counterfactual intervention logic

Example:

```text
High no-show / interruption risk
          ↓
Arrange transportation
          ↓
Re-run model
          ↓
Lower displayed risk
```

### Remote monitoring
Their finals script includes a staged:

```text
2:00 AM fever spike
    ↓
possible neutropenic fever
    ↓
RN escalation
    ↓
caregiver SMS
```

### Provider operations
- prior-auth drafting
- referral flow
- tumor-board preparation
- PCP decision-support feed
- per-slot no-show scoring
- smart rebooking concepts
- clinic operations
- care-team roster

### Prevention
- risk-stratified screening
- parish heat map
- screening-van routing
- abnormal-result follow-up
- FIT return tracking

### Survivorship
- ASCO-style survivorship care plan
- late-effects radar

### Trials
- ClinicalTrials.gov matching

### Accessibility / Louisiana
- English
- Spanish
- Haitian Creole
- Vietnamese
- Louisiana parish framing

## Confirmed finals story

Their public script is approximately:

```text
Darlene
  ↓
Patient check-in
  ↓
2 AM fever
  ↓
Care-team prediction
  ↓
Counterfactual action
  ↓
Arrange ride
  ↓
Risk changes
  ↓
Clinic Ops
  ↓
Prior auth + no-show
  ↓
Survivorship
  ↓
Parish prevention
  ↓
Languages
```

## Their strength

**Breadth + visible demo density.**

In 10–12 minutes they can make judges feel they have "covered the entire brief."

## Their weakness

The more modules a product contains, the more judges can ask:

- Which features are truly integrated vs scripted?
- Which models are validated?
- Which APIs are live?
- What is the primary buyer ROI?
- What exact workflow is changed tomorrow morning?
- How much of the product requires new behavior from staff?

## The key OncoReady counter-position

Do not say:

> "We have more features."

Say:

> **"BayouCare addresses the whole cancer journey. OncoReady addresses the operational moment where the next scheduled treatment can still fail. We turn that moment into an owned, timed, auditable workflow."**

---

# 6. BayouCare's competitor-simulation file is a major intelligence clue

This is one of the strongest findings.

Before finalists were announced, BayouCare's public repo contained a document explicitly describing **six simulated competitor teams** generated against the same challenge.

Their simulated teams:

| Simulated team | Archetype |
|---|---|
| SIGNAL | predictive risk |
| Lagniappe | community / social determinants |
| OncoFlow | provider workflow / EHR |
| FirstCheck LA | prevention / risk / parish map |
| VitalSweep | hardware / remote monitoring |
| SecondLine | survivorship / supportive care |

Later, the real finalist list contains a project called:

> **Second Line**

This does **not** prove that the real team used the same model, prompt, or source.

It does prove something more useful:

> **Systematic ideation against this challenge naturally converges on these exact archetypes — and even on very similar branding.**

That is the best available evidence for reverse-engineering the **idea space**.

---

# 7. Functional Vital Sign — likely the most clinically distinctive unknown competitor

## Evidence level: STRONG INFERENCE

The phrase **"functional vital sign"** has a recognized clinical meaning.

Walking/gait speed has been described in clinical literature as a functional or sixth vital sign.

Sources:

- Walking speed: the functional vital sign  
  https://pubmed.ncbi.nlm.nih.gov/24812254/
- Gait speed as a functional vital sign  
  https://academic.oup.com/innovateage/article/8/Supplement_1/584/7937861
- Cancer cachexia / six-minute walk discussion  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC12304731/
- Gait speed in hematologic malignancies  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC6659254/
- Wearable inertial sensors in hematologic cancer patients  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC9782382/

## VCOM institutional fit

VCOM publicly describes research strengths in:

- clinical research
- rural/underserved health
- biomechanics
- movement
- exercise physiology
- motion capture
- cancer collaboration with ULM pharmacy

Sources:

- https://www.vcom.edu/research
- https://www.vcom.edu/research/research-services-information/research-strategic-plan

This combination makes the project name unusually informative.

## Most plausible product

```text
Cancer patient
    ↓
Timed Up and Go / gait / sit-to-stand / short walk
    ↓
Phone camera, IMU, wearable, or manual timing
    ↓
Functional score
    ↓
Baseline comparison
    ↓
Detect decline
    ↓
Flag clinician / care team
```

Potential measurements:

- gait speed
- stride variability
- TUG
- six-minute walk
- sit-to-stand
- fatigue
- balance
- frailty trend

## Possible AI

- pose estimation
- inertial-sensor analytics
- time-series trend detection
- risk classification
- functional decline prediction

## Likely 10-minute demo

```text
Patient baseline
   ↓
Walk / TUG test
   ↓
Sensor measurement
   ↓
Functional score
   ↓
"Decline detected"
   ↓
Care-team dashboard
   ↓
Trend over treatment cycles
```

## Strongest pitch angle

> Traditional vitals can look normal while function is deteriorating.

## Likely judge weakness

- Does gait decline specifically change oncology decisions?
- Is the measurement clinically validated for the intended cancer population?
- Is the tool measuring general frailty rather than solving a cancer-specific workflow?
- Does it require special hardware?
- Who acts on the alert?

## OncoReady response

Do not compete with the measurement.

Position it as an upstream signal:

```text
Functional Vital Sign
detects a clinical risk signal.

OncoReady
makes sure treatment-impacting signals and nonclinical barriers
reach the correct owner before the treatment deadline.
```

---

# 8. Second Line — probably a double-meaning brand

## Evidence level: STRONG–MODERATE INFERENCE

"Second line" has two highly relevant meanings.

### Meaning A — oncology

Second-line therapy is treatment used after first-line treatment fails, stops working, or is not tolerated.

### Meaning B — Louisiana culture

A New Orleans second line is a communal parade tradition.

Cancer institutions in Louisiana already use the phrase culturally; for example East Jefferson General Hospital has publicly described a "Cancer Center Second Line" celebration.

Source:

https://www.linkedin.com/posts/east-jefferson-general-hospital_cancer-center-second-line-activity-7425324639930798080-mq39

## Hypothesis A — survivorship/supportive care

This is the most interesting because BayouCare's pre-finalist simulation independently invented:

```text
SecondLine
→ survivorship
→ late-effects
→ mood
→ peer support
→ return to work
→ caregiver burnout
```

Likely flow:

```text
Treatment ends
   ↓
Patient enters "second line" of life
   ↓
Survivorship care plan
   ↓
Late-effect surveillance
   ↓
Mental health / financial / rehab support
```

## Hypothesis B — treatment sequencing

Alternative:

```text
First-line treatment fails
   ↓
Understand next options
   ↓
Second-line treatment
   ↓
Trials / biomarkers / decision support
```

## Potential demo

If survivorship:

```text
Cancer survivor
   ↓
Treatment history
   ↓
Generated care plan
   ↓
Late-effects checklist
   ↓
Follow-up reminders
   ↓
Peer/community support
```

## OncoReady overlap

Low to medium.

Second Line likely owns a different time horizon:

```text
months / years after treatment
```

OncoReady owns:

```text
hours / one day before treatment
```

That temporal difference is useful in Q&A.

---

# 9. CareCrab — likely patient-facing, mascot-first navigation

## Evidence level: MODERATE INFERENCE

No verified public repository or app was found.

The name strongly suggests:

```text
Care + Crab
```

The crab is culturally associated with Cancer, so the brand appears designed to make cancer care less intimidating.

## Likely product category

Most likely:

- patient companion
- AI chat
- journey roadmap
- reminders
- questions for doctor
- resource navigation
- symptom diary
- emotional support

## Likely ideation prompt archetype

A generic AI ideation flow might produce:

> "Create a friendly, memorable cancer-care companion that feels less clinical."

The resulting brand could naturally be something like:

- CareCrab
- Cancer Companion
- HopeBuddy
- OncoPal

This is **style inference, not proof of AI use**.

## Likely technical stack

Typical student implementation:

```text
React / Next.js
+
Supabase/Firebase
+
LLM API
+
RAG over cancer resources
+
simple treatment timeline
```

## Likely demo

```text
New patient
   ↓
CareCrab chat
   ↓
"Explain my treatment"
   ↓
Roadmap
   ↓
Reminders/resources
```

## Likely weakness

Generic companion products are crowded.

Judge questions:

- Why doesn't MyOchsner / ChatGPT / a nurse navigator already solve this?
- What prevents unsafe medical advice?
- What is uniquely Louisiana?
- What is measured?

## OncoReady response

> CareCrab likely improves understanding and engagement. OncoReady is not a general educational assistant; it coordinates time-sensitive operational closure around a scheduled treatment.

---

# 10. Project Compass — likely navigation, but the name is extremely noisy online

## Evidence level: MODERATE INFERENCE

There are many unrelated "Project Compass" products online:

- generic project-management tools
- accessibility apps
- Navy placement tools
- EU cancer cardiotoxicity research
- NHS cancer early-detection pilots

None of the discovered public Project Compass artifacts can be confidently tied to the ULM finalist.

Therefore, any direct feature claim would be irresponsible.

## Strong semantic clue

Compass means:

```text
Where am I?
Where am I going?
What happens next?
```

That maps almost perfectly to the official challenge's patient-navigation category.

## Most plausible product

```text
Diagnosis
   ↓
Personalized cancer journey map
   ↓
Appointments
   ↓
Next step
   ↓
Resources
   ↓
Care team
```

Possible features:

- AI diagnosis explainer
- treatment roadmap
- appointment organizer
- task checklist
- care-team directory
- question generator
- resources
- maybe transportation

## Likely demo

```text
Patient logs in
   ↓
"Your current stage"
   ↓
"Next appointment"
   ↓
"What you need to do"
   ↓
AI explanation
   ↓
Resource recommendation
```

## Likely weakness

The challenge already has multiple navigation-shaped concepts.

The key judge question will be:

> Why this navigator rather than existing portal/navigation infrastructure?

## OncoReady distinction

Compass likely optimizes:

```text
orientation
```

OncoReady optimizes:

```text
closure before a fixed treatment deadline
```

---

# 11. Bayou Care Navigator — the category is almost explicit in the name

## Evidence level: STRONG CATEGORY INFERENCE, LOW FEATURE-LEVEL CONFIDENCE

No verified repo was found.

But the title maps nearly word-for-word to the official suggested category:

> AI-powered patient navigation.

The "Bayou" prefix localizes it to Louisiana.

## Most likely problem statement

> Cancer patients do not know what to do next or where to find local help.

## Likely product

```text
Patient profile
     +
Diagnosis/treatment context
     +
Louisiana resources
     ↓
AI navigator
     ↓
Next-step checklist
     ↓
appointments
transportation
financial help
support services
```

## Possible implementation

- RAG over trusted cancer content
- local resource database
- personalized checklist
- appointment reminders
- FAQ/chat
- transportation finder

## Strongest pitch angle

> A Louisiana-specific navigator rather than a generic national cancer app.

## Likely weakness

If it is primarily a navigator/chatbot:

- action ownership may stop at referral
- resource availability may not be known
- no proof service was actually delivered
- generic AI safety concerns
- duplication with existing navigation programs

## OncoReady counter

> A resource recommendation is not closure. OncoReady follows a barrier from detection through named ownership, action, patient acknowledgment, and resolution against the treatment deadline.

---

# 12. Cancer Krewe — community network is the natural interpretation

## Evidence level: MODERATE INFERENCE

"Krewe" is a culturally strong Louisiana term for an organized social group.

Cancer-related krewes already exist in Louisiana.

Examples:

- Karnival Krewe de Louisiane
- Krewe de Pink
- LSU's public "Krewe de Cancer Immunity" phrasing

This makes the project name highly likely to represent **community around the patient**.

## Most plausible product

```text
Patient
   ↓
Cancer Krewe
   ↓
family
friends
caregiver
survivor mentor
community resource
```

Potential tasks:

- rides
- meals
- appointment companion
- medication pickup
- childcare
- check-in calls
- peer support
- respite

## Possible AI

- match tasks to helpers
- summarize unmet needs
- match patient to survivor mentor
- recommend community resources
- detect caregiver overload

## Likely demo

```text
Patient creates Krewe
   ↓
Invite supporters
   ↓
Need = ride to treatment
   ↓
Assign person
   ↓
Need = meal / childcare
   ↓
Assign supporter
```

## Strong pitch angle

> Cancer should not be managed alone.

## Likely weakness

- volunteer reliability
- privacy boundaries
- clinical information sharing
- operational verification
- who is responsible when the community cannot fulfill a task?

## OncoReady opportunity

OncoReady already has a strong answer through **caregiver minimum-necessary projection**.

A live privacy proof could differentiate you strongly:

```text
Patient/staff see clinical concern.
Caregiver sees only authorized transportation details.
```

---

# 13. LASpot — two plausible branches

## Evidence level: MODERATE-LOW INFERENCE

No reliable repo/app was discovered.

The name is likely:

```text
LA + Spot
```

Two plausible meanings remain.

## Hypothesis A — Louisiana care/screening locator

More likely.

Possible flow:

```text
ZIP / parish
   ↓
risk / screening need
   ↓
nearest service
   ↓
eligibility
   ↓
transportation
```

Could include:
- screening map
- rural service access
- mammography / colon / lung screening
- community events
- mobile screening
- parish heat map

## Hypothesis B — "spot cancer" early detection

Alternative:

- image analysis
- skin lesion detection
- pathology/radiology assist
- symptom red-flag detection

There is not enough evidence to choose confidently.

## OncoReady overlap

Probably low.

If LASpot is prevention-focused, it operates before diagnosis/treatment.

---

# 14. Tomorrow — the largest unknown

## Evidence level: SPECULATIVE

No reliable public repo, website, or indexed project artifact was tied to this finalist.

The name is emotionally framed rather than technically descriptive.

Likely themes:

### A. Prevention
> Do something today for tomorrow.

### B. Survivorship
> What life looks like after cancer.

### C. Treatment planning
> What happens tomorrow / what is my next step?

### D. Hope / behavioral engagement
> Keep patients engaged through a difficult journey.

## Why this project deserves monitoring

If their interpretation is "tomorrow's treatment," it could overlap directly with OncoReady.

If it is prevention/survivorship, overlap is small.

Until more evidence emerges, do not overfit your strategy around this team.

---

# 15. Elpis — a useful "ghost competitor"

## Evidence level: CONFIRMED CHALLENGE PROJECT, NOT CONFIRMED FINALIST

Repo:

https://github.com/Nytester/Elpis

The code explicitly names:

- Ochsner Health
- Cancer Care & Prevention Challenge
- Nexus Louisiana
- DevDays

Its public commit activity is dense through the Aug. 26–27 semifinal period.

It does not appear on the finalist schedule.

Possible interpretations:

- semifinalist that did not advance
- renamed project
- separate challenge submission

Do not assign it to a finalist without evidence.

## Confirmed capabilities

- patient journey timeline
- AI assistant
- RAG
- medications
- symptoms
- patient/caregiver/care-team shared view
- documents
- financial resources
- transportation resources
- telehealth
- hospital finder
- provider dashboard
- unified inbox
- appointments
- care tasks
- Supabase Auth/Postgres/RLS/Realtime

## Why Elpis is strategically useful

Elpis is a concrete example of the **generic strong solution** the challenge naturally produces:

```text
AI assistant
+
patient timeline
+
resources
+
caregiver
+
provider dashboard
```

That supports the thesis that OncoReady should avoid becoming another whole-journey portal.

---

# 16. Reverse-engineering the likely AI ideation space

This is not reconstruction of another team's hidden reasoning.

It is reconstruction of what a competent AI system would likely generate from the public challenge prompt.

## Prompt stage 1 — identify pain points

Input:

```text
Cancer journey
Louisiana
rural barriers
caregivers
oncology staff
AI/digital health
```

Likely output clusters:

```text
navigation
remote monitoring
risk prediction
transportation
resource matching
caregiver communication
screening
admin automation
survivorship
```

## Prompt stage 2 — ask for Louisiana-specific branding

Likely lexical pool:

```text
Bayou
Krewe
Parish
Pelican
Lagniappe
Second Line
LA
Gulf
```

Observed finalist names align with that pattern:

- BayouCare
- Bayou Care Navigator
- Cancer Krewe
- Second Line
- LASpot

Again, alignment is **not proof** of AI generation.

## Prompt stage 3 — ask for patient-friendly names

Likely output style:

```text
CareCrab
Tomorrow
Compass
Ready
Hope
Guide
Navigator
```

Observed:

- CareCrab
- Tomorrow
- Project Compass
- OncoReady

## Prompt stage 4 — ask for a "technical/clinical" differentiated project

Likely output:

```text
predictive risk
functional biomarker
remote monitoring
digital vital sign
wearable sensor
```

Observed:

- Functional Vital Sign

## Prompt stage 5 — ask for a 10-minute live demo

AI naturally recommends:

- chatbot
- timeline
- dashboard
- risk score
- map
- alert
- caregiver view
- sensor input

That is exactly why hackathon products often converge visually.

---

# 17. What OncoReady already does better than a generic AI-generated cancer app

From the current OncoReady repository, the following differentiation is already strong:

## 17.1 Fixed treatment anchor

The workflow is centered on:

```text
Tomorrow's infusion
```

not an undefined "cancer journey."

## 17.2 Deterministic clinical safety boundary

Patient words remain intact.

AI does not:
- diagnose
- downgrade urgency
- clear treatment
- change treatment

Clinical concerns route to a named human.

## 17.3 Split ownership

One patient message can become:

```text
Clinical concern → triage nurse
Transportation → navigator
```

That is more realistic than sending everything to one generic AI agent.

## 17.4 Closure semantics

The system does not stop at:

```text
resource recommended
```

It models:

```text
owner
deadline
action
acknowledgment
closure
```

## 17.5 Caregiver data minimization

The caregiver receives only allowed logistics information rather than blanket clinical access.

## 17.6 Causal audit timeline

The state change is explainable:

```text
patient report
→ task
→ human action
→ confirmed ride
→ patient acknowledgment
→ readiness state
```

These should become the stars of the finals demo.

---

# 18. Current OncoReady credibility gaps exposed by the repository

This is the most important internal section.

The repository documents that several things are still future/simulated:

- no production backend
- no live SMS/voice
- no live Ochsner/Epic/FHIR connection
- no production transport booking/capacity
- no durable multi-user audit store
- low-connectivity behavior is future scope
- validated synthetic FHIR export is future scope
- failure paths are future scope
- Storm Mode is future scope

At the same time, some marketing/pricing UI uses phrases like:

- "Automated T-24h Patient SMS Screening"
- "FHIR Mapping Workspace"
- "Automated Medical Transit API"

That creates a finals risk.

A judge can ask:

> "Is that actually connected?"

If the answer is no, the product can suddenly feel like a polished mock-up.

---

# 19. Highest-value OncoReady upgrade plan

## P0 — implement before any broad new feature

### P0.1 — Validated synthetic FHIR export

Current plan already calls for it.

Make the final readiness event export a real FHIR R4 bundle.

Suggested resources:

```text
Patient
Appointment
QuestionnaireResponse
Task
Communication
PractitionerRole
RelatedPerson
Consent
Provenance
```

Then show:

```text
Download FHIR Bundle
✓ Schema/profile validation passed
```

Do not claim live Epic/Ochsner connectivity.

### Why this matters

BayouCare can show a lot of UI.

OncoReady should show:

> "Our core workflow has a real interoperability contract."

---

## P0.2 — Make operational metrics computed, not fixture-only

Derive metrics directly from the append-only event stream:

```text
Time to owner
Time to first action
Time to closure
Open blockers at T-24
Open blockers at T-12
Open blockers at T-4
% with patient acknowledgment
SLA breaches
```

Do not show fake "42 min" as if measured from a deployment unless clearly labeled synthetic.

Use seeded cases so the dashboard still looks populated.

---

## P0.3 — Implement the failure path

Current golden path proves success.

Judges often attack success-only demos.

Add:

```text
Transport resource unavailable
        ↓
attempt recorded
        ↓
fallback resource
        ↓
if still unresolved:
escalate to navigator lead
```

And:

```text
Clinical task unacknowledged
        ↓
SLA breach
        ↓
escalation
        ↓
readiness stays unresolved
```

This is much more technically impressive than another feature card.

---

## P0.4 — Add a truthful pharmacy/compounding readiness gate

Do **not** say:

> "Chemotherapy is mixed the night before."

That is too broad.

Evidence shows oncology pharmacies balance:
- advance preparation and shorter patient wait times
- against waste when treatment is changed/cancelled
- while some expensive/short-expiration products use just-in-time preparation

Sources:

- Preparation policy tradeoff:  
  https://www.sciencedirect.com/science/article/abs/pii/S0305048311000685
- Advanced preparation reduced turnaround time but produced waste in the studied program:  
  https://pubmed.ncbi.nlm.nih.gov/32970518/
- Pharmacist checks before mixing reduced anticancer drug discard in one study:  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC9847088/
- ISOPP standards discuss just-in-time production for expensive/short-expiration products:  
  https://doi.org/10.1177/10781552211070933

### Better OncoReady model

Add a pharmacy node:

```text
PHARMACY PREP STATUS

Awaiting readiness review
        ↓
Clinical review complete
Transportation confirmed
        ↓
Ready for pharmacy review
```

Important wording:

> **OncoReady does not instruct pharmacy to compound or hold chemotherapy. It surfaces readiness state before the site's own pharmacy preparation decision.**

That answers the likely attack:

> "Not all doses are mixed the night before."

Correct. Your system is not dependent on that assumption.

---

## P0.5 — Fix any marketing language that implies live integrations

Either implement a real sandbox adapter or relabel it.

Examples:

Instead of:

```text
Automated Medical Transit API
```

Use:

```text
Transportation Adapter
Simulated provider in training environment
```

Instead of:

```text
Automated T-24h SMS Screening
```

If not actually sent:

```text
T-24h SMS Workflow
Sandbox delivery simulation
```

Instead of:

```text
FHIR Integration
```

Use:

```text
FHIR R4 Mapping + Validated Export
```

Truthfulness is a competitive advantage in healthcare.

---

# 20. P1 — upgrades that make the demo hard to attack

## P1.1 — 20–50 seeded treatment cases

Current product is strongest on Maria's fully interactive case.

Add a queue of seeded cases:

```text
READY
RIDE BLOCKED
CLINICAL REVIEW
MEDICATION ACCESS
CAREGIVER ISSUE
MULTI-BARRIER
SLA BREACH
```

Now judges see:

> This is an operating model, not one scripted patient.

---

## P1.2 — Readiness prioritization vs FIFO

Show two queue modes:

```text
FIFO
vs
Treatment-risk / deadline priority
```

Example:

```text
Patient A
appointment in 2 days
one transport blocker

Patient B
appointment in 4 hours
clinical review pending
```

OncoReady should place B first.

This is more defensible than an opaque AI risk model because the prioritization logic can be explained.

---

## P1.3 — Low-connectivity proof

You do not need a full offline sync engine.

A credible finals demo could show:

```text
network unavailable
    ↓
patient completes minimal local check
    ↓
queued
    ↓
connectivity returns
    ↓
submission syncs once
```

Or show an SMS-style fallback.

This connects directly to rural Louisiana without turning OncoReady into a generic rural-resource app.

---

## P1.4 — One-click Readiness Packet

Generate a human-readable summary:

```text
Treatment: tomorrow 9:00 AM
Clinical concern: reviewed by Sarah, RN
Disposition: documented
Transport: confirmed
Caregiver projection: sent
Patient acknowledgment: received
Outstanding blockers: 0
Audit events: 8
```

Export:
- PDF/print view
- JSON
- FHIR bundle

This gives judges a concrete artifact.

---

## P1.5 — Live privacy proof

In 30 seconds:

```text
Staff view:
fever + nurse note + transport

Patient view:
own concern + plan

Caregiver view:
pickup time + vehicle only
```

Then search the caregiver DOM/output for the clinical phrase and show it is absent.

Given the team's security background, this can become a memorable technical credibility moment.

---

# 21. P2 — useful only after the core is flawless

- Storm Mode
- multilingual clinical content
- real Twilio
- external resource APIs
- richer resource capacity
- additional barrier classes
- AI summarization

Do these only if P0/P1 are finished.

---

# 22. Features OncoReady should NOT add just because competitors have them

Avoid:

- generic cancer chatbot
- clinical trial matcher
- survivorship dashboard
- parish screening heat map
- broad medication tracker
- generic hospital finder
- full symptom-prediction model
- prevention calculator
- community social feed

BayouCare already occupies the broad-platform lane.

Adding these makes OncoReady less memorable.

---

# 23. The strongest possible finals demo

A three-minute core product demo should feel like a causal chain, not a tour.

```text
1. "Maria has chemotherapy tomorrow at 9."

2. Patient check:
   "My ride cancelled."
   "I have a new clinical concern."

3. Submit once.

4. The system visibly splits:
   Clinical → Sarah, RN
   Transportation → Marcus, Navigator

5. Readiness Graph turns from one event into two owned dependencies.

6. Show pharmacy:
   "Awaiting readiness review."
   Explain that OncoReady does not make the compounding decision.

7. Nurse records review/disposition.
   Original patient words remain visible.

8. Navigator's first ride provider is unavailable.
   Fallback path activates.

9. Ride confirmed.

10. Caregiver receives ONLY pickup logistics.

11. Maria acknowledges.

12. Graph becomes:
    PLAN CONFIRMED

13. Metrics update:
    owner time
    closure time
    SLA
    unresolved blockers = 0

14. Export:
    validated FHIR bundle / readiness packet
```

That is much harder to dismiss as a dashboard.

---

# 24. Likely judge attacks and prepared answers

## "All chemotherapy isn't compounded the night before."

Answer direction:

> Correct. OncoReady does not assume that. Preparation timing varies by drug and site. We surface unresolved readiness before the site's pharmacy decision point. Pharmacy retains authority over whether and when to prepare the medication.

---

## "Why not just use MyOchsner?"

Answer direction:

> Existing portals are communication channels. OncoReady is an orchestration layer around one time-sensitive treatment event: one report can become multiple owned tasks, each with a deadline and closure evidence, while the patient and authorized caregiver receive different views.

---

## "Why not an AI navigator?"

Answer direction:

> A navigator can recommend what to do. Our key problem is whether something was actually owned and closed before treatment. OncoReady measures that operational loop.

---

## "Is the clinical triage AI?"

Answer direction:

> No. The patient's words are preserved and routed to a named clinical reviewer. AI does not downgrade urgency, diagnose, or clear treatment.

---

## "Is the FHIR connection live?"

Best answer after P0.1:

> The demo exports a validated synthetic FHIR R4 bundle. We are not claiming a live Ochsner/Epic connection. The export proves the workflow has an interoperability contract that can be integrated later.

---

## "Is the ride booking real?"

Answer direction:

> The finals environment uses a simulated transportation adapter. The key technical behavior being demonstrated is resource selection, failure, fallback, ownership, confirmation, and patient acknowledgment—not a claim that we are already contracted with a transportation network.

---

# 25. Competitive matrix after recommended upgrades

| Capability | Generic Navigator | BayouCare | Functional Vital Sign | Cancer Krewe | OncoReady upgraded |
|---|---:|---:|---:|---:|---:|
| Patient education | High | High | Low | Medium | Low |
| Whole-journey breadth | Medium | **Very high** | Low | Medium | Low |
| Objective monitoring | Low | Medium | **Very high** | Low | Low |
| Community support | Medium | Medium | Low | **High** | Medium |
| Next-treatment focus | Low | Medium | Medium | Low | **Very high** |
| Named ownership | Medium | Medium | Low | Medium | **Very high** |
| Deadline/SLA | Low | Medium | Low | Low | **Very high** |
| Failure/fallback proof | Low | Medium | Medium | Low | **Very high** |
| Caregiver data minimization | Low | Medium | Low | Low | **Very high** |
| Auditability | Low | Medium | Medium | Low | **Very high** |
| Interoperability proof | Medium | Medium | Low | Low | **High** |
| Human clinical authority | Variable | Variable | Clinical | Variable | **Explicit** |
| Pharmacy timing relevance | Low | Medium | Low | Low | **High** |

---

# 26. The final OncoReady positioning

Do not pitch:

> "AI for cancer care."

Do not pitch:

> "A platform for cancer patients."

Do not pitch:

> "We reduce all chemotherapy cancellations."

Pitch:

> **OncoReady is the treatment-readiness coordination layer for time-sensitive oncology care. Twenty-four hours before an infusion, it captures practical and clinical blockers, routes them to different accountable owners, tracks them against the treatment deadline, and proves whether the plan is closed — without allowing AI to make clinical decisions.**

Shorter:

> **Catch what could derail tomorrow's treatment, give it an owner, and close the loop before the patient reaches the chair.**

---

# 27. OSINT leads for the next pass

If any finalist team member name, screenshot, browser URL, QR code, social profile, or semifinal recording becomes available, the project can usually be traced much more effectively.

Best public sources:

1. **Wayback Machine CDX**
   - exact submitted URL
   - deployment host wildcard
2. **Common Crawl index**
3. **Certificate Transparency**
   - custom domains
4. **urlscan.io**
5. **GitHub commits**
   - unique UI text
   - project tagline
   - API endpoint names
6. **Vercel / Netlify indexed deployment**
7. **Devpost**
8. **LinkedIn posts**
9. **university news / faculty advisor posts**
10. **Google image indexing**
    - logos/screenshots can reveal app names and URLs

Without at least a URL, teammate name, screenshot, or distinctive sentence from the app, exact reverse attribution is much less reliable.

---

# 28. Source appendix

## Official challenge
- https://www.nexusla.org/programs/devdays
- https://www.nexusla.org/articles/nexus-louisiana-and-ochsner-health-launch-devdays-cancer-care-prevention-challenge
- https://form.jotform.com/261948001315148

## BayouCare
- https://github.com/DanOhsaka/bayoucare
- https://github.com/DanOhsaka/bayoucare/blob/main/PROJECT-DESCRIPTION.md
- https://github.com/DanOhsaka/bayoucare/blob/main/demo-script.html
- https://github.com/DanOhsaka/bayoucare/blob/main/COMPETITOR-IDEAS.md
- https://github.com/DanOhsaka/bayoucare/blob/main/CHALLENGE-BRIEF.md

## Elpis
- https://github.com/Nytester/Elpis

## Functional vital sign evidence
- https://pubmed.ncbi.nlm.nih.gov/24812254/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6659254/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC9782382/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12304731/
- https://www.vcom.edu/research
- https://www.vcom.edu/research/research-services-information/research-strategic-plan

## Pharmacy / preparation workflow evidence
- https://www.sciencedirect.com/science/article/abs/pii/S0305048311000685
- https://pubmed.ncbi.nlm.nih.gov/32970518/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC9847088/
- https://doi.org/10.1177/10781552211070933
- https://www.ashp.org/pharmacy-student/career-resource-center/careers-in-health-system-pharmacy/explore-careers/hematology-oncology

## Second-line cultural clue
- https://www.linkedin.com/posts/east-jefferson-general-hospital_cancer-center-second-line-activity-7425324639930798080-mq39

---

# 29. Final action order

If finals work starts immediately:

```text
1. Validated FHIR export
2. Failure / fallback path
3. Computed operational metrics
4. Pharmacy readiness gate
5. Truth-check all live-integration wording
6. Multi-case staff queue
7. Low-connectivity proof
8. Readiness packet
9. Privacy proof
10. Only then add optional polish
```

The winning version of OncoReady should feel **smaller than BayouCare but more operationally real**.

That is the defensible advantage.
