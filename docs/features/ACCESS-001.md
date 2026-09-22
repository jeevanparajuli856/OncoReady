# ACCESS-001 — Polished demo entry and prepared workspaces

**Scope revision:** September 21, 2026 two-day demonstration. Supersedes this task's prior full-product launch requirements. Status remains PROPOSED; architecture/implementation/review are not certified by this specification.

## User-visible outcome

A viewer enters the chosen synthetic persona and reaches the next recorded scene through the existing finished-looking interface.

## Required scope

Reuse the public story, locked visual language, two pricing cards and prepared patient/caregiver/staff/transport entry. Keep persona switching and return navigation reliable. Only the selected access path must be wired; real social identity and enterprise account workflows are deferred.

## Deferred

Real OAuth, enterprise authentication/provisioning, account recovery email, sign-up backend and complete settings. Never claim that an email was sent or a third-party sign-in occurred when it did not.

## Architecture and contract guidance

Frontend impact. Local scenario personas are explicitly not authorization. Do not attach privileged API credentials to the frontend. OUTREACH owns the separate protected live-action boundary. A local state contract is sufficient; a formal API contract is needed only if the architect selects a real server boundary.

All frontend work preserves [the approved visual system](../design/DESIGN_SYSTEM.md). Design-required work is a compatibility/extension plan with the existing digest gate. The architect must record actual impacts, execution controls and scope before BUILD_READY; the guidance here is not a completed architecture report.

## Verification and risk

SMOKE; LOW risk for synthetic-only presentation routing. If real sessions or protected data are introduced, revise the architecture/risk decision before implementation.

## Dependencies

- RAIL-001

## Acceptance criteria

1. From the public page, Workspace access opens the implemented entry path and reaches the selected prepared persona without a dead end; verify the recorded click path.
2. Public product pages expose no patient record or clinical source content. Prepared workspace selection does not grant any privileged provider action; verify public routes and the live adapter boundary separately.
3. Exactly two existing approved pricing plans remain coherent: Pilot $18,000/year with $1,500/month billed annually, five staff seats and one site; Network Talk to us without a numeric price. No checkout or new pricing system is required.
4. Switching among the recorded personas and returning to staff preserves the active scenario; reset restores the documented start. Verify through one full browser journey.
5. Off-path sign-up, recovery and provider controls are hidden, disabled with an explanation or implemented as honest previews. No false authentication, save or email success; inspect every visible recording-path link.
6. Keyboard focus, readable states, selected desktop/mobile layouts and reduced-motion behavior preserve the approved design; compare before/after screenshots without changing global tokens.

See [the two-day sprint](../LAUNCH_SPRINT_PLAN.md), [scenario settings](../LAUNCH_SCENARIO_SETTINGS.md) and [demo runbook](../operations/DEMO_RUNBOOK.md). Future product work is listed in [the roadmap](../LAUNCH_ROADMAP.md); it is not an additional release gate.
