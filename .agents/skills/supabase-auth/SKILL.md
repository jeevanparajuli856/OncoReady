---
name: supabase-auth
description: Supabase auth and data access done safely under time pressure — the right client for each runtime, session handling in Next.js App Router, and Row Level Security written with the first table rather than bolted on later. Use when adding Supabase auth, creating tables, writing RLS policies, or debugging a query that returns no rows for a signed-in user.
metadata:
  origin: ECC-H
---

# Supabase Auth and RLS

Supabase's defaults are safe in one direction and dangerous in the other: a table
with RLS enabled and no policy returns nothing, and a table with RLS **disabled**
returns everything to anyone holding the anon key — which is in the browser bundle
by design.

Both failure modes look the same during a demo. One is an empty list; the other is
a data leak nobody notices.

## When to Activate

- Adding Supabase auth to a project
- Creating any table that holds per-user data
- Writing or reviewing RLS policies
- A signed-in user's query returns zero rows
- Reviewing a diff that touches `supabase/`, `@supabase/ssr`, or a `.sql` migration

This is a **security trigger** under `rules/common/security.md`: work here is at
least `standard` tier and gets full TDD and a `security-reviewer` pass, however
small the diff looks.

## Pick the right client

Using the wrong one is the most common Supabase bug and the most common Supabase
leak.

| Runtime | Client | Key | Notes |
|---|---|---|---|
| Browser / Client Component | `createBrowserClient` | anon | Session in cookies; RLS applies |
| Server Component / Route Handler | `createServerClient` | anon | Must be given cookie read/write; RLS applies |
| Middleware / proxy | `createServerClient` | anon | Refreshes the session on each request |
| Trusted server-only script | `createClient` | **service role** | **Bypasses RLS entirely** |

The service-role key must never reach the browser. It must never carry a
`NEXT_PUBLIC_` prefix, never appear in a Client Component, and never be committed.
If it has been exposed, rotating it is the fix — deleting the line is not.

```ts
// lib/supabase/server.ts — Server Components and Route Handlers
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
          catch { /* called from a Server Component; middleware refreshes instead */ }
        },
      },
    }
  );
}
```

The anon key being public is fine and intended. It is only safe because RLS is
what actually restricts the data — which is why the next section is not optional.

## RLS with the first table, not later

Write the policy in the same migration that creates the table. "Add RLS later"
does not survive a deadline, and a table shipped without it has been readable by
anyone with the anon key for however long it was live.

```sql
create table receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

alter table receipts enable row level security;

create policy "own rows: select" on receipts
  for select using (auth.uid() = user_id);

create policy "own rows: insert" on receipts
  for insert with check (auth.uid() = user_id);

create policy "own rows: update" on receipts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows: delete" on receipts
  for delete using (auth.uid() = user_id);

create index on receipts (user_id);
```

Four separate policies, because one `for all` policy hides which operation is
actually permitted. `using` filters existing rows; `with check` validates the new
ones — an update needs both, or a user can move a row to another user's id.

The index on `user_id` is not optional: RLS runs its predicate per row, so an
unindexed policy column turns every query into a full scan.

## Debugging "no rows"

An empty result for a signed-in user is almost always one of these, in order:

1. **RLS enabled, no policy for that operation** — the default is deny
2. **`auth.uid()` is null** — the request carried no session, so the server client
   was built without cookies, or middleware is not refreshing them
3. **Wrong client** — a browser client used on the server, so no session
4. **Column mismatch** — the policy compares against a column that is not the owner

Check in that order. Run the query in the Supabase SQL editor with
`set request.jwt.claims` to confirm what the policy sees rather than guessing.

Disabling RLS to "check if that's the problem" is fine only if you re-enable it in
the same sitting. It usually is the problem, and it usually stays disabled.

## Session refresh

In Next.js, the session is refreshed in middleware (`proxy.ts` on Next 16+,
`middleware.ts` before). Without it, tokens expire mid-session and users are
silently signed out — typically about an hour in, which is often mid-demo.

## Verification

- Every table holding user data has `enable row level security` in its migration
- Each table has explicit policies for the operations it actually needs
- `update` policies have both `using` and `with check`
- Policy columns are indexed
- The service-role key appears in no client bundle, no `NEXT_PUBLIC_` variable, and no commit
- Session refresh runs in middleware
- A signed-in user sees their rows and **a second test user sees none of them** —
  verified, not assumed
