# Find My AI Tool Matchmaker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a front-end-only "Find My AI Tool" wizard to the homepage that scores all 132 catalog tools on three answers (use case, budget, skill level) and returns 1–3 ranked matches linking to their detail pages, and move CommunityReviews up to sit between Explore Tools and Browse Categories.

**Architecture:** Four tasks. Task 1 adds a curated `difficulty` field to every entry in `data/agents.json` (single source of truth) via a one-shot transform script carrying the full 132-slug map. Task 2 builds `lib/matchmaker.ts` — framework-free pure logic (`USE_CASES`, `parsePricing`, `scoreTools`) verified by Node assertions importing the TS module directly. Task 3 builds the `'use client'` wizard component `components/Matchmaker.tsx` (step state machine, Back button, results cards, fallback state; state mutated only in event handlers to keep the repo's React-Compiler lint rules clean). Task 4 wires it into `app/page.tsx` (NewsGrid → Matchmaker → AgentExplorer → CommunityReviews → CategoriesGrid → NewsletterSignup).

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Node 24 (native TS import for assertions).

**Spec:** `docs/superpowers/specs/2026-09-25-find-my-ai-tool-matchmaker-design.md`

## Global Constraints

- **No test runner.** Gate = `npm run build` (exit 0) + `npm run lint` (exactly the pre-existing 10 problems: news `any`×2 + unused `_rssImage`, trends `any`×2, AgentExplorer set-state-in-effect, `<img>`×4) + the node/grep assertions each task lists. New files must not add errors.
- `data/agents.json`: one JSON object per line, ids ascending, `difficulty ∈ {"beginner","intermediate","expert"}` on all 132 entries. Do not change any existing field's value — only add the new key.
- Copy/conventions: lowercase `feat:` commit prefixes; dark-glass styling (`border-white/10 bg-white/[0.03]`, purple accents); section headers use an emoji icon + uppercase title (Matchmaker uses 🎯); no new README/docs.
- All setState in the new client component happens inside event handlers only — never in effects or render.
- Assertion scripts live in the system temp dir (`C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\`) — only source/data files are committed. Node assertions import TS via Node 24 type-stripping; if `import('../lib/matchmaker.ts')` fails at runtime, fall back to a byte-identical `.mjs` replica of the pure functions used only for assertions (noted per the spec's risk section).
- `rg` is not installed — use the Grep tool or `findstr` for grep checks.

## Review Focus

1. **Empty/partial answers** — no answer selected yet, or a combo where no tool scores ≥5, must render a stable state (step 1 shown / fallback card), never crash or render zero result cards without explanation. Pinned: Task 2 synthetic `[]` test + Task 3 fallback JSX + absence of `useEffect`.
2. **Budget parsing edge cases** — free-tier tools under a paid budget still score full budget points; usage-based / open-source / subscription strings (`Free credits / API pay-as-you-go`, `$20/mo (Pro) / API`, `Included with ChatGPT Plus / API`, decimals `$14.99`) parse without NaN or false `free`. Pinned: Task 2 `parsePricing` cases.
3. **Difficulty completeness** — every entry carries a valid value; a future entry without one must not break scoring (missing value treated as `intermediate`, a middle-of-road default). Pinned: Task 1 assert + Task 2 `scoreTools` missing-difficulty case.
4. **Use-case option → real category** — a typo in a mapped category would silently make that option always score 0. Every mapped category must exist in the live data. Pinned: Task 2 all-options assertion.
5. **Hydration + lint health** — server HTML renders step 1 with zero answers (no window/DOM access in render); no new lint errors from the wizard. Pinned: Task 3 grep: no `useEffect`, all `useState` initializers static, `window` absent from component.

---

### Task 1: Add the `difficulty` field to all 132 entries

**Files:**
- Modify: `data/agents.json` (all 132 entries gain `"difficulty":"..."`)
- (assert script + transform script written to the temp workspace, not committed)

**Interfaces:**
- Consumes: nothing (data only).
- Produces: `data/agents.json` where every entry has `difficulty ∈ {"beginner","intermediate","expert"}`; agents count still 132, ids ascending. Consumed by Task 2 (`scoreTools` reads `difficulty`) and Task 3 (difficulty chip on result cards).

- [ ] **Step 1: Write the assert script (RED)**

Write `C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-difficulty.mjs`:

```js
import { readFileSync } from 'node:fs';
const agents = JSON.parse(readFileSync('data/agents.json', 'utf8'));
const valid = ['beginner', 'intermediate', 'expert'];
const missing = agents.filter((a) => !valid.includes(a.difficulty));
const sorted = agents.every((a, i) => i === 0 || agents[i - 1].id < a.id);
console.log(JSON.stringify({
  count: agents.length,
  sorted,
  withDifficulty: agents.filter((a) => valid.includes(a.difficulty)).length,
  missing: missing.map((a) => `${a.id}:${a.slug}:${a.difficulty ?? '(none)'}`),
  byLevel: ['beginner', 'intermediate', 'expert'].map((l) => `${l}=${agents.filter((a) => a.difficulty === l).length}`).join(' '),
}));
```

Run: `node "C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-difficulty.mjs"` (workdir = repo root)
Expected: `"withDifficulty":0` and `"missing"` lists all 132 slugs → FAIL (RED).

- [ ] **Step 2: Write the transform script with the full 132-slug map**

Write `C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\add-difficulty.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs';

const DIFFICULTY = {
  chatgpt: 'beginner', claude: 'beginner', gemini: 'beginner', deepseek: 'intermediate',
  perplexity: 'beginner', grok: 'beginner', 'mistral-le-chat': 'intermediate', qwen: 'intermediate',
  kimi: 'beginner', 'meta-ai': 'beginner', 'github-copilot': 'intermediate', cursor: 'intermediate',
  'claude-code': 'expert', 'openai-codex': 'expert', 'replit-agent': 'intermediate', windsurf: 'intermediate',
  midjourney: 'intermediate', 'nano-banana': 'beginner', 'dall-e': 'beginner', 'adobe-firefly': 'beginner',
  'leonardo-ai': 'beginner', sora: 'beginner', veo: 'intermediate', runway: 'intermediate',
  kling: 'intermediate', 'luma-dream-machine': 'beginner', elevenlabs: 'beginner', suno: 'beginner',
  udio: 'beginner', 'murf-ai': 'beginner', jasper: 'beginner', grammarly: 'beginner',
  'copy-ai': 'beginner', 'surfer-seo': 'intermediate', 'notion-ai': 'intermediate', 'manus-ai': 'intermediate',
  'microsoft-365-copilot': 'intermediate', zapier: 'intermediate', elicit: 'beginner', consensus: 'beginner',
  gamma: 'beginner', 'beautiful-ai': 'beginner', lovable: 'intermediate', 'bolt-new': 'intermediate',
  notebooklm: 'beginner', reflect: 'intermediate', scite: 'intermediate', 'semantic-scholar': 'intermediate',
  'connected-papers': 'beginner', 'research-rabbit': 'intermediate', litmaps: 'intermediate', undermind: 'intermediate',
  poe: 'beginner', 'character-ai': 'beginner', pi: 'beginner', 'you-com': 'beginner',
  huggingchat: 'beginner', groq: 'expert', 'together-ai': 'expert', tabnine: 'intermediate',
  codeium: 'intermediate', 'sourcegraph-cody': 'intermediate', aider: 'expert', devin: 'expert',
  'amazon-q': 'intermediate', supermaven: 'intermediate', 'stable-diffusion': 'expert', ideogram: 'beginner',
  'playground-ai': 'beginner', flux: 'expert', 'krea-ai': 'intermediate', recraft: 'beginner',
  clipdrop: 'beginner', heygen: 'intermediate', synthesia: 'intermediate', pika: 'beginner',
  kaiber: 'intermediate', captions: 'beginner', veed: 'beginner', descript: 'intermediate',
  'adobe-podcast': 'beginner', krisp: 'beginner', 'play-ht': 'intermediate', speechify: 'beginner',
  'resemble-ai': 'expert', writesonic: 'beginner', rytr: 'beginner', quillbot: 'beginner',
  wordtune: 'beginner', sudowrite: 'intermediate', 'hypotenuse-ai': 'intermediate', 'content-at-scale': 'intermediate',
  'otter-ai': 'beginner', 'fireflies-ai': 'beginner', 'reclaim-ai': 'beginner', motion: 'intermediate',
  mem: 'beginner', capacities: 'intermediate', 'obsidian-ai': 'intermediate', tome: 'beginner',
  slidesai: 'beginner', decktopus: 'beginner', pitch: 'intermediate', durable: 'intermediate',
  'framer-ai': 'intermediate', 'wix-adi': 'beginner', 'webflow-ai': 'expert', 'beautiful-ai-2': 'beginner',
  anyword: 'intermediate', 'murf-ai-2': 'beginner', magical: 'beginner', openai: 'expert',
  n8n: 'intermediate', make: 'intermediate', langchain: 'expert', crewai: 'expert',
  'galileo-ai': 'intermediate', uizard: 'beginner', canva: 'beginner', exa: 'expert',
  andi: 'beginner', v0: 'intermediate', cline: 'expert', qodo: 'expert',
  'zed-ai': 'intermediate', 'microsoft-copilot': 'beginner', 'kits-ai': 'intermediate', mubert: 'beginner',
  'hailuo-ai': 'beginner', scispace: 'beginner', craft: 'beginner', tana: 'expert',
};

const src = readFileSync('data/agents.json', 'utf8').trim();
const arr = JSON.parse(src);
for (const entry of arr) {
  if (!DIFFICULTY[entry.slug]) throw new Error(`NO DIFFICULTY FOR SLUG: ${entry.slug}`);
  entry.difficulty = DIFFICULTY[entry.slug];
}
const lines = arr.map((entry, i) => {
  const line = '  ' + JSON.stringify(entry);
  return i < arr.length - 1 ? line + ',' : line;
});
writeFileSync('data/agents.json', '[' + lines.join('\n') + ']\n', 'utf8');
console.log(`Wrote ${arr.length} entries with difficulty.`);
```

- [ ] **Step 3: Run the transform**

Run (workdir = repo root): `node "C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\add-difficulty.mjs"`
Expected: `Wrote 132 entries with difficulty.` (throws if any slug is missing from the map).

- [ ] **Step 4: Verify GREEN**

Run the Step 1 assert again.
Expected: `{"count":132,"sorted":true,"withDifficulty":132,"missing":[],"byLevel":"beginner=N1 intermediate=N2 expert=N3"}` (exact N1/N2/N3 printed; values A/B/C read from output and match expectations roughly: beginners dominate midweight, experts ≥ 8). No `missing` entries.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exit 0. (JSON consumers are casts; extra field is inert.)

- [ ] **Step 6: Commit**

```bash
git add data/agents.json
git commit -m "feat: add difficulty field to all tool entries"
```

---

### Task 2: `lib/matchmaker.ts` — scoring engine

**Files:**
- Create: `lib/matchmaker.ts`
- (assert script in temp workspace, not committed)

**Interfaces:**
- Consumes: `data/agents.json` (difficulty from Task 1); nothing else.
- Produces (consumed by Task 3):
  - `export const USE_CASES: { id: string; label: string; categories: string[] }[]`
  - `export const BUDGET_OPTIONS: { id: string; label: string; limit: number | null }[]` (limit `null` = free-only, `Infinity` = any)
  - `export const SKILL_LEVELS: ('beginner' | 'intermediate' | 'expert')[]`
  - `export function parsePricing(pricing: string): { free: boolean; cheapestPaid: number | null }`
  - `export type MatchAgent` (minimal agent shape used for scoring)
  - `export function scoreTools(agents: MatchAgent[], answers: { useCase?: string; budget?: string; skill?: string }): { agent: MatchAgent; score: number }[]`

- [ ] **Step 1: Write the assert script (RED)**

Write `C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-matchmaker.mjs`:

```js
import { readFileSync } from 'node:fs';
const { scoreTools, parsePricing, USE_CASES, BUDGET_OPTIONS } = await import(
  new URL('file://' + process.cwd().replace(/\\/g, '/') + '/lib/matchmaker.ts')
);

const real = JSON.parse(readFileSync('data/agents.json', 'utf8'));

// 1. parsePricing representative cases (RF2)
const pp = [
  ['Free / Plus $20/mo', { free: true, cheapestPaid: 20 }],
  ['$10/mo', { free: false, cheapestPaid: 10 }],
  ['Free credits / API pay-as-you-go', { free: true, cheapestPaid: null }],
  ['Open-source / commercial tiers', { free: true, cheapestPaid: null }],
  ['Free / Pro $14.99/mo', { free: true, cheapestPaid: 14.99 }],
  ['Free / AI subscription optional', { free: true, cheapestPaid: null }],
  ['$20/mo (Pro) / API', { free: false, cheapestPaid: 20 }],
  ['Included with ChatGPT Plus / API', { free: true, cheapestPaid: null }],
];
for (const [input, want] of pp) {
  const got = parsePricing(input);
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`parsePricing(${input}) = ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
}

// 2. Every USE_CASES mapped category exists in live data (RF4)
const cats = new Set(real.map((a) => a.category));
for (const uc of USE_CASES) for (const c of uc.categories) if (!cats.has(c)) throw new Error(`dead category: ${c}`);

// 3. Synthetic tie-break + floor + adjacent (RF1, budget/free edge)
const mk = (slug, extra = {}) => ({
  slug, name: slug, tagline: '', category: 'Coding', pricing: 'Free / Pro $10/mo',
  difficulty: 'intermediate', featured: false, ...extra,
});
const feat = mk('feat-tool', { featured: true });
const plain = mk('plain-tool');
const scored2 = scoreTools([feat, plain], { useCase: 'coding', budget: 'under10', skill: 'intermediate' });
if (scored2[0].agent.slug !== 'feat-tool') throw new Error('featured tie-break failed');

const cheaps = scoreTools([mk('freebie', { pricing: 'Free', difficulty: 'beginner' })], { useCase: 'coding', budget: 'free', skill: 'beginner' });
if (cheaps[0].score !== 9) throw new Error(`free+budget+skill expected 9 got ${cheaps[0].score}`);

const budgetNear = scoreTools([mk('close', { pricing: 'Pro $14/mo' })], { useCase: 'coding', budget: 'under10', skill: 'expert' });
if (budgetNear[0].score !== 7) throw new Error(`near-budget+opposite-skill expected 7 got ${budgetNear[0].score}`);

const none = scoreTools([mk('dud', { category: 'Search', pricing: '$50/mo', difficulty: 'expert' })], { useCase: 'coding', budget: 'free', skill: 'beginner' });
if (none.length !== 0) throw new Error(`floor expected [] got ${JSON.stringify(none)}`);

// missing difficulty defaults to intermediate (RF3)
const noDiff = scoreTools([{ slug: 'x', name: 'x', tagline: '', category: 'Coding', pricing: 'Free', difficulty: undefined }], { useCase: 'coding', budget: 'any', skill: 'intermediate' });
if (noDiff[0].score !== 9 || noDiff.length !== 1) throw new Error('missing-difficulty default failed');

// 4. Real-data combos return 1-3, sorted, min score >= 5
const combos = [
  { useCase: 'coding', budget: 'under25', skill: 'expert' },
  { useCase: 'images', budget: 'free', skill: 'beginner' },
  { useCase: 'writing', budget: 'any', skill: 'intermediate' },
];
for (const answers of combos) {
  const top = scoreTools(real, answers).slice(0, 3);
  if (top.length === 0) throw new Error(`combo ${JSON.stringify(answers)} returned 0`);
  if (top.length > 3) throw new Error('more than 3');
  for (let i = 1; i < top.length; i++) if (top[i - 1].score < top[i].score) throw new Error('not sorted');
  for (const m of top) if (m.score < 5) throw new Error(`below floor ${JSON.stringify(m.agent.slug)}`);
}
const imgFree = scoreTools(real, { useCase: 'images', budget: 'free', skill: 'beginner' }).map((m) => m.agent.slug);
if (!imgFree.includes('canva')) throw new Error(`canva not in image/free/beginner matches: ${imgFree.join(',')}`);

console.log(`OK  ${pp.length} parsePricing, ${USE_CASES.length} use cases, 3 real combos, ${combos.length} combos green`);
console.log(`top search: ${scoreTools(real, { useCase: 'search', budget: 'any', skill: 'beginner' }).slice(0, 3).map((m) => m.agent.slug).join(', ')}`);
```

- [ ] **Step 2: Run it to verify it fails**

Run (workdir = repo root): `node "C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-matchmaker.mjs"`
Expected: FAIL — module not found / imports undefined (`Cannot find module` or `parsePricing is not a function`). RED.

- [ ] **Step 3: Write `lib/matchmaker.ts`**

```ts
export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

export type MatchAgent = {
  slug: string;
  name: string;
  tagline?: string;
  category: string;
  pricing?: string;
  difficulty?: DifficultyLevel;
  featured?: boolean;
  url?: string;
};

export type UseCaseOption = {
  id: string;
  label: string;
  categories: string[];
};

export const USE_CASES: UseCaseOption[] = [
  { id: 'chat', label: 'Chat & AI assistants', categories: ['Chatbots & LLMs'] },
  { id: 'coding', label: 'Coding & dev tools', categories: ['Coding', 'Agents & Frameworks'] },
  { id: 'writing', label: 'Writing & content', categories: ['Writing'] },
  { id: 'images', label: 'Images & design', categories: ['Image', 'Design'] },
  { id: 'video', label: 'Video creation', categories: ['Video'] },
  { id: 'audio', label: 'Audio & voice', categories: ['Audio'] },
  { id: 'research', label: 'Research & learning', categories: ['Research'] },
  { id: 'search', label: 'Search & knowledge', categories: ['Search', 'Note-Taking'] },
  { id: 'productivity', label: 'Productivity & work', categories: ['Productivity'] },
  { id: 'presentations', label: 'Presentations & slides', categories: ['Presentations'] },
  { id: 'automation', label: 'Automation & no-code', categories: ['Integration & Automation', 'Website Builders'] },
];

export const BUDGET_OPTIONS: { id: string; label: string; limit: number | null }[] = [
  { id: 'free', label: 'Free only', limit: null },
  { id: 'under10', label: 'Under $10/mo', limit: 10 },
  { id: 'under25', label: 'Under $25/mo', limit: 25 },
  { id: 'any', label: 'No budget limit', limit: Infinity },
];

export const SKILL_LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'expert'];

function parseAmounts(pricing: string): number[] {
  return Array.from(pricing.matchAll(/\$(\d+(?:\.\d+)?)/g), (m) => Number.parseFloat(m[1]));
}

export function parsePricing(pricing: string = ''): { free: boolean; cheapestPaid: number | null } {
  const text = pricing.toLowerCase();
  const amounts = parseAmounts(text);
  const containsDollar = /[$]/.test(text);
  const free = text.includes('free') || text.includes('open-source') || !containsDollar;
  return { free, cheapestPaid: amounts.length ? Math.min(...amounts) : null };
}

const SKILL_INDEX: Record<DifficultyLevel, number> = { beginner: 0, intermediate: 1, expert: 2 };

export function skillPoints(tool: MatchAgent, chosen: DifficultyLevel): number {
  const level: DifficultyLevel = tool.difficulty ?? 'intermediate';
  const diff = Math.abs(SKILL_INDEX[level] - SKILL_INDEX[chosen]);
  return 3 - diff;
}

export function budgetPoints(tool: MatchAgent, budgetId: string): number {
  const option = BUDGET_OPTIONS.find((b) => b.id === budgetId);
  const { free, cheapestPaid } = parsePricing(tool.pricing);
  if (option?.id === 'free') return free ? 3 : 0;
  if (option?.id === 'any') return 3;
  if (option?.limit == null) return 0;
  if (free) return 3;
  if (cheapestPaid === null) return 1;
  if (cheapestPaid <= option.limit) return 3;
  if (cheapestPaid <= option.limit * 1.5) return 2;
  return 1;
}

export function useCasePoints(tool: MatchAgent, useCaseId: string): number {
  const option = USE_CASES.find((u) => u.id === useCaseId);
  if (!option) return 0;
  return option.categories.includes(tool.category) ? 3 : 0;
}

export type MatchAnswers = { useCase?: string; budget?: string; skill?: string };

export function scoreTools(agents: MatchAgent[], answers: MatchAnswers) {
  return agents
    .map((agent) => {
      let score = 0;
      if (answers.useCase) score += useCasePoints(agent, answers.useCase);
      if (answers.budget) score += budgetPoints(agent, answers.budget);
      if (answers.skill) score += skillPoints(agent, answers.skill as DifficultyLevel);
      if (agent.featured) score += 1;
      return { agent, score };
    })
    .filter((m) => m.score >= 5)
    .sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name));
}
```

- [ ] **Step 4: Run the assert to verify it passes**

Run (workdir = repo root): `node "C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-matchmaker.mjs"`
Expected: prints `OK  8 parsePricing, 11 use cases, 3 real combos, 3 combos green` plus a `top search:` line. No thrown errors. GREEN.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add lib/matchmaker.ts
git commit -m "feat: add matchmaker scoring engine"
```

---

### Task 3: `components/Matchmaker.tsx` — the wizard

**Files:**
- Create: `components/Matchmaker.tsx`

**Interfaces:**
- Consumes: `USE_CASES`, `BUDGET_OPTIONS`, `SKILL_LEVELS`, `scoreTools`, `MatchAgent` from `lib/matchmaker.ts` (Task 2); `ToolLogo` (existing); agent data with `difficulty` (Task 1).
- Produces: `export default function Matchmaker({ agents }: { agents: MatchAgent[] })`. Consumed by Task 4 (homepage).

- [ ] **Step 1: Write `components/Matchmaker.tsx`**

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolLogo from './ToolLogo';
import {
  USE_CASES,
  BUDGET_OPTIONS,
  SKILL_LEVELS,
  scoreTools,
} from '../lib/matchmaker';
import type { MatchAgent, DifficultyLevel } from '../lib/matchmaker';

type Step = 1 | 2 | 3 | 'results';

export default function Matchmaker({ agents }: { agents: MatchAgent[] }) {
  const [step, setStep] = useState<Step>(1);
  const [useCase, setUseCase] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [skill, setSkill] = useState<DifficultyLevel | null>(null);

  const matches =
    useCase && budget && skill
      ? scoreTools(agents, { useCase, budget, skill }).slice(0, 3)
      : [];

  const retake = () => {
    setUseCase(null);
    setBudget(null);
    setSkill(null);
    setStep(1);
  };

  const optionBtn =
    'w-full rounded-xl border px-4 py-3 text-sm font-semibold transition text-left ';

  const activeBtn = 'bg-purple-500/15 border-purple-500/40 text-purple-200';
  const idleBtn = 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-purple-500/40 hover:bg-purple-500/[0.06] hover:text-white';

  const stepLabel =
    step === 1 ? 'What do you want to do?' :
    step === 2 ? 'What should it cost?' :
    step === 3 ? 'How technical are you?' : '';

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎯</span>
          <h2 className="text-sm font-bold text-zinc-300 tracking-wide uppercase">
            Find My AI Tool
          </h2>
        </div>
        <span className="text-[11px] font-medium text-zinc-500">
          {step === 'results' ? 'Matches' : `Step ${step} of 3`}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`h-1 flex-1 rounded-full transition ${
              (step === s || (step !== 'results' && step > s) || step === 'results')
                ? 'bg-purple-500'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {step !== 'results' && (
        <p className="text-lg font-semibold text-white mb-5">{stepLabel}</p>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {USE_CASES.map((uc) => (
            <button
              key={uc.id}
              type="button"
              onClick={() => { setUseCase(uc.id); setStep(2); }}
              className={optionBtn + (useCase === uc.id ? activeBtn : idleBtn)}
            >
              {uc.label}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {BUDGET_OPTIONS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => { setBudget(b.id); setStep(3); }}
              className={optionBtn + (budget === b.id ? activeBtn : idleBtn)}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SKILL_LEVELS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSkill(s); setStep('results'); }}
              className={optionBtn + (skill === s ? activeBtn : idleBtn) + ' text-center'}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {step !== 1 && step !== 'results' && (
        <button
          type="button"
          onClick={() => setStep((step - 1) as Step)}
          className="mt-6 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition"
        >
          ← Back
        </button>
      )}

      {step === 'results' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 leading-snug">
            {matches.length > 0
              ? `Your top match${matches.length > 1 ? 'es' : ''}`
              : 'Close, but no perfect match'}
          </h3>
          {matches.length > 0 ? (
            <p className="text-sm text-zinc-400 mb-5">
              Based on {USE_CASES.find((u) => u.id === useCase)?.label.toLowerCase()}, {BUDGET_OPTIONS.find((b) => b.id === budget)?.label.toLowerCase()}, and {skill} skill.
            </p>
          ) : (
            <p className="text-sm text-zinc-400 mb-5">
              No strong matches for that combination — try adjusting your answers.
            </p>
          )}

          <div className="space-y-3 mb-6">
            {matches.map(({ agent, score }) => (
              <Link
                key={agent.slug}
                href={`/agent/${agent.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-purple-500/40 hover:bg-purple-500/[0.05]"
              >
                <div className="shrink-0">
                  <ToolLogo slug={agent.slug} size={40} className="rounded-lg border border-white/10 bg-white/5 p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-white group-hover:text-purple-300 transition truncate">
                      {agent.name}
                    </h4>
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                      {score}/10
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                    {agent.tagline}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
                      {agent.category}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                      {agent.pricing}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400 capitalize">
                      {agent.difficulty}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={retake}
            className="inline-block rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 font-semibold px-6 py-2.5 transition"
          >
            Retake quiz
          </button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Verify lint health (RF5)**

Run: `npm run lint`
Expected: exactly the pre-existing 10 problems; NO errors mentioning `Matchmaker.tsx`. No `useEffect` anywhere in the component (state changes are all in onClick handlers). Grep `Matchmaker.tsx` for `useEffect|window.` → zero matches; grep `useState` → 4 static initializers.

- [ ] **Step 4: Commit**

```bash
git add components/Matchmaker.tsx
git commit -m "feat: add find my AI tool matchmaker wizard"
```

---

### Task 4: Homepage integration + CommunityReviews reorder

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Matchmaker` from Task 3.
- Produces: homepage render order `NewsGrid → Matchmaker → AgentExplorer → CommunityReviews → CategoriesGrid → NewsletterSignup`. Final state of the branch.

- [ ] **Step 1: Edit `app/page.tsx`**

Replace the imports block and the body. Current file:

```tsx
import agents from '../data/agents.json';
import AppShell from '../components/AppShell';
import LivePulse from '../components/LivePulse';
import NewsGrid from '../components/NewsGrid';
import AgentExplorer from '../components/AgentExplorer';
import CategoriesGrid from '../components/CategoriesGrid';
import CommunityReviews from '../components/CommunityReviews';
import NewsletterSignup from '../components/NewsletterSignup';
```

becomes:

```tsx
import agents from '../data/agents.json';
import AppShell from '../components/AppShell';
import LivePulse from '../components/LivePulse';
import NewsGrid from '../components/NewsGrid';
import Matchmaker from '../components/Matchmaker';
import AgentExplorer from '../components/AgentExplorer';
import CommunityReviews from '../components/CommunityReviews';
import CategoriesGrid from '../components/CategoriesGrid';
import NewsletterSignup from '../components/NewsletterSignup';
```

And the body section:

```tsx
        <NewsGrid />
        <AgentExplorer agents={agents} initialQuery={q} />
        <CategoriesGrid />
        <CommunityReviews />
        <NewsletterSignup />
```

becomes:

```tsx
        <NewsGrid />
        <Matchmaker agents={agents} />
        <AgentExplorer agents={agents} initialQuery={q} />
        <CommunityReviews />
        <CategoriesGrid />
        <NewsletterSignup />
```

- [ ] **Step 2: Verify render order**

Write `C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-page-order.mjs`:

```js
import { readFileSync } from 'node:fs';
const src = readFileSync('app/page.tsx', 'utf8');
const want = ['<NewsGrid />', '<Matchmaker agents={agents} />', '<AgentExplorer', '<CommunityReviews />', '<CategoriesGrid />', '<NewsletterSignup />'];
let last = -1;
for (const w of want) {
  const i = src.indexOf(w);
  if (i === -1) throw new Error(`missing ${w}`);
  if (i < last) throw new Error(`out of order: ${w}`);
  last = i;
}
console.log('order OK: NewsGrid → Matchmaker → AgentExplorer → CommunityReviews → CategoriesGrid → NewsletterSignup');
```

Run (workdir = repo root): `node "C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-page-order.mjs"`
Expected: `order OK: NewsGrid → Matchmaker → AgentExplorer → CommunityReviews → CategoriesGrid → NewsletterSignup`

- [ ] **Step 3: Full verification sweep**

Run:
- `npm run build` — Expected: exit 0.
- `npm run lint` — Expected: the pre-existing 10 problems only.
- `node "C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-difficulty.mjs"` — Expected: `withDifficulty:132`, `missing":[]` .
- `node "C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-matchmaker.mjs"` — Expected: OK line, no errors.
- `node "C:\Users\DELL\AppData\Local\Temp\opencode\ai-universe\assert-page-order.mjs"` — Expected: OK.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: place matchmaker on homepage and move community reviews up"
```