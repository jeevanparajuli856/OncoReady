# LEGAL-001: Support email on the legal pages

**Status:** Done. Merged into `main`.

## User-visible outcome

The Terms of Service (`/terms`) and Privacy Policy (`/privacy`) pages list **support@oncoready.me** instead of `support@oncoready.com`. That matches the pricing "Contact us" link, which already used `support@oncoready.me`.

## Change

- `frontend/src/components/LegalPage.tsx`: the single `SUPPORT_EMAIL` constant now reads `support@oncoready.me`. It feeds all five `mailto:` links: the contact line and SMS HELP text on Terms, and the SMS, rights and contact lines on Privacy.
- No other web, backend or doc file referenced `oncoready.com`.

## Verification

- New `frontend/tests/legal.test.tsx` renders both pages and checks that every support link is `mailto:support@oncoready.me` and that `oncoready.com` does not appear.
- `npm run build` passes; 113 component tests and 14 Playwright tests pass.

## Note

If the Twilio A2P campaign registration lists a support email, it should also be updated to `support@oncoready.me`.
