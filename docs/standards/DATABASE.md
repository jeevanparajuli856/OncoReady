# Database Standards

- Database changes must be represented by explicit Git-tracked migrations/schema artifacts.
- Migrations should be deterministic, reviewable, backward-compatible where practical, and reversible where practical.
- Protect referential/domain integrity with database constraints where appropriate.
- Review indexes against real query/access patterns; avoid speculative indexing.
- Treat authorization/RLS as part of the security model, not an application convenience.
- Avoid destructive schema changes without an explicit migration/data-backfill/rollback plan.
- Never run destructive production statements without human approval.

## Railway PostgreSQL

- Keep vendor-neutral timestamped SQL in `database/migrations/`.
- Test migrations against an isolated local or temporary PostgreSQL database before deployment.
- Apply reviewed migrations to the explicitly selected Railway development environment through the migration runner; never mutate schema only through a dashboard or ad hoc SQL session.
- Use Railway's private `DATABASE_URL` reference from the API service. Do not expose it to the browser or commit resolved credentials.
- Promote the same reviewed migration sequence deliberately after approval and merge.
