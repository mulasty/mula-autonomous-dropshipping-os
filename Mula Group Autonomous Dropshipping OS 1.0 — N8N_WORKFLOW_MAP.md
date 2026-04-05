# N8N_WORKFLOW_MAP.md

## Purpose  
Map the core workflow automations that should exist in n8n for version 1 of the system.

## Principle  
Each workflow should have a single clear operational purpose, explicit triggers, defined inputs/outputs, and clear failure handling.

## Workflow inventory for v1

### WF-01 Supplier Feed Import  
Purpose: fetch supplier data and create raw import records.

Trigger:  
- scheduled trigger  
- optional manual trigger

Inputs:  
- supplier endpoint config  
- authentication if required

Outputs:  
- supplier_import record  
- raw product records  
- import summary

Failure handling:  
- import exception  
- operator alert if repeated failure

### WF-02 Product Normalization  
Purpose: convert raw product records into canonical normalized product records.

Trigger:  
- new raw product batch

Inputs:  
- raw product payload  
- field mapping rules

Outputs:  
- normalized product records  
- normalization errors

Failure handling:  
- row-level normalization exceptions  
- import-level summary issue if major failure rate

### WF-03 Rules Evaluation  
Purpose: evaluate normalized products against deterministic business rules.

Trigger:  
- normalized product created or updated

Inputs:  
- normalized product  
- policy values  
- supplier trust data

Outputs:  
- product_rule_decision  
- exception if blocked for critical reason

### WF-04 AI Product Selection  
Purpose: enrich decision context for eligible products.

Trigger:  
- rule decision = approved or improve_required where AI review allowed

Inputs:  
- normalized product  
- rules outcome  
- product quality context

Outputs:  
- AI selection result  
- escalation flag if uncertain

### WF-05 Listing Generation  
Purpose: generate listing content and payloads for products allowed to proceed.

Trigger:  
- product decision = approved or improve_required and not blocked or rejected

Inputs:  
- trusted product fields  
- channel rules  
- prompt version

Outputs:  
- listing draft payload  
- listing validation result  
- escalation or review flag if publication should stop

### WF-06 Listing Publication  
Purpose: publish validated listings to BaseLinker / channel.

Trigger:  
- listing ready_for_publication

Inputs:  
- listing payload  
- channel mapping data

Outputs:  
- published listing record on success  
- publication error event and exception trigger on failure

### WF-07 Price and Stock Sync  
Purpose: keep live listings aligned with supplier changes.

Trigger:  
- scheduled sync  
- optional supplier delta event

Inputs:  
- latest supplier product state  
- active listing state  
- pricing rules

Outputs:  
- updated listing price  
- listing pause action  
- stock history event

### WF-08 Order Intake  
Purpose: receive orders from BaseLinker or primary channel and create internal order records.

Trigger:  
- new order webhook or scheduled poll

Inputs:  
- channel order payload

Outputs:  
- normalized order record  
- order items  
- order_received event

### WF-09 Order Validation and Supplier Routing  
Purpose: validate and submit orders to supplier.

Trigger:  
- new internal order with status = validated or queued_for_supplier

Inputs:  
- order record  
- item mappings  
- supplier contract

Outputs:  
- supplier submission record  
- order event updates  
- exception if submission fails

### WF-10 Tracking Update Processing  
Purpose: ingest tracking data and update order status.

Trigger:  
- supplier response  
- logistics webhook  
- scheduled tracking poll

Inputs:  
- supplier submission reference  
- tracking payload

Outputs:  
- tracking-linked order event  
- status update

### WF-11 Support Classification  
Purpose: classify inbound customer support messages.

Trigger:  
- inbound support message

Inputs:  
- message text  
- order context  
- support policy version

Outputs:  
- classification result  
- escalate flag

### WF-12 Support Response Drafting / Sending  
Purpose: draft or send low-risk support answers.

Trigger:  
- automation_allowed = true and escalation flag = false

Inputs:  
- classification result  
- verified order/product context  
- support prompt version

Outputs:  
- response draft or sent response record  
- escalation event if policy blocks sending

### WF-13 Exception Queue Builder  
Purpose: centralize failures and risky cases into a consistent queue.

Trigger:  
- exception-worthy event from any workflow

Inputs:  
- entity type  
- entity id  
- category  
- severity  
- summary/details

Outputs:  
- exception record  
- optional alert event

### WF-14 Daily KPI Summary  
Purpose: send daily operational summary to operator.

Trigger:  
- daily scheduled trigger

Inputs:  
- KPI snapshots  
- exception backlog  
- supplier health metrics  
- workflow health metrics

Outputs:  
- summary text  
- Telegram or email notification

## Suggested dependency order  
1. WF-01 Supplier Feed Import  
2. WF-02 Product Normalization  
3. WF-03 Rules Evaluation  
4. WF-04 AI Product Selection can be enabled after rules depending on rollout pace  
5. WF-05 Listing Generation  
6. WF-06 Listing Publication  
7. WF-07 Price and Stock Sync  
8. WF-08 Order Intake  
9. WF-09 Order Validation and Supplier Routing  
10. WF-10 Tracking Update Processing  
11. WF-11 Support Classification  
12. WF-12 Support Response Drafting / Sending  
13. WF-13 Exception Queue Builder  
14. WF-14 Daily KPI Summary

## Shared workflow components  
Recommended reusable nodes/functions:  
- fetch policy config  
- write audit log  
- create exception  
- send Telegram alert  
- validate schema  
- upsert normalized entity  
- write event log

## Common workflow states to track  
- started  
- completed  
- failed  
- retried  
- escalated

## Failure handling guidelines  
- transient API failure -> retry with limits  
- schema failure -> exception record  
- unsafe business state -> pause and escalate  
- duplicated event risk -> idempotency check before action

## Naming convention  
Use predictable workflow names:  
- MG-DS-01-Supplier-Feed-Import  
- MG-DS-02-Product-Normalization  
- MG-DS-03-Rules-Evaluation  
- etc.

## Acceptance criteria  
- each workflow has a single clear operational purpose  
- shared failure patterns are standardized  
- exception creation is reusable  
- workflow dependencies match implementation phases

## Open questions  
- exact split between webhook-driven and scheduled workflows in phase one  
- whether support workflows start in draft-only mode first  
