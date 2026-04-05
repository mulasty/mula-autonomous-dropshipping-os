# NORMALIZATION_RULES.md

## Purpose
Define the canonical normalization rules that convert raw supplier records into normalized internal product records.

## Mission
Normalization exists to transform heterogeneous supplier data into a consistent internal shape that can safely feed rules evaluation, qualification, and later listing generation.

## Scope
This layer covers:
- field mapping
- string cleanup
- identifier standardization
- category normalization
- boolean and numeric coercion
- image/reference shaping
- missing-field detection
- data quality scoring inputs

This layer does not cover:
- commercial eligibility
- margin decisions
- AI enrichment
- listing generation
- publication

## Core principle
Raw source data must remain preserved. Normalization creates a canonical record derived from raw data, not a destructive overwrite.

## Canonical normalization inputs
Expected upstream inputs:
- supplierId
- importId
- rawProductId or raw row reference
- sourceProductReference
- raw payload object
- row prevalidation status

Only rows accepted for normalization should continue automatically.

## Canonical normalization outputs
Suggested normalized product record fields:
- productId
- supplierId
- rawProductId
- internalSku
- supplierSku
- ean
- brand
- titleRaw
- titleNormalized
- descriptionRaw
- categorySource
- categoryNormalized
- attributesJson
- imagesJson
- weightKg
- shippingTimeDays
- costNet
- costGross
- currency
- stockQuantity
- dataQualityScore
- normalizationStatus
- normalizedAt

## Normalization statuses
Recommended statuses:
- normalized
- normalized_with_warnings
- review_required
- failed

## Field mapping rules
### Identifiers
- preserve supplier-provided reference values where available
- trim string values
- coerce empty strings to null where sensible
- avoid inventing SKU/EAN values

### Title
- preserve raw title in `titleRaw`
- create `titleNormalized` as trimmed, whitespace-normalized text
- do not inject marketing phrases
- do not translate or enrich in this stage

### Description
- preserve source description in raw form
- optionally strip obviously broken HTML wrappers if documented by source handling rules
- do not rewrite meaning

### Category
- preserve source category in `categorySource`
- derive normalized category conservatively
- low-confidence category mapping should remain visible and reviewable

### Attributes
- map known fields into structured key/value form
- preserve only source-grounded values
- avoid guessed technical attributes

### Images
- capture image URLs or references in stable array/object structure
- remove empty or invalid values when clearly invalid
- preserve order where meaningful

### Numeric values
- parse known numeric fields conservatively
- invalid numeric strings should not silently become zero
- use null for unknown/invalid parsed values where appropriate

### Boolean values
- map only documented boolean source values
- avoid guessing semantics from arbitrary strings

## Missing-field handling
Missing critical fields should be explicit.

### Critical candidates
- source product reference
- supplier SKU or internal mapping candidate
- price/cost fields
- stock field
- category field

Missing critical fields should contribute to:
- normalization warnings
- review_required or failed status where appropriate
- data quality signals

## Data quality signal inputs
Normalization should contribute inputs for later scoring, such as:
- title present
- category present
- identifier present
- image count
- structured attributes presence
- stock parse validity
- price parse validity

Normalization may compute or prepare a `dataQualityScore` only if the logic is explicit and deterministic.

## Review triggers
Mark record as review_required when:
- category mapping is uncertain
- identifiers are contradictory
- important numeric fields parse ambiguously
- source field structure is partially malformed but still partially usable

## Failure triggers
Mark normalization as failed when:
- raw row is unusable despite upstream acceptance
- critical identity linkage is impossible
- source shape is too broken to create a safe canonical record

## Traceability requirements
Every normalized record should remain traceable to:
- supplierId
- importId
- raw record identifier
- source product reference
- normalization timestamp

## Guardrails
- do not fabricate missing values
- do not merge supplier-specific semantics into canonical fields without explicit rules
- do not treat invalid numeric strings as 0 by default
- do not erase raw source meaning during cleanup

## Dependencies
- supplier intake accepted rows
- canonical data model
- downstream rules engine contract

## Acceptance criteria
- normalized records are deterministic for the same input
- raw-to-normalized linkage is preserved
- missing/uncertain values are explicit
- downstream rules engine can consume normalized records without source-specific branching

## Open questions
- exact category taxonomy strategy for v1
- whether brand normalization dictionary exists in v1
- whether dataQualityScore is computed here or in a separate scorer service
