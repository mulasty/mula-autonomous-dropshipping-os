# CODEX_START_PROMPT_DOCS_PACK_AI_GOVERNANCE_AND_SCHEMAS.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to complete the documentation pack for AI governance, prompt hygiene, structured outputs, and schema discipline.

## Objective
Create and fully populate the AI-governance documentation layer so future AI-assisted modules remain constrained, auditable, and operationally safe.

This pack is documentation-only.

## Files to create
Create and fully populate these files:

1. `docs/ai/AGENT_DECISION_POLICIES.md`
2. `docs/ai/CLASSIFICATION_SCHEMAS.md`
3. `docs/ai/PROMPT_VERSIONING_AND_CHANGE_CONTROL.md`
4. `docs/ai/AI_OUTPUT_VALIDATION_RULES.md`
5. `prompts/README.md`
6. `prompts/product_selection/README.md`
7. `prompts/listing_generation/README.md`
8. `prompts/support/README.md`
9. `prompts/analytics/README.md`
10. `docs/ai/AI_GOVERNANCE_CHECKLIST.md`

## Non-negotiable rules
1. Follow existing repo terminology exactly.
2. Align with current architecture, state model, escalation rules, and safety constraints.
3. Keep the documents implementation-oriented and suitable for Codex/runtime contributors.
4. Do not invent undocumented business policies.
5. Do not change runtime code in this pack.
6. Preserve the separation between deterministic rules and AI-assisted behavior.
7. Preserve the rule that AI is not the source of truth.

## Required reading before writing
Read and align with at least these files:
- `START_HERE.md`
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `AI_AGENT_PROMPT_LIBRARY.md`
- `CUSTOMER_SUPPORT_POLICY.md`
- `PRODUCT_RULES_ENGINE.md`
- `LISTING_FACTORY_SPEC.md`
- `ESCALATION_RULES.md`
- `CONTROL_TOWER_DASHBOARD.md`
- `SUPPLIER_INTAKE_SPEC.md`
- `MARGIN_CALCULATION_SPEC.md`
- relevant runtime code where current AI boundaries are implied

## File expectations

### 1. AGENT_DECISION_POLICIES.md
Must define:
- the role of AI vs deterministic rules
- which modules may use AI and for what purpose
- what AI may never override
- confidence handling expectations
- escalation-first behavior for uncertain/risky outputs
- allowed decision classes vs forbidden autonomous decisions

### 2. CLASSIFICATION_SCHEMAS.md
Must define:
- canonical classification output structures for support, product selection, and future analytics/classification tasks
- status fields, confidence fields, escalation flags, reason arrays, warning arrays
- schema discipline for machine-readable outputs
- examples of acceptable structured outputs

### 3. PROMPT_VERSIONING_AND_CHANGE_CONTROL.md
Must define:
- prompt version naming rules
- storage expectations for prompts
- change log expectations
- activation/deactivation process
- rollback expectations
- how prompt changes should be reviewed and approved

### 4. AI_OUTPUT_VALIDATION_RULES.md
Must define:
- schema validation expectations
- unsupported claim detection expectations
- malformed output handling
- null/empty output handling
- low confidence handling
- contradiction handling between AI output and source-of-truth data
- when outputs should be rejected, reviewed, or accepted

### 5. prompts/README.md
Must define:
- purpose of the prompts directory
- expected file layout
- naming conventions
- prompt/schema pairing rules
- when a prompt is production-eligible vs experimental

### 6. prompts/product_selection/README.md
Must define:
- role of product selection prompts
- expected inputs/outputs
- typical guardrails
- schema pairing expectations
- no-override rule for blocked/rejected safety outcomes

### 7. prompts/listing_generation/README.md
Must define:
- role of listing generation prompts
- source grounding rules
- unsupported-claim prohibition
- output structure expectations
- relationship to listing validation stage

### 8. prompts/support/README.md
Must define:
- role of support prompts
- low-risk automation boundaries
- required escalation behavior
- policy grounding expectations
- prohibition on unsupported promises or legal improvisation

### 9. prompts/analytics/README.md
Must define:
- role of analytics summary prompts
- distinction between factual summary and operational inference
- expectation to clearly mark inference vs known data
- summary safety expectations

### 10. AI_GOVERNANCE_CHECKLIST.md
Must define a practical review checklist for:
- prompt clarity
- schema completeness
- forbidden behavior coverage
- source-of-truth grounding
- escalation coverage
- version traceability
- rollback readiness
- production readiness criteria

## Required structure template
Use this structure where applicable:

# File Title
## Purpose
## Scope
## Core principles / rules
## Expected inputs
## Expected outputs
## Guardrails
## Validation / review expectations
## Acceptance criteria
## Open questions

## Extra guidance
- Include short structured examples where useful.
- Prefer explicit fields and concrete review steps over abstract prose.
- Make these docs directly useful for both prompt authors and runtime implementers.
- Keep channel/business examples generic unless already canonically defined in repo docs.

## Output expectations
At the end, provide:
1. list of created files
2. summary of each file in 1–3 sentences
3. any terminology conflicts found and resolved
4. any open questions that remain

## Definition of done
This pack is complete only if:
- all ten files exist
- documents are substantive and implementation-usable
- naming aligns with current docs/runtime
- AI governance remains clearly subordinate to deterministic business rules and source-of-truth data
- prompt hygiene and schema discipline are explicit enough for future production use
```
