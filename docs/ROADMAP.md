# TOHFA - Implementation Roadmap

Each phase ships something usable. Phases 1–2 are frontend-heavy; the API grows alongside from Phase 3.

> **Status (2026-08-03):** Phases 0–2 are ✅ shipped, plus large parts of 4, 5, and 7 in a
> local-first form: the Fabric.js editor (assets, text, undo/redo, shortcuts, autosave),
> AI Studio with Claude structured-output generation + deterministic local composer,
> AI chat patch-editing, multi-page greeting cards, templates, dashboard, gallery,
> share reveal page, PNG/4K/SVG export, and a 6-article SEO blog. Persistence is
> localStorage behind the `lib/projects.ts` interface until Phase 3 swaps in the API.
> See the root README for the full feature map.

## Phase 0 - Foundation ✅ *(this commit)*
- Architecture, database design, roadmap, folder structure, dependency list
- Next.js 16 + TypeScript strict + Tailwind v4 scaffold
- Design system: tokens (color, type, spacing, radius, shadow), fonts (Clash Display / Inter / Satoshi), motion primitives
- Brand: animated SVG logo, navbar, footer
- Landing page: hero with interactive bouquet, features, AI demo teaser, templates, testimonials, pricing, FAQ, newsletter
- Placeholder routes for all nav destinations; SEO baseline (metadata, robots, sitemap, JSON-LD Organization)

## Phase 1 - Editor core (2–3 weeks)
- `EditorEngine` wrapper over Fabric.js: add/select/transform/layer/duplicate/delete
- Scene document schema (Zod) + serializer between Fabric and Scene JSON
- Command-stack undo/redo over scene patches; keyboard shortcuts; snap & alignment guides
- Left panel (asset browser: categories, search, favorites, recents) with local asset pack v1 (~60 SVG assets)
- Right panel (properties: color/tint, opacity, rotation, scale, shadow, glow, layer order, lock, group)
- Zoom/pan infinite canvas, autosave to localStorage (API autosave in Phase 3)

## Phase 2 - AI Studio v1 (2 weeks)
- FastAPI service up (Docker Compose: api + postgres + redis)
- `/api/v1/ai/generate`: prompt → Claude structured output constrained to Scene schema → validation/repair → editable scene
- AI Studio UI: prompt input, style chips, generation progress, "open in editor"
- `/api/v1/ai/refine`: chat message + scene summary → JSON Patch → applied through undo stack
- AI chat dock inside the editor; quota metering (Redis) + ai_usage logging

## Phase 3 - Accounts & persistence (2 weeks)
- Clerk auth (web + API middleware), users table sync webhook
- Projects CRUD, server autosave (debounced patches), version history
- Dashboard: projects, drafts, collections, favorites
- Supabase Storage for uploads (images, voice notes) with signed URLs

## Phase 4 - Greeting Card editor (1–2 weeks)
- `greeting_card` gift type: 3-page scene (front/inside/back), page navigator
- Rich text layer, handwriting fonts, stickers, photo layers
- Voice message record/upload + QR code layer

## Phase 5 - Sharing & export (1–2 weeks)
- Share pages `/g/[shareId]`: ISR, per-gift OG image (worker-rendered), QR, public/unlisted/private, view counts
- Export worker: PNG, SVG, PDF, 4K, IG story/post, WhatsApp, print-ready CMYK PDF
- Embed mode

## Phase 6 - Monetization (1 week)
- Stripe: plans (Free/Plus/Pro), checkout, customer portal, webhooks
- Plan gates: premium assets, AI quota, export resolution
- Pricing page wired to live plans

## Phase 7 - Content & SEO (ongoing from here)
- Blog engine (MDX, ISR) + first 8 articles (birthday, wedding, anniversary, valentine, festivals, gift ideas, flower meanings, greeting messages)
- Full JSON-LD coverage, dynamic sitemap, Lighthouse CI gate ≥ 95
- Gallery of public gifts (moderated)

## Phase 8 - Admin & ops (1–2 weeks)
- Admin panel: users, templates CMS, blog CMS, AI usage, subscriptions, reports, settings
- Sentry, uptime, structured logging dashboards
- GitHub Actions deploy pipeline → VPS (Nginx + Docker), Cloudflare in front

## Phase 9+ - Expansion
- Gift boxes → invitations → memory books → wedding cards (each = new gift_type + asset pack)
- Mobile apps (API already complete), team workspaces, physical marketplace
