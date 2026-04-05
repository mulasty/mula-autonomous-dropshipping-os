# INTEGRATION_MAP.md

## Purpose  
Map the external systems, internal layers, data directions, and operational responsibilities across the architecture.

## Primary integrations in v1  
- Supplier source  
- BaseLinker  
- Supabase / PostgreSQL  
- OpenAI  
- n8n  
- Telegram  
- Email / Gmail

## Integration philosophy  
Each integration should have:  
- a defined owner module  
- a clear input/output contract  
- error handling expectations  
- logging expectations  
- escalation conditions

## Integration map

### 1. Supplier -> n8n Intake Layer  
Role: source of product data.

Possible methods:  
- XML feed  
- CSV download  
- REST API  
- email attachment  
- FTP/SFTP

Data direction:  
- inbound to system

Expected outputs:  
- import event  
- raw product records  
- import error events if malformed

Risks:  
- bad feed quality  
- missing fields  
- stale stock  
- pricing inconsistency

### 2. n8n Intake Layer -> Supabase  
Role: store raw and normalized data.

Data direction:  
- inbound to database

Expected outputs:  
- supplier_imports rows  
- products_raw rows  
- products_normalized rows  
- logging entries

### 3. Supabase -> Rules Engine  
Role: provide normalized product and policy data for decisions.

Data direction:  
- read by rule evaluation workflows

Expected outputs:  
- product_rule_decisions rows  
- exceptions rows where needed

### 4. Supabase + Rules Output -> OpenAI  
Role: provide constrained context for AI analysis or generation.

Data direction:  
- outbound prompt context to AI  
- inbound structured output from AI

Expected outputs:  
- product_ai_decisions rows  
- generated listing payloads  
- support classifications

Risks:  
- hallucination if source context too thin  
- malformed output if schema enforcement is weak

### 5. n8n -> BaseLinker  
Role: publish listings and process commerce events.

Data direction:  
- outbound listing payloads  
- inbound order/status events

Expected outputs:  
- listings published  
- order events collected  
- status changes mirrored

Risks:  
- publication mismatch  
- duplicate listing events  
- channel validation errors

### 6. BaseLinker -> n8n Order Router  
Role: new order and order status event source.

Data direction:  
- inbound to order automation workflows

Expected outputs:  
- normalized order records  
- supplier submission payloads  
- order event logs

### 7. n8n -> Supplier Order Submission Endpoint  
Role: send accepted orders to supplier.

Data direction:  
- outbound order payload  
- inbound acknowledgement/tracking if supported

Expected outputs:  
- supplier submission status  
- tracking reference  
- exceptions on failure

### 8. n8n -> Telegram  
Role: operator alerting.

Data direction:  
- outbound alerts only

Expected outputs:  
- critical issue notifications  
- daily summaries  
- exception queue reminders

### 9. n8n -> Email / Gmail  
Role: notifications, support routing, possible supplier communication fallback.

Data direction:  
- outbound notifications  
- inbound support or supplier messages in some cases

Expected outputs:  
- customer communication events  
- operator alerts  
- support queue entries

## Canonical ownership by module  
- Supplier Intake owns supplier feed integrations  
- Listing Factory and Publication workflows own BaseLinker publication contracts  
- Order Automation owns supplier order routing integrations  
- Customer Support module owns support-related messaging context  
- Control Tower owns Telegram and summary notifications

## Interface contracts to define later  
- supplier_import_contract  
- listing_publication_contract  
- order_submission_contract  
- support_message_contract  
- daily_summary_contract

## Reliability requirements by integration  
### Supplier integration  
- freshness tracking  
- malformed row handling  
- import retry policy

### OpenAI integration  
- schema validation  
- prompt version logging  
- safe fallback on malformed response

### BaseLinker integration  
- idempotent publication safeguards  
- status reconciliation checks  
- failure logging

### Supplier order integration  
- duplicate submission protection  
- acknowledgement parsing  
- timeout and retry policy

### Telegram/email integration  
- alert deduplication  
- severity-based message templates

## Suggested integration priorities  
1. supplier feed intake  
2. database storage  
3. rules evaluation  
4. listing generation AI  
5. BaseLinker publication  
6. order ingestion  
7. supplier forwarding  
8. support automation messaging  
9. alerting and reporting

## Acceptance criteria  
- every critical integration has a named owner and failure mode  
- no opaque black-box connection exists without logs  
- integration inputs and outputs are explicit

## Open questions  
- exact supplier connection method for phase one  
- exact BaseLinker publication endpoints and constraints to prioritize  
- whether support begins from email, marketplace inbox, or both  
