# OncoReady Design System

Persistent human-readable frontend design source of truth.

## Status

`ESTABLISHED` — Clinical Glass system for an all-ages, business-centric product.

---

## 1. Product Visual Direction

OncoReady uses **Clinical Glass**: a calm SaaS surface with translucent cards, soft elevation, and restrained motion. The product must feel trustworthy to patients, families, clinicians, and hospital buyers. Public surfaces extend this system with **Continuity Aurora**, a lighter editorial layer built from atmospheric indigo, mint, coral, and lavender light.

- **Landing / buyer surfaces**: Editorial two-column hero, interactive continuity field, role workspaces, deployment paths, and a live readiness preview. External references may inform mood and polish, but the structure and story remain specific to OncoReady.
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

### Continuity field

- The landing signature visual is a character/particle cancer-ribbon form that represents one signal becoming owned work and a confirmed plan.
- Pointer response is local and decorative: nearby glyphs flare and repel, then spring back to stable targets.
- Cap canvas device-pixel ratio and particle density, avoid layout reads inside the animation loop, and pause when offscreen or when the document is hidden.
- If canvas is unavailable, show the static SVG ribbon. Under reduced motion, render the glyphs once at rest with no pointer movement.
- The visual is not the sole carrier of content or status; visible nearby copy explains the workflow.

---

## 7. Maps & Data

Leaflet maps are illustrative training-environment routing (Louisiana corridor). Fallback SVG renders in test/offline environments. Caregiver maps never include clinical text.
