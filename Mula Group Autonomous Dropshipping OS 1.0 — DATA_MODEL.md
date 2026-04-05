# DATA_MODEL.md

## Purpose  
Define the core entities, relationships, canonical fields, and storage logic for Mula Group Autonomous Dropshipping OS 1.0.

## Principle  
The data layer is the source of truth. Generated content and workflow events must always be traceable back to durable records.

## Primary database recommendation  
- Supabase / PostgreSQL

## Design rules  
- raw source data is never overwritten  
- normalized data is separated from raw data  
- generated content is separated from source facts  
- state changes are logged as events where possible  
- policy and prompt versions are stored explicitly

## Core entities

### 1. suppliers  
Purpose: registry of supplier sources and operational trust signals.

Suggested fields:  
- supplier_id  
- supplier_name  
- integration_type  
- source_endpoint  
- is_active  
- trust_score  
- avg_fulfillment_delay_days  
- stock_accuracy_score  
- cancellation_rate  
- last_import_at  
- created_at  
- updated_at

### 2. supplier_imports  
Purpose: track each import attempt from supplier source.

Suggested fields:  
- import_id  
- supplier_id  
- import_status  
- source_reference  
- records_received  
- records_valid  
- records_invalid  
- started_at  
- finished_at  
- error_summary

### 3. products_raw  
Purpose: immutable storage of imported supplier rows or payload items.

Suggested fields:  
- raw_product_id  
- supplier_id  
- import_id  
- source_product_reference  
- raw_payload_json  
- payload_hash  
- imported_at

### 4. products_normalized  
Purpose: canonical internal product representation.

Suggested fields:  
- product_id  
- supplier_id  
- raw_product_id  
- internal_sku  
- supplier_sku  
- ean  
- brand  
- title_raw  
- title_normalized  
- description_raw  
- category_source  
- category_normalized  
- attributes_json  
- images_json  
- weight_kg  
- shipping_time_days  
- cost_net  
- cost_gross  
- currency  
- stock_quantity  
- data_quality_score  
- normalization_status  
- normalized_at  
- updated_at

### 5. product_rule_decisions  
Purpose: durable storage of deterministic rules outcomes.

Suggested fields:  
- decision_id  
- product_id  
- rules_version  
- policy_version  
- decision_status  
- reason_codes_json  
- projected_net_margin  
- projected_gross_margin  
- risk_flags_json  
- recommended_next_step  
- decided_at

### 6. product_ai_decisions  
Purpose: store AI-assisted product selection or enrichment decisions.

Suggested fields:  
- ai_decision_id  
- product_id  
- agent_name  
- prompt_version  
- input_reference  
- output_json  
- confidence  
- escalate  
- created_at

### 7. listings  
Purpose: master record of generated and/or published listings.

Suggested fields:  
- listing_id  
- product_id  
- channel  
- channel_listing_id  
- listing_status  
- current_price  
- currency  
- title_generated  
- bullets_json  
- description_generated  
- attributes_payload_json  
- seo_payload_json  
- generation_version  
- published_at  
- updated_at

### 8. listing_validations  
Purpose: capture listing validation outcomes before publication.

Suggested fields:  
- validation_id  
- listing_id  
- validation_status  
- validation_errors_json  
- validation_warnings_json  
- checked_at

### 9. pricing_history  
Purpose: track all price changes over time.

Suggested fields:  
- pricing_event_id  
- listing_id  
- previous_price  
- new_price  
- change_reason  
- source_cost_reference  
- triggered_by  
- changed_at

### 10. stock_history  
Purpose: track inventory changes and freshness.

Suggested fields:  
- stock_event_id  
- product_id  
- previous_stock  
- new_stock  
- source_reference  
- changed_at

### 11. orders  
Purpose: canonical order record.

Suggested fields:  
- order_id  
- channel  
- channel_order_id  
- order_status  
- payment_status  
- customer_reference  
- order_total_gross  
- currency  
- supplier_submission_status  
- tracking_status  
- created_at  
- updated_at

### 12. order_items  
Purpose: individual item lines per order.

Suggested fields:  
- order_item_id  
- order_id  
- product_id  
- listing_id  
- supplier_sku  
- quantity  
- unit_price  
- line_total

### 13. order_events  
Purpose: event log for operational order changes.

Suggested fields:  
- order_event_id  
- order_id  
- event_type  
- event_payload_json  
- event_source  
- created_at

### 14. customers  
Purpose: lightweight customer identity reference where needed.

Suggested fields:  
- customer_id  
- email  
- phone  
- full_name  
- country  
- created_at

### 15. customer_messages  
Purpose: storage of inbound/outbound support-related messages.

Suggested fields:  
- message_id  
- order_id  
- customer_id  
- channel  
- direction  
- message_text  
- classification_label  
- automation_allowed  
- confidence  
- escalation_flag  
- created_at

### 16. support_responses  
Purpose: store drafted or sent support answers.

Suggested fields:  
- response_id  
- message_id  
- prompt_version  
- response_text  
- send_status  
- escalate  
- escalation_reason  
- created_at

### 17. exceptions  
Purpose: queue of issues requiring visibility or human action.

Suggested fields:  
- exception_id  
- entity_type  
- entity_id  
- exception_category  
- severity  
- status  
- summary  
- details_json  
- created_at  
- resolved_at

### 18. policies  
Purpose: structured business rules and policy versions.

Suggested fields:  
- policy_id  
- policy_name  
- policy_version  
- policy_type  
- policy_payload_json  
- active_from  
- is_active

### 19. prompts  
Purpose: version control for AI prompts used in production.

Suggested fields:  
- prompt_id  
- prompt_name  
- module_name  
- version  
- prompt_text  
- schema_reference  
- is_active  
- created_at

### 20. audit_logs  
Purpose: general traceability for important state-changing actions.

Suggested fields:  
- audit_id  
- actor_type  
- actor_reference  
- action_type  
- target_type  
- target_id  
- before_state_json  
- after_state_json  
- created_at

## Relationship overview  
- one supplier has many imports  
- one import has many raw products  
- one raw product maps to one normalized product version in v1  
- one normalized product can have many rule decisions over time  
- one normalized product can have many AI decisions over time  
- one normalized product can have many listings across channels  
- one order has many order items  
- one order has many order events  
- one customer can have many messages  
- one message can have zero or many support responses  
- any entity can create exceptions and audit logs

## Suggested enums  
### decision_status  
- approved  
- rejected  
- review_required  
- improve_required  
- blocked

### listing_status  
- draft  
- generated  
- validation_failed  
- ready_for_publication  
- published  
- paused  
- archived

### listing_validation_status  
- passed  
- failed  
- review_required

### order_status  
- received  
- validated  
- validation_failed  
- queued_for_supplier  
- submitted_to_supplier  
- supplier_acknowledged  
- awaiting_tracking  
- in_transit  
- delivered  
- cancelled  
- exception

### exception_status  
- new  
- acknowledged  
- in_review  
- resolved  
- closed

## Views recommended for v1  
- margin_monitoring_view  
- exception_queue_view  
- supplier_health_view  
- listing_publication_view  
- order_routing_health_view  
- support_automation_view

## Acceptance criteria  
- core records support traceability end-to-end  
- generated outputs are linked to source products and prompt versions  
- exceptions can be tied to entities directly  
- state history is reviewable

## Open questions  
- whether normalized product versions should be immutable snapshots in v1  
- how much customer PII should be retained in first iteration  
- exact policy storage granularity  
