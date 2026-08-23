# Operator quickstart

The repository carries the workflow; the human should not need a giant prompt for every phase.

## Brand-new product

Tell Codex:

```text
This is a brand-new product. Treat my idea as PROJECT INCEPTION.
Follow AGENTS.md and the project-inception skill.
Optimize for a memorable hero journey, real end-to-end functionality, strong technical credibility, exceptional frontend presentation, demo reliability, and rapid delivery.
Keep architecture and backlog small; prefer vertical slices and avoid unnecessary production hardening.
Do not implement or create tasks yet.
Continue automatically unless a material decision genuinely requires me.
```

## Approve first slice

```text
Approve <TASK-ID> as the first implementation slice.
Proceed using AGENTS.md and the task-orchestration skill.
Keep the slice end-to-end and use only the contract/test/security depth architecture actually requires.
Continue automatically until human action is genuinely required.
```

## Lifecycle

```text
PROPOSED → PLANNING → BUILD_READY → IMPLEMENTATION → INTEGRATION → REVIEW → DONE
```

Architecture chooses whether contracts, independent testing, and dedicated security review are required.

## Start Gemini — design-required task

When Codex says `frontend_design_required=true`, open the prepared frontend worktree and tell Gemini:

```text
Perform the frontend design pass for <TASK-ID>. Follow AGENTS.md and GEMINI.md.
Create a distinctive, polished product experience consistent with the product identity and hero journey.
Do not implement production frontend code yet. Return control after frontend-design-report.json is DESIGN_READY.
```

Return to Codex:

```text
Gemini completed the design pass for <TASK-ID>. Review it for compatibility only, bind approval to its exact design digest, and continue orchestration.
```

After Codex commits APPROVED design review, return to the same Gemini frontend worktree:

```text
Continue <TASK-ID> with frontend implementation. Sync the feature-branch review, verify the design gate, then implement the approved design and complete frontend-report.json.
```

Gemini uses:

```bash
python scripts/agentctl.py worktree sync <TASK-ID> frontend
python scripts/agentctl.py frontend design-gate <TASK-ID>
```

## Start Gemini — established design

When `frontend_design_required=false`:

```text
Implement frontend for <TASK-ID> using the established design system. Follow AGENTS.md and GEMINI.md. Preserve product polish and complete all relevant interaction states.
```

## Return from Gemini

```text
Gemini finished/stopped <TASK-ID>. Read frontend-report.json, integrate its worker branch, and continue orchestration.
```

## After final review and merge

```text
The feature branch/PR for <TASK-ID> is approved and merged. Perform post-merge closure.
```
