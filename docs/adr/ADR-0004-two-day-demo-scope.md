# ADR-0004 — Two-day frontend-led demonstration

## Status

Accepted from explicit human direction — September 21, 2026. Implementation pending in the seven proposed tasks.

## Context

The previous launch roadmap required durable multiuser workflows, broad Epic integration, evaluated production-style models, automatic outreach and extensive evidence services. The human now requires the remaining sprint scope in two working days, with finished UI, primarily recorded playback, one real SMS and one short live call.

The human also selected actual Epic Sandbox JSON captured ahead of playback, an offline notebook demonstrating ML on synthetic data with exported results in the UI, and the existing Railway hosts app.oncoready.me and api.oncoready.me. This turn is documentation-only.

## Decision

- Preserve the human-approved visual lock and completed foundation.
- Include all six subsequently approved impact refinements within existing surfaces: graph transformation, Why flagged?, named ownership/next actions/deadlines, patient finish, event-linked receipt and a two-output ML what-if. The comparison stays separate from actual workflow state; caregiver-seen status stays distinct from patient acknowledgment.
- Use one coherent frontend scenario with actual click transitions, prepared checkpoints and consistent views.
- Capture only required authorized Epic Sandbox resources once; render saved JSON with original provenance. No runtime Epic sync is required.
- Build a small synthetic-data training/evaluation notebook offline and use its saved outputs in the UI. No online inference or production ML pipeline is required.
- Implement one manually triggered real SMS and short live call through a minimal protected server adapter, reviewed prepared audio, durable duplicate guard and verified status.
- Show prepared automatic-outreach history with scheduled/sent messages, replies and follow-up changes; no scheduler execution is required.
- Simulate CareLink locally with fictional providers, including a timed replay of a previous dispatch and current-trip recovery; no actual ride dispatch.
- Defer enterprise auth, full event persistence, scheduling, ongoing conversation, comprehensive integrations and validated FHIR export.

## Supersession

ADR-0001 remains valid for the already completed hosting foundation, but its full backend/persistence scope is no longer a dependency of every demo scene.

ADR-0002's truthful provenance, read-only source and no-fabricated-provider-success principles remain. Its live Epic lifecycle, mandatory learned outreach and automated execution requirements are superseded for this release.

ADR-0003's visual lock remains unchanged. Completed task acceptance/evidence remains historical. Proposed specs and task records carry the revised acceptance; no lifecycle state or implementation approval is invented.

## Consequences

The presentation can run from reviewed local assets with only the short communications path requiring live providers. The frontend must maintain internal consistency and clear provenance; prepared results cannot be marketed as current live sync, clinical validation, real dispatch or production readiness.

Local persona routing is not authentication. Browser assets must be safe to publish. Credentials, actual recipient, arming and external side effects stay protected server-side, with risk-appropriate review and normal repository verification.
