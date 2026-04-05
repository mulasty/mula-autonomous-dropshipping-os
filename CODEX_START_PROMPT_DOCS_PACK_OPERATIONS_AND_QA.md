# CODEX_START_PROMPT_DOCS_PACK_OPERATIONS_AND_QA.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to complete the next documentation pack focused on operations, exception handling, daily use, and QA support.

## Objective
Create and populate the remaining core operational and quality-assurance documentation files that support real system use after runtime modules begin to stabilize.

This pack is documentation-only.

## Files to create
Create and fully populate these files:

1. `docs/operations/SOP_EXCEPTIONS_QUEUE.md`
2. `docs/operations/SOP_DAILY_OPERATIONS.md`
3. `docs/operations/SOP_LISTING_REVIEW.md`
4. `docs/operations/SOP_SUPPLIER_QUALITY_CONTROL.md`
5. `qa/TEST_CASES.md`
6. `qa/ACCEPTANCE_CHECKLIST.md`

## Non-negotiable rules
1. Follow existing repo terminology exactly.
2. Align with canonical states, severity levels, and escalation rules from current docs.
3. Keep documents operational, concise, and implementation-friendly.
4. Do not invent undocumented business policies.
5. Do not modify runtime code in this pack.
6. Preserve distinction between operator review, exception escalation, blocked states, and ordinary backlog.

## Required reading before writing
Read and align with at least these files:
- `START_HERE.md`
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `CONTROL_TOWER_DASHBOARD.md`
- `ESCALATION_RULES.md`
- `SUPPLIER_INTAKE_SPEC.md`
- `PRODUCT_RULES_ENGINE.md`
- `ORDER_AUTOMATION_SPEC.md`
- `CUSTOMER_SUPPORT_POLICY.md`
- `SYNC_ENGINE_SPEC.md`
- `SUPPORT_WORKFLOW.md` if present
- `SYNC_WORKFLOW.md` if present
- `ORDER_ROUTING_WORKFLOW.md` if present
- `LISTING_WORKFLOW.md` if present
- current runtime code where relevant for state naming consistency

## File expectations

### 1. SOP_EXCEPTIONS_QUEUE.md
Must define:
- purpose of the exceptions queue
- exception severity handling
- triage order
- acknowledgement process
- in-review process
- resolution/closure rules
- when to escalate further vs when to resolve locally
- operator notes expectations

### 2. SOP_DAILY_OPERATIONS.md
Must define:
- daily review routine
- control tower review sequence
- import/normalization/rules/order/support/sync checks
- what counts as blocking issue vs follow-up issue
- end-of-day status expectations

### 3. SOP_LISTING_REVIEW.md
Must define:
- how operator reviews improve_required and review_required listing candidates
- content quality checks
- policy/claim checks
- readiness vs rejection criteria
- what to send back to enrichment vs what to stop

### 4. SOP_SUPPLIER_QUALITY_CONTROL.md
Must define:
- supplier quality signals to review
- import failure pattern review
- stock accuracy concerns
- shipping performance concerns
- trust score review logic at an operational level
- when supplier reliability should affect automation depth

### 5. qa/TEST_CASES.md
Must define representative test scenarios for:
- supplier intake
- normalization
- rules evaluation
- qualification
- listing validation
- order routing
- support escalation
- sync conservative handling

Prefer scenario-based test cases, not only generic categories.

### 6. qa/ACCEPTANCE_CHECKLIST.md
Must define implementation acceptance checkpoints for:
- docs completeness
- runtime module coherence
- persistence safety
- route/request validation
- exception handling
- status/state naming consistency
- phase readiness for next-stage work

## Required structure template
Use this structure where applicable:

# File Title
## Purpose
## Scope
## Procedure / Rules
## Triggers / Inputs
## Outputs / Expected Outcomes
## Guardrails
## Escalation / Review Notes
## Acceptance criteria
## Open questions

## Output expectations
At the end, provide:
1. list of created files
2. summary of each file in 1–3 sentences
3. any terminology conflicts found and resolved
4. any open questions that remain

## Definition of done
This pack is complete only if:
- all six files exist
- documents are substantive, not placeholders
- operator procedures align with current architecture and runtime semantics
- QA documents are directly useful for implementation review
- naming aligns with existing docs/runtime
```
