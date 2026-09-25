# Find My AI Tool Matchmaker + Homepage Reorder — Design Spec

**Date:** 2026-09-25
**Status:** Approved (Sections A–C reviewed with the product owner)

## Goal

Add a front-end-only "Find My AI Tool" matchmaker quiz to the homepage that surfaces 1–3 best-fit tools from the existing 132-entry catalog, and move the CommunityReviews section up so it sits between Explore Tools and Browse Categories.

## Success Criteria

- A visitor can answer three questions (use case, budget, skill level), advance step by step, and land on 1–3 ranked tool cards linking to `/agent/[slug]`.
- Any combination of answers yields either 1–3 matches above a quality floor or a clear "adjust your answers" state — never a crash.
- Homepage section order changes from `NewsGrid → Explorer → Categories → Reviews → Newsletter` to `NewsGrid → Matchmaker → Explorer → Reviews → Categories → Newsletter`.

## Non-Goals

- No backend, no persistence, no auth, no analytics.
- No changes to search/explorer filtering, category pages, or tool detail pages.
- `difficulty` is added to data for the matchmaker; no other component consumes it in this session.
- No paid/sponsored placement logic in the matchmaker.

## Data Model

### 1. `difficulty` field (all 132 entries in `data/agents.json`)

Every agent entry gains one of:

- `"beginner"` — forgiving, low-friction tools for newcomers (e.g. Canva, Grammarly, Andi).
- `"intermediate"` — capable tools with a learning curve or setup (e.g. Cursor, ElevenLabs, Zapier).
- `"expert"` — developer/technical tools, APIs, frameworks (e.g. LangChain, CrewAI, Qodo).

Curated per slug by the implementer. Value set must be exactly `{beginner, intermediate, expert}`; no entry may omit it. Other components' `Agent` types use structural casts, so the extra field is inert there.

### 2. Budget parsing (from free-text `pricing`)

Pure function `parsePricing(pricing: string)` in `lib/matchmaker.ts` returns:

```ts
{ free: boolean; cheapestPaid: number | null }
```

- `free = true` when the string contains `Free`, `Open-source`, or any `$` absence (e.g. `Free / Plus $20/mo` → free; `$10/mo` → not free; `Free credits / API pay-as-you-go` → free).
- `cheapestPaid` = lowest `$N` amount present (regex `/\$(\d+(?:\.\d+)?)/`), else `null`.

Budget quiz options: **Free only** · **Under $10/mo** · **Under $25/mo** · **No budget limit**.

## Use-Case Options (curated)

Eleven options, each mapping to one or two existing categories, covering all 15 categories exactly once across rows:

| Option label | Mapped categories |
|---|---|
| Chat & AI assistants | Chatbots & LLMs |
| Coding & dev tools | Coding, Agents & Frameworks |
| Writing & content | Writing |
| Images & design | Image, Design |
| Video creation | Video |
| Audio & voice | Audio |
| Research & learning | Research |
| Search & knowledge | Search, Note-Taking |
| Productivity & work | Productivity |
| Presentations & slides | Presentations |
| Automation & no-code | Integration & Automation, Website Builders |

(Eleven rows shown.)

## Scoring

Pure function `scoreTools(agents, answers): RankedMatch[]` in `lib/matchmaker.ts` (no React imports).

| Signal | Match | Points |
|---|---|---|
| Use case | tool's `category` ∈ the chosen option's mapped categories | +3 |
| Budget | "Free only" chosen → `free === true`; any paid limit chosen → `free === true` **or** `cheapestPaid ≤ limit`; "No budget limit" → always | +3 |
| Budget (near) | `free === false` and `cheapestPaid ≤ 1.5 × limit` | +2 |
| Budget (over) | otherwise | +1 |
| Skill | `difficulty` equals chosen level | +3 |
| Skill (adjacent) | `beginner↔intermediate` or `intermediate↔expert` | +2 |
| Skill (opposite) | `beginner↔expert` | +1 |
| Promotion | `featured: true` | +1 |

- "Free only" budget: tools with `free === false` score +0 on budget (the near/over rows do not apply).
- "No budget limit" always scores +3.
- A free-tier tool satisfies any paid budget limit (free is within every budget).
- Sort by score desc, then `name` asc. Keep only `score >= 5`. Empirically most combos yield 2–3 matches; if 0 qualify, return empty (component shows the fallback state).
- Output shape: `{ agent, score }` ordered list, callers slice to 3.

## Component Architecture

### `lib/matchmaker.ts`

Framework-free: `USE_CASES` (labels + category maps), `parsePricing`, `scoreTools`. Consumed by the component and by Node assertion scripts (via Node 24 native TypeScript import). No DOM, no React.

### `components/Matchmaker.tsx`

`'use client'`. Props: `{ agents: Agent[] }` (defines a local minimal `Agent` type). State:

- `step: 1 | 2 | 3 | 'results'` (question steps; landing on results after answering Q3)
- `answers: { useCase: string | null; budget: string | null; skill: string | null }`

State changes happen only in event handlers (onClick) — no setState in effects or render, keeping the repo's React-Compiler lint rules clean.

Wizard UX:

1. Header: "Find My AI Tool" + one-line tagline. Progress: "Step N of 3" plus three segment indicators.
2. Q1 grid of use-case buttons (select → auto-advance to Q2).
3. Q2 budget buttons (4) → auto-advance to Q3.
4. Q3 skill buttons (Beginner / Intermediate / Expert) → auto-advance to results.
5. **Back** button on Q2/Q3 (returns to previous question, preserves answers).
6. Results: heading "Your top matches"; 1–3 cards each with `ToolLogo`, name, tagline, category + pricing + difficulty chips, and a `Link` to `/agent/[slug]`. Footer button **Retake quiz** resets `step`/`answers`.
7. Empty state (no `score >= 5`): "No strong matches yet — try adjusting your answers." with Retake button.

Styling follows the existing dark-glass convention (`rounded-2xl border border-white/10 bg-white/[0.03]`, purple accents, `ToolLogo`).

## Homepage Reorder

`app/page.tsx` render order (final):

1. `NewsGrid`
2. `Matchmaker` (new; passes `agents`)
3. `AgentExplorer` (Explore Tools)
4. `CommunityReviews` (moved up from bottom)
5. `CategoriesGrid` (Browse Categories)
6. `NewsletterSignup`

`Matchmaker` receives `agents={agents}` with the same import used today.

## Verification (no test runner in repo)

Gate = **all** of:

1. `npm run build` → exit 0.
2. `npm run lint` → exactly the pre-existing 10 problems (5 errors: `api/news` any×2, `trends` any×2, `AgentExplorer` set-state-in-effect; 5 warnings: `_rssImage` + `<img>`×4). No new errors from matchmaker files.
3. Node assertions (script imports `lib/matchmaker.ts` via Node 24 native TS):
   - All 132 entries have `difficulty ∈ {beginner, intermediate, expert}`.
   - `parsePricing` handles representative strings (free tier, paid-only, usage-based, open-source, decimal).
   - `scoreTools` returns 1–3 matches for ≥3 representative answer combos (e.g. coding+budget+expert; design+free+beginner; writing+no-limit+intermediate), never 0 for typical combos, never >3 cards rendered.
   - Featured tie-break: a `featured` tool outranks an otherwise-equal non-featured tool.

## Files Touched

- Modify: `data/agents.json` (add `difficulty` to all 132 entries)
- Create: `lib/matchmaker.ts`
- Create: `components/Matchmaker.tsx`
- Modify: `app/page.tsx` (import + placement of Matchmaker; reorder CommunityReviews)

## Risks / Notes

- Difficulty is subjective; curated values are best-effort and revisable.
- `parsePricing` is a heuristic over free-text data — some strings (e.g. "Free credits / usage-based") are inherently variable; treated as free with no fixed tier.
- Node 24 TS import in assertions is the assumed verification path; if unavailable, fall back to a small `.mjs` replica of the pure functions used only in the assertion script (verified equal by construction in plan).