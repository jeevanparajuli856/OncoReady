---
description: Check that ECC-H is correctly installed and wired in this project — hooks, MCP servers, brief sync, rules, state, and gate commands — and report what to fix.
argument-hint: "[--format text|json]"
metadata:
  origin: ECC-derived
  upstream: commands/harness-audit
---

# /ecch-doctor

Deterministic health check of the ECC-H install in the current project. Run it
when something is not firing, after a plugin update, or before a deadline when
you want to know the harness itself is not the problem.

## Usage

```
/ecch-doctor
/ecch-doctor --format json
```

## Deterministic engine

Always run the script rather than inspecting by eye — it is the source of truth
for what is checked and how it scores:

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/doctor.js" --format text
```

Do not invent additional checks in the response, and do not report a check as
passing that the script did not run.

## What it checks

| Area | Check |
|---|---|
| Plugin | `plugin.json` parses; no `agents` or `hooks` field (both are rejected by the validator); `version` present; `mcpServers` opt-out present |
| Hooks | `hooks/hooks.json` parses; every referenced script exists and parses; profile resolves |
| Project | `PROJECT.md` exists; the brief matches what is inlined in `CLAUDE.md` and `AGENTS.md` |
| Rules | The rules the detected stack needs are present in the project |
| State | `.ecch/` exists; `state.json` parses; `.ecch/state.json` and `observations/` are gitignored |
| Gate | Detected build/test/lint/typecheck commands exist and are runnable |
| MCP | `.mcp.json` parses; `.codex/config.toml` lists the same servers |
| Codex | `AGENTS.md` present; `.agents/` mirrors are not older than `skills/` |
| Secrets | No secret-shaped value in a tracked file; `.env*` is gitignored |

## Output

```
ECC-H doctor — myapp

  PASS  plugin manifest
  PASS  hooks (9 wired, profile: standard)
  WARN  brief drift — PROJECT.md is newer than CLAUDE.md; run /ecch-brief
  PASS  rules (common, typescript, react, web)
  PASS  state
  FAIL  gate — "pnpm run test" is configured but no test script exists
  PASS  mcp (context7, chrome-devtools)
  WARN  codex mirrors are 3 days older than skills/; run: npm run adapters

  2 warnings, 1 failure
```

Each finding names the fix. A `FAIL` means something is actually broken; a `WARN`
means it will bite later.

## Common findings

| Finding | Fix |
|---|---|
| brief drift | `/ecch-brief` |
| stale `.agents/` mirrors | `npm run adapters` |
| hooks not firing | Check `hooksEnabled` and `hookProfile` in `.ecch/config.json` |
| gate check missing | Add the script to `package.json`, or accept the skip |
| `.env` not gitignored | Add it immediately, then rotate anything already committed |
| MCP server not connected | The server needs credentials — `.mcp.json` says which |
