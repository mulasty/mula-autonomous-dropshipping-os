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
- `POST /v1/listings/preview`

## Current design
- metadata routes read the real repository contracts and SQL assets
- status and enum registry is centralized and compared against SQL check constraints
- data routes are read-only and intentionally thin
- database-backed routes fail safely with `503` when `DATABASE_URL` is not configured
- enum-like filters normalize case, spaces, and hyphens before validation
- rules engine route supports deterministic phase-2 qualification checks without needing database writes yet
- shared runtime primitives now exist for results, events, logging, config, and exceptions
- phase-3 runtime modules are present for supplier intake, qualification, and order routing
- listing factory preview route generates deterministic channel-aware listing content and validates publication readiness without database writes

## Next backend steps
- add typed repository layer per domain
- add Supabase/Postgres migration execution workflow
- add write paths for intake, rules, and order events
- extend the product pipeline with normalization persistence and durable qualification handoff
- add auth and operator-safe admin endpoints
