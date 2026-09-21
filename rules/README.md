# Rules

Always-follow guidelines. Unlike skills (loaded on demand) rules are meant to sit in
context, so every file here is deliberately short.

Derived from ECC's `rules/` (MIT) — see [`../ATTRIBUTION.md`](../ATTRIBUTION.md).
ECC ships 12 language directories; ECC-H ships 4, matching its stack packs.

## Structure

```
rules/
├── common/          # language-agnostic — always installed
│   ├── agents.md               # the 14-agent roster and delegation contract
│   ├── code-review.md          # when and how to review
│   ├── coding-style.md         # naming, structure, readability
│   ├── development-workflow.md # the size classifier and the 8 phases
│   ├── git-workflow.md         # branches, conventional commits, PRs
│   ├── hooks.md                # hook events and the 3 profiles
│   ├── patterns.md             # cross-cutting design patterns
│   ├── performance.md          # performance baselines
│   ├── security.md             # security checklist and the trigger list
│   └── testing.md              # the tier-scaled test policy
├── typescript/      # TypeScript / JavaScript
├── react/           # React and Next.js components
├── python/          # Python, incl. FastAPI
└── web/             # browser, accessibility, design quality
```

## How rules reach a project

`/ecch-init` detects the stack and copies **`common/` plus only the matching language
directories** into the project, then links them from the generated `CLAUDE.md`. A Next.js
project gets `common/ + typescript/ + react/ + web/`; a FastAPI project gets
`common/ + python/`.

Rules that do not apply to the project are never copied, so they never cost context.

## The three rules that carry the most weight

1. **`development-workflow.md` § Step 0** — the size classifier. Everything else keys off
   the tier it assigns.
2. **`security.md` § Security triggers** — the list that forces a tier escalation and a
   security review.
3. **`testing.md` § Test policy by size tier** — smoke test at trivial/small, full TDD at
   standard/large.

## Adding a language

Create `rules/<lang>/` with `coding-style.md`, `patterns.md`, `security.md`, `testing.md`,
and optionally `hooks.md`. Then add a detection row in `scripts/lib/detect.js` so
`/ecch-init` knows when to copy it. Keep each file under ~100 lines.
