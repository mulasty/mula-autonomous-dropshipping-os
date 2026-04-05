# EVENT_FLOW.md

## Purpose  
Describe the major business and technical events that move records through the system.

## Principle  
The platform should be understandable as a sequence of events and state transitions. Events should be loggable, attributable, and reviewable.

## Event domains  
- supplier intake events  
- product lifecycle events  
- listing lifecycle events  
- pricing and stock events  
- order lifecycle events  
- support lifecycle events  
- exception events  
- reporting events

## 1. Supplier intake event flow  
### Event sequence  
1. supplier_import_started  
2. supplier_payload_fetched  
3. supplier_payload_parsed  
4. raw_product_saved  
5. normalization_started  
6. normalized_product_saved  
7. normalization_failed (optional)  
8. supplier_import_completed

### Notes  
Each import should generate a durable import record and summary counts.

## 2. Product qualification event flow  
### Event sequence  
1. product_ready_for_rules  
2. rules_evaluation_started  
3. product_rule_decision_created  
4. product_approved OR product_rejected OR product_review_required OR product_improve_required OR product_blocked  
5. ai_selection_started (only if decision is approved or improve_required and AI review is enabled)  
6. ai_selection_completed

### Notes  
Hard rules should always run before AI-assisted product evaluation.
Blocked and rejected products must not continue into listing generation automatically.

## 3. Listing generation event flow  
### Event sequence  
1. listing_generation_requested  
2. listing_generation_started  
3. listing_generated  
4. listing_validation_started  
5. listing_validation_passed OR listing_validation_failed OR listing_validation_review_required  
6. listing_ready_for_publication (only if validation passed)

### Notes  
Generated content should remain linked to source product and prompt version.
Validation review_required should route to operator review instead of publication.

## 4. Publication and sync event flow  
### Publication sequence  
1. publication_requested  
2. publication_payload_sent  
3. publication_succeeded OR publication_failed  
4. listing_published (only if publication_succeeded)

### Ongoing sync sequence  
1. supplier_stock_changed  
2. supplier_cost_changed  
3. repricing_evaluation_started  
4. listing_price_updated OR listing_paused  
5. stock_synced

### Notes  
Price and stock updates should create history events.
Publication failure should leave the listing unpublished or paused and should create an exception when operator action is required.

## 5. Order lifecycle event flow  
### Event sequence  
1. order_received  
2. order_normalized  
3. order_validation_started  
4. order_validated OR order_validation_failed  
5. supplier_submission_started (only if order_validated)  
6. supplier_submission_succeeded OR supplier_submission_failed  
7. supplier_acknowledged OR awaiting_tracking (only if supplier_submission_succeeded)  
8. tracking_received  
9. order_in_transit  
10. order_delivered

### Notes  
Every supplier interaction should emit explicit state transitions and audit events.
Validation failure or supplier submission failure should stop autonomous forwarding and create an exception when required.

## 6. Support lifecycle event flow  
### Event sequence  
1. customer_message_received  
2. support_classification_started  
3. support_classified  
4. support_auto_response_drafted OR support_escalated  
5. support_response_sent (only if automation_allowed = true and no escalation is required)  
6. support_case_closed

### Notes  
High-risk classes should jump directly to escalation path.
Escalated cases bypass auto-send and remain open until handled by operator.

## 7. Exception event flow  
### Event sequence  
1. exception_created  
2. exception_acknowledged  
3. exception_in_review  
4. exception_resolved OR exception_closed

### Example exception sources  
- import failures  
- rule conflicts  
- publication failures  
- order routing failures  
- missing tracking  
- risky support message

## 8. Reporting event flow  
### Event sequence  
1. daily_summary_requested  
2. kpi_snapshot_built  
3. exception_snapshot_built  
4. summary_generated  
5. summary_sent

## Canonical event payload attributes  
Recommended common fields:  
- event_id  
- event_type  
- entity_type  
- entity_id  
- event_source  
- occurred_at  
- payload_json  
- actor_type  
- actor_reference

## Event source examples  
- supplier_feed  
- n8n_workflow  
- baselinker  
- openai  
- operator  
- support_channel

## Event ordering rules  
- import events should be grouped by import_id  
- order events should be grouped by order_id  
- listing events should be grouped by listing_id  
- support events should be grouped by message_id or case_id

## Event safety rules  
- important events must be persistent  
- failed events should produce exceptions when needed  
- retries should not create ambiguous duplicate outcomes  
- state-changing events should be auditable

## Acceptance criteria  
- major system flows can be reconstructed from events  
- state transitions are understandable without guessing  
- exception-generating failures are visible

## Open questions  
- how event storage is split between dedicated event tables and audit logs in v1  
- whether some lower-importance events remain workflow-local only  
