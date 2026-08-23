# OncoReady Design System

Persistent human-readable frontend design source of truth.

## Status

`ESTABLISHED` — Playful Geometric system, adapted for cancer-care trust.

---

## 1. Product Visual Direction

OncoReady uses **Playful Geometric**: a stable content grid with tactile, high-energy decoration. The product must feel optimistic and clickable without becoming casual about cancer.

- **Landing / buyer surfaces**: Full expression — confetti shapes, hard shadows, Syne display type, sticker cards, marquee, star badges.
- **Patient / caregiver**: Warm cream paper, candy buttons, clear one-action hierarchy. Friendly, not childish.
- **Staff workspace**: Same tokens, denser rails, less floating decoration so triage stays fast.

Brand motif: the **continuity loop** — a geometric O that becomes a ready-check, surrounded by three nodes (patient, nurse, navigator).

---

## 2. Color Tokens

| Token | Hex | Use |
|---|---|---|
| `cream` | `#FFFDF5` | App canvas (paper) |
| `ink` | `#1E293B` | Text, borders, hard shadows |
| `accent` | `#8B5CF6` | Primary actions, brand |
| `pop` | `#F472B6` | Featured shadows, decorative |
| `sun` | `#FBBF24` | Optimism, popular badge, hover fills |
| `mint` | `#34D399` | Ready / resolved |
| `muted` | `#F1F5F9` | Subtle fills |
| `muted-fg` | `#64748B` | Secondary text |
| `line` | `#E2E8F0` | Soft structural line |

Never rely on color alone. Pair status with icon + label.

---

## 3. Typography

- **Display / logo / hero**: `Syne` ExtraBold
- **Headings**: `Outfit` Bold / ExtraBold
- **Body**: `Plus Jakarta Sans` Regular / Medium
- **Mono**: `JetBrains Mono` for IDs and timestamps
- Scale: Major Third (1.25)

---

## 4. Geometry & Effects

- Radii: 8 / 16 / 24 / full pill
- Borders: 2px ink by default
- **Pop shadow**: `4px 4px 0 #1E293B` (no blur)
- Hover lift: translate −2px, shadow 6px
- Press: translate +2px, shadow 2px
- Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Icons: Lucide, 2.5px stroke, enclosed in a bubble

---

## 5. Components

- **Candy button**: accent fill, pill, ink border, hard shadow, optional white arrow bubble
- **Ghost button**: transparent, ink border, sun fill on hover
- **Sticker card**: white, ink border, soft or pink hard shadow, slight hover wiggle
- **Input**: white, 2px slate border, accent hard shadow on focus
- **Logo**: geometric ready-ring with sun circle, mint node, pink triangle

---

## 6. Motion & Accessibility

- Entrance: pop (scale 0.86 → 1) unless `prefers-reduced-motion`
- Respect the header reduced-motion toggle
- 44px minimum tap targets on patient/public CTAs
- High-contrast focus: 3px accent outline + offset

---

## 7. Maps & Data

Leaflet maps are illustrative training-environment routing (Louisiana corridor). Fallback SVG renders in test/offline environments. Caregiver maps never include clinical text.
