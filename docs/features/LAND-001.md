# LAND-001 — Landing Page Brand and Motion Refresh

## User-visible outcome

OncoReady's landing page becomes lighter, clearer, and more memorable while remaining unmistakably an oncology treatment-readiness product. Visitors should understand within the first screen what OncoReady does, feel confident exploring it, and reach the existing workspace without learning a new site structure.

The official OncoReady title logo and favicon become the public brand source of truth. A single signature interactive visual turns the continuity loop, cancer-ribbon form, or Louisiana access story into a responsive field of characters or particles that reacts gently to the pointer and returns to a stable form.

## Product/demo impact

The refreshed page strengthens the first 30 seconds of the product story: identify what could disrupt tomorrow's treatment, show who owns each issue, and invite the visitor into the working readiness journey. It should feel polished enough to hold attention without making motion compete with healthcare information.

The Lovable Invofy reference supplies inspiration for visual mood only: airy composition, oversized editorial hierarchy, soft atmospheric color, rounded light surfaces, and generous pacing. OncoReady keeps its own content, information architecture, workflows, healthcare language, official identity, and signature readiness proof.

## Confirmed human direction and references

- Use the color, theme, spatial rhythm, and visual polish of the Invofy reference as inspiration; do not reproduce its page or component structure.
- Use the official assets in `Logo/oncoready-title-logo.svg`, `Logo/oncoready-title-logo.png`, `Logo/oncoready-favicon.svg`, and `Logo/oncoready-favicon-512.png`.
- Use `UI Suggestion/Animation_when_hoverit_louisiana_log_flare_likePoint.png` as inspiration for a pointer-reactive Louisiana/character field.
- Use `UI Suggestion/hoverAnimation_but_we_should_have_this_for_cancer_theme_kindof.png` as inspiration for a cancer-themed character/particle form.
- Use the screenshots in `UI Suggestion/UIInspiration/` and the supplied Lovable template page only as style references.

## Experience plan

1. **Brand and navigation** — place the official full wordmark in the public header at desktop sizes, use the official compact mark where space is constrained, simplify landing navigation around the existing page destinations, and keep one strong workspace CTA.
2. **Hero** — retain OncoReady's treatment-readiness message and two-column product entry, with a clearer headline, shorter support copy, strong primary CTA, and one live visual proof. Remove or rewrite absolute outcome language such as "Zero Day-Of" so the page makes no unsupported result claim.
3. **Signature continuity field** — introduce one decorative, pointer-reactive character/particle composition related to the continuity loop, cancer ribbon, and Louisiana access story. Nearby characters may flare, repel, or shift through approved brand accents, then settle back with spring-like motion. It must remain understandable and attractive as a still composition.
4. **Product proof** — keep the role workspaces, readiness graph, how-it-works story, Louisiana access story, enterprise model, FAQ, and CTA, but give them a shared light editorial rhythm rather than a collection of unrelated cards. Preserve all existing functional routes and live state projections.
5. **Interaction polish** — add restrained section entrances, card elevation, button feedback, accordion transitions, and navigation states. Use motion to guide attention and explain continuity; avoid constant ambient motion across the whole page.
6. **Responsive and accessible finish** — support mobile, tablet, and presentation-laptop widths; preserve keyboard operation, visible focus, semantic headings, 44px touch targets, readable contrast, and complete reduced-motion equivalence.

## In scope

- Public landing-page layout, hierarchy, theme expression, spacing, surface treatment, and responsive presentation.
- Public header and footer presentation where required to use the official logo correctly.
- Copy tightening needed to clarify the treatment-readiness value and remove unsupported outcome, deployment, integration, or clinical claims.
- Reuse and deliberate extension of the established OncoReady design system.
- A bounded interactive character/particle or SVG/canvas visual with pointer response, static fallback, reduced-motion behavior, and offscreen/hidden-page pausing.
- Official title-logo and favicon integration from the repository's `Logo/` source assets into the frontend's public asset pipeline.
- Preservation of landing CTAs, section navigation, role entry, FAQ behavior, readiness preview, and current workflow state.
- Smoke coverage for critical landing interactions and official asset usage.

## Out of scope

- Copying Invofy's page structure, source code, photography, logo marquee, testimonials, pricing claims, or exact components.
- Invented customers, testimonials, outcomes, compliance badges, hospital deployments, or live integration claims.
- Changes to the staff, patient, caregiver, or readiness workflow except shared logo/header/footer compatibility needed by this slice.
- Backend, database, authentication, APIs, contracts, production integrations, infrastructure, or workflow-state changes.
- A new logo or redefinition of the official OncoReady identity.
- A site-wide animation framework or several competing hero effects.

## Architecture impact

- **Database:** false
- **Backend:** false
- **Frontend:** true
- **Frontend design required:** true
- **Infrastructure:** false
- Reuse React, TypeScript, Vite, Tailwind, the existing motion dependency, existing typed workflow state, and current client-side navigation.
- Keep the new motion component isolated from clinical/workflow state. It is presentational and cannot block page content or workspace entry.
- Prefer an implementation with no new dependency. If canvas is selected, cap rendering resolution/work per frame, pause through `IntersectionObserver` and `document.visibilityState`, and avoid layout reads inside the animation loop.

## Contract impact

None. The work is fully contained within the existing frontend and introduces no cross-component or external API boundary.

## Test depth

**SMOKE.** Run the production build and implementation-owned smoke checks covering landing render, official branding, header/CTA/section navigation, role/workspace entry, FAQ interaction, reduced-motion fallback, and the existing critical workflow regression.

## Security risk

**LOW.** This is a public, synthetic-data frontend refresh with no new authentication, persistence, privileged action, sensitive data, or external service. Baseline inert rendering and truthful product-claim requirements still apply. No dedicated security review is required.

## Dependencies

- `CORE-001` completed product journey and current frontend behavior.
- Existing OncoReady design system and brand tokens.
- Repository-provided official logo and inspiration assets.
- Human manually starts Gemini for the required design Phase A and later implementation Phase B.

## Risks and mitigations

- **Motion could distract or create discomfort.** Keep one signature animation, use low amplitude at rest, avoid flashing, and provide an equivalent still state for reduced motion.
- **A canvas effect could consume battery or reduce scroll performance.** Limit particle/character count and device-pixel ratio, pause when offscreen or hidden, and validate on mobile-sized viewports.
- **Reference inspiration could overpower the product identity.** Preserve OncoReady's official logo, brand colors, healthcare content, readiness graph, and page destinations; borrow mood rather than layout.
- **The official horizontal logo could crowd small headers.** Define full-wordmark and compact-mark variants with stable intrinsic dimensions and no distortion.
- **A visual refresh could break the completed demo journey.** Keep workflow and routing logic untouched and run existing smoke coverage after the landing changes.

## Acceptance criteria

- The public header, landing hero, CTA area, and footer use the repository's official OncoReady assets without distortion, duplicated wordmarks, or layout shift; the browser favicon also uses the official favicon.
- The page draws stylistic inspiration from the supplied reference through light composition, editorial hierarchy, atmospheric brand color, rounded surfaces, and generous spacing while remaining visibly and structurally OncoReady.
- The landing page retains its own treatment-readiness content and current functional destinations; it does not reproduce Invofy's site structure, copy, assets, testimonials, or customer-logo patterns.
- The first viewport states the treatment-readiness value in plain language, avoids unsupported absolute outcome claims, and offers a clear primary route into the workspace.
- One signature continuity-field visual uses a cancer/continuity or Louisiana-related character/particle form, responds smoothly to pointer movement on capable devices, settles predictably, and never blocks page content or interaction.
- With reduced motion enabled, the signature visual becomes a stable still treatment and all content, meaning, navigation, and focus behavior remain available.
- Motion pauses when its section is offscreen or the document is hidden, avoids flashing and aggressive parallax, and does not cause visible layout shift or degraded primary interaction.
- Role cards, readiness proof, how-it-works, Louisiana access, enterprise model, FAQ, CTA, and footer share one coherent visual system and a clear reading order.
- Existing landing navigation, workspace CTA, patient/staff/caregiver entry, readiness preview actions, FAQ accordion, and return paths remain functional.
- No new customer, testimonial, outcome, compliance, deployment, certification, clinical-validation, or live-integration claim appears.
- The landing experience is complete and readable at 320px mobile, tablet, and presentation-laptop widths, with semantic structure, keyboard access, visible focus, sufficient contrast, non-color cues, and at least 44px primary public touch targets.
- The production build and smoke suite pass, including the existing deterministic Maria journey and caregiver clinical-data exclusion regression.
