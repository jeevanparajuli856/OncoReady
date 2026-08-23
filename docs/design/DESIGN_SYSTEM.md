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
- **Environment Disclosures**: Clear, integrated textual badges ("Training environment") that maintain transparency without breaking the aesthetic immersion.

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
- **Consequential Controls**: Static/read-only enterprise screens do not feature enabled, clickable primary buttons that do nothing. Inoperable controls must be visually read-only, disabled with explanation, or absent.
- **Accessibility**: 44px minimum touch targets on mobile (patient/caregiver/public). Clear 2px focus rings for all keyboard navigation. No color-only status indicators. Stated WCAG conformance is an engineering target, not a public certification claim.

---

## 8. Screen-by-Screen Blueprint

### 8.1 Public Buyer Experience

**Persistent Header Navigation**: Platform, Solutions, Interoperability, Trust, Sign In, Explore Workspace. (May link to consolidated landing-page sections).

#### Landing & Product Story (`/`)
- **User Purpose**: Communicate the core value: "Keep tomorrow’s cancer treatment on track."
- **Main Content**: Hero statement, visual signature sequence (patient concern -> clinical/logistical paths -> accountable owners -> confirmed plan), and consolidated solution/interoperability sections.
- **Primary CTA**: "Explore Workspace"
- **Key Illustrative records**: None (pure product marketing).
- **Working Interactions**: Scroll-based signature sequence (CSS only), navigation to Trust and Sign In.
- **Static/Read-Only**: Solution capability descriptions.
- **Loading/Empty/Error**: Instant load static content. Disabled states not applicable.
- **Responsive**: Single column on mobile, robust multi-column grid on presentation laptops.

#### Trust Center (`/trust`)
- **User Purpose**: Explain data minimization, workflow traceability, and training boundaries.
- **Main Content**: Structured text sections detailing human clinical authority and training environment architecture.
- **Primary CTA**: None (informational).
- **Key Illustrative records**: Descriptions of FHIR mappings and proposed data flows.
- **Working Interactions**: Standard page navigation.
- **Static/Read-Only**: All content. No fake certification badges.
- **Loading/Empty/Error**: Instant static content.
- **Responsive**: Readable long-form text layout.

#### Workspace Access (`/sign-in`)
- **User Purpose**: Provide local perspective selection into the product environment.
- **Main Content**: Clean selector for "Staff", "Patient (Maria)", and "Caregiver (Ana)".
- **Primary CTA**: Perspective selection buttons.
- **Key Illustrative records**: Illustrative user personas.
- **Working Interactions**: Clicking a persona immediately routes to their respective portal, establishing local session state.
- **Static/Read-Only**: Explanatory text that this is a training environment.
- **Loading/Empty/Error**: Error: "Please select a workspace role to continue."
- **Responsive**: Centered column on all devices.

### 8.2 Enterprise Staff Application

**Persistent Shell Layout**: Fixed 240px left sidebar for routing. Top bar for current context and "Reset Workspace" utility. No hidden avatar menus for primary routing.

#### Command Center (`/staff`)
- **User Purpose**: Operational morning view prioritizing treatments approaching in 24-48 hours.
- **Main Content**: Top rails of upcoming treatments, exception workload summary, and a prominent link to Maria's active case.
- **Primary CTA**: "Review Case" for Maria.
- **Key Illustrative records**: Aggregated ownership and upcoming treatment counts (static context). Maria's headline state (dynamic).
- **Working Interactions**: Routing to Exceptions or Case Workspace.
- **Static/Read-Only**: Secondary charts or historical metrics.
- **Loading/Empty/Error**: No-result state: "No immediate treatments at risk."
- **Responsive**: Grid scales to stack on tablets; designed primarily for landscape presentation.

#### Exceptions (`/staff/exceptions`)
- **User Purpose**: Triage table for active blockers.
- **Main Content**: Structured table/list showing urgency, blocker type, owner, and state.
- **Primary CTA**: Row-click to open Maria's case.
- **Key Illustrative records**: Secondary static exception rows for context.
- **Working Interactions**: Search input, column filters, clear filters, routing.
- **Static/Read-Only**: Non-Maria rows.
- **Loading/Empty/Error**: Empty: "No matching exceptions." Clear-filter recovery.
- **Responsive**: Horizontal scrolling for table on narrow viewports.

#### Patients (`/staff/patients`)
- **User Purpose**: Directory of patient records.
- **Main Content**: Searchable list with treatment proximity.
- **Primary CTA**: Select "Maria" to enter case.
- **Key Illustrative records**: Static patient directory context.
- **Working Interactions**: Search, routing.
- **Static/Read-Only**: Secondary profiles.
- **Loading/Empty/Error**: Empty: "No patients found."
- **Responsive**: Standard list scaling.

#### Maria Case Workspace (`/staff/case/maria`)
- **User Purpose**: Resolve Maria's treatment blockers.
- **Main Content**: Treatment Readiness Graph, dual-action workspace (clinical and transportation), caregiver permission context, and Causal Audit Timeline.
- **Primary CTA**: "Acknowledge Review" and "Confirm Transportation".
- **Key Illustrative records**: Maria's generated IDs, timestamps, and role assignments.
- **Working Interactions**: Acknowledging the clinical task, confirming transportation, deriving timeline updates. Guards prevent out-of-order actions.
- **Static/Read-Only**: Patient demographic headers.
- **Loading/Empty/Error**: Disabled CTAs until preconditions met. Success state highlights graph path in emerald.
- **Responsive**: Two-column desktop layout stacks to single column on narrow screens.

#### Resources (`/staff/resources`)
- **User Purpose**: View available transportation/support services.
- **Main Content**: Catalog of illustrative providers.
- **Primary CTA**: None (read-only directory context).
- **Key Illustrative records**: Illustrative transport availability.
- **Working Interactions**: Search/Filter.
- **Static/Read-Only**: The entire catalog (action is taken within Maria's case).
- **Loading/Empty/Error**: Empty: "Resource not found."
- **Responsive**: Grid cards adapt to viewport width.

#### Insights (`/staff/insights`)
- **User Purpose**: View operational storytelling.
- **Main Content**: Charts for exception aging and resolution.
- **Primary CTA**: None.
- **Key Illustrative records**: Static historical trends; dynamic Maria summary.
- **Working Interactions**: None.
- **Static/Read-Only**: All charts.
- **Loading/Empty/Error**: Immediate render.
- **Responsive**: Responsive chart containers.

#### Integrations (`/staff/integrations`)
- **User Purpose**: View proposed data flow mapping.
- **Main Content**: FHIR mappings and proposed event history.
- **Primary CTA**: None.
- **Key Illustrative records**: Proposed FHIR schemas and data flows.
- **Working Interactions**: None.
- **Static/Read-Only**: All content. Explicitly labeled "Training environment" (no "Live" tags).
- **Loading/Empty/Error**: N/A
- **Responsive**: Standard text/table layout.

#### Admin (`/staff/admin`)
- **User Purpose**: View local routing and role configuration.
- **Main Content**: Read-only rules list.
- **Primary CTA**: None.
- **Key Illustrative records**: Illustrative organization rules.
- **Working Interactions**: None.
- **Static/Read-Only**: All fields rendered read-only or disabled with "Configuration locked in training environment" tooltip.
- **Loading/Empty/Error**: N/A
- **Responsive**: Single column form structure.

### 8.3 Patient and Caregiver Portals

#### Patient Experience (`/patient`)
- **User Purpose**: Report concerns and acknowledge plan.
- **Main Content**: Treatment countdown, readiness check form, and status view.
- **Primary CTA**: "Submit Readiness Check", "Acknowledge Plan".
- **Key Illustrative records**: Upcoming infusion details.
- **Working Interactions**: Form submission (creates two tasks in shared state), final plan acknowledgment.
- **Static/Read-Only**: Clinical instructions.
- **Loading/Empty/Error**: Validation error if form incomplete. Success state upon confirmation.
- **Responsive**: Mobile-first single column, 44px touch targets.

#### Caregiver Experience (`/caregiver`)
- **User Purpose**: View authorized transport updates.
- **Main Content**: Transportation status timeline.
- **Primary CTA**: None.
- **Key Illustrative records**: Transport updates.
- **Working Interactions**: Live state reflection from staff actions.
- **Static/Read-Only**: All content.
- **Loading/Empty/Error**: Explicit boundary text ensuring clinical data is absent.
- **Responsive**: Mobile-first.
