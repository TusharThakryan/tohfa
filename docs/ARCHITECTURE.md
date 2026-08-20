# 🌸 TOHFA - System Architecture

> **Every Emotion, Beautifully Gifted.**
> AI-powered digital gifting platform. Bouquets and greeting cards first; gift boxes, invitations, memory books, wedding cards, and a physical marketplace later - with zero architecture changes.

---

## 1. Guiding Principles

1. **Gift-type agnostic core.** Nothing in the platform knows what a "bouquet" is. The core knows about **Projects**, **GiftTypes**, **Assets**, and **Scenes**. A bouquet is a `GiftType` plugin; so is a greeting card; so is a future wedding invitation.
2. **API-first.** The FastAPI backend is the single source of truth. The Next.js app, future Android/iOS apps, and the admin panel are all clients of the same versioned REST API (`/api/v1`).
3. **The canvas document is the product.** Every gift - AI-generated or hand-made - is a structured, versioned **Scene JSON document**. AI generates Scene JSON; humans edit Scene JSON; exporters render Scene JSON. One format, three consumers.
4. **AI edits, never regenerates.** Conversational refinement produces **Scene patches** (JSON Patch operations), applied to the existing document so user edits are never destroyed.
5. **Clean architecture, both sides.** Route → Service → Repository on the backend; feature-sliced atomic design on the frontend. No business logic in routes or components.

---

## 2. High-Level Topology

```
                    ┌─────────────────────────────────────────┐
                    │                Cloudflare                │
                    │   CDN · WAF · DDoS · DNS · Image resize  │
                    └───────────────┬─────────────────────────┘
                                    │
                    ┌───────────────▼─────────────┐
                    │        Nginx (VPS)          │
                    │  TLS · gzip/brotli · routing │
                    └───────┬─────────────┬───────┘
                            │             │
              ┌─────────────▼──┐   ┌──────▼──────────────┐
              │  Next.js 15    │   │  FastAPI (Uvicorn)  │
              │  SSR/SSG/ISR   │   │  /api/v1            │
              │  (Docker)      │   │  (Docker, N workers)│
              └───────┬────────┘   └──┬────────┬─────────┘
                      │               │        │
        ┌─────────────▼───┐   ┌───────▼──┐  ┌──▼─────────────┐
        │ Clerk (auth)    │   │PostgreSQL│  │ Redis           │
        │ Stripe (billing)│   │ (Prisma  │  │ cache · queues  │
        │ Anthropic API   │   │  schema) │  │ rate limits     │
        │ Supabase Storage│   └──────────┘  └──┬─────────────┘
        └─────────────────┘                    │
                                       ┌───────▼────────┐
                                       │ Worker (arq)   │
                                       │ exports · OG   │
                                       │ images · email │
                                       └────────────────┘
```

- **Web** renders marketing pages (SSG/ISR), blog (SSG + ISR), share pages (ISR), and the app shell (client components hydrated over the API).
- **API** owns all domain logic. Web server components call it server-to-server; the editor calls it from the client with Clerk JWTs.
- **Worker** handles anything slow: 4K/PDF exports, OG image generation, AI usage rollups, transactional email.

---

## 3. The Scene Document (core abstraction)

Every project stores a `scene` JSONB document:

```jsonc
{
  "version": 3,                    // schema version, migratable
  "giftType": "bouquet",           // plugin key - bouquet | card | giftbox | ...
  "canvas": { "width": 1080, "height": 1350, "background": {...} },
  "pages": [                        // 1 page for bouquets, 3+ for cards (front/inside/back)
    {
      "id": "pg_1",
      "layers": [
        {
          "id": "ly_a8f",
          "type": "asset",          // asset | text | shape | sticker | image | qr | audio
          "assetId": "ast_rose_peony_03",
          "transform": { "x": 420, "y": 310, "scaleX": 1.2, "scaleY": 1.2, "rotation": -12, "zIndex": 4 },
          "style": { "tint": "#C996CC", "opacity": 1, "shadow": {...}, "glow": null },
          "animation": { "preset": "float", "delay": 0.2 },
          "locked": false,
          "groupId": null,
          "meta": { "aiGenerated": true, "semantic": "flower.rose" }  // lets AI chat target "the roses"
        }
      ]
    }
  ],
  "greeting": { "text": "...", "font": "handwriting-01", "voiceUrl": null },
  "palette": ["#6C4AB6", "#C996CC", "#D4AF37"]
}
```

**Why this matters:**
- The **editor** (Fabric.js) serializes to/from this format - it never persists Fabric's own JSON.
- The **AI Studio** returns this exact format (validated by Zod on the client and Pydantic on the server). Every generated object is a normal editable layer.
- The **AI Chat** returns RFC-6902 JSON Patch ops against this document (`remove all layers where meta.semantic startsWith "flower.rose"`, `add layer {...}`), applied through the same undo/redo command stack as manual edits.
- **Exporters** render it headlessly (PNG/SVG/PDF/4K) without a browser session.
- **Version history** is a chain of scene snapshots + patches.

Adding a gift type = registering a `GiftTypeDefinition` (canvas presets, allowed asset categories, page structure, AI prompt template, export presets). No core changes.

---

## 4. Frontend Architecture (`web/`)

Next.js 15 App Router · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion + GSAP · Fabric.js · Zustand · TanStack Query.

### Rendering strategy per route

| Route | Strategy | Why |
|---|---|---|
| `/` `/about` `/pricing` | SSG | Pure marketing, max Lighthouse |
| `/templates` `/gallery` | ISR (60s) | Content changes, still cacheable |
| `/blog` `/blog/[slug]` | SSG + ISR | SEO-critical, JSON-LD Article schema |
| `/g/[shareId]` (share page) | ISR + dynamic OG image | Public gift links, OpenGraph per gift |
| `/create/*` `/studio` `/dashboard/*` | Client (app shell) | Editor is inherently client-side |
| `/admin/*` | Dynamic SSR, role-gated | Fresh data, no caching |

### State layers

- **Zustand** - editor state only (scene doc, selection, history stack, tool state). Slices: `sceneSlice`, `selectionSlice`, `historySlice`, `viewportSlice`, `chatSlice`.
- **TanStack Query** - all server state (projects, assets, templates, user). Normalized keys: `['projects', id]`, `['assets', { category }]`.
- **URL** - shareable state (template filters, gallery pages).

### Editor engine (`features/editor/engine/`)

Fabric.js is wrapped behind an `EditorEngine` interface - commands in (`addLayer`, `transform`, `group`, `reorder`), scene patches out. Undo/redo is a command stack over scene patches (not Fabric snapshots), which is what lets AI chat and human edits share one history. Autosave debounces patches to the API every 2s of idle.

---

## 5. Backend Architecture (`api/`)

FastAPI · SQLAlchemy 2 (async) · Pydantic v2 · Redis · arq workers. Prisma is used as the **schema/migration source of truth** (`prisma/schema.prisma` → `prisma migrate`), with SQLAlchemy models mirroring it for the Python runtime.

```
api/app/
├── api/v1/            # routers only - parse, authz, delegate
│   ├── projects.py, assets.py, ai.py, templates.py,
│   ├── exports.py, sharing.py, billing.py, blog.py, admin/
├── services/          # business logic (ProjectService, AIService, ExportService...)
├── repositories/      # data access, one per aggregate (Repository Pattern)
├── domain/            # pure domain: scene schema, gift-type registry, patch engine
│   ├── scene/         # Pydantic Scene models + validators + migrations
│   ├── gift_types/    # bouquet.py, greeting_card.py  ← plugins
│   └── ai/            # prompt templates, JSON-schema-constrained generation, patch planner
├── infra/             # postgres, redis, supabase storage, clerk, stripe, anthropic clients
├── workers/           # arq tasks: render_export, generate_og, rollup_usage, send_email
└── core/              # config, security, rate limiting, logging, errors
```

**AI pipeline (`domain/ai/`):**
1. `generate`: user prompt + gift-type template → Claude (structured output, JSON schema = Scene schema) → validate → repair loop (max 2) → priced against `ai_usage` → return Scene.
2. `refine`: user message + current scene (compact semantic summary, not raw JSON) → Claude returns JSON Patch ops → server validates ops against schema + asset catalog → return patch. Client applies through undo stack.
3. Guardrails: per-plan quotas in Redis, token metering per request, moderation on prompts.

**Security:** Clerk JWT verification middleware (JWKS cached), per-route rate limits (Redis sliding window), strict Pydantic validation, CSP/HSTS headers at Nginx, signed URLs for storage, Stripe webhook signature verification, audit log on admin actions.

---

## 6. Database (PostgreSQL - see DATABASE.md for full schema)

Aggregates: `users`, `projects` (scene JSONB + `gift_type` FK), `project_versions`, `assets` (the element library - flowers are just rows with `category='flower'`), `gift_types`, `templates`, `collections`, `favorites`, `shares`, `exports`, `subscriptions`, `plans`, `ai_usage`, `media` (user uploads), `blog_posts`, `analytics_events`, `audit_log`.

Key decisions: scene as JSONB with GIN index on `meta`; soft deletes on user content; `share_id` is a nanoid, unguessable; all tables `created_at/updated_at`; cursor pagination everywhere.

---

## 7. SEO & Performance

- Metadata API on every route, `generateMetadata` for dynamic ones; canonical URLs; OG + Twitter cards; per-gift dynamic OG images (worker-rendered, cached at Cloudflare).
- JSON-LD: Organization (global), Article (blog), Product+Offer (pricing), FAQPage (pricing/FAQ), BreadcrumbList (blog, templates).
- `sitemap.xml` (dynamic, includes blog + public templates + public gifts) and `robots.txt` via App Router conventions.
- Budgets: LCP < 1.8s, CLS < 0.05, INP < 150ms, Lighthouse ≥ 95. Enforced in CI via Lighthouse CI on `/`, `/pricing`, one blog post.
- Fonts self-hosted via `next/font` (zero layout shift); editor bundles (Fabric, GSAP) loaded only on editor routes via dynamic import; AVIF/WebP via `next/image` + Cloudflare polish.

---

## 8. DevOps

- **Docker Compose** for local dev (web, api, worker, postgres, redis) and production (plus nginx).
- **GitHub Actions:** lint + typecheck + test on PR; build images → GHCR → SSH deploy to VPS with health-checked rolling restart on `main`. Lighthouse CI + Playwright smoke on PR.
- **Environments:** `.env.example` documents every variable; secrets in GitHub Environments + VPS-side `.env` files.
- **Observability:** structured JSON logs, Sentry (web + api), `/healthz` + `/readyz`, uptime monitoring.

---

## 9. Future-proofing checkpoints

| Future feature | Already supported by |
|---|---|
| Gift boxes, invitations, wedding cards | `gift_types` registry + Scene pages |
| Memory books / scrapbooks | Multi-page Scene documents |
| Physical marketplace | `products`/`orders` tables reserved; Stripe already integrated |
| Android/iOS apps | Everything is `/api/v1`; Clerk has native SDKs |
| Team workspaces | `owner_id` is polymorphic-ready (`owner_type` column) |
