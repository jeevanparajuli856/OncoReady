# Railway PostgreSQL deployment model

Git-tracked SQL under `database/migrations/` is the schema authority. The
Railway database contains controlled synthetic data only; dashboard edits are
not a substitute for a migration.

## Development and finals

```text
database specialist
  ↓
create timestamped PostgreSQL migration in Git
  ↓
run migration, seed/reset, constraint, ordering, and idempotency tests
  ↓
review the migration and database report
  ↓
apply the reviewed migration through the API service pre-deploy command
  ↓
verify schema state and deterministic seed/reset against Railway Postgres
```

The API service receives `DATABASE_URL` through the Railway reference variable
`${{Postgres.DATABASE_URL}}`; never copy the connection string into source,
chat, screenshots, or frontend variables. Keep Postgres private unless a
temporary operator connection is explicitly required.

## Promotion rule

Apply exactly the committed migration history to each environment in order.
Do not copy development rows into another environment and do not edit
projections by hand to repair a rehearsal. Recovery uses migrations plus the
deterministic scenario seed/reset path.

Production promotion remains a deliberate human/CI action after review and
merge. Confirm the target Railway project, environment, Postgres service, and
backup/recovery posture before applying migrations outside the controlled
finals environment.
