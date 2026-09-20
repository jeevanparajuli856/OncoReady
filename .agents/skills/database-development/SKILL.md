---
name: database-development
description: Implement database-impacting tasks using Git-tracked vendor-neutral PostgreSQL migrations and scoped development inspection/verification.
---

# Database Development

Use only when `architecture-report.json.impacts.database=true` and task status is `IMPLEMENTATION`.

## Core rule

Git-tracked migration/schema artifacts are authoritative.

For Railway PostgreSQL, prefer this flow:

```text
inspect the explicitly selected development database
        ↓
create a timestamped migration in database/migrations
        ↓
write migration SQL
        ↓
test against an isolated PostgreSQL database
        ↓
apply pending migrations through the project migration runner
        ↓
inspect and verify resulting development state
        ↓
review RLS/indexes/advisors
        ↓
database-report.json
```

Do not make direct dashboard/MCP schema edits that are not represented by a migration file.

## Railway PostgreSQL rules

- use timestamped migration names and vendor-neutral PostgreSQL where practical
- use an explicitly selected DEVELOPMENT/TEST environment only
- reference the Railway PostgreSQL connection privately from the API service
- infrastructure tooling is primarily for scoped inspection, diagnostics, and verification
- never use an ad hoc SQL/dashboard change as the sole schema implementation
- never connect normal agent tooling to production without explicit human direction
- never use development test data as production seed data

If a disposable PostgreSQL target is unavailable, still create and review the migration and record exactly which live checks were not performed.

## Completion

Update `database-report.json`, including migration files, environment, verification, RLS/index review, advisors, blockers, and backend notes.

Run:

```bash
python scripts/agentctl.py scope check <TASK-ID> database
```

before reporting completion when working on an isolated agent branch.
