# OncoReady Design System

Persistent human-readable frontend design source of truth.

## Status

`ESTABLISHED` — Clinical Glass system for an all-ages, business-centric product.

---

## 1. Product Visual Direction

OncoReady uses **Clinical Glass**: a calm SaaS surface with translucent cards, soft elevation, and restrained motion. The product must feel trustworthy to patients, families, clinicians, and hospital buyers.

- **Landing / buyer surfaces**: Two-column SaaS hero, workspace cards, enterprise pricing, and a live readiness preview.
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

Never rely on color alone. Pair status with icon + label.

---

## 3. Typography

- **Display / hero**: `Syne` ExtraBold
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

---

## 6. Motion & Accessibility

- Entrance: fade + slight rise unless `prefers-reduced-motion`
- Respect the header reduced-motion toggle
- 44px minimum tap targets on patient/public CTAs
- High-contrast focus: 2px accent outline + offset

---

## 7. Maps & Data

Leaflet maps are illustrative training-environment routing (Louisiana corridor). Fallback SVG renders in test/offline environments. Caregiver maps never include clinical text.
