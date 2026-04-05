# QUALIFICATION_WORKFLOW.md

## Purpose
Define the workflow that turns a normalized product plus deterministic rule evaluation into a qualification outcome that can drive the next stage of the system.

## Mission
Qualification exists to convert rule and policy outputs into an explicit operational decision path: proceed, improve, review, reject, or block.

## Scope
This workflow covers:
- rules decision intake
- optional AI review eligibility decision
- operator review recommendation
- escalation recommendation
- qualification output contract
- domain event expectations

This workflow does not cover:
- normalization logic itself
- listing generation itself
- publication
- sync operations

## Upstream inputs
Qualification requires one of:
- an existing rule decision
- rules input that can be evaluated immediately before qualification

Optional inputs:
- workflowRunId
- aiReviewEnabled flag
- business priority / escalation hints

## Canonical stages
1. qualification requested
2. rules decision attached or rules decision produced
3. qualification output built
4. optional exception recommendation or creation
5. next step selected

## Canonical qualification statuses
Recommended statuses:
- approved
- improve_required
- review_required
- rejected
- blocked

These should align with canonical rule decision statuses.

## Qualification logic
### approved
Product is commercially and operationally safe enough to proceed to the next downstream stage.

### improve_required
Product may proceed only after enrichment or content/data improvement path.

### review_required
Product requires human or controlled review before moving further.

### rejected
Product should not proceed in the current form because it fails business viability or policy criteria, but it is not necessarily a critical blocked case.

### blocked
Product must stop and create or recommend a strong exception/escalation path because safety or policy rules prevent progression.

## AI review handling
Qualification may determine:
- whether AI review is eligible
- whether AI review is required before listing generation

AI review must remain downstream of deterministic hard rules.

Products that are blocked or rejected should not be treated as AI-enrichment candidates by default.

## Recommended next steps
Examples:
- send_to_listing_factory
- send_to_enrichment
- send_to_operator_review
- stop_candidate_and_log_decision
- create_exception_and_stop
- send_to_ai_review

## Exception recommendation rules
Exception recommendation should be explicit when:
- status is blocked
- review_required intersects with strategic/high-priority workflows
- risk profile suggests operator escalation rather than passive queueing

## Domain events
Suggested events:
- qualification_requested
- rules_decision_attached
- qualification_evaluated
- qualification_escalation_recommended

Avoid misleading event names that imply a new rules decision was created when an existing one was only consumed.

## Workflow output
Suggested output shape:
- productId
- qualificationStatus
- rulesDecision
- aiReviewEligible
- aiReviewRequiredBeforeListing
- listingGenerationAllowed
- exceptionRecommended
- recommendedNextStep
- auditLogRequired
- domainEvents

## Guardrails
- qualification must not weaken blocked/rejected outcomes into false approval
- AI review must not override hard rule failures
- next step must match qualification status semantics
- escalation path must stay explicit

## Dependencies
- product rules engine
- exception service
- logger
- optional AI review policy

## Acceptance criteria
- qualification statuses align with canonical rule statuses
- blocked path remains truly blocking
- review path remains distinct from improve path
- domain events accurately represent what actually happened
- downstream modules receive explicit next-step guidance

## Open questions
- when rejected vs blocked should create durable exception by policy
- whether high-priority review cases always escalate or only under selected domains
