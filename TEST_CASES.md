# TEST_CASES.md

## Purpose
Provide a practical test inventory for validating the documentation-driven system design before and during implementation.

## Principle
Test cases should map to major system risks and decision branches, not just happy-path scenarios.

## Test domains
- supplier intake
- normalization
- qualification
- listing generation and validation
- sync
- order routing
- support automation
- exceptions and escalation

## Supplier intake tests
1. successful XML/CSV/API fetch creates import record and raw records
2. malformed payload creates import failure and exception
3. zero valid records creates exception
4. duplicate import suspicion creates review/exception path

## Normalization tests
1. valid raw record becomes normalized record
2. missing source identifier becomes invalid
3. bad cost field blocks downstream eligibility
4. weak category mapping becomes review signal, not fake certainty

## Qualification tests
1. product with safe margin and valid data becomes approved
2. banned category becomes blocked
3. borderline margin becomes review_required
4. weak content but safe economics becomes improve_required

## Listing tests
1. approved product generates listing draft
2. missing required attribute fails validation
3. unsupported claim triggers failed or review-required outcome
4. valid listing becomes publication-ready

## Sync tests
1. cost increase below safe margin pauses listing
2. stock drop to zero updates visibility state safely
3. price change beyond allowed threshold creates review/exception path
4. repeated sync failure creates exception

## Order routing tests
1. valid order routes to supplier successfully
2. unmapped SKU blocks supplier submission
3. ambiguous supplier acknowledgement creates escalation
4. missing tracking beyond SLA creates escalation

## Support tests
1. order-status question can be automated
2. legal-threat message escalates immediately
3. safety incident escalates immediately
4. low-confidence risky class does not auto-send

## Exception tests
1. critical exception triggers alert path
2. medium exception enters queue
3. resolved exception leaves active queue views

## Acceptance criteria
- every major branch has at least one representative test
- blocked and escalation paths are tested, not just success paths
- tests are understandable by both developer and operator
