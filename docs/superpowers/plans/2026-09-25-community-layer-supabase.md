# Community Layer (Supabase Auth, Reviews, Favorites) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock reviews with real, authenticated user reviews and bookmarks backed by Supabase (email/password auth, RLS-only access), plus an `/account` dashboard.

**Architecture:** Official `@supabase/ssr` — browser client (`lib/supabase/client.ts`), server client (`lib/supabase/server.ts`, async because Next 16 `cookies()` is async), middleware client for session refresh, and a global `AuthProvider` mounted in `AppShell`. Tool data stays in `data/agents.json`; `slug` is the join key. Row Level Security is the sole authorization boundary — no service-role key. Every read the app needs is a public RLS select; every write is owner-gated.

**Tech Stack:** Next.js 16.3.5 (App Router, server components), React 19, `@supabase/ssr` + `@supabase/supabase-js`, Tailwind v4, Node 24 (native TS type-stripping for assert scripts).

**Spec:** `docs/superpowers/specs/2026-09-25-community-layer-supabase-design.md`

## Execution Amendments (source-of-truth change, supersedes the steps below)

Applied during Task 1; recorded in full in the plan's SDD ledger (`.superpowers/sdd/2026-09-25-community-layer-supabase/progress.md`):

1. **Root file is `proxy.ts`, not `middleware.ts`** — Next 16.3.5 deprecates the `middleware` convention and renames it to `proxy.ts` (export named `proxy`; confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). `config.matcher` is unchanged. Ruling in ledger.
2. **`@supabase/ssr@0.12.7` removed `createMiddlewareClient`** — `lib/supabase/middleware.ts` instead uses `createServerClient` with a request/response cookie adapter: `getAll()` reads `request.cookies`; `setAll(cookiesToSet, headers)` writes cookies to the rebuilt `supabaseResponse` and applies the cache-control headers; then `auth.getUser()` performs refresh-token rotation. Official Supabase pattern for Next 16 proxy (verified against `@supabase/ssr` `CookieMethodsServer` types). Ruling in ledger.
3. **`updateSessionCookie` now returns `{ response, user }`** (plan said "returns the response") so root `proxy.ts` can enforce the spec §6.3 `/account` guard with the verified user instead of creating a second client. Ruling in ledger.

Everything else in Tasks 1–6 is implemented exactly as written below.

## Global Constraints

- **No service-role key.** Only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never read `SUPABASE_SERVICE_ROLE_KEY`.
- **Env-missing degradation:** with no env vars, `getBrowserClient()`/`getServerClient()` return `null`; every consumer renders the signed-out/empty state; inline messages say "Authentication is not configured yet." Nothing throws. `npm run build` and `npm run dev` must stay green with env vars absent.
- **Replace mocks everywhere:** the tool-page Reviews tab and homepage Community Reviews become live data. No mock fallback, no `soon` badges, no "Load more reviews" button.
- **Next 16.3.5:** `cookies()` from `next/headers` is async — `getServerClient()` must be `async` and `await cookies()`. Route `params`/`searchParams` are Promises — must be awaited.
- **React-Compiler lint rule:** client components must never call `setState` synchronously inside an effect body. `setState` inside `onAuthStateChange`/`.then`/event-handler callbacks is permitted. Baseline lint = exactly 10 pre-existing problems; every new file must stay clean.
- **Auth model:** email + password only. One review per user per tool (`unique (user_id, slug)`, upsert on submit, hard delete only). No pagination (cap at 100 reviews per slug).
- **Verification gates (no test runner):** `npm run build` exits 0; `npm run lint` shows exactly the 10 baseline problems; Node 24 asserts for `lib/time.ts` and `lib/supabase/env.ts`.
- **Database join:** `slug` is a plain string key to `data/agents.json` (no FK). Stale slugs must not crash — resolve to "Anonymous"/"Unknown tool" gracefully.
- **Commits:** lowercase prefixes (`feat:`, `docs:`, `fix:`), on `main`. `.env.local` is git-ignored (never committed).
- **New files beyond the spec §12 map** (implementation details the spec's behavior requires — each is small and single-purpose): `lib/agentLookup.ts`, `lib/favorites-client.ts`, `lib/reviews-client.ts`, `lib/profile.ts`, `lib/initials.ts`, `components/Stars.tsx`.

## Review Focus

Failure modes / input classes the spec implies but no task's own tests exercise directly — the owning task pins each:

1. **Env vars absent anywhere** (fresh clone, CI, first dev run): every page builds and renders signed-out; auth forms and mutation attempts say "Authentication is not configured yet."; `/account` redirects to `/login?next=/account`; homepage + tool Reviews show empty states. → Tasks 1, 2, 4, 5; verified at gate in Task 6.
2. **Signed-out visitor on a tool page** (the "before auth exists" default): FavoriteButton renders a `/login` link (not a dead button), Reviews tab shows the enabled "Sign in to write a review" CTA with `next=/agent/<slug>#reviews`. → Tasks 3, 4.
3. **Tool with zero reviews** (fresh database): Reviews tab shows count `0` and "No reviews yet — be the first." with no average row; homepage shows "No reviews yet — share your experience by signing in." → Tasks 4, 5.
4. **Auth edge cases** (wrong password, short password, mismatched confirm, unconfirmed email): inline error/success messages; unconfirmed signup lands on "Check your inbox to confirm your email." rather than crashing or silently failing; reset shows "Reset link sent — check your inbox." → Task 2.
5. **Duplicate review submission** (same user, same tool, twice): upsert on `user_id,slug` updates the existing row — never a second row, never an RLS error. → Task 4 (+ manual re-check in Task 6).
6. **Stale slug in the DB** (a review/favorite references a tool removed from `agents.json`): account dashboard and homepage render "Unknown tool" text with the raw slug; no crash. → Tasks 4, 5.

---

### Task 1: Supabase Foundation (deps, env, clients, middleware, migration)

**Files:**
- Modify: `package.json` (add 2 deps)
- Create: `.env.example`, `lib/supabase/env.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `lib/supabase/auth.ts`, `middleware.ts`, `supabase/migrations/20260925-community-layer.sql`

**Interfaces:**
- Produces:
  - `lib/supabase/env.ts` → `export const SUPABASE_URL: string`, `export const SUPABASE_ANON_KEY: string`, `export const supabaseConfigured: boolean`
  - `lib/supabase/client.ts` → `export function getBrowserClient(): SupabaseClient | null`
  - `lib/supabase/server.ts` → `export async function getServerClient(): Promise<SupabaseClient | null>`
  - `lib/supabase/middleware.ts` → `export async function updateSessionCookie(request: NextRequest): Promise<NextResponse>`
  - `lib/supabase/auth.ts` → `export async function getCurrentUser(): Promise<User | null>`
  - Root `middleware.ts` refreshes the session cookie and guards `/account`.
- Consumes: nothing from later tasks.

- [ ] **Step 1: Install dependencies**

Consult `node_modules/next/dist/docs/` only if the middleware conventions differ from the recipe below during build. Then:

```bash
npm install @supabase/ssr @supabase/supabase-js
```

Note: `@supabase/ssr` latest uses `createBrowserClient`, `createServerClient`, and `createMiddlewareClient({ request, response }, { supabaseUrl, supabaseKey })` with `cookies: { getAll, setAll }`. If the installed typings differ (older `req/res` signature), adapt only the call sites to match the installed package's exported types.

- [ ] **Step 2: Create `.env.example`**

```text
# Supabase (public/anon credentials). RLS is the authorization boundary — no service-role key.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Trends feed (optional in dev; used by /trends)
TRENDS_MCP_API_KEY=
```

- [ ] **Step 3: Create `lib/supabase/env.ts`**

```ts
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
```

- [ ] **Step 4: Write and run the env assert (RED)**

In the temp workspace `C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\`, write `assert-env.mjs`:

```js
import assert from 'node:assert';

const mod = await import(
  `file:///${process.cwd().replace(/\\/g, '/')}/lib/supabase/env.ts`
);
assert.equal(mod.supabaseConfigured, false, 'expected unconfigured (no keys yet)');
console.log('env asserts OK (unconfigured)');
```

Run from repo root in PowerShell: `node C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-env.mjs`

Expected: `env asserts OK (unconfigured)`. This assertion flips to `expected true` in Task 6 after the human supplies keys.

- [ ] **Step 5: Create `lib/supabase/client.ts`**

```ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfigured } from './env';

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}
```

- [ ] **Step 6: Create `lib/supabase/server.ts`**

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfigured } from './env';

export async function getServerClient(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — the middleware refreshes the
          // session cookie on navigation; safe to ignore here.
        }
      },
    },
  });
}
```

- [ ] **Step 7: Create `lib/supabase/middleware.ts`**

```ts
import { createMiddlewareClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfigured } from './env';

export async function updateSessionCookie(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  if (!supabaseConfigured) return response;
  const supabase = createMiddlewareClient(
    { request, response },
    { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY }
  );
  await supabase.auth.getUser();
  return response;
}
```

- [ ] **Step 8: Create `lib/supabase/auth.ts`**

```ts
import { getServerClient } from './server';

export async function getCurrentUser() {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
```

- [ ] **Step 9: Create root `middleware.ts`**

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/ssr';
import { updateSessionCookie } from './lib/supabase/middleware';
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfigured } from './lib/supabase/env';

export async function middleware(request: NextRequest) {
  const response = await updateSessionCookie(request);
  if (supabaseConfigured && request.nextUrl.pathname.startsWith('/account')) {
    const supabase = createMiddlewareClient(
      { request, response },
      { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login?next=/account', request.url));
    }
  }
  return response;
}

export const config = {
  matcher:
    '/((?!_next/static|_next/image|favicon\\.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
};
```

- [ ] **Step 10: Create `supabase/migrations/20260925-community-layer.sql`**

Copy the SQL verbatim from spec §5.3 (lines 69–157 of the spec): `profiles` table + RLS + `handle_new_user()` trigger, `reviews` table + indexes + RLS + `unique (user_id, slug)`, `favorites` table + indexes + RLS, `tool_stats` view, and the final grants. Nothing else.

- [ ] **Step 11: Verify build and lint**

```bash
npm run build
npm run lint
```

Expected: build exits 0 (baseline RSS-fetch warnings and `MODULE_TYPELESS_PACKAGE_JSON` node warning are harmless noise). Lint shows exactly the 10 pre-existing problems, none in the new files.

- [ ] **Step 12: Commit**

```bash
git add .env.example lib/supabase middleware.ts supabase/migrations
git commit -m "feat: add supabase foundation (clients, middleware, migration)"
```

---

### Task 2: Auth Pages, Provider, and Account Menu

**Files:**
- Create: `components/AuthProvider.tsx`, `components/AuthForm.tsx`, `components/AccountMenu.tsx`, `lib/initials.ts`, `app/login/page.tsx`, `app/signup/page.tsx`
- Modify: `components/AppShell.tsx` (wrap with `AuthProvider`, mount `AccountMenu` in the header action cluster)

**Interfaces:**
- Consumes: `getBrowserClient()` from Task 1.
- Produces:
  - `components/AuthProvider.tsx` → `export function AuthProvider({ children }: { children: ReactNode })` and `export function useAuth(): { user: User | null; loading: boolean }`
  - `components/AccountMenu.tsx` → default export, no props
  - `components/AuthForm.tsx` → default export `({ mode, next }: { mode: 'login' | 'signup'; next?: string })`
  - `lib/initials.ts` → `export function initialsOf(name: string): string`
  - `app/login/page.tsx`, `app/signup/page.tsx` → server shells reading `searchParams.next`
- Consumed by: Tasks 3, 4, 5 (all client components use `useAuth`; `/account` guard).

- [ ] **Step 1: Create `lib/initials.ts`**

```ts
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}
```

- [ ] **Step 2: Create `components/AuthProvider.tsx`**

```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getBrowserClient } from '../lib/supabase/client';

type AuthState = { user: User | null; loading: boolean };

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserClient();
    let cancelled = false;

    if (!supabase) {
      void Promise.resolve().then(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

All `setState` calls happen in `.then`/subscription callbacks (lint-safe per the React-Compiler rule). The initial `loading: true` is the SSR-safe default (no hydration mismatch).

- [ ] **Step 3: Create `components/AccountMenu.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { getBrowserClient } from '../lib/supabase/client';
import { initialsOf } from '../lib/initials';

function displayName(email: string, metadata: unknown): string {
  if (typeof metadata === 'object' && metadata !== null) {
    const value = (metadata as Record<string, unknown>).display_name;
    if (typeof value === 'string' && value.trim()) return value;
  }
  return email.split('@')[0] || 'User';
}

export default function AccountMenu() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <span className="h-9 w-9 rounded-full border border-zinc-800 bg-zinc-900" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-purple-500/40 hover:text-white"
      >
        Sign in
      </Link>
    );
  }

  const name = displayName(user.email ?? '', user.user_metadata);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white transition hover:opacity-90"
      >
        {initialsOf(name)}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-11 z-20 w-52 space-y-1 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-xl">
            <p className="truncate px-3 py-2 text-xs text-zinc-500">{user.email}</p>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
            >
              My account
            </Link>
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                const supabase = getBrowserClient();
                if (supabase) await supabase.auth.signOut();
                router.refresh();
                router.push('/');
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `components/AuthForm.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { getBrowserClient } from '../lib/supabase/client';

type Props = { mode: 'login' | 'signup'; next?: string };

export default function AuthForm({ mode, next }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const target = next && next.startsWith('/') ? next : '/account';
  const accent =
    'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = getBrowserClient();
    if (!supabase) {
      setError('Authentication is not configured yet.');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    setInfo('');

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setSubmitting(false);
      if (err) {
        setError(`Sign-in failed: ${err.message}`);
        return;
      }
      router.push(target);
      router.refresh();
      return;
    }

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setSubmitting(false);
    if (err) {
      setError(`Sign-up failed: ${err.message}`);
      return;
    }
    if (data.session) {
      router.push(target);
      router.refresh();
      return;
    }
    setInfo('Check your inbox to confirm your email.');
  };

  const handleForgot = async () => {
    const supabase = getBrowserClient();
    if (!supabase) {
      setError('Authentication is not configured yet.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email first to reset your password.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
    setSubmitting(false);
    if (err) {
      setError(`Reset failed: ${err.message}`);
      return;
    }
    setInfo('Reset link sent — check your inbox.');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
      <h1 className="mb-1 text-2xl font-semibold text-white">
        {mode === 'login' ? 'Sign in' : 'Create your account'}
      </h1>
      <p className="mb-6 text-sm text-zinc-400">
        {mode === 'login'
          ? 'Welcome back — write reviews and save tools.'
          : 'Join the community — review tools and build your library.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-display-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Display name
            </label>
            <input
              id="auth-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Kiara"
              className={accent}
            />
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={accent}
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={accent}
          />
        </div>
        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-confirm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Confirm password
            </label>
            <input
              id="auth-confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={accent}
            />
          </div>
        )}

        {error && <p className="text-xs text-rose-400">{error}</p>}
        {info && <p className="text-xs text-emerald-400">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {mode === 'login' && (
        <button
          type="button"
          onClick={handleForgot}
          disabled={submitting}
          className="mt-3 text-xs text-purple-400 transition hover:text-purple-300 disabled:opacity-60"
        >
          Forgot password?
        </button>
      )}

      <p className="mt-6 text-xs text-zinc-500">
        {mode === 'login' ? (
          <>
            New here?{' '}
            <Link
              href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-purple-400 hover:text-purple-300"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link
              href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-purple-400 hover:text-purple-300"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create `app/login/page.tsx` and `app/signup/page.tsx`**

`app/login/page.tsx`:

```tsx
import AppShell from '../../components/AppShell';
import AuthForm from '../../components/AuthForm';

export const metadata = { title: 'Sign in — AI Universe' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-8 lg:px-8">
        <AuthForm mode="login" next={next} />
      </div>
    </AppShell>
  );
}
```

`app/signup/page.tsx`: identical shell with `mode="signup"`, metadata title `'Create your account — AI Universe'`.

- [ ] **Step 6: Modify `components/AppShell.tsx`**

1. Add imports:

```tsx
import { AuthProvider } from './AuthProvider';
import AccountMenu from './AccountMenu';
```

2. Wrap the entire return in `<AuthProvider>`:

```tsx
return (
  <AuthProvider>
    <div className="min-h-screen flex bg-transparent text-zinc-100">
      {/* ...existing tree, unchanged... */}
    </div>
  </AuthProvider>
);
```

3. In the header action cluster (inside `ml-auto flex items-center gap-3`), add `<AccountMenu />` immediately before the `<Link href="/submit" ...>` block.

- [ ] **Step 7: Verify build, lint, and auth guard**

```bash
npm run build
npm run lint
```

Expected: build exits 0. Lint shows exactly the 10 baseline problems (AuthProvider, AccountMenu, AuthForm all clean). Static check — confirm `grep` for `'use client'` finds it in the three new components, and `grep` for `setState` inside `AuthProvider.tsx` shows only occurrences inside `.then`/callbacks.

- [ ] **Step 8: Commit**

```bash
git add components/AuthProvider.tsx components/AuthForm.tsx components/AccountMenu.tsx lib/initials.ts app/login app/signup components/AppShell.tsx
git commit -m "feat: add email/password auth pages and account menu"
```

---

### Task 3: Favorites (Bookmark button + account-ready helpers)

**Files:**
- Create: `lib/agentLookup.ts`, `lib/favorites.ts`, `lib/favorites-client.ts`, `components/FavoriteButton.tsx`
- Modify: `app/agent/[slug]/page.tsx` (server-fetch `isFavorite`, render `FavoriteButton` in the hero action row)

**Interfaces:**
- Consumes: `getServerClient()` (Task 1), `useAuth()` (Task 2), `getAgentMeta` (this task), `getBrowserClient()` (Task 1).
- Produces:
  - `lib/agentLookup.ts` → `export function getAgentMeta(slug: string): { slug: string; name: string; tagline: string } | null`
  - `lib/favorites.ts` (server) → `export type FavoriteAgent = { slug: string; name: string; tagline: string }`, `export async function getFavoriteSlugs(userId: string): Promise<string[]>`, `export async function getFavorites(userId: string): Promise<FavoriteAgent[]>`, `export async function getIsFavorite(slug: string, userId: string): Promise<boolean>`
  - `lib/favorites-client.ts` (browser) → `export async function addFavorite(slug: string): Promise<{ ok: boolean; message: string }>`, `export async function removeFavorite(slug: string): Promise<{ ok: boolean; message: string }>`
  - `components/FavoriteButton.tsx` → default export `({ slug, initialFavorited }: { slug: string; initialFavorited: boolean })`
- Consumed by: Task 5 (account dashboard uses `getFavorites` + `removeFavorite`).

- [ ] **Step 1: Create `lib/agentLookup.ts`**

```ts
import agents from '../data/agents.json';

export type AgentMeta = { slug: string; name: string; tagline: string };

const INDEX = new Map<string, AgentMeta>();
for (const a of agents as AgentMeta[]) {
  INDEX.set(a.slug, a);
}

export function getAgentMeta(slug: string): AgentMeta | null {
  return INDEX.get(slug) ?? null;
}
```

- [ ] **Step 2: Create `lib/favorites.ts` (server-only)**

```ts
import { getServerClient } from './supabase/server';
import { getAgentMeta } from './agentLookup';
import type { AgentMeta } from './agentLookup';

export type FavoriteAgent = AgentMeta;

export async function getFavoriteSlugs(userId: string): Promise<string[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('slug')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<{ slug: string }[]>();
  if (error || !data) return [];
  return data.map((row) => row.slug);
}

export async function getFavorites(userId: string): Promise<FavoriteAgent[]> {
  const slugs = await getFavoriteSlugs(userId);
  return slugs
    .map((slug) => getAgentMeta(slug))
    .filter((a): a is FavoriteAgent => a !== null);
}

export async function getIsFavorite(slug: string, userId: string): Promise<boolean> {
  const slugs = await getFavoriteSlugs(userId);
  return slugs.includes(slug);
}
```

This file must only be imported by server code (it pulls in `next/headers`).

- [ ] **Step 3: Create `lib/favorites-client.ts`**

```ts
import { getBrowserClient } from './supabase/client';

export async function addFavorite(
  slug: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase.from('favorites').insert({ slug });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}

export async function removeFavorite(
  slug: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase.from('favorites').delete().eq('slug', slug);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}
```

- [ ] **Step 4: Create `components/FavoriteButton.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { addFavorite, removeFavorite } from '../lib/favorites-client';

type Props = { slug: string; initialFavorited: boolean };

export default function FavoriteButton({ slug, initialFavorited }: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleToggle() {
    setSubmitting(true);
    setError('');
    const target = !favorited;
    setFavorited(target);
    const result = target ? await addFavorite(slug) : await removeFavorite(slug);
    setSubmitting(false);
    if (!result.ok) {
      setFavorited(!target);
      setError(result.message);
      return;
    }
    router.refresh();
  }

  if (loading) {
    return <span className="inline-block h-11 w-32 rounded-lg border border-white/10 bg-white/[0.03]" />;
  }

  if (!user) {
    return (
      <Link
        href={`/login?next=/agent/${slug}`}
        className="inline-block rounded-lg border border-purple-500/40 px-6 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/10 hover:text-purple-200"
      >
        ☆ Bookmark
      </Link>
    );
  }

  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={submitting}
        aria-pressed={favorited}
        className="inline-block rounded-lg border border-purple-500/40 px-6 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/10 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Saving…' : favorited ? '★ Bookmarked' : '☆ Bookmark'}
      </button>
      {error && <span className="text-[11px] text-rose-400">{error}</span>}
    </span>
  );
}
```

- [ ] **Step 5: Modify `app/agent/[slug]/page.tsx`**

1. Add imports:

```tsx
import FavoriteButton from '../../../components/FavoriteButton';
import { getCurrentUser } from '../../../lib/supabase/auth';
import { getIsFavorite } from '../../../lib/favorites';
```

2. After the `if (!agent) { notFound(); }` block, add the server fetch:

```tsx
const user = await getCurrentUser();
const isFavorite = user
  ? await getIsFavorite(agent.slug, user.id)
  : false;
```

(For this task the `user` variable is also used here; Task 4 extends this block with the reviews prompts.)

3. In the hero action row (after the `<Link href={`/claim/${agent.slug}`} ...>` block), add:

```tsx
<FavoriteButton slug={agent.slug} initialFavorited={isFavorite} />
```

- [ ] **Step 6: Verify build, lint, and signed-out path**

```bash
npm run build
npm run lint
```

Expected: build exits 0; lint baseline unchanged. Static check — `grep` shows `FavoriteButton` renders `<Link href={`/login?next=/agent/${slug}`}>` for the signed-out branch (no dead button), and `lib/favorites.ts` is not imported by any `'use client'` file (grep `from '../lib/favorites'` only in server modules).

- [ ] **Step 7: Commit**

```bash
git add lib/agentLookup.ts lib/favorites.ts lib/favorites-client.ts components/FavoriteButton.tsx "app/agent/[slug]/page.tsx"
git commit -m "feat: add tool bookmark button and favorites"
```

---

### Task 4: Real User Reviews

**Files:**
- Create: `lib/time.ts`, `lib/reviews.ts`, `lib/reviews-client.ts`, `components/Stars.tsx`, `components/ReviewForm.tsx`
- Modify: `components/AgentReviews.tsx` (full rewrite, client), `app/agent/[slug]/page.tsx` (server-fetch reviews/stats/myReview; count + content for the Reviews tab)

**Interfaces:**
- Consumes: `getServerClient()` (Task 1), `useAuth()` (Task 2), `getAgentMeta` (Task 3), `getBrowserClient()` (Task 1), `initialsOf` (Task 2).
- Produces:
  - `lib/time.ts` → `export function formatRelativeTime(iso: string): string`
  - `lib/reviews.ts` (server) → `export type ReviewRow`, `export type ToolStats`, `export type MyReview`, `export type MyReviewWithAgent`; `export async function getReviewsForSlug(slug: string, limit?: number): Promise<ReviewRow[]>`, `export async function getToolStats(slug: string): Promise<ToolStats>`, `export async function getMyReview(slug: string, userId: string): Promise<MyReview | null>`, `export async function getLatestReviews(limit?: number): Promise<LatestReview[]>`, `export async function getMyReviews(userId: string): Promise<MyReviewWithAgent[]>`
  - `lib/reviews-client.ts` (browser) → `export async function upsertReview(input: { slug: string; rating: number; comment: string }): Promise<{ ok: boolean; message: string }>`, `export async function deleteReview(id: string): Promise<{ ok: boolean; message: string }>`
  - `components/Stars.tsx` → default export `({ count, size }: { count: number; size?: string })`
  - `components/ReviewForm.tsx` → default export `({ slug, myReview }: { slug: string; myReview: MyReview | null })`
  - `components/AgentReviews.tsx` → default export `({ slug, reviews, stats, myReview }: { slug: string; reviews: ReviewRow[]; stats: ToolStats; myReview: MyReview | null })`
- Consumed by: Task 5 (`getLatestReviews`/`getMyReviews`), and `components/CommunityReviews.tsx`.

- [ ] **Step 1: Create `lib/time.ts`**

```ts
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = (Date.now() - then) / 1000;
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
```

- [ ] **Step 2: Write and run time asserts**

`C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-time.mjs`:

```js
import assert from 'node:assert';

const { formatRelativeTime } = await import(
  `file:///${process.cwd().replace(/\\/g, '/')}/lib/time.ts`
);

const now = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

assert.equal(formatRelativeTime(new Date(now - 30 * 1000).toISOString()), 'just now');
assert.equal(formatRelativeTime(new Date(now - 5 * MIN).toISOString()), '5m ago');
assert.equal(formatRelativeTime(new Date(now - 2 * HOUR).toISOString()), '2h ago');
assert.equal(formatRelativeTime(new Date(now - 3 * DAY).toISOString()), '3d ago');
assert.equal(formatRelativeTime(new Date(now - 14 * DAY).toISOString()), '2w ago');
assert.equal(formatRelativeTime(new Date(now - 120 * DAY).toISOString()), '4mo ago');
assert.equal(formatRelativeTime(new Date(now - 500 * DAY).toISOString()), '1y ago');
assert.equal(formatRelativeTime('not-a-date'), '');

console.log('time asserts OK');
```

Run: `node C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-time.mjs`
Expected: `time asserts OK` (this is the RED-to-GREEN check for Step 1's pure logic).

- [ ] **Step 3: Create `lib/reviews.ts` (server-only)**

```ts
import { getServerClient } from './supabase/server';
import { getAgentMeta } from './agentLookup';

export type ReviewRow = {
  id: string;
  slug: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  display_name: string;
};

export type ToolStats = { review_count: number; avg_rating: number | null };

export type MyReview = {
  id: string;
  slug: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type MyReviewWithAgent = MyReview & {
  agentName: string;
  tagline: string;
};

export type LatestReview = {
  id: string;
  slug: string;
  rating: number;
  comment: string;
  created_at: string;
  display_name: string;
};

type ReviewRowRaw = {
  id: string;
  slug: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string } | null;
};

type MyReviewRaw = {
  id: string;
  slug: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

type LatestReviewRaw = {
  id: string;
  slug: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { display_name: string } | null;
};

function toReviewRow(row: ReviewRowRaw): ReviewRow {
  return {
    id: row.id,
    slug: row.slug,
    rating: row.rating,
    comment: row.comment ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
    display_name: row.profiles?.display_name?.trim() ? row.profiles.display_name : 'Anonymous',
  };
}

export async function getReviewsForSlug(
  slug: string,
  limit = 100
): Promise<ReviewRow[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, slug, rating, comment, created_at, updated_at, profiles ( display_name )')
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<ReviewRowRaw[]>();
  if (error || !data) return [];
  return data.map(toReviewRow);
}

export async function getToolStats(slug: string): Promise<ToolStats> {
  const supabase = await getServerClient();
  if (!supabase) return { review_count: 0, avg_rating: null };
  const { data, error } = await supabase
    .from('tool_stats')
    .select('review_count, avg_rating')
    .eq('slug', slug)
    .limit(1)
    .returns<{ review_count: number; avg_rating: number | null }[]>();
  if (error || !data || data.length === 0) return { review_count: 0, avg_rating: null };
  return { review_count: data[0].review_count, avg_rating: data[0].avg_rating };
}

export async function getMyReview(
  slug: string,
  userId: string
): Promise<MyReview | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('reviews')
    .select('id, slug, rating, comment, created_at, updated_at')
    .eq('slug', slug)
    .eq('user_id', userId)
    .limit(1)
    .returns<MyReviewRaw[]>();
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    id: row.id,
    slug: row.slug,
    rating: row.rating,
    comment: row.comment ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getLatestReviews(limit = 3): Promise<LatestReview[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, slug, rating, comment, created_at, profiles ( display_name )')
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<LatestReviewRaw[]>();
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    rating: row.rating,
    comment: row.comment ?? '',
    created_at: row.created_at,
    display_name: row.profiles?.display_name?.trim() ? row.profiles.display_name : 'Anonymous',
  }));
}

export async function getMyReviews(userId: string): Promise<MyReviewWithAgent[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, slug, rating, comment, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<MyReviewRaw[]>();
  if (error || !data) return [];
  return data.map((row) => {
    const meta = getAgentMeta(row.slug);
    return {
      id: row.id,
      slug: row.slug,
      rating: row.rating,
      comment: row.comment ?? '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      agentName: meta?.name ?? 'Unknown tool',
      tagline: meta?.tagline ?? '',
    };
  });
}
```

- [ ] **Step 4: Create `lib/reviews-client.ts`**

```ts
import { getBrowserClient } from './supabase/client';

export async function upsertReview(input: {
  slug: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'You must be signed in to write a review.' };
  const { error } = await supabase.from('reviews').upsert(
    {
      user_id: user.id,
      slug: input.slug,
      rating: input.rating,
      comment: input.comment,
    },
    { onConflict: 'user_id,slug' }
  );
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}

export async function deleteReview(
  id: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}
```

- [ ] **Step 5: Create `components/Stars.tsx`**

```tsx
export default function Stars({
  count,
  size = 'text-xs',
}: {
  count: number;
  size?: string;
}) {
  const clamped = Math.max(0, Math.min(5, count));
  return (
    <span className={`inline-flex gap-0.5 ${size}`} aria-label={`${clamped} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < clamped ? 'text-amber-400' : 'text-zinc-700'}>
          ★
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 6: Create `components/ReviewForm.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { upsertReview, deleteReview } from '../lib/reviews-client';
import type { MyReview } from '../lib/reviews';

type Props = { slug: string; myReview: MyReview | null };

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={`text-xl transition ${n <= value ? 'text-amber-400' : 'text-zinc-700 hover:text-zinc-500'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewForm({ slug, myReview }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Pick a star rating (1–5).');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await upsertReview({ slug, rating, comment: comment.trim() });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  };

  const handleDelete = async () => {
    if (!myReview) return;
    if (!window.confirm('Delete your review for this tool?')) return;
    setSubmitting(true);
    setError('');
    const result = await deleteReview(myReview.id);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <StarPicker value={rating} onChange={setRating} />
        <textarea
          rows={3}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : myReview ? 'Update review' : 'Submit review'}
        </button>
        {myReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
```

- [ ] **Step 7: Rewrite `components/AgentReviews.tsx` (client)**

```tsx
'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import Stars from './Stars';
import ReviewForm from './ReviewForm';
import { formatRelativeTime } from '../lib/time';
import { initialsOf } from '../lib/initials';
import type { ReviewRow, ToolStats, MyReview } from '../lib/reviews';

type Props = {
  slug: string;
  reviews: ReviewRow[];
  stats: ToolStats;
  myReview: MyReview | null;
};

export default function AgentReviews({ slug, reviews, stats, myReview }: Props) {
  const { user, loading } = useAuth();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-sm">
      {stats.review_count > 0 && (
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
          <Stars count={Math.round(stats.avg_rating ?? 0)} />
          <span className="text-xs text-zinc-400">
            {(stats.avg_rating ?? 0).toFixed(1)} average · {stats.review_count}{' '}
            review{stats.review_count === 1 ? '' : 's'}
          </span>
        </div>
      )}

      <div className="divide-y divide-white/5">
        {reviews.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">
            No reviews yet — be the first.
          </p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="flex items-start gap-3 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
              {initialsOf(r.display_name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-white">{r.display_name}</span>
                <Stars count={r.rating} />
              </div>
              {r.comment && (
                <p className="text-xs leading-relaxed text-zinc-400">{r.comment}</p>
              )}
            </div>
            <span className="shrink-0 text-[11px] text-zinc-500">
              {formatRelativeTime(r.created_at)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4">
        {loading ? null : user ? (
          <ReviewForm key={myReview?.id ?? 'new'} slug={slug} myReview={myReview} />
        ) : (
          <Link
            href={`/login?next=/agent/${slug}#reviews`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
          >
            Sign in to write a review →
          </Link>
        )}
      </div>
    </div>
  );
}
```

The `key={myReview?.id ?? 'new'}` forces a fresh `ReviewForm` (prefill resets) after an update or delete.

- [ ] **Step 8: Modify `app/agent/[slug]/page.tsx`**

1. Add imports:

```tsx
import { getReviewsForSlug, getToolStats, getMyReview } from '../../../lib/reviews';
```

2. Replace the Task 3 fetch block with:

```tsx
const user = await getCurrentUser();
const [reviews, stats, myReview, isFavorite] = await Promise.all([
  getReviewsForSlug(agent.slug),
  getToolStats(agent.slug),
  user ? getMyReview(agent.slug, user.id) : Promise.resolve(null),
  user ? getIsFavorite(agent.slug, user.id) : Promise.resolve(false),
]);
```

3. Replace the `reviews` tab section (the `{ id: 'reviews', label: 'Community Reviews', count: 3, content: (<AgentReviews name=... category=... slug=... />), }` object) with:

```tsx
{
  id: 'reviews',
  label: 'Community Reviews',
  count: stats.review_count,
  content: (
    <AgentReviews
      slug={agent.slug}
      reviews={reviews}
      stats={stats}
      myReview={myReview}
    />
  ),
},
```

- [ ] **Step 9: Verify build, lint, and zero-review/signed-out states**

```bash
npm run build
npm run lint
```

Expected: build exits 0; lint baseline unchanged (AgentReviews, ReviewForm, Stars clean). Static checks — grep that `AgentReviews.tsx` no longer contains `AUTHORS`, `TIMES`, `Load more`, or `soon`; grep that `app/agent/[slug]/page.tsx` renders the sign-in CTA path (`/login?next=/agent/`) only inside `AgentReviews`.

- [ ] **Step 10: Commit**

```bash
git add lib/time.ts lib/reviews.ts lib/reviews-client.ts components/Stars.tsx components/ReviewForm.tsx components/AgentReviews.tsx "app/agent/[slug]/page.tsx"
git commit -m "feat: add real user reviews"
```

---

### Task 5: Homepage Live Reviews + Account Dashboard

**Files:**
- Create: `lib/profile.ts`, `app/account/page.tsx`, `components/AccountContent.tsx`
- Modify: `components/CommunityReviews.tsx` (full rewrite, server component)

**Interfaces:**
- Consumes: `getCurrentUser()` (Task 1), `getBrowserClient()` (Task 1), `getLatestReviews`/`getMyReviews`/`MyReviewWithAgent` (Task 4), `getFavorites`/`removeFavorite`/`FavoriteAgent` (Task 3), `getAgentMeta` (Task 3), `useAuth` indirectly (AccountContent lives under `AuthProvider` via AppShell).
- Produces:
  - `lib/profile.ts` (server) → `export async function getProfile(userId: string): Promise<{ display_name: string }>`
  - `components/CommunityReviews.tsx` → default export, no props (async server component)
  - `app/account/page.tsx` → async server component; `redirect('/login?next=/account')` when signed out
  - `components/AccountContent.tsx` → default export `({ userId, email, displayName, favorites, reviews }: { userId: string; email: string; displayName: string; favorites: FavoriteAgent[]; reviews: MyReviewWithAgent[] })`

- [ ] **Step 1: Create `lib/profile.ts`**

```ts
import { getServerClient } from './supabase/server';

export async function getProfile(
  userId: string
): Promise<{ display_name: string }> {
  const supabase = await getServerClient();
  if (!supabase) return { display_name: '' };
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .limit(1)
    .returns<{ display_name: string }[]>();
  if (error || !data || data.length === 0) return { display_name: '' };
  return { display_name: data[0].display_name };
}
```

- [ ] **Step 2: Rewrite `components/CommunityReviews.tsx` (server component)**

```tsx
import Link from 'next/link';
import { getLatestReviews } from '../lib/reviews';
import { getAgentMeta } from '../lib/agentLookup';
import Stars from './Stars';
import { formatRelativeTime } from '../lib/time';
import { initialsOf } from '../lib/initials';

export default async function CommunityReviews() {
  const reviews = await getLatestReviews(3);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">💬</span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">
            Community Reviews
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-sm">
        <div className="divide-y divide-white/5">
          {reviews.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-zinc-500">
              No reviews yet — share your experience by signing in.
            </p>
          )}
          {reviews.map((r) => {
            const meta = getAgentMeta(r.slug);
            return (
              <div key={r.id} className="flex items-start gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
                  {initialsOf(r.display_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-white">{r.display_name}</span>
                    <Stars count={r.rating} />
                    {meta ? (
                      <Link
                        href={`/agent/${r.slug}`}
                        className="text-xs text-purple-400 transition hover:text-purple-300"
                      >
                        on {meta.name} →
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-500">on {r.slug}</span>
                    )}
                  </div>
                  {r.comment && (
                    <p className="text-xs leading-relaxed text-zinc-400">{r.comment}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-zinc-500">
                  {formatRelativeTime(r.created_at)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
          >
            Sign in to write a review →
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `app/account/page.tsx` (server)**

```tsx
import { redirect } from 'next/navigation';
import AppShell from '../../components/AppShell';
import AccountContent from '../../components/AccountContent';
import { getCurrentUser } from '../../lib/supabase/auth';
import { getFavorites } from '../../lib/favorites';
import { getMyReviews } from '../../lib/reviews';
import { getProfile } from '../../lib/profile';

export const metadata = { title: 'My account — AI Universe' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  const [favorites, reviews, profile] = await Promise.all([
    getFavorites(user.id),
    getMyReviews(user.id),
    getProfile(user.id),
  ]);

  return (
    <AppShell>
      <AccountContent
        userId={user.id}
        email={user.email ?? ''}
        displayName={profile.display_name}
        favorites={favorites}
        reviews={reviews}
      />
    </AppShell>
  );
}
```

- [ ] **Step 4: Create `components/AccountContent.tsx` (client)**

```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import ToolLogo from './ToolLogo';
import Stars from './Stars';
import { removeFavorite } from '../lib/favorites-client';
import { deleteReview } from '../lib/reviews-client';
import { getBrowserClient } from '../lib/supabase/client';
import { formatRelativeTime } from '../lib/time';
import type { FavoriteAgent } from '../lib/favorites';
import type { MyReviewWithAgent } from '../lib/reviews';

type Props = {
  userId: string;
  email: string;
  displayName: string;
  favorites: FavoriteAgent[];
  reviews: MyReviewWithAgent[];
};

export default function AccountContent({
  userId,
  email,
  displayName,
  favorites,
  reviews,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [error, setError] = useState('');

  const saveName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = getBrowserClient();
    if (!supabase) {
      setProfileError('Authentication is not configured yet.');
      return;
    }
    setSaving(true);
    setProfileError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() })
      .eq('id', userId);
    setSaving(false);
    if (err) {
      setProfileError(err.message);
      return;
    }
    router.refresh();
  };

  const handleRemoveFavorite = async (slug: string) => {
    setError('');
    const result = await removeFavorite(slug);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    setError('');
    const result = await deleteReview(reviewId);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My account</h1>
        <p className="mt-1 text-sm text-zinc-400">{email}</p>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Saved tools</h2>
        {favorites.length === 0 && (
          <p className="text-sm text-zinc-500">No saved tools yet.</p>
        )}
        <ul className="divide-y divide-white/5">
          {favorites.map((f) => (
            <li key={f.slug} className="flex items-center gap-3 py-3">
              <ToolLogo slug={f.slug} size={32} />
              <Link
                href={`/agent/${f.slug}`}
                className="min-w-0 flex-1 transition hover:text-purple-300"
              >
                <span className="block truncate text-sm font-semibold text-white">{f.name}</span>
                <span className="block truncate text-xs text-zinc-400">{f.tagline}</span>
              </Link>
              <button
                type="button"
                onClick={() => handleRemoveFavorite(f.slug)}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-rose-500/40 hover:text-rose-300"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Your reviews</h2>
        {reviews.length === 0 && (
          <p className="text-sm text-zinc-500">
            You haven&apos;t reviewed any tools yet.
          </p>
        )}
        <ul className="divide-y divide-white/5">
          {reviews.map((r) => (
            <li key={r.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/agent/${r.slug}#reviews`}
                    className="text-sm font-semibold text-purple-300 transition hover:text-purple-200"
                  >
                    {r.agentName}
                  </Link>
                  <Stars count={r.rating} />
                  <span className="text-[11px] text-zinc-500">
                    {formatRelativeTime(r.created_at)}
                  </span>
                </div>
                {r.comment && <p className="mt-1 text-xs text-zinc-400">{r.comment}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteReview(r.id)}
                className="shrink-0 rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Profile</h2>
        <form onSubmit={saveName} className="space-y-3">
          <label htmlFor="profile-name" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Display name
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
          />
          {profileError && <p className="text-xs text-rose-400">{profileError}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save display name'}
          </button>
        </form>
        <p className="mt-4 text-xs text-zinc-500">
          Your display name appears next to the reviews you write.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify build, lint, and degradation states**

```bash
npm run build
npm run lint
```

Expected: build exits 0; lint baseline unchanged. Static checks — grep that `CommunityReviews.tsx` has no `REVIEWS` constant, no `soon`, no `Load more`; grep that `app/account/page.tsx` redirects with `/login?next=/account`. With env vars absent, `/account` redirects to `/login` (which renders "Authentication is not configured yet." on submit), and the homepage shows the "No reviews yet — share your experience by signing in." empty state (server helper returns `[]`).

- [ ] **Step 6: Commit**

```bash
git add lib/profile.ts "app/account/page.tsx" components/AccountContent.tsx components/CommunityReviews.tsx
git commit -m "feat: add account dashboard and live homepage reviews"
```

---

### Task 6: Wire the Real Supabase Project and Verify

**Files:**
- Modify: `.env.local` (git-ignored — credentials only; never committed)

**Interfaces:**
- Consumes: everything from Tasks 1–5 (all build-time-safe; this task only supplies live credentials and runs the spec §10 manual checklist).
- Produces: a live end-to-end app + verification evidence for spec §10.

- [ ] **Step 1: STOP — request credentials from the human partner**

The human partner creates the Supabase project now and supplies:
1. `NEXT_PUBLIC_SUPABASE_URL` (Project Settings → API → Project URL)
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same page, anon/publishable)

While waiting, ask them to run the migration `supabase/migrations/20260925-community-layer.sql` in the SQL editor, enable **Auth → Providers → Email**, and set **Auth → URLs → Site URL** to `http://localhost:3000`, and decide **Confirm email** ON (recommended) or OFF.

- [ ] **Step 2: Add credentials to `.env.local`**

Append to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=<human-provided>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<human-provided>
```

Verify it stays out of git: `git status` shows NO `.env.local`.

- [ ] **Step 3: Flip the env assert expectation**

Update `C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-env.mjs` to expect `true`:

```js
assert.equal(mod.supabaseConfigured, true, 'expected configured once keys are present');
```

Run: `node C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-env.mjs`
Expected: `env asserts OK (configured)`.

- [ ] **Step 4: Run build + lint gate**

```bash
npm run build
npm run lint
```

Expected: build exits 0; lint shows exactly the 10 baseline problems. (Lint is unaffected by env vars; this gate confirms no regressions from the wiring.)

- [ ] **Step 5: Manual checklist (spec §10) — run `npm run dev` and walk it**

1. Sign up (works with Confirm email ON → inbox link, or OFF → auto session), sign out, sign in with wrong then right password.
2. Tool page: write a review (stars + comment) → appears with name/avatar; tab count and average update; edit it (Update review); delete it.
3. Signed-out visitor sees "Sign in to write a review" linking to `/login?next=/agent/<slug>#reviews`.
4. Bookmark a tool → toggles to "★ Bookmarked"; `/account` lists it under Saved tools; Remove un-bookmarks.
5. `/account` shows "Your reviews" with Delete; edit display name; write another review and confirm the new name shows on it.
6. Homepage Community Reviews shows the latest 3 real reviews.
7. RLS smoke test: sign out, open the browser console, and attempt `fetch('/api/...')`-style Supabase endpoint writes as `anon` → rows are denied.

Anything that fails is a bug — fix it with a new lowercase-prefixed commit (e.g. `fix: ...`).

- [ ] **Step 6: Commit any fixes, confirm push**

If Task 6 produced code changes, commit them. Then present the branch for a fresh-context review before pushing to `origin/main` (human confirms the push).

---

## Self-Review Notes (collapsed by the author)

- **Spec coverage:** §4 deps → Task 1; §5.1 clients/middleware → Task 1; §5.2 env vars/.env.example → Task 1, Task 6; §5.3 migration → Task 1, Task 6; §5.4 project settings → Task 6; §6.1 pages → Tasks 2, 5; §6.2 provider/menu → Task 2; §6.3 middleware guard → Tasks 1, 2; §7.1 tool reviews → Task 4; §7.2 homepage → Task 5; §8 favorites → Tasks 3, 5; §9 error handling → embodied in every client action's `{ ok, message }` + pending text; §10 verification → per-task gates + Task 6; §11 out-of-scope → none implemented.
- **Placeholder scan:** every step has concrete code; no TBD/TODO/“similar to Task N”/“handle edge cases”.
- **Type consistency:** `formatRelativeTime`, `initialsOf`, `getAgentMeta`, `useAuth`, `getBrowserClient`, `getServerClient`, `getCurrentUser`, `getReviewsForSlug`, `getToolStats`, `getMyReview`, `getLatestReviews`, `getMyReviews`, `getFavorites`, `getIsFavorite`, `addFavorite`, `removeFavorite`, `upsertReview`, `deleteReview`, `getProfile` are defined once and used with matching signatures everywhere. `ReviewRow/ToolStats/MyReview/MyReviewWithAgent/FavoriteAgent` travel verbatim between server and client props.
- **Review Focus mapping:** env-missing → Tasks 1, 2, 4, 5 (asserts + grep) + Task 6 flip; signed-out tool page → Tasks 3, 4; zero reviews → Tasks 4, 5; auth edge cases → Task 2 (AuthForm messages); duplicate review → Task 4 (upsert onConflict) + Task 6 step 2; stale slug → Tasks 4, 5 (`getAgentMeta` null→“Unknown tool”).
- **Lint safety:** AuthProvider is the only new effect-bearing component; all its `setState` calls are inside `.then`/subscription/`Promise.resolve().then` callbacks — never synchronous in the effect body. Event-handler `setState` everywhere else.