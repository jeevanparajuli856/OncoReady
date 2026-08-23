---
name: security-review
description: Perform a focused independent review only when architecture marks security_review_required=true, concentrating on the task's actual trust boundaries.
---

# Security Review Workflow

First read `architecture-report.json.execution.security_risk` and the stated task trust boundaries. Do not turn a narrow product slice into a generic compliance exercise.

Review only applicable areas such as:
- authentication/authorization and ownership checks
- secrets/credentials
- sensitive data/privacy
- untrusted input, injection, file handling, SSRF/deserialization
- database/RLS authorization
- consequential external actions and tool permissions
- abusive/destructive endpoints
- logging of secrets/sensitive data
- dependency/configuration risk when material to the change

Baseline rules always prohibit committed secrets, frontend-only protected authorization, obvious injection, unrestricted destructive actions, unsafe production access, and unjustified TLS disabling.

Do not modify production code. Write only `security-report.json` and set `reviewed_commit` to exact `git rev-parse HEAD`.

Use `APPROVED` only when no unresolved blocking finding remains. Run `python scripts/agentctl.py scope check <TASK-ID> security` before handoff when applicable.
