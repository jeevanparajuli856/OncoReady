---
description: Set ECC-H up on this project — detect the stack, interview for the project brief, and write PROJECT.md, CLAUDE.md, AGENTS.md, rules, MCP config, and .ecch state. Dry-run by default.
argument-hint: "[--apply] [--stack <ids>] [--force]"
metadata:
  origin: ECC-derived
  upstream: commands/project-init
---

# /ecch-init

Onboard the current project onto ECC-H. This is the one command you run in every
new project.

## Usage

```text
/ecch-init              # detect, interview, show the plan (writes nothing)
/ecch-init --apply      # write the files after you have seen the plan
/ecch-init --stack nextjs,supabase   # override detection
/ecch-init --force      # overwrite existing ECC-H-generated files
```

## Safety Rules

1. **Default to dry-run.** Show every file that would be written, then ask. Only
   `--apply` writes.
2. **Never overwrite hand-written guidance.** If `CLAUDE.md`, `AGENTS.md`, or
   `.codex/config.toml` already exists, read it and propose a merge — ECC-H's
   generated blocks are delimited, so merging is additive.
3. **Never write a secret.** Detected env var *names* go into `PROJECT.md` and
   `.env.example`; values never leave `.env.local`.
4. **Keep permissions narrow.** Generated `.claude/settings.json` allows only the
   build, test, and lint commands actually detected.

## Step 1 — Detect

```bash
node -e "console.log(JSON.stringify(require('$CLAUDE_PLUGIN_ROOT/scripts/lib/detect.js').detect(), null, 2))"
```

Report the stack, package manager, and detected commands **with the evidence for
each**, so a wrong guess is visible before anything is written:

```
Next.js       — next dependency and next.config.ts
Supabase      — @supabase/ssr dependency
TypeScript    — tsconfig.json
package manager: pnpm (pnpm-lock.yaml)
build: pnpm run build | typecheck: pnpm exec tsc --noEmit | test: (none found)
```

If the stack is `Unrecognized`, say so and use the `generic-stack` skill to find
the real commands before continuing.

## Step 2 — Interview for the brief

Ask for what cannot be detected. Keep it to one round; a blank field is never a
blocker, and the brief can be edited any time.

1. **Idea** — one paragraph: what is this and who is it for?
2. **Goal and deadline** — what counts as done, and by when?
3. **Demo path** — the exact click-through that must work, as numbered steps.
   Push for specifics; this field drives Phase 7, `/check`, `/demo`, and review
   priority. "It should work" is not a demo path.
4. **Constraints** — sponsor tech, judging criteria, offline demo, no paid APIs,
   anything that is fixed.

Infer the rest and let the user correct it: locked stack from the manifest,
env var names from `.env.example` or `process.env` references, data model from an
existing schema or migration.

## Step 3 — Show the plan

List every file, marked new or merged:

```
NEW    PROJECT.md                     the brief (yours to edit)
NEW    CLAUDE.md                      ECC-H rules + brief inlined
NEW    AGENTS.md                      same content, for Codex
NEW    .claude/settings.json          narrow permissions for detected commands
NEW    .mcp.json                      context7, chrome-devtools
NEW    .codex/config.toml             Codex mirror of the same MCP servers
NEW    .ecch/config.json              hook profile: standard
NEW    .ecch/state.json               empty session state
MERGE  .gitignore                     + .ecch/state.json, .ecch/observations/
COPY   rules/common/ + rules/typescript/ + rules/react/ + rules/web/
```

Then ask for approval.

## Step 4 — Apply

Run the scaffolder, which performs the writes shown above:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/init-project.js" --apply
```

## Step 5 — Report and hand off

```
ECC-H ready.

  Stack     Next.js + Supabase + TypeScript (pnpm)
  Rules     common, typescript, react, web
  Hooks     standard profile
  MCP       context7, chrome-devtools  (supabase: needs a project ref — add it to .mcp.json)
  Brief     PROJECT.md — 3-step demo path, deadline Sunday 17:00

Next: /ship "<your first feature>"
Edit the brief any time in PROJECT.md, then run /ecch-brief to re-sync.
```

Name anything that needs the user's own credentials rather than pretending it is
configured.

## Output Contract

- Dry-run prints the plan and writes nothing
- Every generated file is listed before it is written
- Detection evidence is shown, so a wrong guess can be corrected
- Secrets are never written; only variable names are recorded
- The final message names the next command to run
