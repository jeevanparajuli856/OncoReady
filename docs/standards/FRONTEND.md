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

Gemini is the frontend visual and interaction design authority inside product, architecture, contract, security, accessibility, performance, brand, and human-defined constraints.

Codex may specify required behavior and constraints but should not prescribe aesthetic choices unless they are already authoritative.

Gemini owns the coherent choice and implementation of:
- color usage and tokens
- typography/font treatment
- spacing, sizing, radius, borders, shadows, hierarchy
- component presentation and page composition
- responsive presentation
- animations, transitions, easing, and microinteractions
- visual treatment of application states

## Design-system continuity

- Prefer the established design system over per-feature invention.
- `docs/design/DESIGN_SYSTEM.md` documents the human-readable system when one is established.
- Runtime tokens/components are the implementation source of truth.
- Extend the design system only when the task justifies it; document the extension in the design report.
- Do not redesign unrelated product surfaces as part of a narrow feature.

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
