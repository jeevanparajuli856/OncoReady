# Agent Orchestration

> Derived from ECC `rules/common/agents.md`. The roster is ECC-H's 14 agents.

## Available agents

| Agent | Purpose | When to use |
|-------|---------|-------------|
| `planner` | Implementation planning | Phase 2 of `ship-pipeline`; any standard/large work |
| `architect` | System design, scalability | Structural decisions, new modules, data model changes |
| `code-explorer` | Trace how existing code works | Phase 0/1 before touching unfamiliar code |
| `docs-lookup` | Live API/library docs via Context7 | Before writing any third-party integration code |
| `tdd-guide` | Red-green-refactor | Phase 4 at standard/large tier |
| `code-reviewer` | Quality and maintainability review | Phase 5, after any code is written |
| `security-reviewer` | Vulnerability detection | Phase 5 whenever a security trigger is touched |
| `typescript-reviewer` | TypeScript/JavaScript review | TS/JS repos, in place of the generic reviewer |
| `database-reviewer` | Postgres/Supabase schema and query review | Schema changes, RLS policies, slow queries |
| `build-error-resolver` | Fix build and type errors | Whenever the build breaks |
| `silent-failure-hunter` | Find swallowed errors and dead catch blocks | Before shipping; when behavior is wrong but nothing throws |
| `e2e-runner` | End-to-end Playwright testing | Critical user flows at large tier |
| `refactor-cleaner` | Dead code cleanup | Phase 6 of `ship-refine-code` |
| `doc-updater` | Documentation and README upkeep | After a feature changes public behavior |
| `e2e-runner` | Drive the running app and write durable Playwright tests | Phase 7 (Verify-live), via the `browser-qa` skill |

## Immediate agent usage

No user prompt needed:

1. Standard or large feature request → **planner**
2. Code just written or modified → **code-reviewer**
3. Diff touches a security trigger → **security-reviewer**
4. Build or typecheck fails → **build-error-resolver**
5. Unfamiliar code about to be changed → **code-explorer**
6. Third-party API about to be called → **docs-lookup**

## Parallel task execution

Use parallel execution for independent operations:

```markdown
# GOOD
Launch 3 agents in parallel:
1. code-explorer: trace the existing auth flow
2. docs-lookup: confirm the Supabase SSR client API
3. code-explorer: map where session state is read

# BAD
Sequential when the tasks share nothing
```

## Delegation completion contract

Applies to every agent at every depth (parent, child, grandchild):

1. **Your final message IS the deliverable.** Never end your turn with "waiting for
   background agents" — a spawned task is not a completed task. Ending your turn while
   children are running orphans their results.
2. **If you delegate, you own collection.** Wait for results, integrate them, then return.
   Fire-and-forget delegation is forbidden.
3. **Decompose only when the work cannot fit in one context.** Do not re-delegate a task
   already sized for a single agent — depth is an outcome, not a plan.

> Rationale (observed upstream): research agents followed the parallel-execution rule,
> spawned children, and returned "waiting" as their final answer. All children completed
> successfully but their results were orphaned. The parallel rule without a completion
> contract produces zombie tasks.

## Agent budget

ECC-H is built for solo, fast work. Delegation costs a round trip and a fresh context.

- **trivial / small tier** — do the work inline. Delegate only to `build-error-resolver`
  when the build actually breaks.
- **standard tier** — `planner` for Phase 2, `code-reviewer` for Phase 5. Others on demand.
- **large tier** — full roster as the pipeline calls for it.

Do not spawn an agent to answer a question you can answer with one Grep.

## Multi-perspective analysis

For genuinely ambiguous decisions use the `council` skill (four adversarial voices) rather
than hand-rolling multiple reviewer agents. For output that must clear two independent
reviewers before shipping, use `santa-method`.
