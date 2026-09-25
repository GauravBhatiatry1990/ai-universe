# Community Layer (Supabase Auth, Reviews, Favorites) — Design Spec

**Date:** 2026-09-25
**Status:** Approved (brainstorming) — pending written-spec review
**Supersedes:** mock reviews in `components/AgentReviews.tsx` and `components/CommunityReviews.tsx`

## 1. Goal

Replace the deterministic mock reviews with real, authenticated user reviews, and give logged-in users a persistent identity and a saved-tools list, backed by Supabase. A signed-in user can:

- Review any tool (1–5 stars + optional comment) from the tool page's Reviews tab, updating or deleting their own review.
- Bookmark any tool from its detail page and see saved tools plus their own reviews on a profile dashboard.
- Sign in / sign up with email + password.

## 2. Background

- Tool data lives in `data/agents.json` (132 entries, keyed by string `slug`). There is no tool table in the database — `slug` is the join key between code data and DB rows.
- Mock reviews exist in two places:
  - `components/AgentReviews.tsx` (tool-page Reviews tab, under `AgentTabs`), including a disabled "Sign in to write a review" button and a disabled "Load more reviews" button.
  - `components/CommunityReviews.tsx` (homepage section), with 3 hard-coded cards and the same disabled buttons.
- Every page renders through `components/AppShell.tsx` (a `'use client'` component) — the natural host for a global `AuthProvider`.
- Homepage (`app/page.tsx`) and tool pages (`app/agent/[slug]/page.tsx`) are server components (`ƒ /` and `ƒ /agent/[slug]` — rendered on demand), so DB reads work directly in the request.
- No Supabase dependencies or references exist today. `.env.local` holds only `TRENDS_MCP_API_KEY` (and is git-ignored). No `.env.example` exists.
- Lint baseline is exactly 10 pre-existing problems; the repo's React-Compiler lint rules require that **client components never call `setState` synchronously inside an effect body** (subscription/async-callback setState is permitted — established in `LivePulse` and `AgentTabs`).

## 3. Decisions (from brainstorming, approved)

1. **Project availability:** Design-first; the human partner will create the Supabase project when asked and supply the URL + anon key. The app must build and render signed-out without env vars present.
2. **Auth method:** Email + password only (no social OAuth in this session).
3. **Review model:** One review per user per tool, enforced by `unique (user_id, slug)`. Submitting again updates the user's existing review.
4. **Replace mocks everywhere:** both the tool-page Reviews tab and the homepage Community Reviews section become live data. No mock fallback.
5. **Account dashboard:** `/account` shows favorite tools, the user's own reviews (delete here; edit on the tool page), and an editable display name.
6. **Integration approach:** Official `@supabase/ssr` (browser + server + middleware clients) with Row Level Security as the sole authorization boundary. **No service-role key** — every read the app needs (review lists, stats, display names) is a public RLS select; every write is owner-gated.

## 4. Dependencies

Add `@supabase/ssr` and `@supabase/supabase-js` to `package.json` dependencies.

## 5. Architecture

### 5.1 Connection layer — `lib/supabase/`

| File | Export | Purpose |
|---|---|---|
| `lib/supabase/client.ts` | `getBrowserClient()` | Lazy singleton `createBrowserClient` for client components. Returns `null` if env vars are missing. |
| `lib/supabase/server.ts` | `getServerClient()` | `createServerClient` using `cookies()` from `next/headers`. Returns `null` if env vars are missing. |
| `lib/supabase/middleware.ts` | `updateSessionCookie(req)` | `createMiddlewareClient`; refreshes the session cookie on navigation. Returns the response. No-op (pass-through) when env vars are missing. |
| `lib/supabase/auth.ts` | `getCurrentUser()` | Server-side helper around `getServerClient()`. Returns `null` when signed out or when Supabase is unavailable. |

Root `middleware.ts` (new file at repo root) runs `updateSessionCookie` on every request, skipping `/api/*`, `_next/*`, `favicon.ico`, and static files (paths with a file extension).

**Env-missing degradation contract:** anywhere Supabase is unavailable (`getBrowserClient()`/`getServerClient()` return `null`), every consumer renders the signed-out / empty state and inline messages say "Authentication is not configured yet." Nothing throws; `npm run build` and `npm run dev` stay green without credentials.

### 5.2 Environment variables

Committed template `.env.example` (placeholders, no secrets) and runtime `.env.local` (git-ignored). The two variables below are the only secrets; both are required for live auth/data, and the app still builds and runs signed-out without them.

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL from Supabase dashboard (Settings → API). Required for live auth/data; the app builds and renders signed-out without it. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | anon/publishable key; RLS is the security boundary. Required for live auth/data; the app builds and renders signed-out without it. |

**No `SUPABASE_SERVICE_ROLE_KEY`** — deliberately omitted (YAGNI + fewer secrets).

### 5.3 Database schema (single SQL migration)

Committed at `supabase/migrations/20260925-community-layer.sql`; the human partner pastes it into the project's SQL editor. Composition:

```sql
-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists reviews_slug_idx on public.reviews (slug);
create index if not exists reviews_user_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

create policy "reviews are publicly readable"
  on public.reviews for select using (true);
create policy "users can insert their own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "users can update their own reviews"
  on public.reviews for update using (auth.uid() = user_id);
create policy "users can delete their own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- ---------- favorites ----------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists favorites_user_idx on public.favorites (user_id);
create index if not exists favorites_slug_idx on public.favorites (slug);

alter table public.favorites enable row level security;

create policy "users can read their own favorites"
  on public.favorites for select using (auth.uid() = user_id);
create policy "users can insert their own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);
create policy "users can delete their own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- ---------- tool_stats view ----------
create or replace view public.tool_stats as
select slug, count(*) as review_count, round(avg(rating), 1) as avg_rating
from public.reviews
group by slug;

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.reviews, public.favorites, public.tool_stats
  to anon, authenticated;
```

**Semantics:**
- `slug` is a plain string (no FK; tools live in `agents.json`).
- The trigger seeds a `profiles` row at signup from `raw_user_meta_data.display_name`, falling back to the email local-part.
- `reviews.rating` is required (1–5); `comment` is optional but encouraged (default `''`).
- `tool_stats` powers the tab badge (count + average) and "X reviews" copy.
- Hard delete only (no soft-delete / moderation in this session).

### 5.4 Supabase project settings (documented for the human partner)

- **Auth → Providers:** Email enabled.
- **Auth → Email → Confirm email:** either ON (signup shows "Check your inbox to confirm") or OFF (auto-confirm, immediate session). The signup UI handles both outcomes.
- **Auth → URLs → Site URL:** `http://localhost:3000` (dev) so confirmation/reset links work.

## 6. Auth pages & flow

### 6.1 Pages

- `app/login/page.tsx` + `app/signup/page.tsx` — server shells that render the shared client component `components/AuthForm.tsx` (prop `mode: 'login' | 'signup'`). Dark card, purple accent, consistent with `claim/[slug]` form styling.
  - **Login:** email + password, inline error line, submit → `supabase.auth.signInWithPassword`, then `router.push(next)` (default `/account`), "Forgot password?" link (calls `resetPasswordForEmail` and shows "Reset link sent — check your inbox"), link to signup.
  - **Signup:** display name + email + password (+ confirm password). Calls `signUp({ email, password, options: { data: { display_name } } })`. On "confirmation required" → "Check your inbox to confirm your email"; on success with session → `router.push('/account')`.
  - `next` param honored (`/login?next=/agent/chatgpt#reviews`) and re-appended on the signup cross-link.
- `app/account/page.tsx` — server component; `getCurrentUser()` must resolve or `redirect('/login?next=/account')`. Renders three cards: **Saved tools**, **Your reviews** (each with Delete), **Profile** (edit display name). Data fetched server-side via the server client; mutations done client-side then `router.refresh()`.

### 6.2 Provider & navigation

- `components/AuthProvider.tsx` — client context provider. Subscribes to `supabase.auth.onAuthStateChange`, exposing `{ user, loading }`. Mounted in `AppShell` (wraps all pages; no root-layout change). Uses `useSyncExternalStore` or an effect whose `setState` happens only inside the subscription callback (lint-safe; see §2).
- `components/AccountMenu.tsx` — nav control in `AppShell` header:
  - Logged out → "Sign in" button (`/login`).
  - Logged in → avatar chip (initials from display name) + menu with "My account" (`/account`) and "Sign out" (calls `supabase.auth.signOut`, then `router.refresh()` + navigate `/`).

### 6.3 Middleware guard

`middleware.ts` refreshes the session cookie on navigation and redirects `/account` to `/login?next=/account` when there is no session.

## 7. Reviews

### 7.1 Tool page (replaces `AgentReviews.tsx` mocks)

- The Reviews tab in `app/agent/[slug]/page.tsx` becomes **server-fetched**: `getServerClient()` queries:
  - `reviews` for the slug (newest first, join `profiles` for `display_name`);
  - `tool_stats` for the slug (`review_count`, `avg_rating`);
  - the current user's own review row (when signed in).
- Tab label becomes "Community Reviews" with `count` = `tool_stats.review_count` (replaces the hard-coded `3`); show the average as a star row in the tab header area.
- `components/AgentReviews.tsx` is rewritten as a client component that receives the server-fetched `reviews`, `stats`, and `myReview` as props, plus a `slug`. Behavior:
  - **List:** author avatar (initials), display name, `Stars` (amber), relative created time (`lib/time.ts`), comment. Empty state: "No reviews yet — be the first."
  - **Signed out:** "Sign in to write a review" → `<Link href="/login?next=/agent/[slug]#reviews">` (enables the previously disabled button).
  - **Signed in:** compact `ReviewForm` — interactive 1–5 star picker (required) + comment textarea (optional) + submit. If `myReview` exists, it loads prefilled with an **Update** action (upsert on the `user_id`+`slug` unique constraint) and a **Delete** action (confirm via `window.confirm`). Submissions go through the browser client (RLS backstop) then `router.refresh()`.
  - The disabled "Load more reviews →" mock button is removed (no pagination this session; all reviews for a slug render, capped at 100).
- `lib/reviews.ts` — server helpers: `getReviewsForSlug(slug)`, `getToolStats(slug)`, `getMyReview(slug)`. Each returns an empty result when Supabase is unavailable (env-missing contract).
- `lib/time.ts` — `formatRelativeTime(iso: string)` returning "2h ago", "3d ago", etc.

### 7.2 Homepage Community Reviews (replaces `CommunityReviews.tsx` mocks)

- `components/CommunityReviews.tsx` becomes a **server component**: latest 3 reviews across all tools (join `profiles` for display_name), tool name resolved from `agents.json` by slug, `Stars`, relative time, and a link to that tool's page. Keeps the "Sign in to write a review" button (now enabled → `/login`). Empty state: "No reviews yet — share your experience by signing in."

## 8. Favorites

- `components/FavoriteButton.tsx` — client toggle rendered in the tool hero action row (next to Visit/Claim in `app/agent/[slug]/page.tsx`).
  - Server component passes `isFavorite` (initial state, from `favorites` for current user + slug via server client).
  - Click toggles: insert or delete row through the browser client, then `router.refresh()`.
  - Displays as an outline bookmark-style toggle: "☆ Bookmark" ↔ "★ Bookmarked".
  - **Signed out:** button renders as a link to `/login?next=/agent/[slug]`.
- Account dashboard "Saved tools" card lists favorite agents (logo, name, tagline) as links to their pages, each with an inline Remove (unfavorite) control. Root empty state: "No saved tools yet."

## 9. Error handling

- Supabase error `message` shown inline on the relevant form (auth errors, review save errors, favorite toggle failures).
- Buttons disable + show "Saving…" / "Submitting…" during async work.
- RLS is the backstop; a failed write surfaces its message directly.
- Any client query/`router.refresh()` failure degrades to the empty state with no uncaught promise.

## 10. Verification

- **Automated gates (no test runner):** `npm run build` exits 0; `npm run lint` shows exactly the pre-existing 10 problems (no new errors — `Matchmaker.tsx` and all new files stay clean); Node 24 assertions for the pure helper `formatRelativeTime` (and any other pure logic).
- **Environment-less build check:** CI/author runs `npm run build` and `npm run dev` with env vars absent — app renders fully signed-out (empty reviews/saved lists), no crash.
- **Manual checklist (requires the live project + env vars — the human partner supplies URL + anon key when the env task runs):**
  1. Sign up (verify email), sign out, sign in with wrong then right password.
  2. Tool page: write a review (stars + comment) → appears with name/avatar and tab count/average update; edit it; delete it.
  3. Signed-out visitor sees "Sign in to write a review" linking to `/login?next=…`.
  4. Bookmark a tool → toggles to Bookmarked; `/account` lists it; Remove un-bookmarks.
  5. `/account` shows "Your reviews" with Delete; edit display name persists on future reviews.
  6. Homepage Community Reviews shows the latest 3 real reviews.
  7. RLS smoke test: sign out and attempt to hit the reviews/favorites endpoints via the browser console → denied.

## 11. Out of scope (explicitly deferred)

- Social OAuth providers, password reset page (only a "Forgot password?" email flow), email templates, pagination/"Load more", review moderation/flagging, per-tool ratings in the Matchmaker scoring, the disabled Theme/Notifications header buttons, migrating the claim-profile (mailto) flow into auth.

## 12. File map (new/modified)

**New:** `.env.example`, `middleware.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `lib/supabase/auth.ts`, `lib/reviews.ts`, `lib/time.ts`, `components/AuthProvider.tsx`, `components/AuthForm.tsx`, `components/AccountMenu.tsx`, `components/FavoriteButton.tsx`, `components/ReviewForm.tsx`, `supabase/migrations/20260925-community-layer.sql`, `app/login/page.tsx`, `app/signup/page.tsx`, `app/account/page.tsx`.

**Modified:** `package.json` (deps), `components/AppShell.tsx` (provider + account menu), `components/AgentReviews.tsx` (server-fetched wrapper/render), `components/CommunityReviews.tsx` (server component), `components/AgentTabs.tsx` (count prop already supported — no change needed), `app/agent/[slug]/page.tsx` (server-fetch reviews/stats/favorite; hero bookmark; enabled sign-in CTA), `app/page.tsx` (no change — `CommunityReviews` stays in place and becomes live internally).