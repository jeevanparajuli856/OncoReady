---
description: Final pass before showing the project to anyone — walk the demo path live, seed realistic data, clear console noise, verify env vars, guarantee flaky calls, and rehearse once.
metadata:
  origin: ECC-H
---

# /demo

The last hour. Invokes the `demo-prep` skill.

## Usage

```
/demo
```

## The order

Each step assumes the one above it passed.

1. **The demo path runs live, end to end.** `/check` first. If it fails, nothing
   below matters.
2. **Zero console errors** on that path. Red text reads as broken to anyone watching.
3. **Seed data that looks real** — deterministic, committed, plausible. `test test`
   and empty states make a working product look unfinished.
4. **Every env var resolves** in the environment the demo will actually run in.
5. **Guarantee external calls** on the path — cache, fall back, or warm each one.
   Conference wifi and cold starts are the two most common demo failures.
6. **Remove debug noise** — console.log, debugger, lorem ipsum, TODO banners.
7. **README and pitch** — one line on what it does, a GIF of the demo path, setup
   steps verified from clean, and an honest statement of what is stubbed.
8. **Rehearse once, timed**, on the machine and network you will use. Record a
   fallback video.

## The rule about fallbacks

Caching or stubbing a flaky call for the demo is legitimate engineering. Label it
in the code and know which parts are live, so that if you are asked what is real,
you can answer straight. Never present a canned response as a live one.

## Related

`/harden` runs first and closes correctness gaps. `production-audit` is the
different question of what breaks over weeks in production.
