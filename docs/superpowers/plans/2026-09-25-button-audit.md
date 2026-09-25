# Button Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate every dead end found in the button/link audit — disable inert buttons with a "coming soon" affordance, fix the `/#categories` anchor by adding a homepage categories section, add OpenAI to the directory so a dangling alternative resolves, and convert a placeholder link to a real button.

**Architecture:** Six independent, small tasks — one shared-utility extraction, one new homepage component, one data entry, and three button/UI normalization edits. Each task compiles and commits on its own.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-09-25-button-audit-design.md`

## Global Constraints

- **No test runner in this repo.** `package.json` defines only `dev`, `build`, `start`, `lint`. The verification gate for every task is `npm run build` (exit 0) plus the targeted grep/node checks listed in each task. Do not add test infrastructure.
- Match existing copy conventions exactly: lowercase `design:`/`fix:`/`feat:`/`refactor:` commit prefixes; no emoji in UI copy; existing form labels/buttons untouched unless a task says so.
- Keep the dark glassy design language: cards are `border-white/10 bg-white/[0.03]`, accents are `purple-*` at `500/10`→`/30` opacity, section headings are uppercase `text-sm font-bold text-zinc-300`.
- The site is dark-only; there is no theme or notifications feature — the disabled buttons must stay inert, not gain behavior.
- Do not touch pre-existing lint errors (`api/news` any-types, AgentExplorer `setState` in effect, trends `any` params, `<img>` warnings). They are out of scope.
- `data/agents.json` continues to be sorted by ascending `id`. The new entry is `id: 112`.
- `lib/` directory does not exist yet; the slugify extraction creates it.

## Review Focus

- **Empty/invalid category name**: `slugify` must never produce an empty string that routes to `/category/` — CategoriesGrid filters these out and renders nothing if the list is empty.
- **`disabled` buttons still firing clicks**: every dead button gets `disabled` + `aria-disabled="true"` + `title="Coming soon"`; the Free vs Paid next-case conversion must NOT be disabled — it replaces a working control, so it keeps its handler and gains `type="button"`.
- **A `button` misbehaving inside a form context**: the next-case button must set `type="button"` so it can never submit.
- **Dangling `alternatives` after the data change**: every `alternatives` slug across `agents.json` must resolve to an existing agent (verified with a node one-liner).
- **Missing anchor target**: the sidebar `/#categories` item must resolve to the new `id="categories"` section after the homepage change (verified with grep).

---

### Task 1: Extract shared slugify utility

**Files:**
- Create: `lib/slugify.ts`
- Modify: `components/AgentExplorer.tsx:7-15`, `app/category/[slug]/page.tsx:18-26`
- Verify: build + grep

**Interfaces:**
- Consumes: nothing
- Produces: `export function slugify(str: string): string` — lowercases, strips `&`, collapses whitespace to `-`, removes non-`[a-z0-9-]`, collapses and trims `-`. Imported as `import { slugify } from '../lib/slugify';` (components) and `import { slugify } from '../../../lib/slugify';` (app/category).

- [ ] **Step 1: Create `lib/slugify.ts`**

```ts
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
```

- [ ] **Step 2: Update `components/AgentExplorer.tsx`**

Delete the local `slugify` function (lines 7-15) and add the import at the top of the imports block (after `import { getLogoUrl } from '../data/toolDomains';`):

```tsx
import { slugify } from '../lib/slugify';
```

- [ ] **Step 3: Update `app/category/[slug]/page.tsx`**

Delete the local `slugify` function (lines 18-26) and add the import in the existing import block:

```tsx
import AppShell from '../../../components/AppShell';
import { slugify } from '../../../lib/slugify';
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: exit 0, all routes generate, `lib/slugify.ts` compiles.
Run: `rg "function slugify" app components lib --glob "*.ts" --glob "*.tsx"`
Expected: exactly one match — `C:\...\lib\slugify.ts:1`.

- [ ] **Step 5: Commit**

```bash
git add lib/slugify.ts components/AgentExplorer.tsx "app/category/[slug]/page.tsx"
git commit -m "refactor: extract shared slugify utility"
```

---

### Task 2: Add homepage categories section

**Files:**
- Create: `components/CategoriesGrid.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `slugify` from `../lib/slugify`, `agents` from `../data/agents.json`, `Link` from `next/link`
- Produces: `export default function CategoriesGrid(): JSX.Element | null` — a `<section id="categories">` with a heading row and a link grid; `null` when no categories exist. Homepage imports it as `import CategoriesGrid from '../components/CategoriesGrid';` and renders it between `AgentExplorer` and `CommunityReviews`.

- [ ] **Step 1: Create `components/CategoriesGrid.tsx`**

```tsx
import Link from 'next/link';
import agents from '../data/agents.json';
import { slugify } from '../lib/slugify';

type Agent = {
  category: string;
};

export default function CategoriesGrid() {
  const all = agents as Agent[];
  const categories = Array.from(new Set(all.map((a) => a.category))).sort();

  const withCounts = categories
    .map((category) => ({
      category,
      count: all.filter((a) => a.category === category).length,
      slug: slugify(category),
    }))
    .filter((c) => c.slug.length > 0 && c.count > 0);

  if (withCounts.length === 0) return null;

  return (
    <section id="categories">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">📂</span>
          <h2 className="text-sm font-bold text-zinc-300 tracking-wide uppercase">
            Browse Categories
          </h2>
        </div>
        <Link
          href="/#tools"
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
        >
          All tools →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {withCounts.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <span className="text-sm font-medium text-zinc-200 group-hover:text-purple-300 transition truncate">
              {c.category}
            </span>
            <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
              {c.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `app/page.tsx`**

Change the imports to add `CategoriesGrid`:

```tsx
import AgentExplorer from '../components/AgentExplorer';
import CategoriesGrid from '../components/CategoriesGrid';
import CommunityReviews from '../components/CommunityReviews';
```

Insert between AgentExplorer and CommunityReviews:

```tsx
        <AgentExplorer agents={agents} initialQuery={q} />
        <CategoriesGrid />
        <CommunityReviews />
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: exit 0; homepage regenerates with the new section.
Run: `rg 'id="categories"' components/CategoriesGrid.tsx`
Expected: one match on the `<section id="categories">` line.
Run: `rg 'href=\{`?`/category/' app/category app/page.tsx | Measure-Object` 
Expected: category links present in generated homepage source and all existing category pages unchanged.

- [ ] **Step 4: Commit**

```bash
git add components/CategoriesGrid.tsx app/page.tsx
git commit -m "feat: add browse categories section to homepage"
```

---

### Task 3: Add OpenAI to the directory

**Files:**
- Modify: `data/agents.json` (append entry after `id: 111`)

**Interfaces:**
- Consumes: nothing (data shape matches existing entries)
- Produces: an `openai` agent entry so `/agent/openai` renders and `together-ai.alternatives` resolves.

- [ ] **Step 1: Append the OpenAI entry**

Add to the end of the top-level array in `data/agents.json` (after the entry with `"id": 111`), matching the existing field order:

```json
{
  "id": 112,
  "slug": "openai",
  "name": "OpenAI",
  "tagline": "Frontier AI research lab behind GPT-4o, DALL·E, and the OpenAI API.",
  "category": "Chatbots & LLMs",
  "pricing": "Free credits / API pay-as-you-go",
  "featured": false,
  "url": "https://openai.com",
  "bestFor": "Developers building on the OpenAI API and teams adopting ChatGPT",
  "features": [
    "GPT-4o and o-series models",
    "DALL·E image generation",
    "Reasoning models (o1)",
    "Fine-tuning and assistants API",
    "Enterprise-grade API"
  ],
  "pros": [
    "State-of-the-art models",
    "Huge ecosystem and SDKs",
    "Simple, scalable API"
  ],
  "cons": [
    "Usage costs add up at scale",
    "Less open than open-source alternatives"
  ],
  "alternatives": ["chatgpt", "openai-codex", "together-ai"]
}
```

- [ ] **Step 2: Verify data integrity**

Run:
`node -e "const a=require('./data/agents.json');const slugs=new Set(a.map(x=>x.slug));const bad=[];for(const t of a){for(const s of t.alternatives||[])if(!slugs.has(s))bad.push(t.slug+' -> '+s)}if(a.find(x=>x.slug==='openai')&&!bad.length){console.log('OK',a.length,'agents, alternatives valid')}else{console.error('BAD',bad,a.length);process.exit(1)}"`
Expected: `OK 112 agents, alternatives valid`

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exit 0; `/agent/openai` static route generation succeeds and `together-ai`'s alternatives card links to a real page.

- [ ] **Step 4: Commit**

```bash
git add data/agents.json
git commit -m "feat: add OpenAI to tool directory"
```

---

### Task 4: Free vs Paid — disable quiz button, real next-case button

**Files:**
- Modify: `app/free-vs-paid/page.tsx:107` (quiz button), `:316-344` (next-case link)

**Interfaces:**
- Consumes: existing `activeIdx` state, `setActiveIdx`
- Produces: nothing consumed elsewhere; `href="#"` is removed from the codebase.

- [ ] **Step 1: Disable the quiz button**

Replace the `Take the quiz →` button (currently a plain `className` string, no handler):

```tsx
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Coming soon"
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold px-4 py-2.5 transition shadow-sm shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Take the quiz →
          <span className="ml-2 rounded-full border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
            soon
          </span>
        </button>
```

(Note: the hover `hover:from-purple-600 hover:to-blue-600` classes are dropped so the disabled button renders flat.)

- [ ] **Step 2: Convert the next-case link to a button**

Replace the `<Link href="#" ...>` wrapper (its inner JSX moves verbatim):

```tsx
          <button
            type="button"
            onClick={() => setActiveIdx((activeIdx + 1) % cases.length)}
            className="mt-4 block w-full text-left rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition px-6 py-4 group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg shrink-0">
                {nextCase.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition">
                  {nextCase.title}
                </div>
                <div className="text-xs text-zinc-500 truncate">
                  {nextCase.description}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-zinc-500">
                  {activeIdx + 2} of {cases.length}
                </span>
                <span className="text-zinc-600 group-hover:text-purple-400 transition">
                  →
                </span>
              </div>
            </div>
          </button>
```

The opening tag changes from `<Link href="#" onClick={(e) => { e.preventDefault(); setActiveIdx((activeIdx + 1) % cases.length); }}` to the `<button type="button" onClick={() => setActiveIdx((activeIdx + 1) % cases.length)}>` above, and the closing tag changes from `</Link>` to `</button>`. No other content changes.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: exit 0.
Run: `rg 'href="#"' app components`
Expected: no matches (the only placeholder link is gone).

- [ ] **Step 4: Commit**

```bash
git add app/free-vs-paid/page.tsx
git commit -m "fix: disable dead quiz button and convert next-case link to button"
```

---

### Task 5: AppShell — disable header buttons

**Files:**
- Modify: `components/AppShell.tsx:131-142`

**Interfaces:**
- Consumes: nothing
- Produces: two inert header buttons with tooltips.

- [ ] **Step 1: Disable the theme toggle**

Replace the 🌙 button:

```tsx
              <button
                aria-label="Theme"
                disabled
                aria-disabled="true"
                title="Coming soon"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                🌙
              </button>
```

- [ ] **Step 2: Disable the notifications button**

Replace the 🔔 button:

```tsx
              <button
                aria-label="Notifications"
                disabled
                aria-disabled="true"
                title="Coming soon"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                🔔
              </button>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: exit 0.
Run: `rg 'aria-disabled="true"' components app | Measure-Object | Select-Object -ExpandProperty Count`
Expected: `5` (2 here + 1 quiz + 2 CommunityReviews after Task 6).

- [ ] **Step 4: Commit**

```bash
git add components/AppShell.tsx
git commit -m "design: disable dead header buttons with coming soon hint"
```

---

### Task 6: CommunityReviews — disable review buttons

**Files:**
- Modify: `components/CommunityReviews.tsx:94-105`

**Interfaces:**
- Consumes: nothing
- Produces: two inert footer buttons with visible "soon" chips.

- [ ] **Step 1: Disable "Sign in to write a review"**

Replace the button:

```tsx
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[11px] font-semibold px-3 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in to write a review
            <span className="rounded-full border border-purple-500/30 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
              soon
            </span>
          </button>
```

- [ ] **Step 2: Disable "Load more reviews"**

Replace the button:

```tsx
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="text-[11px] font-semibold text-purple-400 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Load more reviews →
            <span className="ml-1.5 rounded-full border border-purple-500/30 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
              soon
            </span>
          </button>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: exit 0.
Run: `rg 'aria-disabled="true"' components app | Measure-Object | Select-Object -ExpandProperty Count`
Expected: `5`.

- [ ] **Step 4: Full verification sweep**

Run:
- `npm run lint`
- `npm run build`
- `rg 'href="#"' app components`
- `node -e "const a=require('./data/agents.json');const slugs=new Set(a.map(x=>x.slug));const bad=[];for(const t of a){for(const s of t.alternatives||[])if(!slugs.has(s))bad.push(t.slug+' -> '+s)}if(!bad.length){console.log('alternatives OK')}else{console.error(bad);process.exit(1)}"`

Expected: lint reports only the pre-existing errors (api/news, AgentExplorer effect, trends `any`s, `<img>` warnings); build exit 0; no `href="#"`; `alternatives OK`.

- [ ] **Step 5: Commit**

```bash
git add components/CommunityReviews.tsx
git commit -m "design: disable dead review buttons with coming soon hint"
```