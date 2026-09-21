---
name: ship-add-feature
description: Orchestrate building a brand-new feature end to end — research, plan, TDD implementation, review, and gated commit — by delegating each phase to the matching ECC-H agent. Use when adding a capability that does not exist yet.
metadata:
  origin: ECC-derived
  upstream: skills/orch-add-feature
---

# ship-add-feature

Actor · action · target: **ship · add · feature**. Thin wrapper over the shared
engine in [`ship-pipeline`](../ship-pipeline/SKILL.md).

## When to Use

- The user wants a capability that does **not exist yet** ("add", "build",
  "implement", "support …").
- It is net-new behavior — not a correction (`ship-fix-defect`) and not an
  alteration of existing behavior (`ship-change-feature`).

## Operation settings

- **Default size floor:** standard — run Research + Plan unless clearly small.
- **Phase mask:** 0 → 1 → 2 → 4 → 5 → 6 (+ 7 when the feature is on the demo path).
  Skip 3 Scaffold; that is MVP-only.
- **First move (phase 4):** at standard/large, write *new* failing tests for the
  new behavior, then implement to green. At trivial/small, implement first and
  then add one happy-path `smoke-test`. The tier decides — see
  [`ship-pipeline`](../ship-pipeline/SKILL.md) § Test policy by tier.

## How It Works

1. Run the `ship-pipeline` engine with the settings above.
2. Classify size first; small / trivial features collapse toward 4 → 5 → 6.
3. Stop at **Gate 1** (plan approval) and **Gate 2** (pre-commit).
4. Add `security-reviewer` if the feature touches a security trigger.

> Related: `/feature-dev` is a standalone version of this flow. `ship-add-feature`
> differs by sharing the `ship-pipeline` engine — the size classifier and the two
> gates — with the rest of the family, so it right-sizes trivial features to 4 → 5 → 6.

## Example

```
ship-add-feature: add OAuth2 login to nws-poller
→ research existing auth libs → plan task_list  [GATE 1: approve]
→ auth trips a security trigger → forced to standard → TDD each task
→ code-reviewer + security-reviewer
→ commit  [GATE 2: confirm]
```
