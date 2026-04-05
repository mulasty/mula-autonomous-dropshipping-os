# CODEX_START_PROMPT_DOCS_PACK_WORKFLOWS_AND_LISTING.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to complete the next documentation pack focused on workflows and listing/publication support docs.

## Objective
Create and populate the remaining core documentation files that support Phases 5–7 without changing runtime behavior.

This pack is documentation-only.

## Files to create
Create and fully populate these files:

1. `docs/workflows/LISTING_WORKFLOW.md`
2. `docs/workflows/SYNC_WORKFLOW.md`
3. `docs/workflows/ORDER_ROUTING_WORKFLOW.md`
4. `docs/workflows/SUPPORT_WORKFLOW.md`
5. `docs/modules/LISTING_VALIDATION_SPEC.md`
6. `docs/modules/CHANNEL_CONSTRAINTS.md`

## Non-negotiable rules
1. Follow existing repo terminology exactly.
2. Align with canonical states and event names from current docs and runtime.
3. Do not invent undocumented product/business policies.
4. Keep documents implementation-friendly, not fluffy.
5. Preserve separation between deterministic rules, AI behavior, and external integrations.
6. Do not modify runtime code in this pack.

## Required reading before writing
Read and align with at least these files:
- `START_HERE.md`
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `LISTING_FACTORY_SPEC.md`
- `PRODUCT_RULES_ENGINE.md`
- `ORDER_AUTOMATION_SPEC.md`
- `CUSTOMER_SUPPORT_POLICY.md`
- `SYNC_ENGINE_SPEC.md`
- `CONTROL_TOWER_DASHBOARD.md`
- `SUPPLIER_ORDER_CONTRACT.md`
- `ESCALATION_RULES.md`
- `QUALIFICATION_WORKFLOW.md`
- current runtime code where relevant for state naming consistency

## File expectations

### 1. LISTING_WORKFLOW.md
Must define:
- upstream input from qualification/product pipeline
- listing generation stage
- listing validation stage
- publication readiness stage
- optional publication handoff stage
- failure/review/blocking transitions
- recommended next steps
- domain events

### 2. SYNC_WORKFLOW.md
Must define:
- supplier state change intake
- stock change evaluation
- pricing evaluation
- pause/review/update decisions
- history persistence expectations
- exception triggers
- control tower visibility handoff

### 3. ORDER_ROUTING_WORKFLOW.md
Must define:
- validated order intake
- payload build
- supplier submission
- acknowledgement branching
- timeout/ambiguous/rejected handling
- tracking wait handoff
- exception behavior

### 4. SUPPORT_WORKFLOW.md
Must define:
- inbound support intake
- classification stage
- low-risk response stage
- escalation stage
- persistence expectations for messages/responses
- forbidden automation zones

### 5. LISTING_VALIDATION_SPEC.md
Must define:
- validation goals
- title checks
- content completeness checks
- unsupported claim checks
- attribute completeness checks
- validation outcomes
- warning vs blocking distinction
- persistence expectations for validation results

### 6. CHANNEL_CONSTRAINTS.md
Must define:
- the role of channel-specific constraints
- separation between canonical listing content and per-channel adaptation
- likely constraint categories such as title length, required attributes, prohibited claims, shipping/declaration constraints
- placeholders for future channel-specific policy packs

Do not invent final channel-specific numbers unless already documented. Use explicit placeholders like “channel-specific policy value” only when necessary and clearly marked.

## Required structure template
Use this structure where applicable:

# File Title
## Purpose
## Mission or Scope
## Inputs
## Outputs
## Canonical stages / rules
## Events / statuses
## Guardrails
## Dependencies
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
- naming aligns with existing docs/runtime
- no major workflow uses fake success semantics
- docs are ready for Codex and human contributors to use as implementation references
```
