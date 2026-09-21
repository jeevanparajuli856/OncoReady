---
name: demo-prep
description: Final-pass readiness for a live demo or a shared personal project — seed real-looking data, remove console noise, guarantee the demo path against flaky network calls, verify environment variables, and prepare the fallback. Use in the last hours before a hackathon demo, a submission deadline, or the first time someone else will run the project.
metadata:
  origin: ECC-H
---

# Demo Prep

The last pass before someone else sees it run. Distinct from `production-audit`,
which asks what breaks in production over weeks: this asks what breaks in the
next five minutes, in front of an audience, on someone else's network.

## When to Activate

- The last hours before a demo, submission, or deadline
- Before sharing a personal project with anyone else
- The user says "getting ready to demo", "submitting soon", "make it presentable"
- After `/harden`, as the final step

Run `production-audit` instead when the question is genuine production readiness.
Run this when the question is whether the next five minutes go well.

## The order

Work in this order. Each step assumes the previous one passed.

### 1. The demo path runs, live, end to end

Read the demo path from `PROJECT.md` and walk it with `browser-qa` against the
running app — not the test suite, the app. Every step, in order, as a user.

If a step fails, stop. Nothing below matters until the path completes.

### 2. Zero console errors on the demo path

Open devtools and walk it again. Red text in the console during a demo reads as
"this is broken" to anyone watching, whether or not it matters.

Fix real errors. For unfixable third-party warnings, note them so you are not
surprised, and do not silence them by disabling the console.

### 3. Seed data that looks real

Empty states and `test test test` make a working product look unfinished.

- Enough rows that lists, charts, and pagination look populated
- Plausible names, dates, and amounts — not `asdf`, not `User 1`
- Deterministic: a seed script, committed, that produces the same data every run
- The demo account is already in the state the demo starts from

The demo must not depend on you creating data live unless creating data *is* the
demo.

### 4. Every environment variable is present and correct

Read the External services section of `PROJECT.md` and check each name resolves
in the environment the demo will run in — which is often not the one you have
been developing in.

```bash
node -e "for(const k of ['DATABASE_URL','ANTHROPIC_API_KEY']) if(!process.env[k]) console.log('MISSING', k)"
```

Confirm `.env.example` lists every variable, with no real values in it. If the
demo runs on a deploy, check the variables there too — a missing key on Vercel is
the single most common demo failure.

### 5. Guarantee the demo path against flaky calls

Anything on the demo path that leaves the machine can fail at the worst moment:
LLM calls, third-party APIs, cold serverless starts, conference wifi.

For each one, decide now:

- **Cache it** — a recorded response for the exact demo input is the strongest option
- **Fall back** — on error, show a plausible canned result rather than an error state
- **Warm it** — hit the endpoint once before starting so nothing is cold

Label the fallback in the code so it is obvious later, and know which parts are
live in case you are asked. Do not misrepresent a cached response as live if the
question comes up.

### 6. Remove debug noise

`console.log`, `debugger`, commented-out blocks, TODO banners, placeholder
copyright, lorem ipsum. The Stop hook warns about these; this is where they get
cleared.

### 7. README and pitch

Someone will open the repo. It needs:

- one line on what it does
- a screenshot or GIF of the demo path
- setup: clone, install, env vars, run — actually verified from clean
- what is built vs. what is stubbed, stated honestly

For a hackathon, add the problem, the approach, and what you would build next.
Judges read the README when the demo queue is long.

### 8. Rehearse once, timed

Run the demo path start to finish, on the clock, on the machine and network you
will use. This is the step people skip, and it is the one that catches the
missing env var on the deploy and the 40-second cold start.

Have the fallback ready: a recorded video or screenshots of the working path. If
the live demo dies, you keep going instead of debugging in front of an audience.

## Verification

- The demo path completed live, in the demo environment, within the time budget
- Console is clean on that path
- Seed data is deterministic, committed, and looks real
- Every env var in `PROJECT.md` resolves where the demo will run
- Each external call on the path is cached, has a fallback, or is warmed
- No debug statements or placeholder copy on any screen the demo touches
- README setup steps were followed from clean and worked
- A recorded fallback exists
