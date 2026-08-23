# Project Definition

> This document defines the product, its signature experience, the minimum real engineering needed to support it, and the delivery boundaries that keep development focused.
>
> Classification labels:
> - **Confirmed** — explicitly established
> - **Assumption** — temporary working assumption
> - **Recommendation** — proposed choice awaiting approval where material
> - **Open question** — unresolved item

## 1. Product Identity

### Product name

[Real product name]

### One-sentence description

[What the product does and for whom.]

### Status

[Inception / Active / Maintenance]

### Product presentation rule

The internal development process may optimize aggressively for speed, but user-facing surfaces and normal product descriptions must present the software as the real product it is. Do not use labels such as prototype, resume project, portfolio project, toy, practice app, or cheap demo. Do not invent production claims that are not true.

---

## 2. Problem Statement

### Confirmed

- [Real problem]

### Assumptions

- [Working assumption]

---

## 3. Intended Users and Outcome

| Actor / User | Need | Desired outcome |
|---|---|---|
| [Actor] | [Need] | [Outcome] |

### Primary product outcome

[What meaningful result should the user get?]

### Non-goals

- [Explicitly not building]
- [Production complexity intentionally deferred unless needed]

---

## 4. Hero User Journey

Describe the single most important path through the product.

```text
[Entry]
  ↓
[Meaningful action/input]
  ↓
[Real system processing]
  ↓
[Compelling result]
  ↓
[Exploration/action]
```

### Demo-critical path

[Exact 60–120 second journey that must work reliably.]

### Failure states that must still feel complete

- [Loading/error/empty/input validation/etc.]

---

## 5. Product Impression Strategy

### First 30-second impression

[What should a new viewer immediately understand and remember?]

### Visual hook

[Distinctive visual idea; Gemini owns its execution.]

### Interaction hook

[Interaction/motion/microinteraction that makes the product feel alive/useful.]

### Data / storytelling hook

[Chart, timeline, graph, report, map, score, comparison, transformation, etc.]

### Experience principles

- [Principle]
- [Principle]

---

## 6. Technical Credibility

### Core real engineering capability

[What proves this is more than a static frontend?]

Examples: meaningful API integration, AI/ML pipeline, security analysis, graph processing, real-time behavior, data pipeline, computer vision, RAG, agent orchestration, non-trivial algorithm, or another problem-relevant capability.

### Minimum real backend / data / integration

- [Needed capability]

### Technology that must earn its place

| Technology / subsystem | Needed? | Product/technical reason |
|---|---:|---|
| Database | Yes/No | [Reason] |
| Authentication | Yes/No | [Reason] |
| External API | Yes/No | [Reason] |
| Queue/cache/realtime | Yes/No | [Reason] |
| IaC/container platform | Yes/No | [Reason] |

Do not add complexity solely to make the architecture look sophisticated.

---

## 7. Core Capabilities

### Confirmed

- [Capability]

### Recommended / proposed

- [Capability]

---

## 8. Scope

### In scope

- [Item]

### Out of scope

- [Item]

### Future / possible scope

- [Item]

---

## 9. Functional Requirements

### Confirmed

- [Requirement]

### Assumptions

- [Requirement assumption]

---

## 10. Quality and Non-Functional Requirements

Consider only what materially affects the product:
- responsiveness/accessibility
- demo-critical reliability
- performance where visible
- security/privacy where trust boundaries exist
- maintainability sufficient for iteration
- cost constraints

### Confirmed

- [Requirement]

### Recommended

- [Recommendation]

---

## 11. Data, Privacy, and Trust Boundaries

### Data involved

- [Data category]

### Sensitive / regulated data

- [Known or none]

### Trust boundaries

- [Meaningful boundary]

### Baseline safety requirements

- no committed/exposed secrets
- authorization must be server/data enforced when protected actions exist
- untrusted input must not create obvious injection/destructive behavior
- production credentials/data/tools remain outside normal agent workflows

### Open questions

- [Only material privacy/security question]

> Do not claim regulatory compliance unless independently established.

---

## 12. External Systems and Integrations

| System / Provider | Purpose | Status |
|---|---|---|
| [System] | [Purpose] | Confirmed / Proposed / Unknown |

---

## 13. Architecture Shape

Summarize the smallest credible architecture for the hero journey.

```text
[Frontend]
   ↓
[API/service if needed]
   ↓
[DB/external system/model if needed]
```

### Deliberately avoided complexity

- [Technology/pattern not justified]

---

## 14. Delivery Strategy

Prefer 2–5 vertical slices that each create a demonstrable user outcome.

| Order | Task ID | Vertical slice | User-visible outcome | Depends on |
|---:|---|---|---|---|
| 1 | CORE-001 | [Hero journey] | [Outcome] | — |
| 2 | INSIGHT-001 | [Second capability] | [Outcome] | CORE-001 |
| 3 | POLISH-001 | [Experience polish] | [Outcome] | CORE-001 |

Avoid separate database/backend/frontend tasks unless they genuinely need independent sequencing.

### Recommended first slice

**[TASK-ID] — [Title]**

Reason: [Why this produces the fastest meaningful end-to-end product result.]

---

## 15. Stop Condition

The product/slice is complete when:
- the hero journey works end to end
- meaningful core behavior is real
- intended surfaces are visually complete and responsive
- demo-critical flow is reliable
- selected test/security depth is satisfied
- setup/documentation is sufficient
- no high-value planned requirement is still obviously missing

Do not keep adding production hardening or infrastructure after this point unless it enables a defined product goal or fixes a material risk.

---

## 16. Success Criteria

- [Observable product outcome]
- [Demo reliability outcome]
- [Technical capability outcome]
- [Experience quality outcome]

---

## 17. Assumptions Register

| ID | Assumption | Why needed | Validation needed |
|---|---|---|---|
| A-001 | [Assumption] | [Reason] | [How/when] |

---

## 18. Recommended Decisions

| ID | Recommendation | Rationale | Human approval needed? |
|---|---|---|---|
| R-001 | [Recommendation] | [Reason] | Yes / No |

---

## 19. Open Questions

| ID | Question | Why it matters | Blocks first slice? |
|---|---|---|---|
| Q-001 | [Question] | [Impact] | Yes / No |

---

## 20. Project-Level Decisions Already Approved

- [Decision]

---

## 21. Related Repository Documents

- `docs/architecture/SYSTEM.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/adr/`
- `docs/standards/`
- `contracts/`
- `.ai/tasks/`
