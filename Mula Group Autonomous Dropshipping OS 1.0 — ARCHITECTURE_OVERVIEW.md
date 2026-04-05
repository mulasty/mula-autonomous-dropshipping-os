# ARCHITECTURE_OVERVIEW.md

## Purpose  
Describe the technical architecture of the system, its layers, interfaces, responsibilities, and non-negotiable implementation principles.

## Architectural principle  
The system is modular, layered, rule-governed, and event-aware. AI participates as a constrained service layer inside a broader architecture, not as the architecture itself.

## Core architectural layers

### 1. Source Layer  
Responsible for data origination.

Sources include:  
- supplier XML / CSV / API feeds  
- BaseLinker channel/order data  
- logistics status data  
- support messages  
- operator-maintained policies

### 2. Intake Layer  
Responsible for collecting external data and storing raw snapshots.

Responsibilities:  
- fetch supplier files or API responses  
- parse structured data  
- store raw payloads for traceability  
- create import events

### 3. Normalization Layer  
Responsible for converting source-specific records into internal canonical product records.

Responsibilities:  
- map supplier fields to internal schema  
- clean titles and descriptions  
- standardize brand/category/attributes  
- validate required fields  
- score data quality

### 4. Rules Layer  
Responsible for enforcing business safety.

Responsibilities:  
- margin thresholds  
- shipping time guardrails  
- category allow/block logic  
- supplier trust logic  
- listing eligibility statuses  
- escalation triggers

### 5. AI Layer  
Responsible for constrained enrichment and classification.

Subcomponents:  
- Product Selection Agent  
- Listing Generation Agent  
- Categorization Agent  
- Support Classification Agent  
- Analytics Summary Agent

### 6. Workflow Orchestration Layer  
Responsible for moving records through the system.

Tool:  
- n8n

Responsibilities:  
- import workflows  
- qualification workflows  
- listing workflows  
- sync workflows  
- order workflows  
- support workflows  
- reporting workflows

### 7. Operational Commerce Layer  
Responsible for channel and order operations.

Tool:  
- BaseLinker

Responsibilities:  
- listings channel operations  
- orders  
- status updates  
- shipping-related operations

### 8. Data and Audit Layer  
Responsible for durable records, policies, and traceability.

Tool:  
- Supabase / PostgreSQL

Tables expected:  
- suppliers  
- supplier_imports  
- products_raw  
- products_normalized  
- product_rule_decisions  
- product_ai_decisions  
- listings  
- listing_validations  
- pricing_history  
- stock_history  
- orders  
- order_items  
- order_events  
- customer_messages  
- support_responses  
- exceptions  
- policies  
- prompts  
- audit_logs

### 9. Control Tower Layer  
Responsible for visibility and human oversight.

Responsibilities:  
- exception queue  
- KPI reporting  
- supplier health visibility  
- automation failure visibility  
- operator escalation panel

## Canonical flow  
1. data enters from external sources  
2. intake stores raw payloads  
3. normalization builds internal records  
4. rules assign eligibility status  
5. AI enriches only where permitted  
6. workflow sends ready records to listing publication  
7. sync engine protects live operations  
8. orders are routed to supplier  
9. support events are classified and then either drafted, sent within policy, or escalated  
10. dashboards and logs expose system health

## State model for products  
Suggested product states:  
- raw_received  
- normalized  
- approved  
- rejected  
- review_required  
- improve_required  
- blocked  
- listing_generated  
- published  
- paused  
- archived

## State model for support messages  
Suggested support states:  
- received  
- classified  
- auto_answer_ready  
- sent  
- escalated  
- closed

## State model for exceptions  
Suggested exception states:  
- new  
- acknowledged  
- in_review  
- resolved  
- closed

## Interface contracts  
### Supplier Intake -> Normalization  
Input: raw supplier record  
Output: canonical normalized product record + quality signals

### Normalization -> Rules  
Input: normalized product record  
Output: eligibility status + rule explanation

### Rules -> AI Listing Layer  
Input: approved or improve_required product that is not blocked or rejected  
Output: generated content package or recommendation package

### Listing Layer -> Publication Layer  
Input: channel-ready listing payload  
Output: published listing record with external IDs

### Order Layer -> Supplier Forwarding  
Input: validated order  
Output: supplier submission event + status updates

### Support Layer -> Operator Queue  
Input: classified risky message  
Output: escalated support item with reason and context

## Non-functional requirements  
- traceability  
- idempotent workflow behavior where possible  
- retry handling for transient failures  
- explicit logging for state changes  
- separation of raw data and generated data  
- safe defaults  
- policy version awareness

## Security and guardrails  
- protected secrets management  
- no hardcoded credentials in workflows  
- no AI override of hard business rules  
- logging of prompt and output versions for important decisions  
- price change threshold guardrails  
- blocked category controls  
- escalation for uncertain complaint cases

## Failure domains to plan for  
- supplier feed unavailable  
- malformed feed rows  
- invalid mapping logic  
- margin miscalculation  
- duplicate listing attempts  
- publication API failure  
- stock mismatch after order placement  
- missing tracking updates  
- support classification error

## Monitoring recommendations  
Track at minimum:  
- workflow success/failure counts  
- import freshness  
- publication success rate  
- sync lag  
- order routing failure rate  
- supplier error rate  
- exception queue size  
- support auto-resolution rate

## V1 simplification strategy  
To avoid unnecessary complexity, version 1 should keep:  
- one supplier  
- one primary channel  
- minimal essential dashboards  
- simple but strict rules  
- lightweight operator control surface

## Expansion path after V1  
- multi-supplier intake abstraction  
- channel-specific policy packs  
- richer pricing intelligence  
- supplier performance prediction  
- customer support QA loop  
- dedicated operator UI

## Notes  
This file should stay structural and technical. Business narrative belongs in SYSTEM_OVERVIEW.md and strategic memory belongs in COMPENDIUM.  
