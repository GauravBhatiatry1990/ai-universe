# Session 3 Design — Tool Page Tabs, Data Expansion, Monetization Prep

> **Status:** Approved (user reviewed sections 1–3 and provided claim contact email)
> **Date:** 2026-09-25

## Overview

Three improvements to the AI Universe directory:

1. **Tabbed Tool Detail layout** — restructure `app/agent/[slug]` so all content is reachable without long scrolling, especially Community Reviews. Hash-based navigation, shareable URLs.
2. **Data expansion** — add 20 new tools (→ 132 entries), create 4 new categories, enrich a set of flagship entries, ensure every new tool has a logo domain.
3. **Monetization prep** — a distinct `sponsored` flag + badge (separate from the existing `featured`), and a "Claim this Profile" flow ending in a mailto form to the site owner's inbox.

## Current State (verified)

- `app/agent/[slug]/page.tsx` is a server component rendering: hero card (logo, name, category pill, pricing, `featured` badge, tagline, bestFor, Visit link) → Key Features card → Pros & Cons grid → Alternatives grid → `NewsletterSignup`. No reviews section on this page.
- `components/CommunityReviews.tsx` (homepage-only) renders 3 hardcoded reviews and two disabled buttons ("Sign in to write a review", "Load more reviews") per the Session 2 dead-button work.
- `data/agents.json`: 112 entries, all with full metadata — min 4 `features`, 3 `pros`, 2 `cons`; exactly one entry (OpenAI) has 5 features. Entries are one-line JSON objects sorted ascending by `id`. `featured` exists and is consumed by the detail page badge, AgentExplorer card styling/sort, and the Trends page filter.
- `data/toolDomains.ts`: `TOOL_DOMAINS: Record<slug, domain>` + `getLogoUrl` → Google favicon service (`sz=64`). Only 48 of 112 slugs are covered; `ToolLogo` renders `<null>` (icon hidden) for uncovered slugs.
- `components/AgentExplorer.tsx`: card link has `className="group relative ..."` — **relative**, so badges can be absolutely positioned in the top-right corner. Card border changes when `featured`.
- No test runner. Verification gate = `npm run build` (exit 0) + `npm run lint` + targeted node/grep assertions.
- No `/claim` route, no `lib/site.ts`, no email constant exists.

## Goals

- **G1 Tabbed layout:** four tabs — Overview, Features & Pros/Cons, Community Reviews, Alternatives — switchable without a full page reload, URL-hash shareable (`#overview`, `#features`, `#reviews`, `#alternatives`), default `#overview`.
- **G2 Data:** 132 entries, 4 new categories (Integration & Automation, Agents & Frameworks, Design, Search), every new tool complete + logo domain, all `alternatives` resolve.
- **G3 Monetization:** `sponsored` flag on 3 demo entries, distinct badge on detail page + search cards, `/claim/[slug]` page with a mailto form to `gauravbhatia2190@gmail.com`.

## Design

### Section 1 — Tabbed Tool Detail Layout

**Approach (chosen): client-side tab wrapper, hash-based, all panels SSR'd.**

The page remains a server component; a new client component receives the pre-rendered sections as children. Browser navigation via hash only — no query params, no page reload, no refetch. All four panels stay in the DOM (inactive panels use `hidden`), preserving SSR/SEO content and instant switching.

**File structure:**

- `app/agent/[slug]/page.tsx` (server, modified):
  - Keeps hero masthead — visible regardless of tab: back link, logo, name, badges row (category pill, ★ Featured, Sponsored), tagline, and the two CTA buttons (`Visit {name} ↗`, `Claim this Profile`).
  - Builds four tab sections (JSX nodes) and renders `<AgentTabs sections={[...]} />`.
  - `NewsletterSignup` stays below the tab container, outside the tab system.
- `components/AgentTabs.tsx` (client, new):
  - Props: `sections: Array<{ id: string; label: string; count?: number; content: ReactNode }>`; `initialTab: string` defaulting `"overview"`.
  - State: `active`; **initial value read from `window.location.hash` on mount** (strip `#`, validate against known ids, fallback `"overview"`).
  - On tab switch: set state, set `location.hash` (via `window.location.hash = id` — no history push needed beyond native hash history), scroll the tab bar into view if needed.
  - Listens for `hashchange` (back/forward) and syncs state.
  - Layout: a tab bar directly below the hero (rounded-full pill buttons in a `bg-white/[0.03] border border-white/10` bar; active tab gets `bg-purple-500/10 text-purple-300 border-purple-500/30`, inactive `text-zinc-400 hover:text-zinc-200`). The bar is NOT sticky — it stays put under the hero (keeps implementation simple, no header-offset math). Optional count chip on the Reviews tab (e.g. badge with review count).
  - Each panel wrapped in `<div id="{id}" className={id === active ? '' : 'hidden'}>`. Panels keep `scroll-mt` so hash-only jumps land below the sticky header.
- `components/AgentReviews.tsx` (server, new):
  - **Deterministic** (no RNG): derives 3 reviews from the agent's `slug` and `category` by index-cycling through fixed pools of authors (initials/colors/names), ratings, categories-keyed review templates, and `time` strings. Same output every build → SSR-safe, no hydration mismatch.
  - Visuals mirror `CommunityReviews.tsx` card: avatar circle (`w-9 h-9 rounded-full {color}`), name, star row, review text (category-flavored), `time`. Header "Reviews" with 💬; footer row reusing the two disabled buttons from the homepage section ("Sign in to write a review" + "soon" chip, "Load more reviews →" + "soon" chip) — same classes as Session 2.
  - Review text templates reference the tool generically ({toolName} used) plus category-specific strengths/weaknesses; ratings mostly 4–5 with the occasional 3 for balance.

**Tab content mapping (no content lost):**

| Tab (hash) | Content |
|---|---|
| Overview (`#overview`) | "At a glance" card — data-dense fact grid: Pricing · Category · Website (`url`, external link) · Best for. Tagline already in hero. |
| Features & Pros/Cons (`#features`) | Existing **Key Features** card + **Pros & Cons** grid, moved verbatim. |
| Community Reviews (`#reviews`) | New `AgentReviews` component. Reviews tab shows count chip (e.g. "3"). |
| Alternatives (`#alternatives`) | Existing alternatives grid, moved verbatim. |

**Edge cases:**
- Unknown/empty hash → `overview`.
- Agent with no features/pros/cons → tab content renders the empty-state `null` path as today (sections already conditional).
- Agent with no alternatives → Alternatives tab shows a "No alternatives listed yet" empty state instead of an empty grid (page currently hides the whole card; in a tab system the tab must still exist so the bar is stable).

### Section 2 — Data Expansion

**Field shape** stays stable: `id, slug, name, tagline, category, pricing, featured, url, bestFor, features[], pros[], cons[], alternatives[]` plus the new optional `sponsored?: boolean`. No new required fields.

**New tools (20) → 132 total.** Each gets complete metadata (4–5 features, 3 pros, 2 cons, bestFor, pricing, url) and a `data/toolDomains.ts` entry:

| slug | name | category | logo domain |
|---|---|---|---|
| `n8n` | n8n | Integration & Automation | `n8n.io` |
| `make` | Make | Integration & Automation | `make.com` |
| `langchain` | LangChain | Agents & Frameworks | `langchain.com` |
| `crewai` | CrewAI | Agents & Frameworks | `crewai.com` |
| `galileo-ai` | Galileo AI | Design | `galileo.ai` |
| `uizard` | Uizard | Design | `uizard.io` |
| `canva` | Canva (Magic Studio) | Design | `canva.com` |
| `exa` | Exa | Search | `exa.ai` |
| `andi` | Andi | Search | `andi.com` |
| `v0` | v0 (Vercel) | Coding | `v0.dev` |
| `cline` | Cline | Coding | `cline.bot` |
| `qodo` | Qodo | Coding | `qodo.ai` |
| `zed-ai` | Zed AI | Coding | `zed.dev` |
| `microsoft-copilot` | Microsoft Copilot | Chatbots & LLMs | `microsoft.com` |
| `kits-ai` | Kits AI | Audio | `kits.ai` |
| `mubert` | Mubert | Audio | `mubert.com` |
| `hailuo-ai` | Hailuo AI | Video | `hailuoai.video` |
| `scispace` | SciSpace | Research | `scispace.com` |
| `craft` | Craft | Note-Taking | `craft.do` |
| `tana` | Tana | Note-Taking | `tana.inc` |

**New categories (4):** Integration & Automation (n8n, Make), Agents & Frameworks (LangChain, CrewAI), Design (Galileo AI, Uizard, Canva Magic Studio), Search (Exa, Andi).

**Constraints:**
- Entries appended after `id: 112`, ascending order, one JSON object per line (existing format).
- Every new entry's `alternatives` references only existing slugs (keeps the Session 2 `alternatives OK` invariant).
- `featured` stays `false` for all 20 new entries; the existing 12 featured tools are unchanged.

**Enrichment pass (6 flagship entries):** bump `chatgpt`, `claude`, `midjourney`, `elevenlabs`, `cursor`, `perplexity` to 5 features and expand pros/cons only with statements that are accurate for the product. No invented claims; if a tool has nothing honest to add, keep 4 features.

### Section 3 — Monetization Prep

**Data:** add `"sponsored": true` to exactly 3 existing tools — `supermaven`, `murf-ai`, `decktopus` (all currently `featured: false`, so Sponsored never co-occurse with ★ Featured in the demo set). All other entries omit the field (undefined = false).

**Types:** `sponsored?: boolean` added to the `Agent` type in `app/agent/[slug]/page.tsx` and `components/AgentExplorer.tsx`.

**Badge:** `components/SponsoredBadge.tsx` (server-safe, new) — a small cyan pill:
`span` with `inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300` and label `Sponsored` (± a `●` dot). Rendered:
- Detail hero badges row (next to category pill / ★ Featured).
- AgentExplorer card top-right corner: since the card Link is `relative`, an absolutely-positioned `absolute top-3 right-3` badge. (Card body is unchanged; the badge overlays the corner.)

**Claim flow:**
- `lib/site.ts` (new): `export const SITE_CONTACT_EMAIL = 'gauravbhatia2190@gmail.com';`
- `app/claim/[slug]/page.tsx` (new, server): finds the agent by slug, `notFound()` if missing. Renders (wrapped in `AppShell`): back link to `/agent/{slug}`, header with `ToolLogo` + tool name ("Claim this profile: {name}"), explanatory copy ("This listing is managed by the community right now. Claim it to control its description, contact info, and visibility."), and a form:
  - Fields: **Full name** (text, required), **Work email** (email, required), **Company** (text, optional), **Message** (textarea, optional, prefilled placeholder mentioning what they'd like to change).
  - Submit → `onSubmit` builds a `mailto:` URL: `mailto:{SITE_CONTACT_EMAIL}?subject={encodeURIComponent('Claim this profile: ' + name)}&body={encodeURIComponent(multiline summary)}` and sets `window.location.href` (no backend).
  - The page renders a `<form>`; the submit is a `type="button"` handler in a client boundary. To keep this simple: `app/claim/[slug]/page.tsx` stays a server component, and the form is `components/ClaimProfileForm.tsx` (`"use client"`).
- Detail page hero: secondary button "Claim this Profile" (`<Link href={/claim/${agent.slug}}>`, outline-purple style) beside the Visit button.

**Demo visibility:** with only 3 sponsored entries, the badge appears on those 3 detail pages and wherever those cards appear on the homepage/trends.

## Verification Gate (no test runner in repo)

1. `npm run build` — exit 0; all routes generate.
2. `npm run lint` — reports only the pre-existing errors (api/news `any`s, AgentExplorer setState-in-effect, trends `any`s, `<img>` warnings). No new errors.
3. Data integrity (node one-liners):
   - `agents.length === 132`, ids sorted ascending, `sponsored` count === 3, `featured` count unchanged (12).
   - All slugs unique; all new slugs have a `TOOL_DOMAINS` entry.
   - `alternatives OK` (every alternatives slug resolves).
4. Grep assertions:
   - `components/AgentTabs.tsx` defines tabs with ids `overview|features|reviews|alternatives`.
   - `id="overview"` … `id="alternatives"` present in `AgentTabs.tsx`.
   - The hero's secondary `Link` to `/claim/{slug}` present in `app/agent/[slug]/page.tsx`.
   - `SITE_CONTACT_EMAIL` used in `components/ClaimProfileForm.tsx`.
   - No `console.log`/debug leftovers.
5. Manual smoke (optional for user): `/agent/cursor#reviews` opens the Reviews tab; `/agent/supermaven` shows the Sponsored badge; `/claim/supermaven` form `mailto:` has correct subject/body.

## Out of Scope

- Real authentication, ownership, or payment for claims (mailto-only by design in this phase).
- Sponsored sort/placement logic or ad analytics.
- Backend/database for reviews; reviews remain deterministic mock content.
- Filling the remaining ~60 uncovered logo domains in `toolDomains.ts` (only new-tool domains are added).
- Fixing pre-existing lint errors.
- Alphabetizing categories or visual re-theming beyond the tab bar, badges, and claimed button.

## Risks

- **Category drift:** a new "Design" category could blur with existing "Image". Mitigated by copy standards (Design = product/UI creation, Image = visual asset generation) written into the data.
- **Hash tabs ignore anchor-scroll default:** browser jumps to the element on hash change; we intentionally scroll the tab panel into view instead.
- **Mailto length limits** on long messages — form message is kept optional and short.
- **Deterministic reviews feel repetitive** across many tools — mitigated by per-category template pools and named authors so adjacent tools differ.