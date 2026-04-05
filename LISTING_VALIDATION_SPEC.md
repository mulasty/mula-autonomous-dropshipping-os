# LISTING_VALIDATION_SPEC.md

## Purpose
Define the validation rules that every generated listing must pass before publication or channel handoff.

## Mission
Prevent low-quality, misleading, incomplete, or channel-invalid listings from moving into live commerce operations.

## Scope
This module covers:
- structural validation
- factual consistency validation
- channel constraint validation
- completeness validation
- risky-claim detection
- publication readiness decision

## Principles
- publication readiness is not assumed from generation success
- generated content must remain grounded in structured data
- missing required fields must block or route to review
- validation should be deterministic wherever possible

## Validation domains
### 1. Structural validation
Check that required output sections exist and are parseable.

### 2. Factual consistency validation
Check that generated content does not contradict normalized product data.

### 3. Completeness validation
Check required title/description/attributes presence.

### 4. Channel constraint validation
Check title length, required attributes, and channel-specific formatting limits.

### 5. Risk validation
Check for unsupported claims, risky wording, or prohibited content patterns.

## Canonical validation outcomes
Suggested statuses:
- passed
- failed
- review_required

## Core validation checks
### Title checks
- non-empty
- within channel length limit
- contains no unsupported claim language
- does not contradict brand/model data

### Bullet/description checks
- non-empty where required
- no unsupported technical specs
- no invented certifications or guarantees
- no repeated spammy phrasing
- no contradiction with structured attributes

### Attribute checks
- required channel attributes present
- structured attributes align with normalized product facts
- missing critical attribute triggers failed or review_required outcome

### SEO checks
- optional in early validation, but if present should not contradict product facts
- no keyword stuffing patterns where policy blocks them

### Risk checks
- unsupported compatibility claims
- unsupported safety or compliance claims
- fabricated warranty promises
- misleading delivery promise language

## Reason code examples
- EMPTY_TITLE
- TITLE_TOO_LONG
- MISSING_REQUIRED_ATTRIBUTE
- FACT_CONFLICT
- UNSUPPORTED_CLAIM
- DUPLICATED_SPAMMY_TEXT
- MISSING_DESCRIPTION
- CHANNEL_FORMAT_VIOLATION

## Output contract
Suggested output structure:
```json
{
  "listing_id": "string",
  "validation_status": "passed|failed|review_required",
  "error_codes": ["MISSING_REQUIRED_ATTRIBUTE"],
  "warning_codes": ["TITLE_TOO_LONG"],
  "publication_ready": false
}
```

## Blocking rules
A listing must not proceed to publication when:
- validation_status = failed
- critical required attribute is missing
- unsupported claim is detected
- title or payload violates hard channel limit
- structured fact contradiction exists

## Review-required rules
A listing may route to review when:
- issue is borderline and human-curable
- channel requirement confidence is uncertain
- risky wording is suspected but not deterministically blocked

## Logging requirements
For each validation run, store:
- listing_id
- validation version
- validation status
- error codes
- warning codes
- checked_at

## Acceptance criteria
- invalid listings are blocked before publication
- reviewable issues are distinct from hard failures
- validation outputs are machine-readable and auditable
- reason codes support iterative quality improvement

## Open questions
- exact per-channel limits for v1
- whether image validation is included in this module or later companion spec
