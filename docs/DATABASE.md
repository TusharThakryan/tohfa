# TOHFA - Database Schema

PostgreSQL 16. Prisma schema is the migration source of truth (`api/prisma/schema.prisma`). All tables have `id` (cuid/nanoid), `created_at`, `updated_at`. User content is soft-deleted (`deleted_at`).

## Core

### users
Mirror of Clerk identity + app data.
- `id`, `clerk_id` (unique), `email`, `name`, `avatar_url`
- `role` enum: `user | admin`
- `plan_id` FK → plans, `onboarded_at`, `deleted_at`

### gift_types  *(the plugin registry)*
- `key` (unique: `bouquet`, `greeting_card`, later `giftbox`, `invitation`…)
- `name`, `description`, `icon`, `status` enum: `active | coming_soon | hidden`
- `config` JSONB - canvas presets, page structure, allowed asset categories, AI prompt template key, export presets

### projects
- `owner_id` FK → users, `owner_type` enum: `user | team` (team reserved)
- `gift_type_key` FK → gift_types
- `title`, `scene` JSONB (the Scene document), `scene_version` int
- `thumbnail_url`, `status` enum: `draft | active | archived`
- `template_id` nullable FK, `deleted_at`
- Indexes: `(owner_id, updated_at desc)`, GIN on `scene -> 'pages'` for semantic queries

### project_versions  *(version history)*
- `project_id` FK, `seq` int, `scene` JSONB snapshot, `label`, `created_by`
- Snapshot every N patches or on explicit save; unique `(project_id, seq)`

## Content library

### assets  *(flowers, leaves, ribbons, teddies… all one table)*
- `category` enum-ish text: `flower | leaf | branch | wrapping | ribbon | frame | butterfly | chocolate | teddy | tag | heart | sparkle | confetti | balloon | icon | shape | background | sticker`
- `slug` (unique), `name`, `svg_url` / `raster_url`, `preview_url`
- `palette_slots` JSONB (which parts are tintable), `default_colors` JSONB
- `semantic` text (`flower.rose`, `wrap.kraft`) - AI targeting key
- `tags` text[], `is_premium` bool, `status` enum: `active | draft | retired`
- Index: `(category, status)`, GIN on `tags`

### templates
- `gift_type_key` FK, `title`, `slug`, `scene` JSONB, `preview_url`
- `occasion` text (`birthday | wedding | anniversary…`), `is_premium`, `is_featured`, `use_count`
- SEO: `meta_title`, `meta_description`

### collections / collection_items
- User-curated folders: `user_id`, `name`, `is_default`; items link `project_id`

### favorites
- `user_id`, `subject_type` enum: `asset | template | project`, `subject_id`; unique triple

### media  *(user uploads)*
- `user_id`, `kind` enum: `image | audio`, `storage_key`, `url`, `mime`, `bytes`, `width`, `height`, `duration_ms`
- Voice messages for cards live here

## Sharing & output

### shares
- `project_id` FK, `share_id` nanoid (unique, unguessable), `visibility` enum: `public | unlisted | private`
- `og_image_url`, `qr_url`, `password_hash` nullable, `view_count`, `expires_at` nullable

### exports
- `project_id`, `user_id`, `format` enum: `png | svg | pdf | png_4k | ig_story | ig_post | whatsapp | print`
- `status` enum: `queued | processing | done | failed`, `url`, `error`, `worker_ms`

## Billing & AI

### plans
- `key` (`free | plus | pro`), `stripe_price_id`, `limits` JSONB (projects, ai_generations/mo, exports/mo, premium_assets bool, resolution cap)

### subscriptions
- `user_id`, `plan_id`, `stripe_customer_id`, `stripe_subscription_id`
- `status` enum: `active | trialing | past_due | canceled`, `current_period_end`, `cancel_at_period_end`

### ai_usage
- `user_id`, `project_id`, `kind` enum: `generate | refine | greeting_text`
- `model`, `input_tokens`, `output_tokens`, `latency_ms`, `success` bool, `month` (partition key)
- Rolled up nightly into `ai_usage_monthly` for quota checks (hot path reads Redis counter)

## Content & telemetry

### blog_posts
- `slug` (unique), `title`, `excerpt`, `body_mdx`, `cover_url`, `author_id`
- `status` enum: `draft | published`, `published_at`, `occasion_tags` text[]
- SEO: `meta_title`, `meta_description`, `og_image_url`, `reading_minutes`

### analytics_events
- `user_id` nullable, `session_id`, `event` text, `props` JSONB, `ts`
- Monthly partitions; only aggregates surfaced in admin

### audit_log
- `actor_id`, `action`, `subject_type`, `subject_id`, `diff` JSONB - every admin mutation

## Reserved for marketplace (empty migrations now, zero cost)
`products`, `orders`, `order_items`, `fulfillments` - schema stubs documented, created when the marketplace ships.
