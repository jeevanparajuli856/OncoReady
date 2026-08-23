# Backend Agent Instructions

These rules specialize the root `AGENTS.md`.

- Backend owns server-side validation and authorization.
- Keep route/controller handlers thin.
- Keep business logic separated from transport code.
- Use explicit boundary schemas.
- Add implementation-owned tests/checks proportional to behavior and the selected task test depth.
- Do not silently modify `contracts/`.
