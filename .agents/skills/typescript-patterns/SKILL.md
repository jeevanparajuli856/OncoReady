---
name: typescript-patterns
description: TypeScript type-level design — discriminated unions and exhaustiveness, branded types, narrowing and type predicates, `satisfies`, generics that earn their place, schema-first parsing of untrusted input, and the tsconfig strictness the gate depends on. Use when modelling domain types, removing `any`/`as`, designing a public API surface, or fixing `tsc --noEmit` failures.
metadata:
  origin: ECC-H
---

# TypeScript Patterns

Type-level design for TypeScript 5.x. This skill is about *shaping* types so the
compiler catches real bugs — not about formatting or naming.

`rules/typescript/coding-style.md` already covers naming, `any` avoidance,
immutability, error handling, and input validation, and it is always in context.
This skill is the deeper layer underneath it: what to reach for when the obvious
type does not express the constraint you actually have.

## When to Activate

- Modelling a domain type where some field combinations are impossible
- Removing `any`, `as`, or `@ts-expect-error` from existing code
- Designing a function or module that other code imports (public API surface)
- Deciding whether something should be generic
- Typing the boundary where untrusted data enters — request bodies, env vars,
  `JSON.parse`, third-party responses
- `tsc --noEmit` fails and the fix is not obvious
- A `tsconfig.json` change is proposed

## Core Principles

### 1. Make illegal states unrepresentable

If two fields can never both be set, do not give the type a shape that lets them
both be set. Optional-field soup pushes the check to runtime and to every reader.

```ts
// Bad — four states exist, only three are legal
type Req = { loading: boolean; data?: User; error?: Error };

// Good — exactly three states, each carrying only what it owns
type Req =
  | { status: 'loading' }
  | { status: 'ok'; data: User }
  | { status: 'error'; error: Error };
```

### 2. Parse, don't validate

Validation returns a boolean and leaves you holding the same untyped value.
Parsing returns a *new, narrower type* and makes the check unrepeatable. Do it
once, at the edge; everything inward takes the parsed type.

### 3. Annotate the boundary, infer the inside

Annotate exported function signatures and module boundaries so the contract is
explicit and errors point at the caller. Let inference do the work for locals —
re-stating an inferable type just creates a second thing to keep in sync.

## Discriminated Unions and Exhaustiveness

The discriminant must be a literal type, and the same property name across every
member. Pair it with a `never` check so adding a member becomes a compile error
rather than a silent fallthrough.

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;
    case 'rect':   return s.w * s.h;
    default: {
      const _exhaustive: never = s;   // adding a Shape breaks the build here
      throw new Error('unhandled shape: ' + JSON.stringify(_exhaustive));
    }
  }
}
```

Use the same shape for results instead of throwing across a module boundary:

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

`Result` is worth it when the caller is expected to handle the failure. It is not
worth it for genuinely exceptional cases — do not wrap everything.

## Branded Types

Two `string` ids are interchangeable to the compiler even when they are not
interchangeable to your database. Brand them.

```ts
declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

type UserId = Brand<string, 'UserId'>;
type OrgId  = Brand<string, 'OrgId'>;

const asUserId = (s: string): UserId => s as UserId;   // one sanctioned cast

declare function loadUser(id: UserId): Promise<User>;
declare const org: OrgId;
// loadUser(org);   // Error — OrgId is not assignable to UserId
```

Brand ids, money amounts, and anything already-validated (`SanitizedHtml`,
`AbsolutePath`). The single `as` inside the constructor is the point: it
concentrates the unsafety in one auditable line.

## Narrowing

Prefer, in order: the discriminant, a built-in guard, a type predicate, an
assertion function. `as` is last and needs a comment saying why it is sound.

```ts
// Type predicate — returns a boolean, narrows the caller's variable
function isUser(v: unknown): v is User {
  return typeof v === 'object' && v !== null && 'id' in v && 'email' in v;
}

// Assertion function — narrows for the rest of the scope, throws otherwise.
// The explicit return-type annotation is mandatory; TS cannot infer `asserts`.
function assertDefined<T>(v: T, what: string): asserts v is NonNullable<T> {
  if (v == null) throw new Error(what + ' is required');
}
```

A type predicate is a **promise you make to the compiler**, and the compiler does
not check the body. A predicate whose body is wrong is exactly as dangerous as
`as` — with a bigger blast radius, because it looks safe. Keep predicate bodies
trivial, or generate them from a schema (see below).

Start from `unknown`, never `any`. `unknown` forces the narrowing to happen;
`any` deletes every downstream check silently.

## `satisfies` vs Annotation vs Assertion

```ts
const routes = {
  home: '/',
  user: '/users/:id',
} satisfies Record<string, `/${string}`>;

routes.home;   // type is '/' — literal preserved
```

| Want | Use | Effect |
|---|---|---|
| Check the value against a type, keep the narrow inferred type | `satisfies T` | checked, literals preserved |
| Fix the variable's type to the wider contract | `: T` | checked, literals widened |
| Tell the compiler you know better | `as T` | **unchecked** — last resort |

Reach for `satisfies` on config objects, route tables, and lookup maps where you
want both the constraint *and* the literal keys. Never use `as` to silence an
error you have not understood; `as unknown as T` is a code smell that should carry
a comment justifying it.

## Generics That Earn Their Place

A type parameter is justified when it creates a *relationship* between inputs and
output. If it appears exactly once in the signature, it is not doing anything.

```ts
// Pointless — T is used once; this is just (x: unknown) => void
function log<T>(x: T): void {}

// Justified — the return type depends on the arguments
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

Constrain with `extends` so error messages land at the call site instead of deep
inside the implementation. Default type parameters (`<T = string>`) keep the
common call simple. Avoid conditional types in code others must read — they are
excellent in library internals and a maintenance burden in application code.

## Utility and Template-Literal Types

`Pick` / `Omit` / `Partial` / `Required` / `Readonly` / `Record` / `Awaited` /
`ReturnType` / `Parameters` / `NonNullable` cover most needs. Derive from the
source of truth rather than declaring a parallel type that will drift:

```ts
type User = { id: UserId; email: string; passwordHash: string };
type PublicUser = Omit<User, 'passwordHash'>;   // drifts with User, by construction
```

Template-literal types make string keys checkable:

```ts
type Method = 'GET' | 'POST';
type Route  = `/${string}`;
type Endpoint = `${Method} ${Route}`;   // 'GET /users' ok, 'GET users' not
```

Do not build a type-level parser. If the type is harder to read than the runtime
code it guards, the type has lost.

## The Runtime Boundary — Schema First

Data crossing into the process is `unknown` no matter what the docs promise.
Declare a schema, parse once, and **derive** the static type from the schema so
the two cannot diverge.

```ts
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
});

export type User = z.infer<typeof UserSchema>;   // derived, never hand-written

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch('/api/users/' + id);
  return UserSchema.parse(await res.json());     // throws on shape mismatch
}
```

Apply the same treatment to `process.env` — parse it once at startup into a typed
config object, rather than reading `process.env.FOO!` (which is
`string | undefined` lied about with `!`) at each use site.

This is the type-system half of the Prompt Defense Baseline in `CLAUDE.md`:
external, fetched, and retrieved data is untrusted, and `z.infer` is how "validate
or reject before acting" becomes something the compiler enforces. A cast at the
boundary — `(await res.json()) as User` — asserts trust in data you do not
control, and is the single most common way `any` re-enters a strict codebase.

## tsconfig Strictness the Gate Depends On

```jsonc
{
  "compilerOptions": {
    "strict": true,                        // the baseline; everything below adds to it
    "noUncheckedIndexedAccess": true,      // arr[i] is T | undefined — catches real bugs
    "exactOptionalPropertyTypes": true,    // { a?: string } no longer accepts a: undefined
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,          // type-only imports stay erasable
    "isolatedModules": true                // required by esbuild/SWC/Turbopack pipelines
  }
}
```

`noUncheckedIndexedAccess` is the highest-value flag after `strict` and the one
most often turned off under deadline pressure. Turn it on early; retrofitting it
into a large codebase is expensive.

`scripts/hooks/protect-config.js` blocks edits that weaken these — `"strict": false`,
`noImplicitAny: false`, `strictNullChecks: false`, `@ts-nocheck`, and Next.js's
`typescript.ignoreBuildErrors` / `eslint.ignoreDuringBuilds`. If a hook blocks
your edit, that is the design: fix the types, or state explicitly why the
weakening is correct.

## The Typecheck Gate

`scripts/lib/detect.js` resolves a `typecheck` command in this order: a `typecheck`
npm script, a `type-check` npm script, then `tsc --noEmit` if `tsconfig.json`
exists. The Stop hook (`scripts/hooks/stop-gate.js`) runs that command
**project-wide** after edits and blocks on failure — so a type error anywhere
stops the turn, not just in files you touched.

Practical consequences:

- Add a `typecheck` npm script so the gate runs the same command CI does.
- In a monorepo, make that script cover every package (`tsc -b`), or the gate
  silently checks only the root.
- `@ts-expect-error` (which fails when the error goes away) is always preferable
  to `@ts-ignore` (which rots silently). Both need a reason on the same line.

## Anti-Patterns

| Anti-pattern | Why it hurts | Instead |
|---|---|---|
| `as` to silence an error | Deletes the check, keeps the bug | Narrow, or fix the type |
| `any` on a boundary | Poisons every downstream inference | `unknown` + parse |
| Hand-written type beside a schema | The two drift; the type wins, reality doesn't | `z.infer<typeof S>` |
| Optional fields for state | Illegal combinations become representable | Discriminated union |
| `!` non-null assertion | Same as `as`, easier to miss in review | `assertDefined`, or handle null |
| Enums for string sets | Nominal, awkward to erase, poor JSON interop | Union of string literals |
| Generic used once | Noise with no relationship expressed | Concrete type or `unknown` |
| `interface` merged across files by accident | Declaration merging is silent | `type` for closed shapes |

## Out of Scope (Pointer Sections)

- **React prop and hook typing** — see [react-patterns](../react-patterns/SKILL.md)
  and `rules/react/hooks.md`
- **Naming, immutability, error handling, `console.log`** — already in
  `rules/typescript/coding-style.md`, always in context
- **Runtime performance** — types are erased; see
  [react-performance](../react-performance/SKILL.md)
- **Build/bundler configuration** — see [vite-patterns](../vite-patterns/SKILL.md)
  or [nextjs-react](../nextjs-react/SKILL.md)

## Related

- Rules: [rules/typescript/](../../rules/typescript/) — coding-style, patterns, security, testing, hooks
- Skills: [react-patterns](../react-patterns/SKILL.md), [coding-standards](../coding-standards/SKILL.md), [error-handling](../error-handling/SKILL.md), [api-design](../api-design/SKILL.md)
- Agents: `typescript-reviewer` for review, `build-error-resolver` for `tsc` failures
- Commands: `/review`, `/check`, `/gate`

## Examples

### Typed env config, parsed once

```ts
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export const env = EnvSchema.parse(process.env);   // throws at startup, not at 3am
```

Failing fast at boot beats `undefined` surfacing inside a request handler.

### Exhaustive reducer

```ts
type Action =
  | { type: 'add'; item: Item }
  | { type: 'remove'; id: ItemId };

function reducer(state: Item[], action: Action): Item[] {
  switch (action.type) {
    case 'add':    return [...state, action.item];
    case 'remove': return state.filter((i) => i.id !== action.id);
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}
```

Adding an action variant without handling it fails `tsc --noEmit`, which means it
fails the Stop gate before it reaches review.

### Narrowing a third-party response without `as`

```ts
async function loadConfig(url: string): Promise<Config> {
  const raw: unknown = await fetch(url).then((r) => r.json());
  const parsed = ConfigSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('invalid config from ' + url + ': ' + parsed.error.message);
  }
  return parsed.data;   // typed, and actually checked
}
```
