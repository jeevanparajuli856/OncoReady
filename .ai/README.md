# `.ai/` task coordination

This directory stores structured, Git-tracked coordination state for the rapid product workflow.

## Single-writer task state

Only the orchestrator modifies `tasks/<TASK-ID>/task.json`. Workers write assigned reports and permitted implementation/test paths.

Architecture reports now contain two kinds of decisions:
- `impacts` — which product/code areas actually require workers
- `execution` — whether contracts, independent testing, and dedicated security review are justified

Conditional specialist report files are still created for a uniform workspace, but an unused tester/security report may remain in template state when architecture does not require that specialist.

## Frontend design authority

For design-required work:
- Gemini writes `frontend-design-report.json`
- Codex writes `frontend-design-review.json` and binds approval to `reviewed_design_sha256`
- Gemini implements the approved design and writes `frontend-report.json`

If Gemini's design report changes after approval, the digest mismatch forces a new compatibility review.

## Do not store here

- chain-of-thought
- secrets/access tokens
- large logs
- temporary model scratchpads
