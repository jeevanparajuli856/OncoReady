# jee-agentic-dev — Rapid Product Baseline

Reusable agentic development baseline for shipping polished, technically credible, end-to-end products quickly.

- Codex orchestrates product slices and owns architecture/database/backend/integration/verification/final review.
- Gemini owns frontend visual/interaction design and frontend implementation in V1 and is manually started by the human.
- Contracts, independent testing, and dedicated security review are conditional rather than mandatory phases.
- Baseline safety, scope isolation, Git evidence, and design-authority gates remain deterministic.
- The framework prefers a small number of vertical user-visible slices over enterprise-style subsystem decomposition.

## Core model

```text
Raw idea
  ↓
Focused product inception
  ↓
Hero journey + product impression strategy + minimum credible architecture
  ↓
Vertical product slice
  ↓
PLANNING → BUILD_READY
        ├─ contract only if needed
        ├─ test depth chosen
        └─ security risk/review chosen
  ↓
DB/backend/Gemini only when impacted
  ↓
Conditional Gemini design pass → compatibility gate → Gemini implementation
  ↓
Integration
  ├─ independent tester only for TARGETED/FULL
  ├─ commit-bound verification always
  └─ security specialist only when required
  ↓
Final product/engineering review
  ↓
Human merge → DONE
```

## Product philosophy

Optimize for:
1. strong idea and user value
2. exceptional frontend/product experience
3. real end-to-end behavior
4. reliable primary demonstration journey
5. visible technical credibility
6. rapid iteration
7. risk-appropriate hardening

Do not add databases, caches, queues, microservices, Kubernetes, IaC, auth, or other complexity unless they support real product behavior or a deliberate technical objective.

The internal rapid-delivery workflow must not cheapen the user-facing product identity. Present products according to the problem they solve and capabilities they genuinely implement; do not make false production claims.

## First-time setup

```bash
python -m pip install -r requirements-agent.txt
python scripts/agentctl.py bootstrap
```

For a new product, give Codex the idea and tell it to use the project-inception skill. Do not create implementation tasks until `.ai/project.json` is `INCEPTION_READY`.

## Main commands

```bash
python scripts/agentctl.py project validate
python scripts/agentctl.py task create CORE-001 "Primary user journey"
python scripts/agentctl.py git prepare CORE-001
python scripts/agentctl.py task advance CORE-001
python scripts/agentctl.py worktree create CORE-001 backend
python scripts/agentctl.py worktree create CORE-001 frontend
python scripts/agentctl.py worktree sync CORE-001 frontend
python scripts/agentctl.py frontend design-digest CORE-001 --ref agent/CORE-001-frontend
python scripts/agentctl.py frontend design-gate CORE-001
python scripts/agentctl.py scope check CORE-001 backend
python scripts/agentctl.py verify CORE-001
```

Normal lifecycle progress uses `task advance`; `task status --force` is recovery only.

## Lifecycle

```text
PROPOSED → PLANNING → BUILD_READY → IMPLEMENTATION → INTEGRATION → REVIEW → DONE
```

Architecture chooses:
- `contract_required`: true/false
- `test_depth`: NONE / SMOKE / TARGETED / FULL
- `security_risk`: LOW / STANDARD / HIGH
- `security_review_required`: true/false

This preserves rigor where it matters without making every slice pay the full process cost.

## Important directories

```text
AGENTS.md                 universal mission/invariants
GEMINI.md                 Gemini frontend authority
.agents/skills/           reusable workflows
.codex/agents/            Codex specialist definitions
.ai/project.json          operational product configuration
.ai/tasks/                task state and durable evidence
contracts/                authoritative interfaces when required
docs/                     product/architecture/standards/ADRs
scripts/                  deterministic control plane
supabase/migrations/      DB migrations when Supabase is selected
tests/agentic/            framework regression tests
```

## Supabase

If selected:
1. use a DEV/TEST Supabase project for agent work
2. configure the DEV project ref in `.codex/config.toml`
3. authenticate with `codex mcp login supabase`
4. use Git-tracked timestamped migrations for schema history
5. use MCP mainly for scoped inspection/verification/advisors/types
6. use synthetic/de-identified development data
7. deploy reviewed migrations to production only through a deliberate human/CI path after merge

Normal agent MCP access must not target production.
commiting last one
committing the last one x4