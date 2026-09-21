---
description: Run the full ECC-H quality gate now — secret scan, typecheck, lint, build, tests — and report exactly what failed.
argument-hint: "[quick|full] [--fix]"
metadata:
  origin: ECC-derived
---

# Gate Command

Run the quality gate on demand. The same gate runs automatically at Stop, but
scoped to the files edited that turn; this runs it across the project.

## Usage

```
/gate            # full: secrets, typecheck, lint, build, test
/gate quick      # secrets + typecheck only — the two that catch most breakage
/gate --fix      # run the formatter first, then the gate
```

## How it works

The gate is `scripts/lib/gate.js`. It detects this project's real commands with
`scripts/lib/detect.js` and runs the ones that exist.

```bash
node -e "
const {runGate}=require('$CLAUDE_PLUGIN_ROOT/scripts/lib/gate.js');
const {execSync}=require('child_process');
const files=execSync('git diff --name-only HEAD').toString().split('\n').filter(Boolean);
const r=runGate({files});
console.log(r.summary);
if(!r.passed){
  const failed=r.checks.find(c=>c.status!=='pass'&&c.status!=='skip');
  if(failed&&failed.output) console.log('\n'+failed.output);
}
process.exitCode=r.passed?0:1;
"
```

For `quick`, pass `only: ['secrets','typecheck']`.

## The checks

| Check | Source | Blocking |
|---|---|---|
| secrets | regex scan of changed files | yes — a committed key must be rotated, not deleted |
| typecheck | `tsc --noEmit`, `mypy`, or the project's `typecheck` script | yes |
| lint | the project's `lint` script, `ruff`, `clippy`, `go vet` | yes |
| build | the project's `build` script, `cargo build`, `go build` | yes |
| test | the project's `test` script, `pytest`, `go test` | yes |

**A check the project does not have is reported as `skip`, never invented.** A
project with no lint script gets `skip lint`, not a guessed `eslint .`.

## Reading the result

- `PASS` — the tree is green. This is the state a checkpoint should be taken in.
- `FAIL` — fix it before doing anything else. Failing forward is how one broken
  thing becomes three.
- `skip` — that check does not exist here. If it should, adding it is a real
  improvement; say so rather than silently accepting the gap.
- `ERR` — the check timed out or could not run. Investigate; do not treat it as a pass.

## When to run it

- Before `/checkpoint` — checkpointing a red tree stores a trap
- Before Gate 2 of `ship-pipeline` (the commit gate)
- After a merge or a dependency change
- Whenever you are about to say the work is done

## Fixing failures

| Failure | Next step |
|---|---|
| secrets | Move the value to `.env.local`, add the name to `.env.example`, rotate if it was ever committed |
| typecheck / build | `/fix`, or the `build-error-resolver` agent for more than a handful |
| lint | Fix the code. Do not relax the config — the `protect-config` hook blocks that anyway |
| test | Fix the implementation, not the test, unless the test is genuinely wrong |

Never make a gate pass by weakening the check. A green gate that means nothing is
worse than a red one.
