# Security Guidelines

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on all endpoints
- [ ] Error messages don't leak sensitive data

## Secret Management

- NEVER hardcode secrets in source code
- ALWAYS use environment variables or a secret manager
- Validate that required secrets are present at startup
- Rotate any secrets that may have been exposed

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues

## Security triggers

Pull in the **security-reviewer** agent, and force the work to **at least the `standard`
size tier**, whenever the diff touches any of:

- authentication or authorization
- user-input handling (forms, query params, uploads, webhooks)
- database queries or schema, including RLS policies
- filesystem paths
- external API calls
- cryptography
- secrets or credentials

This list is the authoritative definition referenced by `ship-pipeline`,
`development-workflow.md`, and `testing.md`. A trigger means full TDD and a security
review, no matter how small the change looks.

## Speed does not lower this bar

Hackathon and demo pressure is the most common reason these checks get skipped, and a
leaked key or an open RLS policy is not recoverable by shipping faster. If a security
trigger is in scope and there is no time to do it properly, cut the feature — do not
ship it unreviewed. The `scope-guard` skill exists for exactly this call.
