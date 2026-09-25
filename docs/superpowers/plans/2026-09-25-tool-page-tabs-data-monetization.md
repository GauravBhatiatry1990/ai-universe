# Tool Page Tabs, Data Expansion & Monetization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the tool detail page into shareable hash tabs (Overview, Features & Pros/Cons, Community Reviews, Alternatives), grow the directory from 112 to 132 tools with 4 new categories, and prepare monetization with a Sponsored flag/badge and a `mailto:` claim-inquiry flow.

**Architecture:** Five sequential tasks — two data tasks (append 20 tools + logos; add sponsored flags + enrich 6 flagship entries), one badge UI task, one claim flow task (lib constant + client form + claim route + hero button), one tabbed-layout task. The page stays a server component; a client `AgentTabs` wrapper receives pre-rendered sections and manages hash-synced state; all panels stay in the DOM.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-09-25-tool-page-tabs-data-monetization-design.md`

## Global Constraints

- **No test runner.** `package.json` defines only `dev`, `build`, `start`, `lint`. Verification gate = `npm run build` (exit 0) + `npm run lint` (no NEW errors beyond the pre-existing set) + the node/grep assertions each task lists. Do not add test infrastructure.
- `data/agents.json`: one JSON object per line, sorted ascending by `id`, appended after the last entry. Keep the Session 2 invariant — every `alternatives` slug resolves to an existing agent.
- Copy conventions: lowercase `feat:`/`design:`/`refactor:`/`fix:` commit prefixes; no emoji in UI copy (icons ✔ are emojis/unicode already used in the codebase; do not add new ones); dark glassy design (`border-white/10 bg-white/[0.03]`, purple accents).
- The site is dark-only; no backend, auth, or payment exists. Claims are mailto-only. Reviews are deterministic mock content.
- Do not touch pre-existing lint errors (`api/news` `any`s, AgentExplorer `setState` in effect, trends `any` params, `<img>` warnings). New components must not add new errors.
- Only 3 entries carry `"sponsored": true` and none of them are `featured: true`.
- New agents get a `TOOL_DOMAINS` entry in `data/toolDomains.ts` (Google favicon service needs a domain).
- Contact email constant: `gauravbhatia2190@gmail.com`.
- `rg` is not installed on Windows hosts — use the Grep tool or `findstr` for the grep checks below; also the following occurrence counts were verified manually to avoid referencing `rg` behavior.

## Review Focus

1. **Unknown/empty hash** — `window.location.hash` may be `""`, `#unknown`, or contain spaces. The tabs must fall back to Overview and never throw. AgentTabs validates the hash against its own `sections` ids and defaults to `overview`.
2. **Hydration mismatch** — the server renders Overview as active; the client must NOT re-render a different initial tab. The hash is read only inside `useEffect` (after mount), never in `useState` initializer or render.
3. **Agent missing sections** — agents with no features/pros/cons (rare) or no alternatives must still render a stable four-tab bar. The Alternatives tab shows an empty state instead of vanishing.
4. **mailto correctness** — claim form subject/body must URL-encode all free text via `encodeURIComponent` so names with `&`, `?`, or non-ASCII still compose a valid mailto link.
5. **Sponsored/featured separation** — the demo set keeps `sponsored` count at exactly 3, none overlapping `featured`, and the badge renders only in the two places the spec names (detail hero + search card). T3's grep asserts exactly two `SponsoredBadge` usage sites.

---

### Task 1: Add 20 new tools and 4 new categories

**Files:**
- Modify: `data/agents.json` (append 20 one-line entries, ids 113–132)
- Modify: `data/toolDomains.ts` (append 20 domain entries)

**Interfaces:**
- Consumes: nothing.
- Produces: `data/agents.json` with 132 entries (ids ascending, all alternatives resolvable); `TOOL_DOMAINS` covers slugs `n8n, make, langchain, crewai, galileo-ai, uizard, canva, exa, andi, v0, cline, qodo, zed-ai, microsoft-copilot, kits-ai, mubert, hailuo-ai, scispace, craft, tana`. Consumed by Tasks 2–5 (categories grid, detail pages, claim page all read this file).

- [ ] **Step 1: Append the 20 agent entries**

Insert before the closing `]` of `data/agents.json`. The current last entry ends:

```json
  {"id":112,"slug":"openai","name":"OpenAI","tagline":"Frontier AI research lab behind GPT-4o, DALL·E, and the OpenAI API.","category":"Chatbots & LLMs","pricing":"Free credits / API pay-as-you-go","featured":false,"url":"https://openai.com","bestFor":"Developers building on the OpenAI API and teams adopting ChatGPT","features":["GPT-4o and o-series models","DALL·E image generation","Reasoning models (o1)","Fine-tuning and assistants API","Enterprise-grade API"],"pros":["State-of-the-art models","Huge ecosystem and SDKs","Simple, scalable API"],"cons":["Usage costs add up at scale","Less open than open-source alternatives"],"alternatives":["chatgpt","openai-codex","together-ai"]}
]
```

Add a trailing comma to the `openai` line, then the 20 lines below, then the closing `]`:

```json
  {"id":113,"slug":"n8n","name":"n8n","tagline":"Fair-code workflow automation with 400+ integrations and self-hosting.","category":"Integration & Automation","pricing":"Free / Pro $20/mo","featured":false,"url":"https://n8n.io","bestFor":"Teams that want source-available automation they can self-host","features":["400+ integrations","Visual workflow editor","Self-hostable (fair-code)","AI agent nodes","Version control for workflows"],"pros":["Source-available and self-hostable","Huge integration library","Strong developer community"],"cons":["Self-hosting requires ops effort","Advanced AI features need Enterprise"],"alternatives":["zapier","make","reclaim-ai"]},
  {"id":114,"slug":"make","name":"Make","tagline":"Visual automation platform to connect apps and build no-code workflows.","category":"Integration & Automation","pricing":"Free / Core $9/mo","featured":false,"url":"https://make.com","bestFor":"Teams building complex multi-step automations without code","features":["Visual scenario builder","RSS and HTTP connectors","SQL and data integrations","Error handling and scheduling","Human-in-the-loop approvals"],"pros":["Flexible visual builder","Generous free tier","Handles complex data flows"],"cons":["Scenarios get costly at high runs","Steeper learning curve than Zapier"],"alternatives":["zapier","n8n","reclaim-ai"]},
  {"id":115,"slug":"langchain","name":"LangChain","tagline":"Open-source framework for building LLM applications with composable chains.","category":"Agents & Frameworks","pricing":"Open-source / commercial tiers","featured":false,"url":"https://langchain.com","bestFor":"Developers building agents and RAG pipelines on top of LLMs","features":["Composable chains and agents","Model-agnostic API","Vector store integrations","LangSmith observability","LangGraph for stateful agents"],"pros":["Huge ecosystem and community","Multi-model support","Production tooling (LangSmith)"],"cons":["Abstraction learning curve","Fast-moving API surface"],"alternatives":["crewai","huggingchat","groq"]},
  {"id":116,"slug":"crewai","name":"CrewAI","tagline":"Python framework for role-based, collaborative multi-agent systems.","category":"Agents & Frameworks","pricing":"Open-source / Cloud tiers","featured":false,"url":"https://crewai.com","bestFor":"Developers orchestrating multiple specialized AI agents","features":["Role-based agent crews","Task delegation between agents","Tool and memory support","Python-native","CrewAI Studio for low-code builds"],"pros":["Intuitive role-based design","Strong for workflow orchestration","Active community"],"cons":["Younger ecosystem than LangChain","Debugging multi-agent flows is hard"],"alternatives":["langchain","manus-ai","zapier"]},
  {"id":117,"slug":"galileo-ai","name":"Galileo AI","tagline":"Turn text prompts into editable UI designs for product teams.","category":"Design","pricing":"Pro $37/mo","featured":false,"url":"https://galileo.ai","bestFor":"Product designers generating UI mockups from prompts fast","features":["Text-to-UI generation","Editable Figma exports","Component-level control","High-fidelity mockups","Multiple page generation"],"pros":["Very fast mockups","Good Figma handoff","Clean component output"],"cons":["Paid only","Best for early exploration, not final design"],"alternatives":["uizard","midjourney","leonardo-ai"]},
  {"id":118,"slug":"uizard","name":"Uizard","tagline":"AI design assistant that turns sketches and screenshots into app UIs.","category":"Design","pricing":"Free / Pro $12/mo","featured":false,"url":"https://uizard.io","bestFor":"Non-designers prototyping mobile and web interfaces","features":["Sketch-to-UI","Screenshot-to-design","Autodesigner templates","Branding kit","Collaboration for teams"],"pros":["Beginner friendly","Free tier available","Great for rapid prototypes"],"cons":["Less precise than hand-built design","Templates can look generic"],"alternatives":["galileo-ai","framer-ai","beautiful-ai"]},
  {"id":119,"slug":"canva","name":"Canva (Magic Studio)","tagline":"Drag-and-drop design with Magic Studio AI for text, images, and brands.","category":"Design","pricing":"Free / Pro $12/mo","featured":false,"url":"https://canva.com","bestFor":"Marketers and small teams producing on-brand visuals quickly","features":["Magic Design from prompts","Magic Eraser and background tools","Brand kit consistency","1M+ templates and assets","Text-to-image and Magic Write"],"pros":["Extremely easy to learn","Huge template library","Strong free tier"],"cons":["Limits on complex custom design","AI features concentrated in Pro"],"alternatives":["adobe-firefly","recraft","framer-ai"]},
  {"id":120,"slug":"exa","name":"Exa","tagline":"Semantic search and retrieval API designed for AI agents and RAG.","category":"Search","pricing":"Free credits / usage-based","featured":false,"url":"https://exa.ai","bestFor":"Developers embedding web search into AI agents","features":["Semantic + keyword hybrid search","Neural web corpus","Agent-friendly API","Code search","Crawl and search endpoints"],"pros":["Purpose-built for LLM retrieval","High-quality results","Simple REST API"],"cons":["Developer-focused, no consumer UI","Usage pricing adds up"],"alternatives":["perplexity","groq","deepseek"]},
  {"id":121,"slug":"andi","name":"Andi","tagline":"Gemini-powered AI search engine with direct answers and source cards.","category":"Search","pricing":"Free","featured":false,"url":"https://andi.com","bestFor":"Consumers who want conversational, ad-light web search","features":["Conversational answers","Source cards with citations","Useful for privacy","Follow-up questions","Ad-light search"],"pros":["Clean, ad-light experience","Conversational follow-ups","Free to use"],"cons":["Smaller index than Google","Coverage lags for niche queries"],"alternatives":["perplexity","you-com","gemini"]},
  {"id":122,"slug":"v0","name":"v0 by Vercel","tagline":"Generate production-ready React and Next.js UIs from text prompts.","category":"Coding","pricing":"Free / Pro $20/mo","featured":false,"url":"https://v0.dev","bestFor":"Developers scaffolding React/Next.js interfaces quickly","features":["Prompt-to-React components","Tailwind and shadcn/ui output","AI image generation","Deploy to Vercel instantly","Iterate on chat history"],"pros":["Boilerplate-free UI generation","Great Tailwind output","Fast iteration loop"],"cons":["Focused on Vercel ecosystem","Complex layouts need editing"],"alternatives":["cursor","bolt-new","lovable"]},
  {"id":123,"slug":"cline","name":"Cline","tagline":"Autonomous coding assistant in VS Code that edits files and runs commands.","category":"Coding","pricing":"Free / bring your own API key","featured":false,"url":"https://cline.bot","bestFor":"Developers who want an autonomous agent inside VS Code","features":["File editing and terminals","Multi-model support (Claude, GPT, local)","Plan/act mode toggle","Checkpoint and restore","Browser automation"],"pros":["Truly autonomous in IDE","Bring-your-own-key model flexibility","Active open-source community"],"cons":["Requires API key setup","Long tasks burn tokens fast"],"alternatives":["claude-code","cursor","openai-codex"]},
  {"id":124,"slug":"qodo","name":"Qodo","tagline":"PR-focused AI code review and test generation (formerly Codium).","category":"Coding","pricing":"Free / Pro $25/mo","featured":false,"url":"https://qodo.ai","bestFor":"Engineering teams that want AI review on every pull request","features":["Automated code review on PRs","Test generation from code","GitHub/GitLab integration","Security and performance checks","IDE companion plugin"],"pros":["Catches issues pre-merge","Test coverage boost","Works across major Git hosts"],"cons":["Noise on trivial PRs","Best value in team plans"],"alternatives":["github-copilot","cursor","codeium"]},
  {"id":125,"slug":"zed-ai","name":"Zed AI","tagline":"High-performance editor with native AI agents and inline transformation.","category":"Coding","pricing":"Free / AI subscription optional","featured":false,"url":"https://zed.dev","bestFor":"Developers wanting a fast editor with built-in AI assistance","features":["Inline AI transformations","Autonomous agents","Multi-agent panel","Workspaces and collaboration","Model provider flexibility"],"pros":["Editor performance focus","Native agent UX","Flexible model providers"],"cons":["Younger ecosystem than VS Code","AI features need subscription"],"alternatives":["cursor","windsurf","claude-code"]},
  {"id":126,"slug":"microsoft-copilot","name":"Microsoft Copilot","tagline":"Microsoft's free AI assistant across Windows, Edge, Bing, and mobile.","category":"Chatbots & LLMs","pricing":"Free / Pro $20/mo","featured":false,"url":"https://copilot.microsoft.com","bestFor":"Windows and Edge users who want a free AI assistant everywhere","features":["Integrated with Windows and Edge","Bing grounding with citations","DALL·E 3 image creation","Deep link and reasoning","Copilot Voice on mobile"],"pros":["Free and well integrated","Good search grounding","No usage caps on free tier"],"cons":["Less capable than paid assistants","Quality varies across tasks"],"alternatives":["chatgpt","gemini","meta-ai"]},
  {"id":127,"slug":"kits-ai","name":"Kits AI","tagline":"Music AI studio for voice cloning and stems with legal approvals.","category":"Audio","pricing":"Free / Pro $15/mo","featured":false,"url":"https://kits.ai","bestFor":"Producers cloning voices for music with approved rights","features":["Voice cloning and voice-to-voice","Stem separation","Text-to-speech and vocals","Legal voice marketplace","DAW integration"],"pros":["Legally cleared artists library","Quality voice conversion","Music-focused workflow"],"cons":["More expensive for full features","Niche music use case"],"alternatives":["elevenlabs","suno","play-ht"]},
  {"id":128,"slug":"mubert","name":"Mubert","tagline":"Royalty-free AI music generation with render-while-listening streams.","category":"Audio","pricing":"Free / Pro $14.99/mo","featured":false,"url":"https://mubert.com","bestFor":"Creators needing endless royalty-free music for content","features":["Endless AI-generated streams","Music for videos and apps","Royalty-free commercial use","API for developers","Genre and mood filters"],"pros":["Never runs out of original tracks","Clean licensing model","Affordable tiers"],"cons":["Tracks can sound similar","Less control than composing"],"alternatives":["suno","udio","elevenlabs"]},
  {"id":129,"slug":"hailuo-ai","name":"Hailuo AI","tagline":"MiniMax's video generator for expressive, controllable character scenes.","category":"Video","pricing":"Free credits / usage-based","featured":false,"url":"https://hailuoai.video","bestFor":"Creators generating character-driven AI video clips","features":["Text and image to video","Expressive character control","Multi-shot story mode","High-fidelity motion","Web and mobile apps"],"pros":["Strong character realism","Generous free credits","Good story features"],"cons":["Clip length limited","Usage pricing can be unclear"],"alternatives":["kling","runway","pika"]},
  {"id":130,"slug":"scispace","name":"SciSpace","tagline":"AI research assistant that explains and chats with any academic paper.","category":"Research","pricing":"Free / Premium $20/mo","featured":false,"url":"https://scispace.com","bestFor":"Students and researchers getting plain-language paper explanations","features":["Chat with any PDF","Paper explanations and QA","Citation paraphrases","Linked literature graph","Math and table rendering"],"pros":["Fast paper comprehension","Huge paper corpus","Good citation handling"],"cons":["Answers can oversimplify","Premium needed for heavy use"],"alternatives":["elicit","consensus","semantic-scholar"]},
  {"id":131,"slug":"craft","name":"Craft","tagline":"Beautiful document and knowledge workspace with native AI writing.","category":"Note-Taking","pricing":"Free / Pro $10/mo","featured":false,"url":"https://craft.do","bestFor":"Teams and individuals writing polished docs on Mac/iOS/Web","features":["Built-in AI writing assistant","Apple-style design","Space and folder organization","Publish and sharing","Offline-first sync"],"pros":["Polished, pleasant writing experience","Native Apple app quality","AI assistant included"],"cons":["macOS-centric feel","Smaller ecosystem than Notion"],"alternatives":["notion-ai","reflect","mem"]},
  {"id":132,"slug":"tana","name":"Tana","tagline":"Supertag-based knowledge workspace with AI summaries and voice input.","category":"Note-Taking","pricing":"Free / Pro $8/mo","featured":false,"url":"https://tana.inc","bestFor":"Power users wanting a structured graph-based second brain","features":["Supertag data structures","Native AI chat and summaries","Voice-to-note input","Graph navigation","Powerful search"],"pros":["Unique structured approach","Strong AI native features","Fast search"],"cons":["Learning curve","Younger product, rougher edges"],"alternatives":["reflect","mem","notion-ai"]}
]
```

- [ ] **Step 2: Add the 20 logo domains**

In `data/toolDomains.ts`, insert these lines before the closing `};` (line 49):

```ts
  'n8n': 'n8n.io',
  make: 'make.com',
  langchain: 'langchain.com',
  crewai: 'crewai.com',
  'galileo-ai': 'galileo.ai',
  uizard: 'uizard.io',
  canva: 'canva.com',
  exa: 'exa.ai',
  andi: 'andi.com',
  v0: 'v0.dev',
  cline: 'cline.bot',
  qodo: 'qodo.ai',
  'zed-ai': 'zed.dev',
  'microsoft-copilot': 'microsoft.com',
  'kits-ai': 'kits.ai',
  mubert: 'mubert.com',
  'hailuo-ai': 'hailuoai.video',
  scispace: 'scispace.com',
  craft: 'craft.do',
  tana: 'tana.inc',
```

- [ ] **Step 3: Verify data integrity**

Run:
```
node -e "const a=require('./data/agents.json');const d=require('./data/toolDomains')['TOOL_DOMAINS'];const sorted=a.every((x,i)=>i===0||a[i-1].id<x.id);const uniq=new Set(a.map(x=>x.slug));const noLogo=a.filter(x=>!d[x.slug]);const bad=[];for(const t of a){for(const s of t.alternatives||[])if(!uniq.has(s))bad.push(t.slug+' -> '+s)}console.log(JSON.stringify({count:a.length,sorted,unique:uniq.size===a.length,featured:a.filter(x=>x.featured).length,noLogo:noLogo,alternativesBad:bad}))"
```
Expected: `{"count":132,"sorted":true,"unique":true,"featured":12,"noLogo":[],"alternativesBad":[]}`

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: exit 0; 132 agent routes reachable, category pages regenerate with the 4 new categories (15 total), homepage categories grid shows new categories.

- [ ] **Step 5: Commit**

```bash
git add data/agents.json data/toolDomains.ts
git commit -m "feat: add 20 AI tools and 4 new tool categories"
```

---

### Task 2: Sponsored flags + enrich flagship entries

**Files:**
- Modify: `data/agents.json` (3 sponsored flags, 6 enriched entries)

**Interfaces:**
- Consumes: Task 1 output (132-entry file).
- Produces: `sponsored` field on `supermaven`, `murf-ai`, `decktopus` (all `featured: false`); exactly 12 `featured` (unchanged). Consumed by Task 3 (badge rendering).

- [ ] **Step 1: Set `"sponsored": true` on 3 entries**

Replace these three full lines in `data/agents.json` (each gains `"sponsored":true,` right after `"featured":false,`):

- Line for `murf-ai` becomes:
```json
  {"id":30,"slug":"murf-ai","name":"Murf AI","tagline":"Studio-quality AI voiceovers for videos, e-learning, and ads.","category":"Audio","pricing":"Free / Creator $19/mo","featured":false,"sponsored":true,"url":"https://murf.ai","bestFor":"Businesses producing e-learning and marketing voiceovers","features":["120+ studio-quality voices","Sync with video timelines","Voice cloning","Team collaboration features"],"pros":["Great for business content","Easy timeline editor","Broad voice library"],"cons":["Less realistic than ElevenLabs","Pricier than competitors"],"alternatives":["elevenlabs","suno","udio"]},
```
- Line for `supermaven` becomes:
```json
  {"id":66,"slug":"supermaven","name":"Supermaven","tagline":"Ultra-fast AI code completion with a massive 1M token context window.","category":"Coding","pricing":"Free / Pro $10/mo","featured":false,"sponsored":true,"url":"https://supermaven.com","bestFor":"Developers who want the fastest and most context-aware autocomplete","features":["1M token context window","Extremely fast completions","Chat with your code","Supports VS Code, JetBrains, Neovim"],"pros":["Fastest completion engine","Huge context awareness","Cheap Pro tier"],"cons":["Limited to autocomplete and chat","No agentic multi-file editing"],"alternatives":["github-copilot","cursor","codeium"]},
```
- Line for `decktopus` becomes:
```json
  {"id":102,"slug":"decktopus","name":"Decktopus","tagline":"AI presentation generator with built-in design and content assistance.","category":"Presentations","pricing":"Free / Pro $19.99/mo","featured":false,"sponsored":true,"url":"https://decktopus.com","bestFor":"Non-designers needing professional presentations fast","features":["AI content generation","Built-in design tools","Voice recording","Analytics"],"pros":["Great for beginners","All-in-one tool","Good templates"],"cons":["Less customizable","Watermark on free tier"],"alternatives":["gamma","tome","beautiful-ai"]},
```

- [ ] **Step 2: Enrich 6 flagship entries**

Replace these six full lines, adding exactly the content shown (a 5th feature; `chatgpt` also gains one pro):

- `chatgpt` (id 1) — add feature `"Advanced voice conversations"` and pro `"Multimodal — text, vision, and voice in one app"`:
```json
  {"id":1,"slug":"chatgpt","name":"ChatGPT","tagline":"OpenAI's flagship assistant with GPT-5.6, vision, voice, and deep reasoning.","category":"Chatbots & LLMs","pricing":"Free / Plus $20/mo","featured":true,"url":"https://chat.openai.com","bestFor":"Anyone who wants the most versatile general-purpose AI assistant","features":["GPT-5.6 with deep reasoning mode","Image, voice, and document understanding","Custom GPTs and code interpreter","Memory that persists across chats","Advanced voice conversations"],"pros":["Most feature-complete assistant available","Massive plugin and GPT ecosystem","Free tier is genuinely useful","Multimodal — text, vision, and voice in one app"],"cons":["Best features locked behind $20/mo Plus","Occasional hallucination on niche topics"],"alternatives":["claude","gemini","deepseek"]},
```
- `perplexity` (id 5) — add feature `"Collections for saved topics and threads"`:
```json
  {"id":5,"slug":"perplexity","name":"Perplexity","tagline":"AI answer engine with real-time citations and agentic research via Comet browser.","category":"Chatbots & LLMs","pricing":"Free / Pro $20/mo","featured":true,"url":"https://perplexity.ai","bestFor":"Researchers and students who need sourced, up-to-date answers","features":["Real-time web search with citations","Comet browser with built-in AI agent","Focus modes for academic, video, social","Spaces for collaborative research","Collections for saved topics and threads"],"pros":["Every answer cites its sources","Always current — searches live web","Great for research and fact-checking"],"cons":["Less creative than ChatGPT/Claude","Free tier limited to 5 Pro searches/day"],"alternatives":["chatgpt","gemini","consensus"]},
```
- `claude` (id 2) — add feature `"Claude Code CLI for terminal-based workflows"`:
```json
  {"id":2,"slug":"claude","name":"Claude","tagline":"Anthropic's assistant known for long-context reasoning and safe, thoughtful outputs.","category":"Chatbots & LLMs","pricing":"Free / Pro $20/mo","featured":true,"url":"https://claude.ai","bestFor":"Writers, analysts, and developers working with long documents","features":["200K+ token context window","Artifacts for live code and document previews","Projects to organize long-running work","Strong at nuanced writing and analysis","Claude Code CLI for terminal-based workflows"],"pros":["Best-in-class at long document analysis","Thoughtful, less likely to hallucinate","Excellent for coding and refactoring"],"cons":["No image generation","Usage limits on free tier are tight"],"alternatives":["chatgpt","gemini","deepseek"]},
```
- `cursor` (id 12) — add feature `"Background agents for long-running tasks"`:
```json
  {"id":12,"slug":"cursor","name":"Cursor","tagline":"AI-first code editor with codebase-wide context and multi-file agent edits.","category":"Coding","pricing":"Free / Pro $20/mo","featured":true,"url":"https://cursor.com","bestFor":"Professional developers who want an AI-native editor built on VS Code","features":["Codebase-wide context and search","Composer for multi-file agent edits","Tab autocomplete that predicts your next edit","Bring your own API keys (OpenAI, Anthropic)","Background agents for long-running tasks"],"pros":["Best-in-class agentic editing","Full VS Code extension compatibility","Fast and reliable for large repos"],"cons":["Heavy usage burns through Pro quota fast","Occasional indexing lag on huge codebases"],"alternatives":["github-copilot","windsurf","claude-code"]},
```
- `midjourney` (id 17) — add feature `"Community gallery and style discovery"`:
```json
  {"id":17,"slug":"midjourney","name":"Midjourney","tagline":"The gold standard for AI image aesthetics — cinematic, stylized, and consistent.","category":"Image","pricing":"$10/mo","featured":true,"url":"https://midjourney.com","bestFor":"Designers and artists who need the most beautiful AI images","features":["Best-in-class aesthetic quality","Style references and character consistency","Web editor for inpainting and panning","V7 model with improved realism","Community gallery and style discovery"],"pros":["Highest image quality available","Huge community and prompt library","Simple pricing from $10/mo"],"cons":["No free tier","Less literal than DALL·E — better for art than accuracy"],"alternatives":["nano-banana","dall-e","leonardo-ai"]},
```
- `elevenlabs` (id 27) — add feature `"Developer API with low-latency streaming"`:
```json
  {"id":27,"slug":"elevenlabs","name":"ElevenLabs","tagline":"Industry-leading AI voice generation, cloning, and dubbing in 30+ languages.","category":"Audio","pricing":"Free / Starter $5/mo","featured":true,"url":"https://elevenlabs.io","bestFor":"Podcasters, audiobook producers, and content creators","features":["Ultra-realistic voice cloning","30+ language dubbing","Voice design from text description","Emotion and pacing controls","Developer API with low-latency streaming"],"pros":["Best voice quality in the market","Cheap entry tier ($5/mo)","Works in 30+ languages"],"cons":["Character limits on free tier","Clone quality varies by source audio"],"alternatives":["murf-ai","suno","udio"]},
```

- [ ] **Step 3: Verify**

Run:
```
node -e "const a=require('./data/agents.json');const sp=a.filter(x=>x.sponsored);console.log(JSON.stringify({sponsored:sp.map(x=>x.slug), sponsoredCount:sp.length, overlapWithFeatured:sp.filter(x=>x.featured).length, featuredCount:a.filter(x=>x.featured).length, enrichedOk:['chatgpt','perplexity','claude','cursor','midjourney','elevenlabs'].every(s=>a.find(x=>x.slug===s).features.length>=5)}))"
```
Expected: `{"sponsored":["murf-ai","supermaven","decktopus"],"sponsoredCount":3,"overlapWithFeatured":0,"featuredCount":12,"enrichedOk":true}`

- [ ] **Step 4: Commit**

```bash
git add data/agents.json
git commit -m "feat: add sponsored flags and enrich flagship entries"
```

---

### Task 3: Sponsored badge UI

**Files:**
- Create: `components/SponsoredBadge.tsx`
- Modify: `components/AgentExplorer.tsx` (Agent type + card corner badge)
- Modify: `app/agent/[slug]/page.tsx` (Agent type + hero badges row)

**Interfaces:**
- Consumes: `sponsored?: boolean` data from Task 2.
- Produces: `export default function SponsoredBadge()` (no props, static cyan pill). Consumed by Task 5's page rewrite (which keeps the badge in the hero).

- [ ] **Step 1: Create `components/SponsoredBadge.tsx`**

```tsx
export default function SponsoredBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
      Sponsored
    </span>
  );
}
```

- [ ] **Step 2: Update `components/AgentExplorer.tsx`**

(a) Add `sponsored?: boolean;` to the `Agent` type (right after `featured?: boolean;` at line 15).

(b) Add the import at the top of the imports block (after `import { slugify } from '../lib/slugify';`):
```tsx
import SponsoredBadge from './SponsoredBadge';
```

(c) Inside the card `<Link className="group relative ...">`, insert this right after the opening `<Link ...>` tag (before the logo/name header row):
```tsx
{agent.sponsored && (
  <span className="absolute top-3 right-3">
    <SponsoredBadge />
  </span>
)}
```

- [ ] **Step 3: Update `app/agent/[slug]/page.tsx`**

(a) Add `sponsored?: boolean;` to the `Agent` type (after `featured?: boolean;` on line 15).

(b) Add the import (after the `ToolLogo` import):
```tsx
import SponsoredBadge from '../../../components/SponsoredBadge';
```

(c) In the hero badges row (`<div className="flex items-center gap-3 flex-wrap">`), insert the badge before the featured pill:
```tsx
                {agent.sponsored && <SponsoredBadge />}
                {agent.featured && (
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: exit 0.
Grep `SponsoredBadge` across `components/` and `app/`:
Expected: referenced in exactly **two** files — `components/AgentExplorer.tsx` (import + usage) and `app/agent/[slug]/page.tsx` (import + usage). No other usages.

- [ ] **Step 5: Commit**

```bash
git add components/SponsoredBadge.tsx components/AgentExplorer.tsx "app/agent/[slug]/page.tsx"
git commit -m "feat: add sponsored badge to detail page and search cards"
```

---

### Task 4: Claim this Profile flow

**Files:**
- Create: `lib/site.ts`
- Create: `components/ClaimProfileForm.tsx`
- Create: `app/claim/[slug]/page.tsx`
- Modify: `app/agent/[slug]/page.tsx` (hero CTA row)

**Interfaces:**
- Consumes: `agent.name` and `agent.slug` from `data/agents.json`; `ToolLogo` (existing).
- Produces: `export const SITE_CONTACT_EMAIL = 'gauravbhatia2190@gmail.com'` (single source of the claim mailto target); `export default function ClaimProfileForm({ agentName }: { agentName: string })`; route `/claim/[slug]`. Task 5 preserves the hero's "Claim this Profile" button.

- [ ] **Step 1: Create `lib/site.ts`**

```ts
export const SITE_CONTACT_EMAIL = 'gauravbhatia2190@gmail.com';
```

- [ ] **Step 2: Create `components/ClaimProfileForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { SITE_CONTACT_EMAIL } from '../lib/site';

export default function ClaimProfileForm({ agentName }: { agentName: string }) {
  const [name, setName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Claim this profile: ${agentName}`);
    const body = encodeURIComponent(
      `Tool: ${agentName}\n\nFull name: ${name}\nWork email: ${workEmail}\nCompany: ${company || '—'}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:${SITE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="claim-name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
          Full name
        </label>
        <input
          id="claim-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      <div>
        <label htmlFor="claim-email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
          Work email
        </label>
        <input
          id="claim-email"
          type="email"
          required
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      <div>
        <label htmlFor="claim-company" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
          Company <span className="text-zinc-600 normal-case">(optional)</span>
        </label>
        <input
          id="claim-company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Acme Inc."
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      <div>
        <label htmlFor="claim-message" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
          Message <span className="text-zinc-600 normal-case">(optional)</span>
        </label>
        <textarea
          id="claim-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything you'd like to change or fix about the listing?"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold px-4 py-2.5 transition hover:from-purple-600 hover:to-blue-600 shadow-sm shadow-purple-500/20"
      >
        Send claim request →
      </button>
      <p className="text-xs text-zinc-500">
        This opens your email app with a prefilled message to {SITE_CONTACT_EMAIL}. No data is stored on our servers.
      </p>
    </form>
  );
}
```

- [ ] **Step 3: Create `app/claim/[slug]/page.tsx`**

```tsx
import agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import ToolLogo from '../../../components/ToolLogo';
import ClaimProfileForm from '../../../components/ClaimProfileForm';

type Agent = {
  slug: string;
  name: string;
};

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = (agents as Agent[]).find((a) => a.slug === slug);

  if (!agent) {
    notFound();
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-8 py-8 max-w-2xl mx-auto">
        <Link
          href={`/agent/${agent.slug}`}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6 transition"
        >
          ← Back to {agent.name}
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="shrink-0">
              <ToolLogo
                slug={agent.slug}
                size={44}
                className="rounded-xl border border-white/10 bg-white/5 p-1.5"
              />
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Claim this profile: {agent.name}
            </h1>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            This listing is currently managed by the community. Claim it to
            control its description, contact info, and visibility once
            ownership is confirmed.
          </p>

          <ClaimProfileForm agentName={agent.name} />
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Add the hero button in `app/agent/[slug]/page.tsx`**

In the hero card, directly after the existing Visit link block:

```tsx
          {agent.url && (
            <a
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 transition shadow-lg shadow-purple-500/30"
            >
              Visit {agent.name} →
            </a>
          )}
          <Link
            href={`/claim/${agent.slug}`}
            className="inline-block rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 font-semibold px-6 py-3 transition"
          >
            Claim this Profile
          </Link>
```

(The Link import is already present in the page.)

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: exit 0; `/claim/cursor`, `/claim/n8n`, `/claim/unknown-slug` handle correctly (unknown → 404).
Grep checks:
- `SITE_CONTACT_EMAIL` present in `lib/site.ts` AND `components/ClaimProfileForm.tsx` (exactly these two files).
- `href={`/claim/${agent.slug}`}` present in `app/agent/[slug]/page.tsx`.
- `encodeURIComponent` present in `components/ClaimProfileForm.tsx` (subject + body — 2 occurrences).

- [ ] **Step 6: Commit**

```bash
git add lib/site.ts components/ClaimProfileForm.tsx app/claim/[slug]/page.tsx "app/agent/[slug]/page.tsx"
git commit -m "feat: add claim this profile flow with mailto inquiry form"
```

---

### Task 5: Tabbed tool detail layout

**Files:**
- Create: `components/AgentTabs.tsx`
- Create: `components/AgentReviews.tsx`
- Rewrite: `app/agent/[slug]/page.tsx`

**Interfaces:**
- Consumes: `sponsored?: boolean` (Task 2 data), `SponsoredBadge` (Task 3), claim link pattern (Task 4), `slugify` from `lib/slugify` (not re-used here but unchanged).
- Produces: `export type TabSection = { id: string; label: string; count?: number; content: ReactNode }` and `export default function AgentTabs({ sections }: { sections: TabSection[] })`; `export default function AgentReviews({ name, category, slug }: { name: string; category: string; slug: string })`. No task consumes these beyond this page.

- [ ] **Step 1: Create `components/AgentTabs.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type TabSection = {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
};

export default function AgentTabs({ sections }: { sections: TabSection[] }) {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (sections.some((s) => s.id === id)) setActive(id);
  }, [sections]);

  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.replace('#', '');
      if (sections.some((s) => s.id === id)) setActive(id);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [sections]);

  const selectTab = (id: string) => {
    setActive(id);
    window.location.hash = id;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => selectTab(s.id)}
              aria-selected={isActive}
              role="tab"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
              }`}
            >
              {s.label}
              {s.count !== undefined && (
                <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                  {s.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {sections.map((s) => (
        <div
          key={s.id}
          id={s.id}
          role="tabpanel"
          hidden={active !== s.id}
          className="scroll-mt-24"
        >
          {s.content}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/AgentReviews.tsx`**

```tsx
type Props = {
  name: string;
  category: string;
  slug: string;
};

type Review = {
  id: number;
  name: string;
  initials: string;
  color: string;
  rating: number;
  text: string;
  time: string;
};

const AUTHORS = [
  { name: 'Rohan V.', initials: 'RV', color: 'bg-purple-500' },
  { name: 'Anushka P.', initials: 'AP', color: 'bg-rose-500' },
  { name: 'Kabir T.', initials: 'KT', color: 'bg-emerald-500' },
  { name: 'Meera S.', initials: 'MS', color: 'bg-sky-500' },
  { name: 'Dev K.', initials: 'DK', color: 'bg-amber-500' },
  { name: 'Isha R.', initials: 'IR', color: 'bg-indigo-500' },
];

const TIMES = ['2h ago', '5h ago', '9h ago', '1d ago', '2d ago', '3d ago'];

const RATING_SETS: number[][] = [
  [5, 4, 5],
  [4, 5, 4],
  [5, 5, 4],
  [4, 4, 5],
  [5, 4, 3],
  [4, 5, 3],
];

const STRENGTHS: Record<string, string> = {
  'Chatbots & LLMs': 'reasoning quality',
  Coding: 'autocomplete accuracy',
  Image: 'output quality',
  Video: 'generation speed',
  Audio: 'voice fidelity',
  Writing: 'tone consistency',
  Productivity: 'automation features',
  Research: 'source quality',
  Presentations: 'design output',
  'Website Builders': 'page generation',
  'Note-Taking': 'organization',
  'Integration & Automation': 'workflow flexibility',
  'Agents & Frameworks': 'developer experience',
  Design: 'design control',
  Search: 'result relevance',
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

function buildReviews({ name, category, slug }: Props): Review[] {
  const base = hashSlug(slug);
  const strength = STRENGTHS[category] ?? 'core features';
  const openers = [
    `I started using ${name} a few weeks ago and it has become part of my daily workflow.`,
    `Compared with similar ${category} options, ${name} wins on ${strength}.`,
    `${name} is solid for the price — great ${strength} and a clean experience.`,
  ];
  const bodies = [
    `The ${strength} stands out right away.`,
    `Setup and documentation were straightforward, which surprised me.`,
    `I lean on it for ${strength}-heavy tasks and it rarely lets me down.`,
  ];
  const ratings = RATING_SETS[base % RATING_SETS.length];
  return [0, 1, 2].map((i) => {
    const author = AUTHORS[(base + i) % AUTHORS.length];
    return {
      id: i,
      name: author.name,
      initials: author.initials,
      color: author.color,
      rating: ratings[i],
      text: `${openers[i]} ${bodies[i]}`,
      time: TIMES[(base + i * 2) % TIMES.length],
    };
  });
}

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'text-amber-400' : 'text-zinc-700'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function AgentReviews(props: Props) {
  const reviews = buildReviews(props);

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-sm overflow-hidden">
        <div className="divide-y divide-white/5">
          {reviews.map((r) => (
            <div key={r.id} className="flex items-start gap-3 px-5 py-4">
              <div
                className={`w-9 h-9 rounded-full ${r.color} text-white text-xs font-bold flex items-center justify-center shrink-0`}
              >
                {r.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-white">
                    {r.name}
                  </span>
                  <Stars count={r.rating} />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{r.text}</p>
              </div>
              <span className="text-[11px] text-zinc-500 shrink-0">
                {r.time}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
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
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `app/agent/[slug]/page.tsx`**

Replace the entire file with:

```tsx
import agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsletterSignup from '../../../components/NewsletterSignup';
import ToolLogo from '../../../components/ToolLogo';
import AppShell from '../../../components/AppShell';
import AgentTabs from '../../../components/AgentTabs';
import type { TabSection } from '../../../components/AgentTabs';
import AgentReviews from '../../../components/AgentReviews';
import SponsoredBadge from '../../../components/SponsoredBadge';

type Agent = {
  id: number | string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  pricing: string;
  featured?: boolean;
  sponsored?: boolean;
  url?: string;
  bestFor?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
  alternatives?: string[];
};

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = (agents as Agent[]).find((a) => a.slug === slug);

  if (!agent) {
    notFound();
  }

  const alternatives =
    agent.alternatives
      ?.map((altSlug) => (agents as Agent[]).find((a) => a.slug === altSlug))
      .filter(Boolean) ?? [];

  const sections: TabSection[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
          <h2 className="text-2xl font-semibold text-white mb-5">
            At a glance
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Pricing
              </dt>
              <dd className="text-sm text-zinc-200 mt-1">{agent.pricing}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Category
              </dt>
              <dd className="text-sm text-zinc-200 mt-1">{agent.category}</dd>
            </div>
            {agent.url && (
              <div>
                <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Website
                </dt>
                <dd className="text-sm mt-1">
                  <a
                    href={agent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition"
                  >
                    {agent.url.replace(/^https?:\/\//, '')} ↗
                  </a>
                </dd>
              </div>
            )}
            {agent.bestFor && (
              <div>
                <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Best for
                </dt>
                <dd className="text-sm text-zinc-200 mt-1">{agent.bestFor}</dd>
              </div>
            )}
          </dl>
        </div>
      ),
    },
    {
      id: 'features',
      label: 'Features & Pros/Cons',
      content: (
        <>
          {agent.features && agent.features.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Key Features
              </h2>
              <ul className="space-y-2">
                {agent.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-purple-400 mt-1 font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(agent.pros?.length || agent.cons?.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {agent.pros && agent.pros.length > 0 && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-6">
                  <h2 className="text-xl font-semibold text-green-400 mb-4">
                    Pros
                  </h2>
                  <ul className="space-y-2">
                    {agent.pros.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-zinc-300 text-sm"
                      >
                        <span className="text-green-400 mt-0.5 font-bold">
                          +
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {agent.cons && agent.cons.length > 0 && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6">
                  <h2 className="text-xl font-semibold text-red-400 mb-4">
                    Cons
                  </h2>
                  <ul className="space-y-2">
                    {agent.cons.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-2 text-zinc-300 text-sm"
                      >
                        <span className="text-red-400 mt-0.5 font-bold">
                          −
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      ),
    },
    {
      id: 'reviews',
      label: 'Community Reviews',
      count: 3,
      content: (
        <AgentReviews
          name={agent.name}
          category={agent.category}
          slug={agent.slug}
        />
      ),
    },
    {
      id: 'alternatives',
      label: 'Alternatives',
      content:
        alternatives.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Alternatives to {agent.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map((alt) => {
                if (!alt) return null;
                return (
                  <Link
                    key={alt.slug}
                    href={`/agent/${alt.slug}`}
                    className="group rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-purple-500/40 hover:bg-purple-500/[0.05] transition"
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <ToolLogo slug={alt.slug} size={24} />
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition truncate">
                        {alt.name}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {alt.tagline}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-zinc-400">
              No alternatives listed yet.
            </p>
          </div>
        ),
    },
  ];

  return (
    <AppShell>
      <div className="px-4 lg:px-8 py-8 max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6 transition"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 mb-6 shadow-lg shadow-purple-950/20">
          <div className="flex items-start gap-5 mb-6">
            <div className="shrink-0">
              <ToolLogo
                slug={agent.slug}
                size={72}
                className="rounded-xl border border-white/10 bg-white/5 p-1.5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {agent.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300">
                  {agent.category}
                </span>
                {agent.sponsored && <SponsoredBadge />}
                {agent.featured && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md shadow-orange-500/20">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-lg text-zinc-300 mb-6">{agent.tagline}</p>

          <div className="flex items-center gap-3 flex-wrap">
            {agent.url && (
              <a
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 transition shadow-lg shadow-purple-500/30"
              >
                Visit {agent.name} →
              </a>
            )}
            <Link
              href={`/claim/${agent.slug}`}
              className="inline-block rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 font-semibold px-6 py-3 transition"
            >
              Claim this Profile
            </Link>
          </div>
        </div>

        <AgentTabs sections={sections} />

        <div className="mt-12">
          <NewsletterSignup />
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Verify tab structure**

Run: `npm run build`
Expected: exit 0; all 132 agent pages generate, `/agent/cursor` renders with the tab bar.

Grep checks:
- `window.location.hash` in `components/AgentTabs.tsx` → the hash is read only inside the two `useEffect` bodies and set in `selectTab` (no read in `useState` initializer / render). Grep for `useState('overview')` — the initial active is the static default.
- `id="overview"`, `id="features"`, `id="reviews"`, `id="alternatives"` are produced dynamically from the `sections` map in `AgentTabs.tsx` (they appear as `id={s.id}`) — confirm the four section ids exist in `app/agent/[slug]/page.tsx` (`'overview'`, `'features'`, `'reviews'`, `'alternatives'`).
- `SponsoredBadge` usage still in the page hero (from Task 3).
- `Claim this Profile` link still present (from Task 4).

- [ ] **Step 5: Full verification sweep**

Run:
- `npm run lint` — Expected: only the pre-existing errors/warnings (api/news `any`s + unused var, trends `any`s, AgentExplorer setState-in-effect + `<img>`, NewsThumbnail/ToolLogo `<img>`). No new errors.
- `npm run build` — Expected: exit 0.
- `node -e "const a=require('./data/agents.json');const sp=a.filter(x=>x.sponsored);const uniq=new Set(a.map(x=>x.slug));const bad=[];for(const t of a){for(const s of t.alternatives||[])if(!uniq.has(s))bad.push(t.slug+' -> '+s)}console.log(bad.length?'BAD':'OK',a.length,'agents, sponsored',sp.map(x=>x.slug).join(','),'alternatives',bad.length?'FAIL':'OK')"`
  Expected: `OK 132 agents, sponsored murf-ai,supermaven,decktopus alternatives OK`
- Grep `claim` in `app/agent/[slug]/page.tsx` → the `Claim this Profile` link present once.

- [ ] **Step 6: Commit**

```bash
git add components/AgentTabs.tsx components/AgentReviews.tsx "app/agent/[slug]/page.tsx"
git commit -m "feat: add tabbed layout to tool detail pages"
```