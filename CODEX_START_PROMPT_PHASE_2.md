# CODEX_START_PROMPT_PHASE_2.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to implement the next execution block after the documentation foundation and first schema pass.

## Immediate objectives
1. Align canonical status enums and terminology between docs and SQL where they drift.
2. Complete the database foundation for events, policies, logging, views, and seeds.
3. Add implementation-oriented contracts for intake, rules, and order-routing automation.
4. Create a minimal backend skeleton organized around supplier intake, rules evaluation, and order routing.

## Scope of this prompt
This prompt covers:
- schema alignment corrections
- `db/schema` continuation
- `db/views` creation
- `db/seeds` creation
- `automation/contracts` creation
- `app/backend` skeleton creation

Do **not** implement full business logic, live external integrations, or UI dashboards yet.

---

## Non-negotiable rules
1. Treat the repository as the primary source of truth.
2. Read the relevant canonical docs before changing code or schema.
3. Prefer explicit, readable structure over abstraction-heavy design.
4. Keep naming consistent with canonical docs unless you are intentionally aligning drift.
5. If docs and code disagree, align them conservatively and document the assumption.
6. Do not invent supplier-specific behavior beyond generic contracts.
7. Keep backend skeleton minimal and modular.
8. Add comments where they materially improve maintainability.

---

## Required reading before implementation
Read and align with at least these files:
- `START_HERE.md`
- `ARTIFACT_REGISTRY.md`
- `IMPLEMENTATION_PHASES.md`
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `SUPPLIER_INTAKE_SPEC.md`
- `NORMALIZATION_RULES.md`
- `MARGIN_CALCULATION_SPEC.md`
- `PRODUCT_RULES_ENGINE.md`
- `QUALIFICATION_WORKFLOW.md`
- `ORDER_AUTOMATION_SPEC.md`
- `SUPPLIER_ORDER_CONTRACT.md`
- `ESCALATION_RULES.md`
- `SYNC_ENGINE_SPEC.md`
- `LISTING_VALIDATION_SPEC.md`
- `CHANNEL_CONSTRAINTS.md`
- `N8N_WORKFLOW_MAP.md`
- `ACCEPTANCE_CHECKLIST.md`

---

## Block A — Canonical status alignment
Review the current SQL schema and align it with the canonical documentation.

### Required alignment checks
- `products_normalized.normalization_status`
- listing-related statuses
- order statuses
- validation statuses
- exception statuses where present

### Known likely drift to inspect
Current SQL may still use older values such as:
- `pending`
- `failed`
- `partial`

Where docs now expect more canonical states such as:
- `normalized`
- `normalized_with_warnings`
- `review_required`
- `invalid`

### Deliverable
- align enums/check constraints conservatively
- preserve data-model clarity
- add a short note in `PROJECT_CHANGELOG.md` if canonical status drift was corrected

---

## Block B — Complete database schema files
Create or complete these files:
- `db/schema/002_event_tables.sql`
- `db/schema/003_policy_tables.sql`
- `db/schema/004_logging_tables.sql`

### Expected event/log/policy tables
At minimum, implement and/or complete:
- `product_rule_decisions`
- `product_ai_decisions`
- `pricing_history`
- `stock_history`
- `order_events`
- `customer_messages`
- `support_responses`
- `exceptions`
- `policies`
- `prompts`
- `audit_logs`

### SQL rules
- PostgreSQL / Supabase compatible
- use `uuid` primary keys with sensible defaults
- use `jsonb` for flexible payloads
- define foreign keys where useful
- define check constraints for status fields when the canonical enum is known
- use timestamps consistently

---

## Block C — Add operational views
Create these files if missing:
- `db/views/margin_monitoring.sql`
- `db/views/exception_queue.sql`
- `db/views/supplier_health.sql`

### View goals
- `margin_monitoring.sql`: operator visibility into risky listings/products and margin thresholds
- `exception_queue.sql`: unified actionable queue ordered by severity and freshness
- `supplier_health.sql`: import health, freshness, reliability, and basic supplier quality metrics

Keep views readable and implementation-safe. No over-engineering.

---

## Block D — Add initial seeds
Create these files if missing:
- `db/seeds/policy_defaults.sql`
- `db/seeds/category_allowlist.sql`
- `db/seeds/escalation_defaults.sql`

### Seed goals
- initialize minimum policy scaffolding
- provide editable defaults rather than hardcoded runtime assumptions
- reflect current canonical docs, not speculative marketplace-specific details

Suggested seed categories:
- minimum margin thresholds
- review warning bands
- pause thresholds
- default severity routing assumptions
- starter allowed categories for v1 if documented conservatively

---

## Block E — Create automation contracts
Create a new folder structure if missing:
- `automation/contracts/`

Then add these files:
- `automation/contracts/supplier_intake_contract.md`
- `automation/contracts/qualification_contract.md`
- `automation/contracts/order_routing_contract.md`

### Contract expectations
Each contract should include:
- purpose
- triggering event
- required inputs
- expected outputs
- terminal states
- exception triggers
- logging expectations

These are implementation-facing documents, not marketing docs.

---

## Block F — Minimal backend skeleton
Create a minimal backend scaffold under:
- `app/backend/`

Suggested structure:
- `app/backend/README.md`
- `app/backend/src/`
- `app/backend/src/modules/supplier-intake/`
- `app/backend/src/modules/rules-engine/`
- `app/backend/src/modules/order-routing/`
- `app/backend/src/shared/`

### Minimum files to add
- `app/backend/README.md`
- `app/backend/src/index.ts`
- `app/backend/src/modules/supplier-intake/README.md`
- `app/backend/src/modules/rules-engine/README.md`
- `app/backend/src/modules/order-routing/README.md`
- `app/backend/src/shared/README.md`

### Backend skeleton goals
- establish module boundaries
- reflect canonical architecture layers
- avoid fake implementation depth
- be ready for later service/repository/contract code

If language/tooling assumptions must be made, prefer a light TypeScript-oriented structure, but do not scaffold a full framework unless already present in repo.

---

## Output expectations
At the end, provide:
1. list of created files
2. list of updated files
3. summary of enum/status alignments made
4. summary of tables/views/seeds added
5. any assumptions or open questions

---

## Definition of done
This block is complete only if:
- schema drift is corrected where clearly needed
- remaining core schema files exist and are coherent
- views exist for margin, exceptions, and supplier health
- starter seed files exist
- automation contract files exist
- backend skeleton exists and matches repo canon
- changelog is updated if canonical alignment changed

---

## Scope guard
Do not yet implement:
- real supplier adapters
- live BaseLinker integration
- actual OpenAI runtime integration
- full n8n workflow exports
- operator UI
- background job scheduler details

Build only the next stable implementation foundation.
```
