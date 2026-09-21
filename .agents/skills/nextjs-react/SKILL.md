---
name: nextjs-react
description: Next.js App Router work — the server/client component boundary, data fetching and caching, route handlers, environment variables that leak to the browser, and Turbopack dev behavior. Use when building or reviewing Next.js features, or when a component fails with a server/client boundary error.
metadata:
  origin: ECC-derived
  upstream: skills/nextjs-turbopack
---

# Next.js (App Router)

Next.js 16+ uses Turbopack by default for local development: an incremental bundler written in Rust that significantly speeds up dev startup and hot updates.

## When to Use

- **Turbopack (default dev)**: Use for day-to-day development. Faster cold start and HMR, especially in large apps.
- **Webpack (legacy dev)**: Use only if you hit a Turbopack bug or rely on a webpack-only plugin in dev. Disable with `--webpack` (or `--no-turbopack` depending on your Next.js version; check the docs for your release).
- **Production**: Production build behavior (`next build`) may use Turbopack or webpack depending on Next.js version; check the official Next.js docs for your version.

Use when: developing or debugging Next.js 16+ apps, diagnosing slow dev startup or HMR, or optimizing production bundles.

## How It Works

- **Turbopack**: Incremental bundler for Next.js dev. Uses file-system caching so restarts are much faster (e.g. 5–14x on large projects).
- **Default in dev**: From Next.js 16, `next dev` runs with Turbopack unless disabled.
- **File-system caching**: Restarts reuse previous work; cache is typically under `.next`; no extra config needed for basic use.
- **Bundle Analyzer (Next.js 16.1+)**: Experimental Bundle Analyzer to inspect output and find heavy dependencies; enable via config or experimental flag (see Next.js docs for your version).

## Examples

### Commands

```bash
next dev
next build
next start
```

### Usage

Run `next dev` for local development with Turbopack. Use the Bundle Analyzer (see Next.js docs) to optimize code-splitting and trim large dependencies. Prefer App Router and server components where possible.

## Middleware File Naming

Next.js 16 introduced `proxy.ts` as the middleware filename, replacing the older `middleware.ts` convention:

- **Next.js 16+**: use `proxy.ts` at the project root
- **Pre-Next.js 16**: use `middleware.ts` at the project root

The filename change is tied to the **Next.js version**, not to which bundler (Turbopack or webpack) is in use. Always check the official docs for the version you are reviewing.

**Do not flag `proxy.ts` as a misnamed or missing middleware file in Next.js 16 projects.** The file is correct and intentional. Suggesting a rename to `middleware.ts` will break middleware execution.

Reference: [Next.js proxy docs](https://nextjs.org/docs/app/getting-started/proxy)

## Best Practices

- Stay on a recent Next.js 16.x for stable Turbopack and caching behavior.
- If dev is slow, ensure you're on Turbopack (default) and that the cache isn't being cleared unnecessarily.
- For production bundle size issues, use the official Next.js bundle analysis tooling for your version.


## The server/client boundary

Most Next.js bugs that cost a whole evening are boundary bugs. The rules:

- Every component is a **Server Component** unless the file starts with `'use client'`.
- Server Components can be `async`, read the database, and use secrets. They cannot
  use hooks, event handlers, or browser APIs.
- Client Components can use hooks and handlers. They cannot be `async`, and any
  value they touch must be serializable.
- `'use client'` marks a **boundary, not a file**: everything imported below it is
  also client code. Put it as low in the tree as possible.

```tsx
// GOOD — server component fetches, client component handles interaction
// app/receipts/page.tsx  (server)
export default async function Page() {
  const receipts = await db.receipt.findMany();
  return <ReceiptTable rows={receipts} />;
}

// components/receipt-table.tsx  (client)
'use client';
export function ReceiptTable({ rows }: { rows: Receipt[] }) {
  const [sort, setSort] = useState('date');
  ...
}
```

Passing a function, a class instance, or a Date-keyed Map across that boundary
throws at runtime, not at build. If a prop is not JSON, it does not cross.

## Environment variables

`NEXT_PUBLIC_*` variables are **inlined into the browser bundle**. Anything else
is server-only and reading it in a Client Component yields `undefined` rather than
an error — which is why this fails silently.

Never prefix a secret with `NEXT_PUBLIC_`. A service-role key in a client bundle
is public the moment it deploys, and it must be rotated, not just removed.

## Route handlers

```ts
// app/api/receipts/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return Response.json(await getReceipts(searchParams.get('userId')));
}
```

Route handlers are static by default when they read nothing dynamic. If one reads
cookies, headers, or `searchParams` and returns stale data, that is caching, not a
bug in your code — reach for `export const dynamic = 'force-dynamic'` and know why
you needed it.

## Traps worth knowing before you hit them

| Symptom | Cause |
|---|---|
| "Event handlers cannot be passed to Client Component props" | A function crossed the boundary; move the handler into the client component |
| Data is stale after a mutation | Missing `revalidatePath` / `revalidateTag` after the write |
| Works in dev, empty in prod | Static rendering at build time; the page needs `dynamic = 'force-dynamic'` |
| `undefined` env var in the browser | Missing `NEXT_PUBLIC_` prefix — check it is not a secret before adding one |
| Hydration mismatch | `Date.now()`, `Math.random()`, or `localStorage` during render |
| `useState` error in a server component | Missing `'use client'` at the top of the file |

## Verification

- Every interactive component that needs hooks has `'use client'`, placed as low as possible
- No secret carries a `NEXT_PUBLIC_` prefix
- Props crossing the boundary are serializable
- Mutations revalidate the paths that display their data
- The page was checked in a production build, not only in dev
