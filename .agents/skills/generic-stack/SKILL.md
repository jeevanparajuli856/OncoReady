---
name: generic-stack
description: Work in a project whose stack ECC-H has no pack for — discover the real build, test, lint, and run commands from the repository itself instead of guessing, and record them so the gate and later sessions use them. Use when the project is not Next.js, React, Supabase, or Python, or when the detected stack is Unrecognized.
metadata:
  origin: ECC-H
---

# Generic Stack

ECC-H ships packs for Next.js/React, Supabase, and Python. Everything else lands
here. The pipeline, gates, rules, and agents all still apply — the only thing
missing is knowledge of how *this* project builds and tests.

So find out, from the repository, rather than assuming.

## When to Activate

- `/ecch-init` or the SessionStart banner reports an unrecognized stack
- The project is Go, Rust, Java, Ruby, PHP, C#, Elixir, or anything else
- A polyglot repo where the part you are touching has no pack
- `/gate` reports every check as skipped

## The rule

**Never invent a command.** A guessed `npm test` in a repo that uses `make check`
produces a confident failure report about nothing. If a check does not exist,
report it as absent — `scripts/lib/gate.js` skips rather than fabricates for
exactly this reason, and you should too.

## How It Works

### 1. Read the manifest and the task runner

The manifest names the ecosystem; the task runner names the commands. Check both
— many projects wrap the ecosystem's default in `make` or `just`.

| File | Ecosystem | Usual commands |
|---|---|---|
| `go.mod` | Go | `go build ./...`, `go test ./...`, `go vet ./...` |
| `Cargo.toml` | Rust | `cargo build`, `cargo test`, `cargo clippy` |
| `pom.xml` | Java/Maven | `mvn compile`, `mvn test` |
| `build.gradle[.kts]` | Java/Kotlin | `./gradlew build`, `./gradlew test` |
| `Gemfile` | Ruby | `bundle exec rspec`, `bundle exec rubocop` |
| `composer.json` | PHP | `composer test`, `vendor/bin/phpunit` |
| `mix.exs` | Elixir | `mix compile`, `mix test` |
| `*.csproj`, `*.sln` | .NET | `dotnet build`, `dotnet test` |
| `pubspec.yaml` | Dart/Flutter | `flutter test`, `flutter analyze` |
| `Makefile`, `justfile`, `Taskfile.yml` | any | read the targets — these win |

### 2. Trust CI over documentation

`.github/workflows/*.yml` is the most reliable source in any repository: it is
the exact sequence that must pass, and unlike the README it cannot silently rot.

```bash
grep -A3 -E "run:" .github/workflows/*.yml | head -40
```

Take the build, test, and lint commands straight from there.

### 3. Confirm before relying on it

Run each candidate once. A command that fails because the toolchain is missing is
different from one that fails because the code is broken, and you need to know
which you are looking at before the gate depends on it.

### 4. Record what you found

Write the commands into `PROJECT.md` so the next session and `/gate` do not
rediscover them:

```markdown
## Commands

- build: `cargo build`
- test: `cargo test`
- lint: `cargo clippy -- -D warnings`
- run: `cargo run`
```

If it took real digging, save a `fact` to `.ecch/memory/` via `session-memory`.

## What still applies

Everything except the pack-specific knowledge:

- the `ship-pipeline` size classifier and both gates
- the tier test policy — `smoke-test` at trivial/small, `tdd-workflow` at standard/large
- `rules/common/` in full
- `coding-standards`, `error-handling`, `api-design`, `security-review`
- `code-reviewer`, `security-reviewer`, `build-error-resolver`, `code-explorer`

What you do not get is idiomatic guidance for the language. Compensate by reading
neighboring code before writing any, and by matching its conventions exactly —
`inherit-legacy-style` reasoning applies: the repository's existing style is the
specification.

## Adding a real pack

If you keep returning to the same stack, it is worth 20 minutes:

1. Add `skills/<stack>/SKILL.md` with the patterns and traps that bite you
2. Add a detection branch in `scripts/lib/detect.js` (`detectStacks`, plus
   `detectCommands` if the commands are not already covered)
3. Optionally add `rules/<lang>/` with coding-style, patterns, security, testing

`SETUP.md` documents the shape.

## Verification

- Build, test, and lint commands came from the repo (manifest, task runner, or CI), not from memory
- Each was run once and its behavior observed before being relied on
- Absent checks are reported as absent, not substituted
- The commands are recorded in `PROJECT.md`
- New code matches the conventions of the code beside it
