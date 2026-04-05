# CODEX_START_PROMPT_PHASE_7_SYNC_SUPPORT_AND_CONTROL_TOWER.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to implement Phase 7: sync foundation, controlled support runtime, and control-tower visibility foundation.

## Phase 7 objectives
1. Add the first sync runtime foundation for price/stock safety.
2. Add controlled support classification/response scaffolding aligned to support policy.
3. Add control tower runtime/read-model foundation for exceptions and operational visibility.
4. Keep every risky action bounded by documented guardrails.

This phase is about operational safety and visibility, not full production automation depth.

---

## Non-negotiable rules
1. Sync must never imply publication or fulfillment success by default.
2. Unknown stock/cost states must be treated conservatively.
3. Support automation must remain low-risk and policy-bound.
4. Control tower should surface reality, not hide uncertainty.
5. Preserve explicit exception paths and operator review paths.

---

## Required reading before implementation
Read and align with:
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `SYNC_ENGINE_SPEC.md`
- `SYNC_WORKFLOW.md`
- `CUSTOMER_SUPPORT_POLICY.md`
- `SUPPORT_WORKFLOW.md`
- `CONTROL_TOWER_DASHBOARD.md`
- `TEST_CASES.md`
- `INCIDENT_PLAYBOOK.md`
- current runtime code from previous phases

---

## Phase 7 scope
This prompt covers:
- sync engine runtime foundation
- support classification/response runtime foundation
- control tower read models / services / summary helpers
- exception-centric visibility wiring

Do **not** implement:
- full live marketplace syncing clients
- full AI support production integration
- advanced BI dashboards
- external notification fanout beyond minimal internal wiring

---

## Block A — Sync runtime module
Create module under:
- `app/backend/src/modules/sync-engine/`

Suggested structure:
- `contracts/`
- `services/`
- `types/`
- `repositories/`
- `index.ts`

### Minimum files
- `contracts/sync-input.contract.ts`
- `contracts/sync-output.contract.ts`
- `types/sync-status.ts`
- `services/sync-engine.service.ts`
- `services/repricing-evaluation.service.ts`
- `repositories/stock-history.repository.ts`
- `repositories/pricing-history.repository.ts`
- `index.ts`

### Expectations
- evaluate supplier state vs listing state
- preserve conservative outcomes for missing/unsafe data
- keep repricing and stock visibility explicit
- do not perform real marketplace updates unless trivially placeholder-only

---

## Block B — Support runtime foundation
Create or extend module under:
- `app/backend/src/modules/support/`

Suggested structure:
- `contracts/`
- `services/`
- `types/`
- `repositories/`
- `index.ts`

### Minimum files
- `contracts/support-classification-input.contract.ts`
- `contracts/support-classification-output.contract.ts`
- `contracts/support-response-input.contract.ts`
- `contracts/support-response-output.contract.ts`
- `types/support-status.ts`
- `services/support-classification.service.ts`
- `services/support-response.service.ts`
- `repositories/customer-message.repository.ts`
- `repositories/support-response.repository.ts`
- `index.ts`

### Expectations
- align tightly with `CUSTOMER_SUPPORT_POLICY.md`
- keep automation low-risk and explicit
- preserve escalation-first behavior for risky classes
- use deterministic or placeholder-safe behavior where AI is not yet fully wired

---

## Block C — Control tower foundation
Create module under:
- `app/backend/src/modules/control-tower/`

Suggested structure:
- `contracts/`
- `services/`
- `repositories/`
- `index.ts`

### Minimum files
- `contracts/control-tower-summary.contract.ts`
- `services/control-tower.service.ts`
- `repositories/exception-queue.repository.ts`
- `repositories/runtime-health.repository.ts`
- `index.ts`

### Expectations
- surface exception backlog
- surface workflow/runtime health in first usable form
- aggregate key operational signals without pretending to be a full dashboard
- preserve clear distinction between persisted facts and computed summaries

---

## Block D — Composition and exposure
Wire sync/support/control-tower modules into runtime composition.

Potential files:
- `app/backend/src/modules/index.ts`
- `app/backend/src/index.ts`
- `app/backend/src/app.ts`

If adding routes, keep them narrow and clearly internal/dev-focused.

---

## Block E — Docs and notes
Update:
- `app/backend/README.md`
- `PROJECT_CHANGELOG.md`

Document:
- what sync currently evaluates
- what support currently classifies/responds to
- what control tower currently exposes
- what still remains non-production or placeholder-only

---

## Output expectations
At the end, provide:
1. list of created files
2. list of modified files
3. summary of sync runtime added
4. summary of support runtime added
5. summary of control-tower foundation added
6. assumptions or open gaps

---

## Definition of done
This phase is complete only if:
- sync foundation exists and is conservative
- support runtime exists in policy-aligned first form
- control tower runtime foundation exists
- exception visibility remains explicit
- docs/changelog are updated

---

## Scope guard
Do not yet implement:
- full marketplace sync adapters
- production AI support automation
- complete dashboard UI
- notification mesh
- advanced analytics platform

Build the operational safety and visibility foundation only.
```
