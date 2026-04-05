# CODEX_START_PROMPT_PHASE_6_LISTING_AND_PUBLICATION_FOUNDATION.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to implement Phase 6: listing generation foundation, validation, and publication-ready contracts on top of the product pipeline.

## Phase 6 objectives
1. Add a listing runtime module that turns qualified products into structured listing payloads.
2. Add listing validation logic before publication.
3. Add publication contracts and placeholders for channel publication.
4. Persist listing drafts / generation outputs where appropriate.
5. Keep AI-facing and channel-facing concerns separate.

This phase is about preparing safe, structured listing output — not full production marketplace integration.

---

## Non-negotiable rules
1. Use source-grounded product data only.
2. Do not invent technical claims, compatibility, or certifications.
3. Keep listing generation separate from publication and separate from rules engine.
4. Validation must happen before publication readiness.
5. Preserve explicit status transitions for draft / validation / publication readiness.
6. Keep channel-specific constraints modular.

---

## Required reading before implementation
Read and align with:
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `LISTING_FACTORY_SPEC.md`
- `LISTING_WORKFLOW.md`
- `CHANNEL_CONSTRAINTS.md` if present
- `PRODUCT_RULES_ENGINE.md`
- `QUALIFICATION_WORKFLOW.md`
- `ACCEPTANCE_CHECKLIST.md`
- relevant runtime code from Phases 3–5

---

## Phase 6 scope
This prompt covers:
- listing generation module
- listing validation module or service
- listing persistence contract
- publication contract placeholders
- composition updates needed for listing runtime

Do **not** implement:
- real OpenAI listing generation calls unless already minimally scaffolded and clearly bounded
- full BaseLinker integration
- sync engine runtime
- dynamic repricing engine
- support automation expansion

---

## Block A — Listing runtime module
Create module under:
- `app/backend/src/modules/listing-factory/`

Suggested structure:
- `contracts/`
- `services/`
- `types/`
- `repositories/`
- `index.ts`

### Minimum files
- `contracts/listing-generation-input.contract.ts`
- `contracts/listing-generation-output.contract.ts`
- `types/listing-generation-status.ts`
- `services/listing-factory.service.ts`
- `services/title-builder.service.ts`
- `services/description-builder.service.ts`
- `repositories/listing.repository.ts`
- `repositories/listing.mapper.ts`
- `index.ts`

### Expectations
- take only eligible/qualified product data as input
- generate deterministic scaffold content where AI is not yet wired
- keep a clear boundary for future AI enhancement
- produce channel-ready structural outputs, not fake marketplace calls

---

## Block B — Listing validation layer
Create validation support under either the same module or a dedicated one.

### Minimum files
- `services/listing-validation.service.ts`
- `contracts/listing-validation-output.contract.ts`
- optional `types/listing-validation-status.ts`

### Expectations
- validate title presence and constraints
- validate structured attributes presence where possible
- validate absence of unsupported placeholders or empty content
- validate publication readiness status
- preserve warnings vs blocking failures

---

## Block C — Publication contracts
Create publication-facing contracts without implementing full integration.

Suggested area:
- `app/backend/src/modules/publication/`

### Minimum files
- `contracts/publication-input.contract.ts`
- `contracts/publication-output.contract.ts`
- `contracts/channel-publication-payload.contract.ts`
- `services/publication-orchestrator.service.ts`
- `index.ts`

### Expectations
- represent publication as a distinct stage after validation
- avoid fake success semantics
- keep external adapter boundary explicit
- do not implement full BaseLinker client unless trivially placeholder-only

---

## Block D — Listing persistence
Add persistence contracts and mapping for:
- `listings`
- `listing_validations`

### Expectations
- align with `DATA_MODEL.md`
- persist generated title/description/attributes/SEO payloads where appropriate
- persist validation results separately from listing draft if useful
- do not blur listing draft vs published listing state

---

## Block E — Pipeline extension
Extend the existing product pipeline to optionally continue from qualification into listing generation and validation.

### Expectations
- stage-aware output remains explicit
- qualification success should not imply publication success
- listing generation and validation should expose distinct recommended next steps

---

## Block F — Docs and notes
Update:
- `app/backend/README.md`
- `PROJECT_CHANGELOG.md`

Document:
- what listing generation currently does
- whether output is deterministic scaffold vs AI-enhanced
- what publication still does not implement
- what Phase 7 is expected to cover next

---

## Output expectations
At the end, provide:
1. list of created files
2. list of modified files
3. summary of listing runtime added
4. summary of validation added
5. summary of publication contracts added
6. assumptions or open gaps

---

## Definition of done
This phase is complete only if:
- listing runtime exists in coherent first form
- listing validation exists
- listing persistence exists in first usable form
- publication is represented as a separate stage
- state transitions remain semantically correct
- docs/changelog are updated

---

## Scope guard
Do not yet implement:
- full AI generation pipeline in production form
- actual BaseLinker publishing
- sync engine runtime
- repricing logic
- background workers

Build the listing and publication foundation only.
```
