# OncoReady Design System

Persistent human-readable frontend design source of truth.

## Status

`ESTABLISHED · HUMAN-APPROVED · VISUALLY LOCKED` — Clinical Glass system for an all-ages, business-centric product.

### Visual lock

This document and the current runtime UI define the approved OncoReady appearance. Future product work must preserve, not reinterpret, the system.

- The palette and token values, typography, spacing rhythm, geometry, border/shadow language, iconography, logo usage, component character, theme behavior, motion language, layout character, and responsive behavior are locked.
- New functionality must reuse the existing tokens and components or compose new feature-specific components entirely from the same primitives.
- A frontend design phase may determine placement and interaction for new content within this system. It may not introduce a rebrand, alternate theme, new global visual trend, or restyle of existing surfaces.
- No global token or established component-style change is allowed without explicit human approval for the exact proposed change.
- Accessibility fixes must use the smallest visual delta that satisfies the requirement. Materially visible changes require human approval.
- Every frontend task captures matching before/after screenshots for the affected viewports. Frontend review rejects unapproved visual drift.

---

## 1. Product Visual Direction

OncoReady uses **Clinical Glass**: a calm SaaS surface with translucent cards, soft elevation, and restrained motion. The product must feel trustworthy to patients, families, clinicians, and hospital buyers. Public surfaces extend this system with **Continuity Aurora**, a lighter editorial layer built from atmospheric indigo, mint, coral, and lavender light.

- **Landing / buyer surfaces**: Preserve the editorial two-column hero and interactive continuity field styling. `ACCESS-001` replaces historical public role/record previews with the record-free Continuity Rescue Story and exactly two pricing cards. Those approved content changes do not permit visual restyling; patient records and workspaces belong behind access.
- **Patient / caregiver**: Same glass cards and clear one-action hierarchy. Warm enough to use, never childish.
- **Staff workspace**: Same tokens, denser rails, less decoration so triage stays fast.

Brand motif: the **continuity loop** — a ready-check inside a geometric O, with a small mint node for closed work.

---

## 2. Color Tokens

| Token | Hex | Use |
|---|---|---|
| `cream` | `#F4F7FB` | App canvas (cool clinical white) |
| `ink` | `#0F172A` | Text |
| `accent` | `#4F46E5` | Primary actions, brand |
| `pop` | `#F97316` | Secondary CTA, emphasis |
| `sun` | `#F59E0B` | Risk / warning only |
| `mint` | `#059669` | Ready / resolved |
| `muted` | `#EEF2F7` | Subtle fills |
| `muted-fg` | `#5B6576` | Secondary text |
| `line` | `#E2E8F0` | Structural line |
| `coral` | `#F26B63` | Landing-only warmth and pointer response; never a clinical status |
| `lavender` | `#7768E8` | Landing-only atmospheric light |
| `landing-canvas` | `#F8FAFD` | Public-page canvas |

Never rely on color alone. Pair status with icon + label.

---

## 3. Typography

- **Display / hero**: `Outfit` Bold / ExtraBold
- **Headings**: `Poppins` Semibold
- **Body**: `Poppins` Regular / Medium, with `Plus Jakarta Sans` fallback
- **Mono**: `JetBrains Mono` for IDs and timestamps
- Scale: Major Third (1.25)
- Tracking: slightly tight on headings (`-0.02em`)

---

## 4. Geometry & Effects

- Radii: 10 / 16 / 24
- Cards: `rgba(255,255,255,0.72)` + `backdrop-filter: blur(16px)` + 1px white border
- Shadow: soft glass elevation, never hard offset blocks
- Hover: lift 1–4px, deepen shadow
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Icons: Lucide, 2px stroke, tinted rounded square

---

## 5. Components

- **Primary button**: indigo fill, 12px radius, soft indigo shadow
- **Ghost button**: translucent white, hairline border
- **Glass card**: frosted white, soft shadow, lift on hover
- **Input**: translucent white, indigo ring on focus
- **Logo**: indigo ready-ring with mint node

### Official logo use

- Use `oncoready-title-logo.svg` for the public header, public footer, and spacious brand moments.
- Use the compact continuity-loop mark where the full title lockup would be unreadable.
- Preserve the source aspect ratio and intrinsic dimensions. Do not reconstruct the wordmark with live HTML text or recolor the official asset.

### Public landing extension

- Public cards use elevated white/glass surfaces, 24–32px radii, cool hairline borders, and soft shadows.
- The landing hero may use low-opacity coral, lavender, indigo, and mint atmosphere while keeping the primary reading surface light.
- Landing headings can scale beyond product headings, with short line length and compact leading. Operational UI remains denser.
- Marketing proof uses real product states, role views, and readiness behavior rather than customer logos or invented testimonials.

---

## 6. Motion & Accessibility

- Entrance: fade + slight rise unless `prefers-reduced-motion`
- Respect the header reduced-motion toggle
- 44px minimum tap targets on patient/public CTAs
- High-contrast focus: 2px accent outline + offset

### Viewport arrival family

- Use one shared `IntersectionObserver` progressive-enhancement primitive. Content is visible by default, reveals once, unregisters after completion, and becomes final immediately if focus reaches it.
- Historical baseline: the landing role cards use three related variants (retain their motion language when composing the approved record-free replacement; do not retain public workspace entry behavior): patient **guided lift** (`-18px x / 22px y`, 540ms), staff **center resolve** (`28px y / 0.975 scale`, 620ms), and caregiver **supported arrival** (`18px x / 22px y`, 560ms), staggered by 80ms with `cubic-bezier(0.22, 1, 0.36, 1)`.
- Workflow and SaaS-model cards may use smaller 12–14px grouped rises. Do not apply entrances to every section or any operational workspace card.
- Animate only opacity and transform. Use no raw scroll handler, reveal animation-frame loop, pinned scrolling, parallax, or layout-changing property.
- Effective reduced motion is the union of the live operating-system preference and the product motion-off control. It renders all reveal content immediately and also disables smooth scrolling, pulses/dashes, confetti, modal movement, dock transforms, and decorative hover movement.

### Scroll-performance rules

- Do not use a fixed body background or broad scroll-attached `backdrop-filter` layers. Repeated glass cards use near-opaque fills, one-pixel cool borders, and compact shadows rather than blur.
- Document scrolling owns landing and workspace pages. Keep local vertical scrolling only inside bounded dialogs and local horizontal scrolling only for tables, preformatted mappings, or labeled filter rails.
- Load the live Leaflet map only when its stable static fallback is near the viewport. Preserve explicit media dimensions to prevent layout shift.
- Keep `will-change` temporary and limited to pre-reveal elements. Preserve the Continuity Field's DPR cap, offscreen/hidden pause, idle settling, and static fallback.

### Workspace continuity

- **Public / patient**: editorial spacing, 24–32px public radii, 16–24px product panels, and clear one-action hierarchy.
- **Staff**: the same tokens and component family at compact density; ownership, deadline, state, and next action remain immediately scannable.
- **Caregiver**: mint-tinted logistics and privacy emphasis. Transportation-only projection remains the hard content boundary.
- **System**: ink/indigo structure for graph, audit, and architecture surfaces, with icons and labels carrying every state in addition to color.
- Public positioning uses buyer-oriented SaaS language. Illustrative, simulated, or not-connected labels belong only at the specific in-product record/integration boundary that requires them; the product is never globally branded as a demo or training environment.

### Continuity field

- The landing signature visual is a character/particle cancer-ribbon form that represents one signal becoming owned work and a confirmed plan.
- Pointer response is local and decorative: nearby glyphs flare and repel, then spring back to stable targets.
- Cap canvas device-pixel ratio and particle density, avoid layout reads inside the animation loop, and pause when offscreen or when the document is hidden.
- If canvas is unavailable, show the static SVG ribbon. Under reduced motion, render the glyphs once at rest with no pointer movement.
- The visual is not the sole carrier of content or status; visible nearby copy explains the workflow.

---

## 7. Maps & Data

Leaflet maps are illustrative training-environment routing (Louisiana corridor). Fallback SVG renders in test/offline environments. Caregiver maps never include clinical text.
