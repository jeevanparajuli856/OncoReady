# Development Workflow

> Derived from ECC `rules/common/development-workflow.md`. ECC-H keeps every phase and
> both gates, and adds the size classifier that decides which phases actually run.

This file extends [`git-workflow.md`](./git-workflow.md) with the development pipeline
that happens before git operations. The full engine lives in the `ship-pipeline` skill —
this is the always-on summary.

## Step 0 — Classify size before anything else

Ceremony scales to blast radius. Score the request on three signals, take the **highest**
tier any signal reaches, and state the result in one line so the user can override it.

| Tier | Files touched | New dependency / contract | Design ambiguity | Phases that run |
|------|---------------|---------------------------|------------------|-----------------|
| trivial | 1, a few lines | none | none — the change is obvious | 4 → 5 → 6 |
| small | 1 file / 1 function | none | clear once you read the code | (1 light) → 4 → 5 → 6 |
| standard | 2–5 files | maybe a new internal module | one real choice to make | 1 → 2 → 4 → 5 → 6 |
| large | many / cross-cutting | new external dep, public API, or a spec doc | multiple open questions | 1 → 2 → (3) → 4 → 5 → 6 → 7 |

Phase 0 always runs. **Tie-breaker:** anything touching a security trigger (see
[`security.md`](./security.md)) or a public API/contract is **at least standard**,
regardless of file count.

Guessing "trivial" to skip work is a violation of this rule, not a shortcut.

## The phases

**0. Intake** — restate the request in one or two lines. Name the tier.

**1. Research & Reuse** _(standard and large; light at small)_
- **Project brief first:** read `PROJECT.md` for the locked stack, non-goals, and demo path.
- **Live docs second:** Context7 (`documentation-lookup`) or primary vendor docs to confirm
  API behavior and version-specific details before implementing.
- **Package registries third:** search npm, PyPI, crates.io before writing utility code.
  Prefer battle-tested libraries over hand-rolled solutions.
- **Code search when still unclear:** `gh search repos` / `gh search code` for existing
  implementations and adaptable patterns.
- Prefer adopting or porting a proven approach over writing net-new code.

**2. Plan** _(standard and large)_ — delegate to **planner** (or **architect** for
structural calls). Output an ordered `task_list` of thin vertical slices, plus the
**MUST-DEMO / NICE / CUT** cut-line scored against `PROJECT.md`'s goal and deadline.
→ **GATE 1: do not write implementation code until the user approves.**

**3. Scaffold** _(large / MVP only)_ — stand up the first end-to-end slice.

**4. Implement** — test policy comes from the tier (see [`testing.md`](./testing.md)):
smoke test at trivial/small, full TDD via **tdd-guide** at standard/large.

**5. Review** — **code-reviewer** (or the language reviewer). Add **security-reviewer**
whenever the diff touches a security trigger. CRITICAL and HIGH findings must be resolved
before Gate 2.

**6. Commit** — conventional commits (`feat:` / `fix:` / `refactor:` / …), one per logical
chunk. → **GATE 2: present the diff summary and proposed messages; do not commit until
the user confirms.**

**7. Verify-live** _(large; run it any time the app has a UI)_ — boot the app, walk the
demo path from `PROJECT.md` with the **browser-qa** skill (escalating to **e2e-runner**),
confirm zero console errors. Compiling is
not the same as working.

## The two gates

This pipeline is **gated, not autonomous**. Everything between the gates flows without
stopping; the two gates always stop.

Auto-checkpoint commits made by the Stop hook are not Gate 2. They are recoverable
save points, not the user's approval to commit feature work.

## Pre-review checks

Before requesting review:

- All automated checks (CI/CD) pass
- Merge conflicts resolved
- Branch up to date with the target branch

## Handoff artifacts

The pipeline carries no hidden state — the planning docs *are* the handoff:

- `task_list` and cut-line from Phase 2 drive the Implement loop
- Durable decisions go to `.ecch/memory/` via the `session-memory` skill
- Review findings (CRITICAL / HIGH) must be resolved before Gate 2
