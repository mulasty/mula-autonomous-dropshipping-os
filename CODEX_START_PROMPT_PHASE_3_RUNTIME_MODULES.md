# CODEX_START_PROMPT_PHASE_3_RUNTIME_MODULES.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to implement the first real runtime module layer on top of the already-established documentation, schema foundation, and backend skeleton.

## Immediate objectives
1. Implement runtime-oriented module scaffolding and internal contracts for:
   - supplier intake
   - rules engine
   - qualification
   - order routing
2. Add shared runtime primitives for:
   - configuration access
   - logging interfaces
   - exception creation hooks
   - status/result typing
3. Keep the implementation modular, minimal, and aligned with the canonical docs.

## Scope of this prompt
This prompt covers:
- runtime module structure under `app/backend/src/`
- TypeScript interfaces/types/contracts
- service skeletons
- orchestration skeletons
- shared helpers and result patterns

Do **not** implement full external integrations, production business logic depth, or framework-heavy infrastructure yet.

---

## Non-negotiable rules
1. Treat the repository docs as canonical before writing code.
2. Do not invent business rules beyond what is documented.
3. Prefer explicit interfaces and typed results over implicit patterns.
4. Keep runtime modules small, readable, and composable.
5. Implement safe placeholders where logic is not yet finalized.
6. Every state-changing or risk-relevant path should have a place for logging and exception creation.
7. Do not hardcode supplier-specific behavior.
8. Avoid hidden magic and premature abstractions.

---

## Required reading before implementation
Read and align with at least these files:
- `START_HERE.md`
- `ARTIFACT_REGISTRY.md`
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
- `LISTING_WORKFLOW.md`
- `SYNC_WORKFLOW.md`
- `ORDER_ROUTING_WORKFLOW.md`
- `SUPPORT_WORKFLOW.md`
- `ACCEPTANCE_CHECKLIST.md`

---

## Block A — Shared runtime foundation
Create or complete shared runtime files under:
- `app/backend/src/shared/`

Suggested structure:
- `app/backend/src/shared/types/`
- `app/backend/src/shared/contracts/`
- `app/backend/src/shared/logging/`
- `app/backend/src/shared/exceptions/`
- `app/backend/src/shared/config/`
- `app/backend/src/shared/results/`

### Minimum files to create
- `app/backend/src/shared/types/status-types.ts`
- `app/backend/src/shared/results/result.ts`
- `app/backend/src/shared/exceptions/exception-service.ts`
- `app/backend/src/shared/logging/logger.ts`
- `app/backend/src/shared/config/runtime-config.ts`
- `app/backend/src/shared/contracts/domain-event.ts`

### Expectations
- define typed result pattern for success/failure/review/escalation-capable operations
- define lightweight logger interface
- define lightweight exception service interface
- define runtime config contract without hardcoding secrets
- define reusable domain event shape

---

## Block B — Supplier intake runtime module
Implement module skeleton under:
- `app/backend/src/modules/supplier-intake/`

Suggested structure:
- `contracts/`
- `services/`
- `types/`
- `index.ts`

### Minimum files
- `contracts/supplier-source.contract.ts`
- `contracts/raw-import-record.contract.ts`
- `types/intake-status.ts`
- `services/supplier-intake.service.ts`
- `services/raw-payload-persister.service.ts`
- `index.ts`

### Expectations
- define supplier intake input/output contracts
- define a service skeleton for intake orchestration
- define raw payload persistence contract
- include placeholders for fetch, parse, persist, and prevalidation steps
- return typed outcomes instead of ad hoc objects

Do not implement real XML/CSV/API parsing depth yet unless already trivial.

---

## Block C — Rules engine runtime module
Implement module skeleton under:
- `app/backend/src/modules/rules-engine/`

Suggested structure:
- `contracts/`
- `services/`
- `types/`
- `index.ts`

### Minimum files
- `contracts/rule-evaluation-input.contract.ts`
- `contracts/rule-evaluation-output.contract.ts`
- `types/rule-decision-status.ts`
- `types/reason-code.ts`
- `services/margin-calculation.service.ts`
- `services/product-rules-engine.service.ts`
- `index.ts`

### Expectations
- encode canonical decision statuses
- provide typed reason code arrays
- create service skeleton for margin calculation
- create service skeleton for deterministic rules evaluation
- keep implementation conservative and aligned with documented formulas and rule groups

Do not add AI behavior here.

---

## Block D — Qualification runtime module
Implement module skeleton under:
- `app/backend/src/modules/qualification/`

Suggested structure:
- `contracts/`
- `services/`
- `types/`
- `index.ts`

### Minimum files
- `contracts/qualification-input.contract.ts`
- `contracts/qualification-output.contract.ts`
- `types/qualification-status.ts`
- `services/qualification.service.ts`
- `index.ts`

### Expectations
- represent blocked/rejected/review_required/improve_required/approved paths explicitly
- preserve distinction between deterministic rules and optional downstream AI review
- include placeholders for exception creation and audit logging hooks

---

## Block E — Order routing runtime module
Implement module skeleton under:
- `app/backend/src/modules/order-routing/`

Suggested structure:
- `contracts/`
- `services/`
- `types/`
- `index.ts`

### Minimum files
- `contracts/order-routing-input.contract.ts`
- `contracts/order-routing-output.contract.ts`
- `contracts/supplier-order-payload.contract.ts`
- `types/order-routing-status.ts`
- `services/order-routing.service.ts`
- `services/supplier-submission.service.ts`
- `index.ts`

### Expectations
- reflect canonical acknowledgement states
- preserve ambiguity/timeout/rejection as explicit outcomes
- avoid fake success paths
- include idempotency awareness in contract comments and types

Do not implement real supplier API clients yet.

---

## Block F — Module composition and entry wiring
Update minimal composition so backend modules are discoverable.

### Suggested files
- `app/backend/src/modules/index.ts`
- update `app/backend/src/index.ts`

### Expectations
- export modules cleanly
- avoid framework lock-in
- keep runtime entry minimal
- document what is implemented vs placeholder

---

## Coding expectations
- use TypeScript
- prefer type aliases/interfaces for contracts
- use small classes or plain services only where useful
- no heavy DI framework yet
- no web server requirement unless already present and trivial
- comments should explain intent, not repeat code blindly

---

## Output expectations
At the end, provide:
1. list of created runtime files
2. list of updated files
3. summary of shared runtime primitives added
4. summary of module skeletons added
5. any assumptions or open questions

---

## Definition of done
This block is complete only if:
- shared runtime contracts exist
- supplier intake runtime skeleton exists
- rules engine runtime skeleton exists
- qualification runtime skeleton exists
- order routing runtime skeleton exists
- module exports are coherent
- code structure matches repository canon
- no module pretends to be production-complete when it is scaffold-only

---

## Scope guard
Do not yet implement:
- real supplier adapter logic
- real database repositories for every module
- actual AI runtime calls
- actual BaseLinker integration
- production job runner
- production HTTP API surface unless already present and minimal

Build only the first stable runtime module layer.
```
