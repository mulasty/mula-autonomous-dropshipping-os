# NORMALIZATION_RULES.md

## Purpose
Define how raw supplier records are transformed into canonical internal product records.

## Mission
Ensure that supplier-specific naming chaos becomes a stable, predictable internal data model that downstream modules can trust.

## Scope
This module covers:
- field mapping
- string cleanup
- attribute normalization
- category normalization
- numeric field normalization
- image list normalization
- identifier rules
- normalization statuses

## Principles
- never overwrite raw payloads
- preserve traceability to supplier source fields
- prefer deterministic normalization over heuristic magic
- uncertain mappings should be reviewable
- normalized output should be safe for rules evaluation

## Canonical normalization stages
1. raw record selected
2. source field map applied
3. identifier normalization
4. title and description cleanup
5. brand normalization
6. category normalization
7. numeric normalization
8. attributes normalization
9. images normalization
10. required field validation
11. normalized record persisted

## Required normalized fields
Minimum required fields for a usable normalized record:
- supplier_id
- raw_product_id
- supplier_sku or equivalent source product reference
- title_normalized
- cost field usable for margin calculation
- stock quantity or explicit stock state
- category_source
- attributes_json (may be partial but must exist structurally)
- normalization_status

## Identifier rules
### supplier_sku
- must preserve original business identity if present
- trim whitespace
- preserve meaningful separators unless policy says otherwise

### internal_sku
- generated or mapped deterministically
- must remain stable across re-imports for same product identity

### ean
- strip whitespace
- keep as string, not numeric
- invalid formats should be flagged, not silently repaired into false values

## Text cleanup rules
### title_normalized
- trim leading/trailing whitespace
- collapse repeated spaces
- remove obvious broken control characters
- keep meaningful model names and units
- do not inject sales language during normalization

### description_raw handling
- preserve source description separately
- optionally derive a cleaned plain-text helper field later
- do not treat source marketing fluff as trusted structured data

## Brand normalization rules
- use canonical casing where known
- map known aliases to one internal brand form
- unknown brands should pass through as reviewable values rather than forced guesses

## Category normalization rules
- preserve category_source as imported
- derive category_normalized using explicit mapping table when possible
- if mapping confidence is low, mark review-required downstream
- do not collapse unrelated categories into one generic bucket without reason

## Numeric normalization rules
### cost fields
- parse decimal safely
- normalize currency separately
- invalid or missing cost blocks downstream eligibility

### stock fields
- convert to integer where appropriate
- if supplier uses text states, map them explicitly
- unknown stock states should not become false in-stock values

### shipping time
- normalize into integer day field when possible
- preserve raw shipping text if present

### weight
- normalize to kilograms in canonical field where conversion is known
- preserve raw unit if needed for auditability

## Attributes normalization rules
- attributes must be represented as structured key-value JSON
- map obvious duplicates to canonical keys where known
- preserve unmapped attributes rather than dropping them silently
- keep original source attribute key/value trace if feasible

## Images normalization rules
- collect images into ordered array
- remove empty values
- preserve original order where meaningful
- detect obviously broken URLs
- duplicate URLs may be deduplicated with caution

## Normalization statuses
Suggested statuses:
- normalized
- normalized_with_warnings
- review_required
- invalid

## Warning examples
- missing_ean
- unknown_brand_alias
- weak_category_mapping
- broken_image_url
- partial_attributes

## Hard invalid examples
- missing_source_reference
- missing_cost
- non-parseable_stock
- empty_title_after_cleanup

## Logging requirements
Per normalized record, store:
- normalization_status
- warning_codes
- invalid_reason_codes
- source field map version if used
- normalized_at

## Acceptance criteria
- downstream rules engine can rely on normalized fields
- raw data remains preserved separately
- identifier handling is stable
- invalid data is flagged explicitly
- warnings are visible for review workflows

## Open questions
- exact internal SKU generation strategy
- whether canonical category map starts as static file or database table
- how deep brand alias normalization should go in v1
