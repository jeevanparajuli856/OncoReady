# OncoReady Design System

Persistent human-readable frontend design source of truth.

## Status

`ESTABLISHED` (Established by Gemini Frontend Authority for CORE-001)

---

## 1. Product Visual Direction

OncoReady's visual identity bridges a persuasive public product story and a calm, dense enterprise operational workspace through a single cohesive grammar. It rejects superficial generic SaaS aesthetics (glassmorphism, glowing borders, card mosaics, repetitive pills) in favor of restrained geometry, crisp structural rails, and deliberate information hierarchy.

- **Atmosphere**: Professional, crisp, and luminous. Interfaces rely on structured canvases, solid dividers, and strict alignment rather than floating panels or excessive drop shadows.
- **Brand Motif**: The causal pathway—a visual signature representing connected dependencies converging to resolution. This motif scales from the expressive public storytelling down to the functional Treatment Readiness Graph in the operational workspace.
- **Density Strategy**: 
  - **Public/Patient/Caregiver**: Generous breathing room, focused linear progression, and calm readability.
  - **Staff Workspace**: High operational density, tabular structures, and tight rails optimized for rapid triage on presentation-laptop viewports.

---

## 2. Color Palette & Tokens

The color system uses strict semantic tokens to maintain a clinical-grade aesthetic and WCAG AA/AAA compliance without relying on color alone for meaning.

### 2.1 Surfaces & Neutrals
- **App Canvas**: `slate-50` (`#F8FAFC`) — Soft background for structural bounding.
- **Content Surface**: `white` (`#FFFFFF`) — Solid, opaque panels for primary content (no glassmorphism).
- **Subtle Surface**: `slate-100` (`#F1F5F9`) — Table headers, read-only fields, and secondary rails.
- **Structural Borders**: `slate-200` (`#E2E8F0`) — Crisp 1px solid borders for panels, tables, and dividers.
- **Focus Ring**: `indigo-500` (`#6366F1`) — 2px offset solid focus indicator.

### 2.2 Typography & Text
- **Text Primary**: `slate-900` (`#0F172A`) — Headings, key patient data, and primary actions.
- **Text Secondary**: `slate-600` (`#475569`) — Comfortable body copy, descriptions, and labels.
- **Text Muted**: `slate-500` (`#64748B`) — Timestamps and read-only metadata (avoids unreadable contrast).
- **Text Inverse**: `white` (`#FFFFFF`) — Text on solid primary buttons.

### 2.3 Semantic & Brand Tokens
- **Primary Indigo**: `indigo-600` (`#4F46E5`) — Brand anchor, primary CTAs, and active interactive elements.
- **Action Required (Amber)**: `amber-700` (`#B45309`) text/icon on `amber-50` (`#FFFBEB`) with `amber-200` (`#FDE68A`) border.
- **Review / In-Progress (Sky)**: `sky-700` (`#0369A1`) text/icon on `sky-50` (`#F0F9FF`) with `sky-200` (`#BAE6FD`) border.
- **Resolved / Confirmed (Emerald)**: `emerald-700` (`#047857`) text/icon on `emerald-50` (`#ECFDF5`) with `emerald-200` (`#A7F3D0`) border.

---

## 3. Typography & Hierarchy

Font Stack: `Inter, -apple-system, sans-serif`. Monospaced data (IDs, FHIR codes) uses `JetBrains Mono, monospace` with tabular figures (`tabular-nums`) to prevent layout shifts. We avoid tiny uppercase metadata.

| Scale Token | Size/Weight | Purpose |
|---|---|---|
| `display` | 32px / 700 | Public hero messaging, primary product storytelling |
| `h1` | 24px / 600 | Page titles, main application headers |
| `h2` | 20px / 600 | Section titles, panel headers |
| `h3` | 16px / 600 | Table headers, secondary groups |
| `body-lg` | 16px / 400 | Patient prompt text, public explanatory copy |
| `body` | 14px / 400 | Standard staff interface text, lists, forms |
| `caption` | 12px / 500 | Compact status indicators (used sparingly) |
| `mono` | 13px / 400 | Identifiers, dates, tabular metrics |

---

## 4. Layout, Spacing & Geometry

- **Base Rhythm**: 4px and 8px baseline grid.
- **Geometry**: Restrained radii. 
  - `0px` or `4px` (`rounded-sm`) for interactive inputs, table rows, and small targets.
  - `8px` (`rounded-md`) maximum for main content panels, dialogs, and structured canvases.
  - No `rounded-full` pills or avatars except for true compact status dots or genuine user avatars (when required).
- **Shadows**: Minimal. We use crisp 1px borders for structure instead of layered drop shadows. A single `shadow-sm` may elevate a primary dropdown or modal, but floating card mosaics are banned.
- **Staff Workspace Container**: Persistent 240px left sidebar (navigation) and a top-bar (search/context). Content area spans the remaining viewport, utilizing max-width bounding (`1280px`) only where text line-length requires it.

---

## 5. Visual Storytelling & Data Visualization

- **Treatment Readiness Graph**: A structured, deterministic node diagram—not an organic amoeba. It uses clean right-angle or simple bezier paths to connect the treatment anchor to its dependencies.
- **Causal Audit Timeline**: A strict vertical rail charting events with exact timestamps, named actors, and immutable states.
- **Synthetic Disclosures**: Clear, integrated textual badges ("Sandbox", "Simulated Event", "Synthetic Data") that maintain transparency without breaking the aesthetic immersion.

---

## 6. Motion Plan

Motion is strictly bounded to communicate causal meaning and state changes. No scroll hijacking, no ambient morphing, and no indefinite pulsing.

### 6.1 Signature Sequences
1. **Public Causal Path**: A brief CSS transition sequence on the landing page showing a concern splitting into two tracks and converging to resolution, triggered once on intersection.
2. **Readiness Split**: When Maria submits her form, a 300ms layout transition visually separates her single submission into two distinct task blocks.
3. **Graph Resolution**: When a task is acknowledged/confirmed, the connector path transitions its stroke color from amber to emerald over 400ms.

### 6.2 Application Transitions
- **Structural Navigation**: 0ms. Route changes in the staff shell are instant for maximum operational speed.
- **Microinteractions**: 100ms background color fades for button hover/focus. No scale bouncing.
- **Timers**: No per-second countdown re-renders. Proximity is displayed in stable chunks (e.g., "Tomorrow, 8:30 AM") to preserve battery and performance.

### 6.3 Reduced Motion
- `prefers-reduced-motion: reduce` completely disables the public sequence, readiness split animation, and graph color sweeps.
- All state changes snap instantly (0ms).
- Meaning relies entirely on border colors, icons, and text labels.

---

## 7. Interaction Boundaries & Accessibility

- **Terminology**: The UI strictly uses human-centric verbs: "Clinical review requested", "Review acknowledged", "Disposition recorded". No AI or system claims to "medically clear" a patient.
- **Consequential Controls**: Static/mock enterprise screens do not feature enabled, clickable primary buttons that do nothing. Inoperable controls must be visually read-only, disabled with explanation, or absent.
- **Accessibility**: 44px minimum touch targets on mobile (patient/caregiver/public). Clear 2px focus rings for all keyboard navigation. No color-only status indicators. Stated WCAG conformance is an engineering target, not a public certification claim.
