# OncoReady Design System

Persistent human-readable frontend design source of truth.

## Status

`ESTABLISHED` (Established by Gemini Frontend Authority for CORE-001)

---

## 1. Product Visual Direction

OncoReady's visual identity embodies **Calm Clinical Precision and Empathetic Clarity**. It rejects generic, dark-mode "AI dashboard slop" in favor of an airy, luminous, clinical-grade aesthetic inspired by modern medical software and high-craft productivity tools (e.g., Apple Health, Linear, Epic Rover).

- **Atmosphere**: Crisp light backgrounds with subtle atmospheric depth, pure white elevated cards, soft slate-tinted shadows, and fine 1px precision borders (`rgba(226, 232, 240, 0.8)`).
- **Hero Focal Point**: The **Treatment Readiness Graph**, which renders treatment dependencies as vibrant, living nodes with subtle organic pulses and clear status transitions from amber blocker to emerald resolution.
- **Cognitive Ergonomics**: High scannability, generous whitespace, large touch targets (minimum 44px on mobile), and unambiguous typographic hierarchy that keeps patients calm while giving staff rapid operational triage capabilities.

---

## 2. Color Palette & Tokens

The color system uses high-contrast, accessible light-theme tokens with dedicated clinical semantics (WCAG AAA/AA+ compliant).

### 2.1 Surfaces & Neutrals
- **Background App Canvas**: `slate-50` (`#F8FAFC`) — Soft, clean neutral canvas that minimizes eye fatigue.
- **Card Surface**: `white` (`#FFFFFF`) — High-clarity elevated container surface.
- **Glassmorphic Elevated Surface**: `rgba(255, 255, 255, 0.85)` with `backdrop-blur-md` and `border-slate-200/80`.
- **Subtle Surface Tint**: `slate-100` (`#F1F5F9`) — Muted wells, table headers, and inactive button states.
- **Border Default**: `slate-200` (`#E2E8F0`) — Razor-sharp 1px structural framing.
- **Border Subtle**: `slate-100` (`#F1F5F9`) — Internal divider lines.
- **Border Focus / Ring**: `indigo-500` (`#6366F1`) / `sky-500` (`#0EA5E9`) with 2px offset.

### 2.2 Typography & Text
- **Text Primary**: `slate-900` (`#0F172A`) — Maximum contrast for headings, critical metrics, and patient names (15.8:1 contrast on white).
- **Text Secondary**: `slate-600` (`#475569`) — High-legibility body copy, field labels, and descriptions (7.0:1 contrast).
- **Text Muted**: `slate-400` (`#94A3B8`) — Timestamps, captions, and de-emphasized metadata.
- **Text Inverse**: `white` (`#FFFFFF`) — Text on solid primary buttons and dark badges.

### 2.3 Brand & Primary Accents
- **Primary Indigo**: `indigo-600` (`#4F46E5`) / `indigo-700` (`#4338CA`) — Brand anchor, primary CTAs, active workflow steps.
- **Accent Sky / Cyan**: `sky-600` (`#0284C7`) / `teal-600` (`#0D9488`) — Clinical care pathways, medical indicators, secondary actions.
- **Indigo Tint / Light**: `indigo-50` (`#EEF2FF`) — Primary badge backgrounds, active pill selections.

### 2.4 Semantic Workflow Statuses
- **Action Required / Blocker (Amber)**:
  - Text/Icon: `amber-700` (`#B45309`)
  - Surface: `amber-50` (`#FFFBEB`)
  - Border: `amber-200` (`#FDE68A`)
  - Pulse / Ring: `amber-400` (`#FBBF24`)
- **Action In-Progress / Review (Sky/Blue)**:
  - Text/Icon: `sky-700` (`#0369A1`)
  - Surface: `sky-50` (`#F0F9FF`)
  - Border: `sky-200` (`#BAE6FD`)
- **Confirmed / Ready (Emerald)**:
  - Text/Icon: `emerald-700` (`#047857`)
  - Surface: `emerald-50` (`#ECFDF5`)
  - Border: `emerald-200` (`#A7F3D0`)
  - Pulse / Ring: `emerald-400` (`#34D399`)
- **Critical Alert / Disruption (Rose)**:
  - Text/Icon: `rose-700` (`#BE123C`)
  - Surface: `rose-50` (`#FFF1F2`)
  - Border: `rose-200` (`#FECDD3`)

---

## 3. Typography & Hierarchy

Font Stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`. Monospaced numbers and codes use `JetBrains Mono, "SF Mono", Menlo, monospace` with tabular figures enabled (`font-variant-numeric: tabular-nums`).

| Scale Token | Font Size | Line Height | Weight | Letter Spacing | Purpose |
|---|---|---|---|---|---|
| `display` | 32px (2rem) | 1.2 | 700 (Bold) | -0.025em | Main Patient Hero Countdown, Key Readiness Headline |
| `h1` | 24px (1.5rem) | 1.3 | 700 (Bold) | -0.02em | Page titles, Primary view headers |
| `h2` | 20px (1.25rem) | 1.35 | 600 (Semibold) | -0.015em | Card headers, Section titles, Modal titles |
| `h3` | 16px (1rem) | 1.4 | 600 (Semibold) | -0.01em | Node titles, Table column headers, Sub-sections |
| `body-lg` | 16px (1rem) | 1.5 | 400 (Regular) | 0 | Patient clinical prompt copy, Hero description |
| `body` | 14px (0.875rem) | 1.5 | 400 (Regular) / 500 (Medium) | 0 | Standard table text, Task descriptions, Form labels |
| `caption` | 12px (0.75rem) | 1.4 | 500 (Medium) | +0.01em | Status pills, Timestamps, Role badges |
| `code/mono` | 13px (0.8125rem) | 1.4 | 500 (Medium) | 0 | Case IDs, FHIR resource codes, Timers |

---

## 4. Spacing, Sizing & Layout Grid

- **Base Unit**: 4px grid (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`).
- **Containers**:
  - Patient Mobile View: Max width `480px` centered with `16px` padding.
  - Staff / Case Workspace Desktop View: Max width `1280px` / `1440px` with 2-column or 3-column split (`320px` queue rail, flexible graph canvas, `360px` action/timeline drawer).
- **Radius Tokens**:
  - `rounded-sm`: 4px (small indicators, micro pills)
  - `rounded-md`: 8px (form inputs, utility buttons, dropdowns)
  - `rounded-lg`: 12px (task sub-cards, nested nodes)
  - `rounded-xl`: 16px (main container cards, graph canvas, dialogs)
  - `rounded-2xl`: 24px (hero treatment banner)
  - `rounded-full`: 9999px (status badges, avatars, icon buttons)
- **Elevation / Shadows**:
  - `shadow-xs`: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`
  - `shadow-sm`: `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)`
  - `shadow-md`: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`
  - `shadow-lg`: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`
  - `shadow-glow-emerald`: `0 0 20px -3px rgba(16, 185, 129, 0.35)`
  - `shadow-glow-amber`: `0 0 20px -3px rgba(245, 158, 11, 0.35)`

---

## 5. Component Patterns

### 5.1 Hero Treatment Card
A warm, elevated presentation card summarizing the upcoming infusion (Protocol, Center, Time proximity, and immediate Readiness status badge). Includes live ticking proximity countdown and high-visibility CTA to begin readiness screening.

### 5.2 Interactive Treatment Readiness Graph
The visual centerpiece of the product:
- **Central Node**: The upcoming infusion appointment (FOLFOX6 Cycle 4, Tomorrow 8:30 AM).
- **Branch Nodes**: Clinical Symptom Clearance (Nurse pathway) and Transport Fulfillment (Navigator pathway).
- **Connectors**: SVG dynamic bezier curves with animated marching dashes when unconfirmed, transitioning into solid luminous emerald tracks upon resolution.
- **Node Cards**: Include owner avatar/role, due countdown, real-time status pill, verbatim concern excerpt, and direct action triggers.

### 5.3 Deterministic Dual-Task Split Card
Visual demonstration of single-input multi-workflow routing:
- Left card: Clinical Review Task (Assigned to Sarah Jenkins, RN). Verbatim text in high-contrast quote well with explicit non-AI triage badge ("Preserved Clinical Report • Human Review Required").
- Right card: Transportation Task (Assigned to Marcus Vance, MSW). Ride requirement details with simulated fulfillment action.

### 5.4 Staff Exception Queue
A high-density, polished triage table displaying synthetic patient records, urgency countdowns, dual-blocker icons, owner assignments, and direct drawer access.

### 5.5 Caregiver Permission-Filtered Card
A dedicated projection card for Ana Hernandez demonstrating strict data-minimization:
- Displays ride status, pickup time (7:45 AM), vehicle dispatch, and driver details.
- Explicitly hides and excludes all clinical symptom text and triage notes with a clear privacy boundary notice.

### 5.6 Append-Only Audit Event Timeline
A chronological event log with vertical connector line, actor badge (Patient, System, Nurse, Navigator), synthetic ISO timestamps, and state diff badges.

### 5.7 Perspective Switcher & Reset Control
A persistent top-bar utility allowing 1-click switching between Patient (Maria), Staff (Triage Nurse / Navigator), Caregiver (Ana), and Full System Overview, alongside a prominent amber/rose "Reset Demo" button that restores deterministic opening state in 0ms.

---

## 6. Motion & Microinteractions

- **Easing Curve**: Custom fluid spring cubic-bezier `cubic-bezier(0.16, 1, 0.3, 1)` for silky, natural decelerations.
- **Card Entry / Stagger**: 250ms slide-up with subtle fade (`opacity: 0 -> 1`, `transform: translateY(8px) -> 0`).
- **Graph Connection Pulse**: 2s infinite subtle glow pulsation on unconfirmed blocker nodes, snapping to a 400ms emerald burst upon completion.
- **Button Microinteractions**: Subtle 100ms scale-down on click (`transform: scale(0.98)`), smooth background color shift, and active focus ring expansion.
- **Reduced Motion (`prefers-reduced-motion: reduce`)**:
  - All transforms, translate animations, and looping pulses are disabled.
  - Transitions switch to instant or 100ms pure opacity changes.
  - Status meaning is fully preserved via text badges, icons, and border colors.

---

## 7. Accessibility Conventions (WCAG 2.1 AA / AAA)

1. **Color Independence**: Every state is signaled simultaneously by text labels, distinct SVG icons (Warning triangle, Check circle, Clock, Shield), and color tokens.
2. **Keyboard Navigability**: Full tab-order support, visible 2px focus rings (`ring-2 ring-indigo-500 ring-offset-2`), and `Escape` handling on dialogs.
3. **Screen Reader Landmarks**: Semantic HTML (`<header>`, `<main>`, `<section>`, `<nav>`, `<article>`, `<time>`) with `aria-live="polite"` on dynamic readiness changes.
4. **Target Sizes**: All interactive buttons, switches, and form inputs meet minimum `44px × 44px` touch bounding boxes.
