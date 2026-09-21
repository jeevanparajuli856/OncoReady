---
name: ship-pipeline
description: Shared engine for the ship-* skill family. Defines the size classifier, the gated Research-Plan-Implement-Review-Commit-Verify pipeline, the tier-scaled test policy, the agent map, and the two human gates that the ship-* operation skills delegate to. Applies when a ship-* skill delegates its pipeline; not usually invoked directly.
metadata:
  origin: ECC-derived
  upstream: skills/orch-pipeline
---

# Ship Pipeline (shared engine)

The `ship-*` skills are thin wrappers. They do not re-implement any work — they
classify the request, choose which phases of *this* pipeline run, and delegate
each phase to an existing ECC-H agent or command. This file is that pipeline.

> Invoke an operation skill (`ship-add-feature`, `ship-fix-defect`, …) rather
> than this engine directly. This file is the reference they point at.

## When to Use

- Loaded indirectly whenever an `ship-*` operation skill runs.
- Read directly only when adding a new operation to the family or tuning the
  shared phases, gates, or agent map.

## The operation family

| Skill | Operation | Trigger | First move |
|-------|-----------|---------|------------|
| `ship-add-feature` | feature | capability does not exist yet | research + plan a new slice |
| `ship-change-feature` | tweak | works, but desired behavior differs | amend existing behavior *and its tests* |
| `ship-fix-defect` | fix | broken; behavior is wrong | reproduce as a failing test, then fix |
| `ship-refine-code` | refactor | behavior stays, structure improves | restructure while keeping tests green |
| `ship-build-mvp` | mvp | bootstrap from a design/spec doc | ingest doc → vertical slices |

> These wrappers **compose** existing ECC-H commands rather than replace them:
> `/plan`, `/review`, `/fix`, `/gate`, and `/check`, plus the `tdd-workflow` and
> `smoke-test` skills. The ship-* family adds the shared size classifier and the
> two gates on top of them, so one umbrella covers all five operations
> consistently. `/ship` is the entry point that picks the right one for you.

## Step 0 — Classify size (right-sizing)

Ceremony scales to blast radius. Score the request on three signals, take the
**highest** tier any signal reaches, and state the result in one line so the user
can override:

| Tier | Files touched | New dependency / contract | Design ambiguity | Phases that run |
|------|---------------|---------------------------|------------------|-----------------|
| trivial | 1, a few lines | none | none — the change is obvious | 4 → 5 → 6 |
| small | 1 file / 1 function | none | clear once you read the code | (1 light) → 4 → 5 → 6 |
| standard | 2–5 files | maybe a new internal module | one real choice to make | 1 → 2 → 4 → 5 → 6 |
| large | many / cross-cutting | new external dep, public API, or a spec doc | multiple open questions | 1 → 2 → (3) → 4 → 5 → 6 |

Phase 0 (Intake) always runs and is omitted from the mask column above. The
tie-breaker: anything touching a security trigger (below) or a public API /
contract is **at least** standard, regardless of file count.

## The phases

Each phase delegates — it does not do the work inline.

- **0. Intake** — restate the request. For `ship-build-mvp`, read the spec/design
  doc and extract scope, locked decisions, and a feature list.
- **1. Research & Reuse** — per `rules/common/development-workflow.md`: read
  `PROJECT.md` for the locked stack and non-goals, then Context7 / vendor docs
  (`documentation-lookup`), then package registries, then `gh search repos` /
  `gh search code`. Prefer adopting a proven implementation over net-new code.
- **2. Plan** — delegate to the `planner` agent (or `architect` for structural
  decisions). Output a `task_list` ordered as thin vertical slices, **plus the
  cut-line** (below). → **GATE 1.**
- **3. Scaffold** — `ship-build-mvp` only: stand up the first end-to-end slice.
- **4. Implement** — the test policy comes from the tier, not from preference
  (see "Test policy" below). At **standard / large**, drive each task through the
  `tdd-guide` agent or the `tdd-workflow` skill: red → green → refactor. At
  **trivial / small**, implement directly and then write one happy-path test with
  the `smoke-test` skill. Honor the operation's first-move rule either way.
- **5. Review** — `code-reviewer` agent / `/review`. Add `security-reviewer`
  whenever the diff touches a security trigger (below).
- **6. Commit** — conventional commits (`feat:` / `fix:` / `refactor:` / …), one
  per logical chunk. → **GATE 2.**
- **7. Verify-live** — *(ECC-H addition)* boot the app and walk the demo path from
  `PROJECT.md` using the `browser-qa` skill, escalating to the `e2e-runner` agent
  when the path deserves a durable Playwright test. Confirm the path completes and
  the console is clean; use `click-path-audit` when buttons work individually but
  the end state is still wrong. Compiling is not the same as working, and a demo
  that fails live has failed regardless of what the suite says. Runs at **large**
  tier, and any time the change touches a UI surface on the demo path.

## The two gates

This family is **gated, not autonomous**:

1. **GATE 1 — after Plan.** Present the `task_list`; do not write implementation
   code until the user approves.
2. **GATE 2 — before Commit.** Present the diff summary and proposed messages;
   do not commit until the user confirms.

Everything between the gates flows without stopping.

Auto-checkpoint commits made by the Stop hook are **not** Gate 2. They are
recoverable save points on a green tree; the feature commit still needs the
user's approval.

## Test policy by tier *(ECC-H)*

ECC runs full TDD on everything. ECC-H scales the test policy the same way it
scales ceremony — by blast radius — so a one-line change does not pay for a
red-green-refactor cycle, and nothing that matters escapes one.

| Tier | Policy | Skill |
|------|--------|-------|
| trivial | Assert the change if a test for that unit already exists. | — |
| small | One happy-path test, written after GREEN, before "done". | `smoke-test` |
| standard | Full TDD: RED → GREEN → REFACTOR. 80% of the changed surface. | `tdd-workflow` |
| large | Full TDD plus one integration or E2E test through the new path. | `tdd-workflow`, `e2e-testing` |

The escalation rule does the real work here: a security trigger or a public
contract forces the tier to **at least standard**, so auth, payments, user input,
database queries, and secrets always get full TDD no matter how small the diff
looks. You may not talk yourself down a tier because of a deadline. Reclassify
honestly, or say out loud that you are overriding.

## The cut-line *(ECC-H)*

Alongside the `task_list`, Phase 2 partitions the work against the goal and
deadline in `PROJECT.md`:

- **MUST-DEMO** — the demo path does not work without it. Nothing else starts
  until every one of these is green.
- **NICE** — real value, but the demo survives without it. Built only after
  MUST-DEMO is done.
- **CUT** — explicitly not being built. Named out loud so it stops being
  reconsidered every session.

Write the cut-line into `PROJECT.md` under Non-goals (for CUT) and carry
MUST-DEMO into `.ecch/state.json` so `SessionStart` can surface what is still
open. The `scope-guard` skill enforces the line when new ideas arrive mid-build.

A plan without a cut-line is not finished. Under a deadline, deciding what you
will *not* build is the decision that determines whether anything ships.

## Agent / command map

| Phase | Primary | Fallback / escalation |
|-------|---------|----------------------|
| Intake / understand | `code-explorer` | trace existing paths before a tweak, fix, or refactor |
| Plan | `planner` | `architect` for structural calls |
| Implement (standard/large) | `tdd-guide` (or `tdd-workflow` skill) | `build-error-resolver` / `/fix` on build breaks |
| Implement (trivial/small) | inline, then `smoke-test` | `build-error-resolver` / `/fix` on build breaks |
| Review | `code-reviewer` / `/review` | `typescript-reviewer`, `database-reviewer` |
| Security | `security-reviewer` | — |
| Verify-live | `browser-qa` / `/check` | `e2e-runner` for a durable test; `click-path-audit` for wrong end state |
| Stuck for 3+ attempts | `debug-fast` | roll back with `/checkpoint back` and try another angle |

Match the language reviewer to the repo (see the repo's own `CLAUDE.md`).

## Security-review trigger

Pull in `security-reviewer` when the diff touches any of: authentication or
authorization, user-input handling, database queries, file-system paths,
external API calls, cryptography, or secrets / credentials. (Per `rules/common/security.md`.)

## Handoff artifacts

The pipeline carries no hidden state — the planning docs *are* the handoff:

- `task_list` and the cut-line (from Plan) drive the Implement loop.
- MUST-DEMO items go into `.ecch/state.json` so `SessionStart` can surface what
  is still open after a restart or a compaction.
- Durable decisions ("we chose Drizzle over Prisma because …") go to
  `.ecch/memory/` via the `session-memory` skill. A decision no one recorded gets
  re-litigated next session.
- Larger work may also emit PRD / architecture / system_design under `docs/`.
- Review findings (CRITICAL / HIGH) must be resolved before Gate 2.

## Verification

- size tier was stated and matched the work
- Gate 1 (plan) and Gate 2 (commit) were both honored
- `security-reviewer` ran iff a security trigger was touched
- commits are conventional and scoped to one logical change
- new / changed behavior has tests at the level its tier requires, per
  `rules/common/testing.md` — a smoke test at trivial/small, full TDD and 80%
  coverage of the changed surface at standard/large
- the cut-line was stated, and nothing outside MUST-DEMO was built before
  MUST-DEMO was green
- at large tier, or on any UI change to the demo path, Phase 7 actually ran
  against the running app
