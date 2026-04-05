# LISTING_WORKFLOW.md

## Purpose
Describe the end-to-end workflow that takes qualified products through listing generation, validation, and publication readiness.

## Mission
Ensure that listing creation is traceable, policy-bound, and safe from generation through validation to publication handoff.

## Scope
This workflow covers:
- qualified product intake
- listing generation
- listing validation
- publication readiness decision
- exception creation for listing-related failures

## Entry conditions
A product may enter listing workflow only when:
- qualification status allows downstream movement
- listing_generation_allowed is true
- required normalized data exists
- active policy version is available

## Workflow stages
1. listing_workflow_requested
2. listing_input_bundle_loaded
3. listing_generation_started
4. listing_generated
5. listing_validation_started
6. listing_validation_passed OR listing_validation_failed OR listing_review_required
7. publication_ready_marked OR listing_sent_to_review_queue
8. exception_created when needed

## Inputs
- normalized product record
- qualification output
- product rules reason codes
- channel constraints
- listing prompt version if AI is used

## Outputs
- listing draft package
- validation outcome
- publication readiness decision
- review queue entry when needed
- exception record when needed

## Failure modes
- missing source fields for listing generation
- malformed generation output
- factual conflict with normalized data
- channel constraint violation
- missing required attributes
- unsupported claim detection

## Branching rules
### Passed
Listing may move to publication workflow.

### Review required
Listing should not auto-publish. It should enter a review queue with reason codes.

### Failed
Listing must not proceed. Exception may be created if the failure blocks an important product or reflects a repeated systemic issue.

## Logging requirements
For each run, log:
- product_id
- listing_id
- workflow run reference
- prompt version if used
- validation status
- reason codes
- final next step

## Acceptance criteria
- listing generation and validation remain distinct steps
- failed listings cannot silently proceed
- review-required listings are clearly separated from passed listings
- every final status is reconstructable from logs
