---
description: Create, verify, or list workflow checkpoints after running verification checks.
metadata:
  origin: ECC-derived
---

# Checkpoint Command

Create or verify a checkpoint in your workflow.

## Usage

`/checkpoint [create|verify|list] [name]`

## Create Checkpoint

When creating a checkpoint:

1. Run `/gate` to ensure the current state is clean
2. Create a git commit with the checkpoint name
3. Record the checkpoint in `.ecch/state.json` (the Stop hook writes auto-checkpoints
   to the same list, so `/checkpoint list` shows both):

```bash
node -e "require('$CLAUDE_PLUGIN_ROOT/scripts/lib/state.js').recordCheckpoint({name:process.argv[1],sha:require('child_process').execSync('git rev-parse --short HEAD').toString().trim()})" "$CHECKPOINT_NAME"
```

4. Report checkpoint created

## Verify Checkpoint

When verifying against a checkpoint:

1. Read checkpoint from log
2. Compare current state to checkpoint:
   - Files added since checkpoint
   - Files modified since checkpoint
   - Test pass rate now vs then
   - Coverage now vs then

3. Report:
```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## List Checkpoints

Show all checkpoints with:
- Name
- Timestamp
- Git SHA
- Status (current, behind, ahead)

## Workflow

Typical checkpoint flow:

```
[Start] --> /checkpoint create "feature-start"
   |
[Implement] --> /checkpoint create "core-done"
   |
[Test] --> /checkpoint verify "core-done"
   |
[Refactor] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## Arguments

$ARGUMENTS:
- `create <name>` - Create named checkpoint
- `verify <name>` - Verify against named checkpoint
- `list` - Show all checkpoints
- `clear` - Remove old checkpoints (keeps last 5)
