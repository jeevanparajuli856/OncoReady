# Contracts

This directory is authoritative for interfaces between system components.

- `openapi.yaml` — HTTP API contract
- `events/` — asynchronous event contracts

For `LAUNCH-001`, the governed files are registered explicitly in
`.ai/tasks/LAUNCH-001/task.json`. The Vite frontend consumes generated
TypeScript client/types, the long-running Railway Node.js service implements the HTTP boundary,
and PostgreSQL events/fixtures must validate against the registered event
schemas.

Frontend and backend implementations must follow these contracts.

Do not silently change a contract during implementation.
