---
description: Deploy the project and verify the deployment actually works — env var parity, build on the target, and the demo path walked against the deployed URL.
argument-hint: "[preview|production]"
metadata:
  origin: ECC-H
---

# /deploy

Invokes the `deploy-fast` skill. The part people skip is the last step, which is
the one that catches the failure.

## Usage

```
/deploy            # preview deploy
/deploy production
```

## What it does

1. **Gate locally first.** `/gate` must be green. Deploying a red tree turns one
   problem into two environments' worth.
2. **Env var parity.** Every variable in `PROJECT.md`'s External services section
   must exist on the target. A missing key on the host is the single most common
   deploy failure, and it fails at runtime, not at build.
3. **Build on the target**, not just locally. Case-sensitive filesystems and
   missing devDependencies surface here and nowhere else.
4. **Walk the demo path against the deployed URL** with `/check`. Working locally
   proves nothing about the deploy — different runtime, different env, different
   caching.

## Env var parity check

```bash
# names only — never print values
grep -oE '^[A-Z_]+' .env.example | sort
```

Compare against the host's configured variables and report differences by name.

## Common failures

| Symptom | Cause |
|---|---|
| Builds locally, fails on the host | Case-sensitive FS, or a devDependency needed at build |
| Deploys, then 500s at runtime | Missing env var on the host |
| Works, then breaks an hour later | Session refresh not running in middleware |
| Blank page, no error | Server Component threw during static render — needs `dynamic = 'force-dynamic'` |

## Rollback

Know the rollback before deploying: the host's previous-deployment promote, or
`git revert` plus redeploy. Under a deadline, rolling back to the last working
deploy beats debugging the new one.
