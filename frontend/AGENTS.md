# Frontend Agent Instructions

These rules specialize the root `AGENTS.md`.

- Follow `GEMINI.md` for Gemini-specific behavior and frontend design authority.
- Use the approved API contract when the task declares one; otherwise consume only existing authoritative interfaces and never invent endpoints.
- Read and preserve the established design system when present.
- When architecture marks `frontend_design_required=true`, complete the Gemini design pass and Codex compatibility gate before production frontend coding.
- Prefer generated API clients where practical.
- Preserve accessibility and reduced-motion behavior.
- Handle loading, error, empty, disabled, and success states.
- Do not silently modify backend, security, architecture, or contract scope.
- Do not let non-authoritative aesthetic suggestions override Gemini's approved frontend design.
