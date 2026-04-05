# PROJECT_CHANGELOG.md

## Purpose  
Record repository-level changes that affect navigation, canonical structure, or cross-document consistency.

## Usage rules  
- add entries when repository structure, canonical rules, or shared naming conventions change  
- keep entries short and factual  
- use absolute dates

## Entries

### 2026-04-05
- normalized Markdown formatting across the core `.md` files so the repository renders cleanly in Markdown preview  
- aligned canonical statuses and flows across architecture, data model, event flow, listing, order, and workflow specs  
- rewrote `REPOSITORY_BLUEPRINT.md` to describe the real current flat repo and the future migration path separately  
- added `.editorconfig` and this changelog to make future edits more consistent
- added initial `db/schema`, `db/views`, `db/seeds`, and `automation/contracts` structure as the first implementation assets  
- established the first PostgreSQL migration set for the canonical data model and seeded minimum operational policy defaults
- added `app/backend` as a thin TypeScript and Fastify service over repository metadata and PostgreSQL tables
- introduced health, metadata, and read-only data routes with safe `503` behavior when `DATABASE_URL` is missing
- synchronized backend registry definitions with SQL enum/status constraints and added normalized status-filter handling
- started Phase 2 runtime implementation with a deterministic rules-engine module and evaluation endpoint
- added Phase 3 runtime scaffolding with shared primitives plus supplier intake, qualification, and order-routing modules
- added a deterministic listing preview runtime with prompt assets, channel constraints, validation, and `POST /v1/listings/preview`
