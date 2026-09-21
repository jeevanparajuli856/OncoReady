# Frontend Standards

The frontend is a primary product surface, not a final decorative layer. For new products and major journeys, optimize for a memorable first impression, clear product storytelling, and polished interaction without sacrificing usability or truthful behavior.

## Engineering

- Prefer TypeScript strict mode.
- Never invent backend endpoints.
- Prefer generated API clients from the OpenAPI contract.
- Separate data/state concerns from presentation where practical.
- Avoid embedding secrets in frontend code.
- Add tests for meaningful behavior.

## Frontend design authority

The Codex frontend specialist is the frontend visual and interaction implementation authority inside product, architecture, contract, security, accessibility, performance, brand, and human-defined constraints. For OncoReady, the existing human-approved visual system is one of those binding constraints.

The Codex orchestrator and architecture specialist may specify required behavior and constraints but should not prescribe aesthetic choices unless they are already authoritative.

Within the locked OncoReady system, the frontend specialist owns the coherent implementation of:
- color usage and tokens
- typography/font treatment
- spacing, sizing, radius, borders, shadows, hierarchy
- component presentation and page composition
- responsive presentation
- animations, transitions, easing, and microinteractions
- visual treatment of application states

## Design-system continuity

- Treat the established OncoReady design system and current runtime UI as mandatory, not advisory.
- `docs/design/DESIGN_SYSTEM.md` documents the human-readable system when one is established.
- Runtime tokens/components are the implementation source of truth.
- Reuse existing tokens, primitives, component styling, density, layout character, motion, and responsive behavior for every new surface.
- Do not change global palette/token values, typography, spacing scale, radii, borders, shadows, icons, logo treatment, navigation, theme behavior, or existing page styling without explicit human approval for that exact change.
- `frontend_design_required=true` means design the feature within the locked system; it does not grant permission to select a new aesthetic direction.
- Do not redesign unrelated product surfaces as part of any feature.
- Record baseline and result screenshots at matching viewports. Unapproved visual drift fails frontend review.

## States and interaction quality

Handle as applicable:
- loading
- error
- empty
- disabled
- success
- hover
- focus
- pressed/active

Motion must support comprehension, continuity, or feedback rather than existing only for decoration. Prefer restrained motion, avoid interaction-blocking animation, prevent obvious layout shifts, and honor reduced-motion preferences.

## Accessibility

- Preserve semantic structure and keyboard navigation.
- Keep visible, usable focus treatment.
- Meet the project's required contrast/accessibility target.
- Do not use color as the only carrier of critical state.
- Provide reduced-motion behavior where animation is present.
- Ensure responsive design remains usable at supported viewport sizes.

## Product presentation

- Do not ship obvious starter-template branding, lorem ipsum, or unfinished placeholder states on intended product surfaces.
- Do not label the product as a prototype, resume/portfolio project, toy, practice app, or cheap demo in user-facing surfaces.
- Do not fabricate production claims, users, scale, compliance, or capabilities.
- Make technical results understandable and visually compelling when the product's value depends on data, analysis, or system behavior.
