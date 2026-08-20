# 🌸 TOHFA

**Every Emotion, Beautifully Gifted.**

Tohfa is an AI-powered digital gifting platform. Describe a feeling - *"a luxury bouquet for my wife"* - and the AI composes a real, structured design: every flower, ribbon, and word is a separate editable object on a Canva-grade canvas. Or start blank and design by hand. Either way, the gift ships as a beautiful link, an HD/4K image, or a print-ready vector.

> *Tohfa* (تحفہ / तोहफ़ा) means **gift** in Urdu and Hindi.

---

## Table of contents

1. [What's inside](#whats-inside)
2. [Quick start](#quick-start)
3. [How it works - the core idea](#how-it-works--the-scene-document)
4. [Feature walkthrough](#feature-walkthrough)
5. [User workflows](#user-workflows)
6. [Architecture](#architecture)
7. [Folder structure](#folder-structure)
8. [Tech stack](#tech-stack)
9. [Enabling real Claude AI](#enabling-real-claude-ai)
10. [SEO](#seo)
11. [What's implemented vs. roadmap](#whats-implemented-vs-roadmap)

---

## What's inside

| Area | Status | Where |
|---|---|---|
| Landing page (animated hero, interactive bouquet, features, pricing, FAQ) | ✅ Live | `/` |
| **Canvas editor** - drag, resize, rotate, layer, tint, lock, undo/redo, shortcuts, autosave | ✅ Live | `/create/[id]` |
| **AI Studio** - prompt → fully editable design (Claude or built-in composer) | ✅ Live | `/studio` |
| **AI chat editing** - "remove roses", "more luxury" patches the live canvas | ✅ Live | editor → *AI edit* |
| Greeting cards - Front / Inside / Back pages, text tool, script fonts | ✅ Live | `/create` → Greeting Card |
| Templates - 8 designer starting points, all fully editable | ✅ Live | `/templates` |
| Dashboard - projects, duplicate, delete, autosaved drafts | ✅ Live | `/dashboard` |
| Gallery - showcase wall | ✅ Live | `/gallery` |
| Share links + gift reveal page | ✅ Live (local) | `/g/[id]` |
| Export - PNG HD, PNG 4K, SVG vector, project JSON | ✅ Live | editor → Export |
| Blog - 6 SEO articles with Article + Breadcrumb JSON-LD | ✅ Live | `/blog` |
| SEO - metadata, sitemap, robots, Organization/FAQ/Article schema | ✅ Live | everywhere |
| Accounts, cloud storage, Stripe, hosted share pages, FastAPI backend | 🔜 Roadmap | [docs/ROADMAP.md](docs/ROADMAP.md) |

## Quick start

```bash
cd web
npm install
npm run dev          # → http://localhost:3000
```

Optional - real Claude-powered generation (works fully without it):

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Production build & checks:

```bash
npm run build        # type-check + static build (25 routes)
npx eslint app components lib features
npm start
```

---

## How it works - the Scene document

Everything in Tohfa revolves around **one JSON format**: the **Scene document** ([`web/lib/scene/types.ts`](web/lib/scene/types.ts)).

```
        ┌────────────────┐          ┌────────────────┐
        │   AI Studio    │ writes   │  Canvas editor │ edits
        │ (Claude/local) ├────┐  ┌──┤   (Fabric.js)  │
        └────────────────┘    ▼  ▼  └────────────────┘
                          ┌────────┐
                          │ Scene  │  { pages: [{ layers: [...] }] }
                          │  JSON  │
                          └──┬─────┘
              renders ┌──────┼──────────┐
                      ▼      ▼          ▼
                 thumbnails  share page  PNG/SVG export
                (SceneSVG renderer - no canvas needed)
```

A Scene is a list of **pages** (1 for bouquets, 3 for cards), each holding **layers**:

```jsonc
{
  "version": 1,
  "giftType": "bouquet",
  "canvas": { "width": 900, "height": 1100 },
  "pages": [{
    "background": "linear-gradient(175deg, #FFF9FB, #F6EEF8)",
    "layers": [
      { "id": "ly_a1", "type": "asset", "assetId": "flower-rose",
        "x": 450, "y": 300, "scaleX": 1.6, "scaleY": 1.6, "rotation": -12,
        "opacity": 1, "tint": "#C4455E", "semantic": "flower.rose" },
      { "id": "ly_a2", "type": "text", "text": "Happy anniversary",
        "fontFamily": "display", "fontSize": 48, "color": "#18181B", ... }
    ]
  }],
  "greeting": "Ten years, and you still feel like the beginning."
}
```

Three properties make the whole product fall out of this format:

1. **The AI generates it** - so AI output is *editable objects*, never a flat image.
2. **The editor round-trips it** - Fabric.js state serializes back to Scene JSON on every edit; Fabric's own format is never persisted.
3. **A pure renderer draws it** - [`sceneToSVG()`](web/lib/scene/render.ts) turns any Scene into a standalone SVG with zero dependencies, powering thumbnails, the share page, the gallery, and PNG/SVG export.

The `semantic` tag on each layer (`flower.rose`, `wrapping.silk`) is how chat edits find "the roses" without the AI ever seeing raw coordinates.

### The asset library

[`web/lib/assets.ts`](web/lib/assets.ts) defines ~35 hand-drawn SVG assets (flowers, greenery, wraps, ribbons, hearts, butterflies, balloons, sparkles, teddy, chocolate…) in a uniform 100×100 box. Each has a `__TINT__` token marking recolorable regions, so one rose asset becomes any-colored rose. **The AI can only reference these ids** - the generation schema uses a JSON-schema enum of asset ids, making hallucinated assets impossible.

---

## Feature walkthrough

### AI Studio (`/studio` → `POST /api/ai/generate`)

1. User describes the gift; picks bouquet or card.
2. **With `ANTHROPIC_API_KEY`**: the route calls **Claude Opus 5** with structured outputs (`output_config.format`) constrained to the SceneSpec JSON schema - positions are relative (0–1), asset ids are enum-locked, and a system prompt teaches bouquet composition (greenery fan → wrap cone → bloom dome → filler → extras → bow). Safety refusals fall back server-side (`fallbacks: "default"`), and any failure falls through to the local composer.
3. **Without a key**: the **local composer** ([`web/lib/ai/composer.ts`](web/lib/ai/composer.ts)) parses the prompt - occasion moods (romance / birthday / wedding / sympathy / friendship), named flowers, color words, "luxury" - and deterministically composes a bouquet with a seeded RNG (same wish → same design).
4. The result renders instantly as SVG; *Open in editor* saves it as a project and jumps into the canvas.

### Canvas editor (`/create/[id]`)

Built on **Fabric.js 7** wrapped by [`EditorEngine`](web/features/editor/engine.ts):

- **Left panel** - searchable asset library by category; click to add. *Add text* inserts editable type (serif / sans / script).
- **Canvas** - drag, resize and rotate with handles, multi-select, center snapping, double-click to edit text, zoom controls, background presets (colors + gradients).
- **Right panel** - contextual properties: tint swatches + custom color, opacity, size, rotation, flip, lock, layer order (forward/back/front/back), duplicate, delete.
- **Undo/redo** - snapshots of the Scene document (not Fabric state) in a zustand store, so manual edits *and AI patches* share one history.
- **Autosave** - every change debounces into `localStorage` (`tohfa:projects`); the API swap in Phase 3 keeps the same interface ([`web/lib/projects.ts`](web/lib/projects.ts)).
- **Shortcuts** - ⌘Z / ⌘⇧Z undo-redo, ⌘D duplicate, Delete, arrows nudge (⇧ = ×5), Esc deselect.
- **Cards** - a page switcher (Front / Inside / Back) swaps which Scene page the canvas edits.

### AI chat editing (editor → *AI edit* dock → `POST /api/ai/refine`)

The chat never regenerates the design. The route sends Claude a **compact semantic summary** of the scene (never raw JSON) and receives **patch operations**:

```jsonc
{ "reply": "Dressed it up with silk and gold.",
  "ops": [
    { "op": "retint", "match": "wrapping", "tint": "#3A2C52" },
    { "op": "retint", "match": "ribbon",   "tint": "#D4AF37" },
    { "op": "add",    "asset": "sparkle", "count": 3, "tint": "#D4AF37" }
  ] }
```

[`applyRefineOps()`](web/lib/ai/spec.ts) applies them client-side through the same undo stack - your manual edits survive, and ⌘Z reverses an AI edit exactly like a drag. Offline, a keyword parser handles the common commands ("remove roses", "add lavender", "black wrapping", "more luxury", greeting changes).

### Sharing & export

- **Share** copies `/g/{id}` - a full-screen gift reveal with falling petals, the design floating on a gradient, and the greeting as a headline. (Local-first for now: gifts open on the device that made them until hosted storage ships in Phase 3.)
- **Export** renders from the Scene document: PNG at 2× or 4× (via SVG → canvas), true vector SVG, or the raw project JSON.

### Templates, dashboard, gallery, blog

- **Templates** are prompts run through the composer at request time - eight curated designs that open as normal editable projects.
- **Dashboard** lists every autosaved project with live SVG thumbnails, duplicate and delete.
- **Gallery** is a masonry wall of composer-generated showcases.
- **Blog** is a typed content collection ([`web/lib/blog.ts`](web/lib/blog.ts)) - six real articles (flower meanings, gift ideas, anniversary messages, AI prompting tips…) with per-post metadata, Article + BreadcrumbList JSON-LD, and static generation.

---

## User workflows

**The 60-second gift:**
`/studio` → type *"a birthday bouquet with balloons for my best friend"* → Generate → Open in editor → drag one flower, tweak the greeting → **Share** → send the link.

**The hand-made card:**
`/create` → Greeting Card → design the Front (assets + text) → switch to Inside, write the message in script type → Back → **Export PNG 4K** or share the link.

**Template first:**
`/templates` → pick *Midnight Muse* → it opens as your own editable project → recolor the ribbon via chat: *"make the ribbon silver"* → export.

**Returning:** everything autosaves; `/dashboard` has every draft with thumbnails.

---

## Architecture

```
web/  (Next.js 16 App Router - everything currently ships here)
│
│  Server components / SSG          Client islands
│  ─ marketing pages, blog,         ─ editor (Fabric), studio,
│    templates, gallery               dashboard, share view, chat
│
│  API routes (/api/ai/*) ──► Claude Opus 5 (structured outputs)
│                        └──► local composer fallback
│
│  Persistence: localStorage  (Phase 3: FastAPI + PostgreSQL,
│                              same lib/projects.ts interface)
```

Design rules the codebase follows:

- **Nothing hardcodes "bouquet".** Gift types are entries in `GIFT_TYPES` (canvas size + page list). Adding *Gift Box* later = a registry entry + assets.
- **Pure core, thin shells.** `lib/` is framework-free logic (scene, assets, renderer, composer, ops) - usable verbatim by the future FastAPI worker for server-side OG images and exports. React components only orchestrate.
- **AI is constrained, validated, and optional.** Schema-locked outputs, asset-id enums, server-side clamping of every number, refusal handling, and a deterministic local fallback so the product never depends on an API key.

The full production architecture (FastAPI, PostgreSQL schema, Redis, workers, Clerk, Stripe, Docker/VPS deployment) is specified in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/DATABASE.md](docs/DATABASE.md).

## Folder structure

```
tohfa/
├── README.md                    ← you are here
├── docs/
│   ├── ARCHITECTURE.md          # full-stack production design
│   ├── DATABASE.md              # PostgreSQL schema (Phase 3+)
│   └── ROADMAP.md               # phased delivery plan
└── web/
    ├── app/
    │   ├── page.tsx             # landing page
    │   ├── layout.tsx           # fonts, metadata, JSON-LD, chrome
    │   ├── studio/              # AI Studio
    │   ├── create/              # gift-type chooser + [id] editor route
    │   ├── dashboard/           # my gifts
    │   ├── templates/ gallery/ blog/ blog/[slug]/ pricing/ about/
    │   ├── g/[id]/              # share / gift-reveal view
    │   ├── api/ai/generate/     # prompt → Scene (Claude or composer)
    │   ├── api/ai/refine/       # message + scene → patch ops
    │   ├── robots.ts sitemap.ts fonts.ts globals.css
    ├── components/
    │   ├── brand/               # Logo (animated), Bouquet illustration
    │   ├── layout/              # Navbar, Footer, Chrome, ComingSoon
    │   ├── motion/              # Reveal, FloatingPetals
    │   ├── scene/               # SceneSVG, TemplateCard
    │   ├── sections/            # landing sections (Hero, Pricing, FAQ…)
    │   └── ui/                  # Button, Container
    ├── features/editor/
    │   ├── engine.ts            # Fabric.js ⇄ Scene document bridge
    │   ├── store.ts             # zustand: project, history, selection, chat
    │   └── components/          # EditorShell, TopBar, panels, ChatDock
    ├── lib/
    │   ├── scene/               # types.ts (Scene doc) + render.ts (SVG)
    │   ├── ai/                  # spec.ts (schemas/ops) + composer.ts
    │   ├── assets.ts            # the tintable SVG asset library
    │   ├── templates.ts blog.ts projects.ts export.ts site.ts utils.ts
    │   └── hooks/
    └── public/fonts/            # self-hosted Clash Display + Satoshi
```

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) + React 19 | SSG marketing, client-island editor |
| Language | TypeScript, strict | |
| Styling | **Tailwind CSS v4** | design tokens in `globals.css` `@theme` |
| Motion | **Framer Motion** | reveals, chat dock, share reveal, hero parallax |
| Canvas | **Fabric.js 7** | wrapped by `EditorEngine`, never persisted |
| State | **zustand** (editor) · React state elsewhere | |
| AI | **Claude Opus 5** via `@anthropic-ai/sdk` | structured outputs + server-side fallback; local composer without a key |
| Fonts | Clash Display · Inter · Satoshi | self-hosted via `next/font`, zero layout shift |
| Persistence | localStorage (Phase 3: FastAPI + PostgreSQL) | one interface: `lib/projects.ts` |

## Enabling real Claude AI

The product is fully functional offline. To upgrade generation/chat to Claude:

```bash
# web/.env.local
ANTHROPIC_API_KEY=sk-ant-...
```

Both routes then use `claude-opus-5` with JSON-schema-constrained outputs; responses tagged `"source": "claude"` vs `"local"`. Every Claude failure (network, refusal, invalid spec) silently falls back to the local composer - users never see an error page because of the AI.

## SEO

- Per-route `Metadata` (title template, descriptions, OpenGraph, Twitter cards) + canonical base URL.
- `sitemap.xml` (includes all blog posts) and `robots.txt` via App Router conventions.
- JSON-LD: **Organization** (site-wide), **FAQPage** (landing), **Article + BreadcrumbList** (each blog post).
- Static generation for all indexable routes (25/25 prerendered), self-hosted fonts, `prefers-reduced-motion` support.

## What's implemented vs. roadmap

Everything in [What's inside](#whats-inside) marked ✅ works today, verified by `npm run build` (25 routes), ESLint clean, and route + API smoke tests.

Deliberately deferred to keep this phase honest (details in [docs/ROADMAP.md](docs/ROADMAP.md)):

- **Accounts & cloud sync** (Clerk + FastAPI + PostgreSQL) - Phase 3. Until then projects are device-local, which is also why share links open on the creating device.
- **Hosted share pages with OG images & QR codes** - needs server storage (Phase 5).
- **Stripe billing** - the pricing page is real, checkout is Phase 6.
- **Voice messages, print-ready CMYK PDF, admin panel** - Phases 4–8.

The seams for all of these already exist: `lib/projects.ts` is the storage interface to swap, `docs/DATABASE.md` is the schema, and the Scene document is the contract everything else already speaks.

---

*Built with 🌸 - every emotion, beautifully gifted.*
