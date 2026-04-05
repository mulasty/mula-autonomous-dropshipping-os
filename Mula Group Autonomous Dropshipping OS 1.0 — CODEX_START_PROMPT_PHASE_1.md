# CODEX_START_PROMPT_PHASE_1.md

```md  
You are working on the project: Mula Group Autonomous Dropshipping OS 1.0.

Your immediate goal is to implement the first execution block of the repository and documentation foundation.

Target tasks:  
- TASK-001 Create repository scaffold  
- TASK-002 Add initial root markdown files  
- TASK-003 Add architecture and vision docs  
- TASK-010 Create core SQL schema files

You must work in a disciplined, documentation-aligned way.

## Non-negotiable instructions  
1. Follow the repository structure from `REPOSITORY_BLUEPRINT.md`.  
2. Do not invent undocumented business rules.  
3. Keep module names, folder names, and file names consistent with project docs.  
4. Prefer explicit structure over cleverness.  
5. Do not implement advanced features outside the target task scope.  
6. Keep SQL readable, normalized, and safe for iterative development.  
7. Add comments where they help future maintainers.  
8. Do not remove placeholders for future folders if they are part of the blueprint.

## Required reference files  
Read and align your work with these files before making changes:  
- `START_HERE.md`  
- `README.md`  
- `IMPLEMENTATION_PHASES.md`  
- `REPOSITORY_BLUEPRINT.md`  
- `SYSTEM_OVERVIEW.md`  
- `ARCHITECTURE_OVERVIEW.md`  
- `DATA_MODEL.md`  
- `SECURITY_AND_GUARDRAILS.md`  
- `CODEX_TASK_PACK.md`

## Task execution details

### TASK-001 Create repository scaffold  
Create the repository directory structure exactly as defined in the repository blueprint.

Expected root items:  
- README.md  
- START_HERE.md  
- IMPLEMENTATION_PHASES.md  
- REPOSITORY_BLUEPRINT.md  
- PROJECT_CHANGELOG.md  
- .env.example  
- docs/  
- prompts/  
- db/  
- apps/  
- automation/  
- data/  
- qa/  
- assets/

Expected docs substructure:  
- docs/vision/  
- docs/architecture/  
- docs/modules/  
- docs/ai/  
- docs/workflows/  
- docs/integrations/  
- docs/operations/

Expected prompts substructure:  
- prompts/product_selection/  
- prompts/listing_generation/  
- prompts/support/  
- prompts/analytics/

Expected db substructure:  
- db/schema/  
- db/seeds/  
- db/views/

Expected automation substructure:  
- automation/n8n/exports/  
- automation/n8n/docs/  
- automation/scripts/feed_parser/  
- automation/scripts/normalization/  
- automation/scripts/repricing/  
- automation/scripts/publishing/

Expected other substructure:  
- data/staging/  
- data/normalized/  
- data/snapshots/  
- data/fixtures/  
- qa/  
- assets/diagrams/  
- assets/templates/  
- assets/branding/

### TASK-002 Add initial root markdown files  
Create or populate these root files using the project planning docs as source of truth:  
- README.md  
- START_HERE.md  
- IMPLEMENTATION_PHASES.md  
- REPOSITORY_BLUEPRINT.md

Also add:  
- PROJECT_CHANGELOG.md  
- .env.example

Rules:  
- keep README business-facing but implementation-useful  
- keep START_HERE action-oriented  
- keep IMPLEMENTATION_PHASES execution-focused  
- keep REPOSITORY_BLUEPRINT structural  
- keep PROJECT_CHANGELOG simple and ready for future entries  
- keep .env.example minimal but useful, with placeholder variables only

Suggested `.env.example` keys:  
- SUPABASE_URL=  
- SUPABASE_SERVICE_ROLE_KEY=  
- OPENAI_API_KEY=  
- BASELINKER_API_TOKEN=  
- SUPPLIER_FEED_URL=  
- TELEGRAM_BOT_TOKEN=  
- TELEGRAM_CHAT_ID=  
- SUPPORT_EMAIL=

### TASK-003 Add architecture and vision docs  
Create or populate these files under correct folders:  
- docs/vision/SYSTEM_OVERVIEW.md  
- docs/architecture/ARCHITECTURE_OVERVIEW.md  
- docs/architecture/DATA_MODEL.md  
- docs/architecture/INTEGRATION_MAP.md  
- docs/architecture/EVENT_FLOW.md  
- docs/architecture/SECURITY_AND_GUARDRAILS.md

Rules:  
- preserve the module names already defined in project docs  
- preserve the layered architecture logic  
- keep business concepts and technical constraints aligned  
- do not add speculative vendor-specific details not yet defined

### TASK-010 Create core SQL schema files  
Create these files:  
- db/schema/001_core_tables.sql  
- db/schema/002_event_tables.sql  
- db/schema/003_policy_tables.sql  
- db/schema/004_logging_tables.sql

SQL design constraints:  
- target PostgreSQL / Supabase compatibility  
- include primary keys  
- include foreign keys where sensible  
- include created_at and updated_at where appropriate  
- use jsonb for flexible payload fields  
- do not overcomplicate with premature optimization  
- favor clarity and maintainability

Minimum expected tables:  
From core/business layer:  
- suppliers  
- supplier_imports  
- products_raw  
- products_normalized  
- product_rule_decisions  
- product_ai_decisions  
- listings  
- listing_validations  
- pricing_history  
- stock_history  
- orders  
- order_items  
- customers  
- customer_messages  
- support_responses  
- exceptions  
- policies  
- prompts  
- audit_logs

From event layer:  
- order_events  
- optionally other dedicated event tables if justified by architecture consistency

## Output expectations  
At the end of your implementation, provide:  
1. A summary of created folders and files.  
2. A summary of SQL tables added.  
3. Any assumptions you had to make.  
4. Any blockers or unresolved ambiguities.

## Definition of done  
The work is done only if:  
- folder structure exists  
- root docs exist and are coherent  
- architecture docs exist in correct paths  
- SQL files exist and reflect the documented entities  
- naming is consistent across docs and schema  
- no major file is left as a one-line placeholder

## Important scope guard  
Do not implement n8n workflows, prompt files, supplier-specific parsers, or UI apps yet. Only prepare the repo/documentation/schema foundation for those later phases.  
```

## Recommended usage  
Paste this prompt into Codex together with access to the repository and the planning files already prepared for this project.

## Scope  
This prompt is for the first build block only. Later phases should use separate execution prompts.  
