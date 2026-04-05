# CODEX_START_PROMPT_PHASE_5_NORMALIZATION_AND_PIPELINES.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to implement Phase 5: normalization flow wiring, qualification pipeline orchestration, and first durable handoff between supplier intake, rules evaluation, and qualification.

## Phase 5 objectives
1. Add a normalization runtime layer that converts raw supplier records into canonical normalized product records.
2. Connect supplier intake outputs to normalization-ready processing.
3. Add orchestration for product qualification pipeline:
   - intake output
   - normalization
   - rules evaluation
   - qualification result
4. Persist normalized products where appropriate.
5. Keep the implementation modular and explicitly staged.

This phase is about turning isolated runtime modules into the first real product pipeline.

---

## Non-negotiable rules
1. Follow documented field names and canonical concepts from the repository docs.
2. Do not invent undocumented normalization outputs.
3. Preserve the separation between raw data, normalized data, and generated content.
4. Do not collapse rules evaluation and qualification into a single opaque blob.
5. All pipeline transitions should remain auditable.
6. Use explicit pipeline result objects and orchestration steps.
7. Keep supplier-specific parsing details out of canonical normalization logic.

---

## Required reading before implementation
Read and align with:
- `START_HERE.md`
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `SUPPLIER_INTAKE_SPEC.md`
- `NORMALIZATION_RULES.md`
- `PRODUCT_RULES_ENGINE.md`
- `MARGIN_CALCULATION_SPEC.md`
- `QUALIFICATION_WORKFLOW.md`
- `ACCEPTANCE_CHECKLIST.md`
- current runtime code in:
  - `app/backend/src/modules/supplier-intake/**`
  - `app/backend/src/modules/rules-engine/**`
  - `app/backend/src/modules/qualification/**`
  - `app/backend/src/shared/**`
  - repository/persistence code added in Phase 4

---

## Phase 5 scope
This prompt covers:
- normalization runtime module
- normalized product persistence contract
- product pipeline orchestration service
- durable handoff from import records to normalized products to qualification outputs
- first pipeline-focused application wiring

Do **not** implement:
- AI selection runtime
- listing generation runtime
- BaseLinker publication
- sync engine runtime
- support runtime expansion beyond current scope
- advanced supplier adapters

---

## Block A — Normalization runtime module
Create module under:
- `app/backend/src/modules/normalization/`

Suggested structure:
- `contracts/`
- `services/`
- `types/`
- `repositories/`
- `index.ts`

### Minimum files
- `contracts/normalization-input.contract.ts`
- `contracts/normalization-output.contract.ts`
- `types/normalization-status.ts`
- `services/normalization.service.ts`
- `services/field-normalizer.service.ts`
- `repositories/normalized-product.repository.ts`
- `repositories/normalized-product.mapper.ts`
- `index.ts`

### Expectations
- normalize known fields into canonical structure
- identify required-field gaps explicitly
- preserve raw reference linkage
- return typed statuses such as completed / partial / review_required / failed only if aligned with docs
- prepare output suitable for rules engine input

Do not invent product enrichment here.

---

## Block B — Normalization rules mapping
Translate the doc-level normalization rules into runtime mapping logic.

### Expectations
- centralize field mapping rules in one place
- keep transformations deterministic and explainable
- clearly mark values derived from raw input vs directly copied
- preserve source references and identifiers

If useful, add:
- `app/backend/src/modules/normalization/normalization-rules.ts`

---

## Block C — Persistence for normalized products
Add persistence support for normalized product records.

### Expectations
- align with `products_normalized` table shape
- define repository write contract clearly
- include mapping from normalization output to persistence DTO
- preserve linkage to supplier/raw/import references

Do not pretend versioned historical normalization is complete unless actually implemented.

---

## Block D — Qualification pipeline orchestration
Create a pipeline/orchestration module under something like:
- `app/backend/src/modules/product-pipeline/`

Suggested structure:
- `contracts/`
- `services/`
- `index.ts`

### Minimum files
- `contracts/product-pipeline-input.contract.ts`
- `contracts/product-pipeline-output.contract.ts`
- `services/product-pipeline.service.ts`
- `index.ts`

### Expectations
Pipeline should explicitly stage:
1. supplier intake result or selected raw record
2. normalization
3. rules evaluation
4. qualification result
5. persistence of durable outputs where available

### Critical requirement
The orchestration layer must not hide which stage failed.
Return stage-aware results and recommended next steps.

---

## Block E — Event and exception alignment
Update event emission and exception creation where needed so the new pipeline remains coherent.

### Expectations
- emit stage-accurate events
- create exceptions only when appropriate
- avoid fake success transitions
- keep blocked/review/improve paths explicit

---

## Block F — Runtime composition wiring
Update runtime composition so normalization and pipeline modules are discoverable and usable.

Potential files:
- `app/backend/src/modules/index.ts`
- `app/backend/src/index.ts`
- `app/backend/src/app.ts`

If a minimal test route is helpful, keep it clearly marked as internal/dev-only and narrow in scope.

---

## Block G — Docs and notes
Update:
- `app/backend/README.md`
- `PROJECT_CHANGELOG.md`

Document:
- what is now durable
- what the pipeline covers
- what remains scaffold-only
- what Phase 6 is expected to do next

---

## Output expectations
At the end, provide:
1. list of created files
2. list of modified files
3. summary of normalization runtime added
4. summary of persistence added
5. summary of pipeline orchestration added
6. assumptions or open gaps

---

## Definition of done
This phase is complete only if:
- normalization module exists and is coherent
- normalized product persistence exists in first usable form
- product pipeline orchestration exists
- stage-aware outcomes remain explicit
- code remains aligned with documentation and state model
- docs/changelog are updated

---

## Scope guard
Do not yet implement:
- listing runtime generation
- AI-driven product selection runtime
- channel publication
- sync engine runtime
- full production queueing
- worker processes

Build the first real product pipeline only.
```
