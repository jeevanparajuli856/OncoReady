# Security Standards

Security is risk-based, but baseline safety is always mandatory.

## Always-on guardrails

- never commit credentials, API keys, access tokens, private keys, or real sensitive `.env` files
- protected authorization must not rely only on frontend state
- validate untrusted input at meaningful trust boundaries
- avoid obvious SQL/command/template injection paths
- do not expose unrestricted destructive actions
- do not log secrets or sensitive payloads unnecessarily
- do not disable certificate verification without explicit justification
- use least privilege for DB/cloud/tool access
- normal agent tooling must not target production systems/data

## Task risk levels

### LOW

Public/synthetic/non-sensitive data, no meaningful auth or privileged boundary. Baseline verification is normally sufficient; no dedicated security reviewer.

### STANDARD

Authentication, persisted user data, uploads, meaningful external actions/APIs, or authorization boundaries. Use targeted controls and normally a dedicated review when those boundaries change.

### HIGH

Sensitive/regulated data, payments, privileged/destructive actions, high-consequence external effects, or dangerous input/tool boundaries. Dedicated security review is mandatory.

## Focused review areas when applicable

- authentication/authorization, IDOR/BOLA
- injection and unsafe input/file processing
- SSRF/deserialization
- database/RLS authorization
- secret exposure
- sensitive logging/privacy
- abuse/destructive operations/rate limiting
- dependency/configuration risk
- external tool/MCP permission boundaries

Do not turn LOW-risk product slices into generic compliance exercises.
