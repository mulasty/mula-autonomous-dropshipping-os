# Backend

## Purpose
Thin backend skeleton for Mula Group Autonomous Dropshipping OS. It sits above the current PostgreSQL schema and workflow contracts without embedding heavy business logic yet.

## Stack
- Node.js
- TypeScript
- Fastify
- PostgreSQL via `pg`

## Scripts
- `npm run dev`
- `npm run check`
- `npm run build`
- `npm run start`

## Environment
Copy values from `.env.example` and set at minimum:
- `HOST`
- `PORT`
- `LOG_LEVEL`
- `DATABASE_URL`

## Current routes
- `GET /`
- `GET /health`
- `GET /meta`
- `GET /meta/database`
- `GET /meta/contracts`
- `GET /meta/registry`
- `GET /meta/runtime-modules`
- `GET /v1/suppliers`
- `GET /v1/products`
- `GET /v1/orders`
- `GET /v1/exceptions`
- `POST /v1/rules/evaluate`
- `POST /v1/pipeline/qualify`
- `POST /v1/listings/preview`
- `POST /v1/listings/generate`
- `POST /v1/publication/prepare`
- `POST /v1/sync/evaluate`
- `POST /v1/support/classify`
- `POST /v1/support/respond`
- `GET /v1/control-tower/summary`

## Current design
- metadata routes read the real repository contracts and SQL assets
- status and enum registry is centralized and compared against SQL check constraints
- data routes are read-only and intentionally thin
- database-backed routes fail safely with `503` when `DATABASE_URL` is not configured
- enum-like filters normalize case, spaces, and hyphens before validation
- rules engine route now supports stricter request validation, policy loading from `policies`, and optional persistence of `product_rule_decisions`
- shared runtime primitives now exist for results, events, logging, config, and exceptions
- exception creation can now use a real repository-backed path instead of noop-only wiring
- phase-3 runtime modules are present for supplier intake, qualification, and order routing
- supplier intake now records `supplier_imports` and persists source-grounded raw rows into `products_raw`
- normalization is now a real runtime module that maps accepted raw records into canonical product shape with explicit quality warnings
- product pipeline now stages normalization, rules evaluation, and qualification explicitly through one runtime service
- normalized product persistence is available through `products_normalized` when `DATABASE_URL` is configured
- listing factory now separates preview, draft persistence, and publication preparation into distinct runtime boundaries
- listing outputs align with prompt/schema field naming and unknown channels default to conservative constraints
- sync engine route evaluates stock and margin safety conservatively before any live-channel update is implied, and now keeps stock and price actions explicit in the same result
- support routes now persist authoritative classifications, require `messageId` lookup for `POST /v1/support/respond`, and block automated order/shipping answers when verified context is missing
- control tower summary route exposes exception visibility and runtime health even when the database is not configured, using an explicit in-memory exception queue instead of silent noop behavior

## Persistence notes
- `POST /v1/rules/evaluate` accepts `persistDecision: true` to write `product_rule_decisions`
- `POST /v1/pipeline/qualify` accepts `persistNormalizedProduct: true` and `persistRuleDecision: true` for the first durable product pipeline handoff
- `POST /v1/listings/generate` persists listing drafts and validation artifacts when `DATABASE_URL` is configured
- `POST /v1/publication/prepare` loads a persisted listing draft and produces a publication-ready payload without implying channel success
- policy loading falls back to in-memory defaults when the database is unavailable or a policy record is missing, and the response exposes that fallback in route metadata
- support classification and response persistence use repository-backed paths, with audit-log enrichment for stored support policy metadata when PostgreSQL is available
- support and sync exceptions remain visible through the control tower even without PostgreSQL because the app now composes a shared in-memory exception store

## Next backend steps
- add Supabase/Postgres migration execution workflow
- extend the product pipeline from qualification into listing/publication with the same stage-aware contract style
- persist stock/pricing history and support artifacts against a live database in environment-backed integration tests
- add richer publication adapters beyond the current bounded payload-preparation step
- add auth and operator-safe admin endpoints
