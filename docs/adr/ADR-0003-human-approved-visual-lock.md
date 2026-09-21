# ADR-0003 — Human-Approved Visual Lock

## Status

Accepted — September 21, 2026

## Context

The current OncoReady interface is already human-approved and is a core product asset. New launch capabilities must not cause future agents or implementation teams to reinterpret, rebrand, or restyle it.

## Decision

Treat the current runtime UI and `docs/design/DESIGN_SYSTEM.md` as a locked visual compatibility contract.

- Preserve global palette and token values, typography, spacing scale, radii, borders, shadows, iconography, logo treatment, navigation character, theme behavior, component styling, layout character, motion, and responsive behavior.
- Build new surfaces by reusing the existing runtime tokens and component primitives.
- `frontend_design_required=true` authorizes feature composition inside the existing system, not a new visual direction.
- Do not restyle existing pages or change a global visual rule without explicit human approval for the exact proposal.
- Accessibility fixes remain required and use the smallest visual delta; materially visible changes require approval.
- Every affected frontend task captures matching before/after screenshots. Unapproved visual drift fails frontend review.

## Alternatives Considered

- Allow each feature's frontend specialist to choose a new direction: rejected because it fragments the product and overrides human approval.
- Freeze all frontend code: rejected because new states and capabilities still need implementation and accessibility maintenance.
- Rely only on informal review: rejected because future agents need durable, inspectable constraints.

## Consequences

### Positive

- Product identity remains coherent across new Epic and workflow surfaces.
- Future coders have a clear boundary between functional extension and redesign.
- Visual review becomes a compatibility gate rather than a subjective restyling pass.

### Negative

- Some new components require more careful composition from existing primitives.
- Global visual improvements must pause for explicit human approval.

### Security Implications

- None directly. Accessibility and truthful status presentation remain mandatory and cannot be waived by the visual lock.

### Operational Implications

- Frontend design reports include baseline evidence and a no-drift statement.
- Final review checks screenshot parity for locked global styling in addition to functional behavior.
