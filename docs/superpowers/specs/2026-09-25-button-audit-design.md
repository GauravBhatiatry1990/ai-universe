# Button Audit — Design

Date: 2026-09-25
Status: Approved (design) — pending spec review

## Purpose

Eliminate dead ends and broken references across the AI Universe app: dead
buttons, a nav anchor pointing to a nonexistent section, dangling data
references, and a placeholder link masquerading as a button. Consolidate or
neutralize duplicate/redundant UI actions.

## Scope

- AppShell header buttons (theme toggle, notifications)
- Free vs Paid page (quiz button, next-case link)
- CommunityReviews (sign-in button, load-more button)
- Homepage (new categories section)
- data/agents.json (add OpenAI)
- Shared slugify utility

## Findings from audit

### Broken links
1. Nav item "Categories" -> `/#categories`, but no element with
   `id="categories"` exists anywhere. Dead anchor.
2. `together-ai` (data/agents.json) lists `"openai"` in `alternatives`, but
   there is no `/agent/openai` route. That card 404s.

### Placeholder links
3. Free vs Paid "next case" is `<Link href="#">` with `onClick preventDefault`
   + cycle logic. Functional, but a button wearing a link costume.

### Dead buttons (no handler, not a form submit)
4. AppShell: theme toggle (`🌙`), notifications (`🔔`).
5. Free vs Paid: "Take the quiz ->".
6. CommunityReviews: "Sign in to write a review", "Load more reviews ->".

### Duplicate / repeating UI
7. No same-page duplicate nav items or repeated buttons beyond the dead
   buttons above. The failing `/#categories` anchor is the only
   duplication/consistency defect.
8. `slugify()` is duplicated verbatim in `AgentExplorer.tsx` and
   `category/[slug]/page.tsx`.

### Confirmed healthy
- All 8 routes exist (`/`, `/agent/[slug]`, `/category/[slug]`,
  `/free-vs-paid`, `/news`, `/pricing`, `/submit`, `/trends`).
- All internal links resolve; agent/category dynamic links valid.
- All `useCases.json` free/paid picks exist in `agents.json`.
- 111 agents, no duplicate names or slugs, max id 111, OpenAI absent
  (only `chatgpt` and `openai-codex` exist).
- Newsletter/submit form buttons work (`type="submit"`).

## Decisions (user-approved)

1. **Dead buttons: disable + "Coming soon"** — not removed, not implemented.
2. **Categories anchor: add a categories section** to the homepage.
3. **Dangling alternative: add OpenAI** to the directory.

## Design

### A. Disable dead buttons with "Coming soon" affordance

Consistent pattern for all 5 dead buttons:
- Keep the `<button>` element.
- Add `disabled`, `aria-disabled="true"`, `title="Coming soon"`.
- Add `disabled:cursor-not-allowed disabled:opacity-60`.

Header icon buttons (AppShell theme + notifications): tooltip hint only, to
keep the header clean.

Content buttons (Free vs Paid quiz, CommunityReviews sign-in and load-more):
add a visible "soon" chip next to the label (small outline badge reading
"soon") so users see why the control is inert.

Files: `components/AppShell.tsx`, `app/free-vs-paid/page.tsx`,
`components/CommunityReviews.tsx`.

### B. Homepage categories section

- New server component `components/CategoriesGrid.tsx`.
- `<section id="categories">` so the sidebar anchor `/#categories` works.
- Heading row: section label ("Browse categories") + "All tools ->" link to
  `/#tools`.
- Grid of glassy cards (category name + tool count) linking to
  `/category/<slug>`. Styled like the existing section cards
  (`border-white/10 bg-white/[0.03]`, purple hover).
- Data from `data/agents.json` (unique categories, counts).
- Placed on the homepage between `AgentExplorer` and `CommunityReviews`.
- Extract duplicated `slugify()` into `lib/slugify.ts`; import it in
  `AgentExplorer.tsx`, `category/[slug]/page.tsx`, and `CategoriesGrid.tsx`.

### C. Add OpenAI to the directory

New entry in `data/agents.json`:
- `id: 112`
- `slug: "openai"`
- `name: "OpenAI"`
- category: `Chatbots & LLMs`
- `tagline`: "Frontier AI research lab behind GPT-4o, DALL·E, and the OpenAI API."
- `pricing`: "Free credits / API pay-as-you-go"
- `url`: `https://openai.com`
- `bestFor`: "Developers building on the OpenAI API and teams adopting ChatGPT"
- `features`: GPT-4o and o-series models, DALL·E image generation, reasoning
  models (o1), fine-tuning and assistants API, enterprise-grade API.
- pros/cons consistent with directory tone (verified against a sample entry
  such as together-ai during implementation).
- `alternatives: ["chatgpt", "openai-codex", "together-ai"]`.

The existing `together-ai -> openai` alternative link then resolves.

### D. Semantic fix: next-case link -> button

In `free-vs-paid/page.tsx`, convert the next-case `<Link href="#">` to a
`<button type="button">` with the same onClick cycle logic and classes.
`Link` stays imported (used by agent links on the same page).

### Redundancy resolution

- The 5 dead buttons become visibly inert with a "Coming soon" hint instead
  of being removed (removal hides affordance for planned features).
- The `/#categories` anchor is fixed by adding the section rather than
  repointing or deleting the nav item.
- No other page-level duplicates found; no consolidation required.

## Out of scope (noted, not planned)

- Pre-existing lint errors: api/news `any` types, AgentExplorer
  setState-in-effect, trends `any` types.
- LivePulse/NewsGrid fetching duplicate /api/news (different content roles).
- ToolLogo/NewsThumbnail `<img>` warnings.

## Verification

1. `npm run build` exits 0; all routes generate including all 11 category
   pages and the new OpenAI agent page.
2. `npm run lint` unchanged from baseline (no new errors introduced).
3. No `href="#"` remains in the codebase.
4. `/#categories` anchor resolves to the new homepage section.
5. `node -e` sanity check that every `alternatives` reference in
   `data/agents.json` resolves to a real slug.