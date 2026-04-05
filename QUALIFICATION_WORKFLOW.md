# QUALIFICATION_WORKFLOW.md

## Purpose
Describe the workflow that moves normalized products through deterministic rules, optional AI review, and final readiness for listing generation.

## Mission
Ensure that only products with acceptable data quality, margin safety, category fit, and supplier trust can become listing candidates.

## Scope
This workflow covers:
- input selection from normalized products
- rules evaluation
- margin calculation usage
- optional AI enrichment/selection step
- final qualification status handoff
- exception generation for risky states

## Entry conditions
A product may enter qualification only when:
- normalization_status is acceptable for downstream evaluation
- required identifiers exist
- required cost/stock/category fields are present enough for rules engine

## Primary workflow stages
1. qualification_requested
2. input_validation_started
3. input_validation_passed or input_validation_failed
4. rules_evaluation_started
5. margin_calculation_completed
6. rules_decision_created
7. qualification_blocked OR qualification_rejected OR qualification_review_required OR qualification_improve_required OR qualification_approved
8. ai_review_started (only for allowed statuses)
9. ai_review_completed
10. listing_candidate_ready (only for approved/improve paths allowed by policy)
11. exception_created when needed

## Decision branching
### Blocked
Product must not proceed to listing generation.
Typical reasons:
- banned category
- missing cost data
- invalid stock data
- severe supplier trust issue

### Rejected
Product is not a current candidate and does not proceed.
Typical reasons:
- weak economics
- low fit for target channel
- unacceptable shipping promise

### Review required
Human review needed before further movement.
Typical reasons:
- borderline margin
- low category confidence
- conflicting source signals

### Improve required
Product may become eligible after data/content improvement.
Typical reasons:
- partial attributes
- weak image set
- insufficient descriptive quality

### Approved
Product is ready for listing generation, subject to downstream validation.

## AI review policy
AI review may run only when:
- product is not blocked
- hard rules have already completed
- required structured context is available

AI review must never:
- override blocked decision
- invent missing facts
- silently convert review_required into approved without policy support

## Recommended input bundle
- normalized product record
- supplier trust data
- rules engine output
- margin calculation output
- current policy version
- prompt version if AI is used

## Recommended output bundle
- final qualification status
- reason codes
- risk flags
- recommended next step
- listing_generation_allowed boolean
- exception reference if created

## Exception triggers
Create exception when:
- blocked product was previously active or expected to be live soon
- review_required product has high business priority
- data contradiction exists between imported fields
- AI output is malformed or low-confidence in a risky case

## Logging requirements
For each qualification attempt, log:
- product_id
- workflow run reference
- rules version
- policy version
- margin formula version
- qualification status
- reason codes
- ai review flag
- final next step

## Acceptance criteria
- blocked path is explicit and terminal for listing generation
- review and improve paths are distinct
- approved products are clearly handoff-ready
- exceptions exist for important risk states
- qualification can be reconstructed from logs

## Open questions
- whether improve_required can auto-continue after automated enrichment in v1
- whether review_required products enter a separate operator queue immediately
