# CODEX_START_PROMPT_PHASE_4_PERSISTENCE_AND_POLICY_LOADING.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to implement Phase 4: persistence, policy loading, and repository-layer wiring for the runtime modules that already exist.

## Phase 4 objectives
1. Load runtime policy from persistent storage instead of relying only on in-memory defaults.
2. Persist product rule decisions into the database.
3. Persist raised exceptions into the database.
4. Add repository-layer contracts and first concrete implementations for core runtime modules.
5. Keep the architecture modular, explicit, and aligned with the canonical docs.

This phase is about making runtime decisions durable and traceable.

---

## Non-negotiable rules
1. Follow the documented source of truth from repository docs.
2. Do not invent undocumented business rules or persistence states.
3. Prefer small repository interfaces and clear DTO mapping.
4. Preserve current scaffold simplicity; do not over-engineer a framework-heavy data layer.
5. Every persisted write relevant to business state should remain auditable.
6. Do not implement full production auth, job orchestration, or supplier-specific adapters in this phase.
7. Do not break existing runtime module public contracts unless necessary for correctness.

---

## Required reading before implementation
Read and align with at least these files:
- `START_HERE.md`
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `PRODUCT_RULES_ENGINE.md`
- `ORDER_AUTOMATION_SPEC.md`
- `CUSTOMER_SUPPORT_POLICY.md`
- `SUPPLIER_INTAKE_SPEC.md`
- `QUALIFICATION_WORKFLOW.md`
- `ORDER_ROUTING_WORKFLOW.md`
- `SUPPLIER_ORDER_CONTRACT.md`
- `ACCEPTANCE_CHECKLIST.md`
- SQL files in `db/schema/`
- SQL files in `db/views/`
- SQL files in `db/seeds/`

Also read the current runtime code before changing it:
- `app/backend/src/modules/rules-engine/**`
- `app/backend/src/modules/qualification/**`
- `app/backend/src/modules/order-routing/**`
- `app/backend/src/modules/supplier-intake/**`
- `app/backend/src/shared/**`

---

## Phase 4 scope
This prompt covers:
- repository contracts
- persistence DTO mapping
- policy loading service
- persistence wiring into rules engine and exception creation
- durable write paths for rule decisions and exceptions
- small runtime correctness fixes discovered during review

Do **not** implement:
- full support persistence
- real supplier API clients
- actual BaseLinker integration
- job scheduler
- worker queues
- authentication/authorization layer
- full HTTP API expansion beyond what is necessary

---

## Required correctness fixes to include in this phase
Before or during persistence work, include these cleanup fixes:

### Fix A — Order routing orphan statuses
Review `order-routing-status.ts` and `order-routing.service.ts`.
Either:
- remove statuses that are never returned, or
- make them part of a real and documented state model.

The final runtime and docs must not drift semantically.

### Fix B — Qualification event naming
In `qualification.service.ts`, avoid emitting a misleading `rules_decision_created` event when the service is only consuming an already existing rule decision.
Use a more accurate event name or conditional event emission.

### Fix C — Rules route request validation hardening
Strengthen request validation for `/v1/rules/evaluate`.
Prefer an explicit validation layer/schema over silent field dropping where reasonable.
Do not break the existing route shape unless necessary.

---

## Block A — Shared persistence foundation
Create or complete shared persistence utilities under a new area such as:
- `app/backend/src/shared/persistence/`

Suggested files:
- `app/backend/src/shared/persistence/database-client.ts`
- `app/backend/src/shared/persistence/persistence-error.ts`
- `app/backend/src/shared/persistence/timestamp.ts`

### Expectations
- define a small DB client abstraction suitable for Supabase/Postgres-backed work
- keep it simple enough to swap implementation later
- centralize low-level persistence errors and mapping
- do not introduce heavy ORM complexity unless already present and clearly justified

---

## Block B — Policy loading layer
Create a policy-loading module under something like:
- `app/backend/src/modules/policy-loader/`

Suggested structure:
- `contracts/`
- `services/`
- `index.ts`

### Minimum files
- `contracts/policy-record.contract.ts`
- `contracts/policy-loader.contract.ts`
- `services/policy-loader.service.ts`
- `index.ts`

### Expectations
- load policies by policy name / type / active version intent
- support loading rules policy defaults from persistent storage
- define safe fallback behavior when policy records are missing
- make fallback explicit and loggable
- do not silently mutate policy data

### Required target
The rules engine should be able to receive policy values from a dedicated loader flow, not only from hardcoded defaults.

---

## Block C — Repository layer for rule decisions
Create persistence contracts and implementation for `product_rule_decisions`.

Suggested area:
- `app/backend/src/modules/rules-engine/repositories/`

### Minimum files
- `repositories/product-rule-decision.repository.ts`
- `repositories/product-rule-decision.mapper.ts`

### Expectations
- define repository interface for writing rule decisions
- define explicit DTO mapping from runtime output to DB shape
- persist:
  - product_id
  - rules_version
  - policy_version
  - decision_status
  - reason_codes_json
  - projected margins
  - risk flags
  - recommended next step
  - decided_at

### Wiring requirement
Add an application path where rule evaluation can optionally persist the resulting decision.
This may be:
- a dedicated orchestration/service wrapper, or
- an optional repository injected into the service layer.

Do not hide persistence behind surprising side effects.

---

## Block D — Repository layer for exceptions
Create persistence contracts and implementation for `exceptions`.

Suggested area:
- `app/backend/src/shared/exceptions/`
or
- `app/backend/src/modules/exceptions/`

### Minimum files
- repository contract
- repository implementation
- mapper if needed

### Expectations
- `ExceptionService.createException()` should be able to persist durable exception records
- exception record should align with documented fields and severity model
- persistence should preserve:
  - entity_type
  - entity_id
  - exception_category or domain
  - severity
  - summary
  - details
  - status
  - created_at

### Wiring requirement
Replace pure no-op behavior in the path intended for real application wiring, while keeping test-safe noop options available.

---

## Block E — Repository scaffolding for supplier intake and order routing
Add first repository contracts for runtime durability, even if write coverage remains partial.

Suggested files:
- `app/backend/src/modules/supplier-intake/repositories/supplier-import.repository.ts`
- `app/backend/src/modules/order-routing/repositories/order-routing.repository.ts`

### Expectations
- create interfaces and minimal implementations/stubs where needed
- define what should eventually be persisted vs what remains runtime-only for now
- do not pretend full workflow durability already exists if it does not

Focus on clear future-safe contracts.

---

## Block F — Runtime composition wiring
Update runtime composition so real services can be assembled coherently.

Potential targets:
- `app/backend/src/modules/index.ts`
- `app/backend/src/index.ts`
- `app/backend/src/app.ts`

### Expectations
- add clean assembly for policy loader, exception persistence, and rule decision persistence
- keep composition explicit
- avoid hardcoding production-only dependencies if environment/config is incomplete

---

## Block G — README / changelog / implementation notes
Update supporting docs after code changes.

Required updates:
- `app/backend/README.md`
- `PROJECT_CHANGELOG.md`

Include:
- what now persists
- what still remains scaffold-only
- what fallbacks still exist
- what phase is expected next

---

## Suggested file structure additions
You may use a structure similar to:

- `app/backend/src/shared/persistence/`
- `app/backend/src/modules/policy-loader/`
- `app/backend/src/modules/rules-engine/repositories/`
- `app/backend/src/modules/order-routing/repositories/`
- `app/backend/src/modules/supplier-intake/repositories/`

If the existing codebase suggests a slightly different but still clean structure, keep it consistent and explain the choice.

---

## Output expectations
At the end, provide:
1. list of created files
2. list of modified files
3. summary of persistence added
4. summary of policy loading added
5. summary of cleanup fixes completed
6. any assumptions or open gaps

---

## Definition of done
This phase is complete only if:
- policy loading exists as a real runtime concern
- rule decisions can be persisted durably
- exceptions can be persisted durably
- repository contracts exist for next-stage runtime durability
- review cleanup fixes are addressed
- updated code remains aligned with docs and state naming
- README/changelog are updated

---

## Scope guard
Do not yet implement:
- supplier-specific network adapters
- full workflow persistence for every domain event
- full qualification persistence store
- support-case persistence system
- UI dashboards
- full sync engine runtime
- production deployment concerns

Build the persistence and policy-loading layer only.
```
