---
name: project-inception
description: Convert a raw product idea into a focused rapid-product plan, signature experience, minimum credible architecture, and deterministic configuration before implementation tasks exist.
---

# Project Inception

Use for a brand-new product before implementation tasks/worktrees exist.

## Objective

Get from idea to an implementation-ready product plan with the least ceremony that preserves clarity. Optimize for a memorable user experience, real end-to-end behavior, technical credibility, demo reliability, and fast delivery.

## Required outputs

Create/update:
- `docs/PROJECT.md` using `.ai/templates/project.template.md`
- `docs/architecture/SYSTEM.md`
- `.ai/project.json`
- only standards justified by confirmed choices
- ADRs only for significant long-lived approved decisions
- a small dependency-aware backlog of vertical product slices

## Product framing that must be explicit

Identify:
1. the real problem and intended user
2. the hero/primary user journey
3. what should be memorable in the first 30 seconds
4. visual hook, interaction hook, and data/storytelling hook
5. technical credibility hook: the real engineering that makes the product more than a static UI
6. minimum backend/database/integration needed to support that journey
7. what technology/production complexity should deliberately NOT be built
8. the exact demo-critical path that must remain reliable
9. ideally 2–5 initial vertical slices, not a long horizontal subsystem backlog

Do not call the user-facing product a prototype, resume project, portfolio project, toy, practice app, or cheap demo. Do not make false production claims either.

## Information classes

Keep explicit:
- Confirmed
- Assumption
- Recommendation
- Open question

Never silently convert assumptions/recommendations into confirmed requirements.

## `.ai/project.json`

This is operational configuration, not duplicate product prose.

- keep `delivery.mode: RAPID_PRODUCT`
- keep `delivery.production_hardening: RISK_BASED`
- set `INCEPTION_DRAFT` while material choices remain unresolved
- resolve component `enabled` flags before `INCEPTION_READY`
- record technologies/providers only when selected
- configure only useful verification/security commands for the selected stack
- prefer fast build/lint/typecheck/critical-path checks over exhaustive suites at inception

## Architecture restraint

Do not add DB, Redis, queues, Kubernetes, Terraform, microservices, auth, observability stacks, or other infrastructure unless the product behavior or a deliberate technical objective needs them.

A credible simple architecture is better than ornamental complexity.

## Human decision policy

Stop only for material unresolved choices affecting product scope/behavior, platform/vendor, sensitive data/trust, significant cost, or required external credentials/access.

## Prohibited during inception

Do not:
- implement production code
- create feature tasks/worktrees
- fabricate contracts for speculative features
- invent a stack merely to fill templates
- expand the backlog with low-value production hardening before the core journey exists

## Completion

```text
STATUS: <INCEPTION_DRAFTED | DECISION_REQUIRED | INCEPTION_READY>
RESULT: <one concise sentence>
FILES: <comma-separated key files>
NEXT_MODE: <AUTOMATIC | HUMAN_ACTION_REQUIRED | COMPLETE>
NEXT: <one concrete next action>
```
