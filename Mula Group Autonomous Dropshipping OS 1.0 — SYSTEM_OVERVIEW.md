# SYSTEM_OVERVIEW.md

## Purpose  
Provide a business-facing and implementation-facing overview of the entire system in a single document.

## Mission  
Create a controlled autonomous dropshipping system for Mula Group that can handle repetitive ecommerce operations with measurable safety, scalability, and visibility.

## Business context  
The system is being designed for a model where products are sourced from suppliers and shipped directly to end customers. Mula Group focuses on building operational advantage through automation, structured systems, and agent-assisted decision layers rather than manual repetitive work.

## Primary problem the system solves  
Dropshipping businesses often fail because of poor product data, weak control over margin, stock mismatches, listing inconsistency, and chaotic support handling. This system addresses those issues by making data, rules, workflows, and AI act in a coordinated structure.

## High-level system promise  
The platform should be able to:  
- identify what is safe and profitable to sell  
- generate listing assets from trusted product data  
- publish only what passes business rules  
- keep price and stock synchronized  
- route orders with traceability  
- automate low-risk support  
- surface exceptions before they become damage

## System boundary  
### In scope  
- internal data normalization  
- listing operations  
- channel publishing  
- order routing  
- support automation boundaries  
- dashboards and exception handling

### Out of scope for v1  
- advanced ad automation  
- complex legal claim handling  
- multi-warehouse logic  
- broad cross-border tax automation  
- uncontrolled marketplace expansion

## Major business entities  
- supplier  
- product  
- normalized product  
- listing candidate  
- published listing  
- order  
- order event  
- customer message  
- exception  
- policy  
- prompt version

## Core modules and responsibilities  
### Supplier Intake  
Collects raw supplier data and ensures it enters the system in a traceable way.

### Product Intelligence  
Evaluates data quality, business fit, and product readiness.

### Product Rules Engine  
Applies hard rules on margin, category, shipping promises, trust signals, and publication safety.

### Listing Factory  
Generates structured sales content and channel payloads.

### Sync Engine  
Keeps published offers aligned with source stock and pricing.

### Order Router  
Transfers valid orders from channel operations to supplier execution.

### Customer Support AI  
Handles repetitive support interactions within strict policy boundaries.

### Control Tower  
Monitors health, exceptions, KPIs, and operator workload.

## System logic in one line  
Raw supplier data becomes normalized product data, which becomes rule-qualified listing candidates, which become generated listings, which become monitored live offers, which produce routed orders and support events, all governed by logs, policies, and escalation.

## Primary technical foundation  
- BaseLinker for commerce operations and channel connectivity  
- n8n for workflow automation and orchestration  
- Supabase/PostgreSQL for data and logs  
- OpenAI for constrained generation and classification  
- Google Sheets for lightweight operational control  
- Telegram and email for alerts

## Control philosophy  
The project does not pursue maximum autonomy at any cost. It pursues safe autonomy with reviewable behavior. Hard rules and source-of-truth data must always outrank generated content.

## Trust and risk model  
### Hard rule examples  
- never publish below minimum margin  
- never answer complaints outside support policy  
- never keep invalid stock as available  
- never let AI invent product facts

### Soft rule examples  
- improve weak titles  
- recommend better categories  
- suggest price adjustments inside thresholds  
- suggest operator review for borderline products

## Primary data flow  
1. supplier data enters through import workflows  
2. records are normalized and scored  
3. rules engine classifies product eligibility  
4. AI enriches approved or improvable products  
5. listing factory generates channel-ready assets  
6. listings are published  
7. sync engine updates pricing and stock  
8. orders are received and routed  
9. support messages are classified and handled  
10. control tower tracks everything

## Example v1 operating model  
- one supplier  
- one primary channel  
- low-risk category set  
- one defined margin model  
- daily operator review  
- gradual expansion after stability

## What success looks like  
- fewer manual tasks  
- fewer listing mistakes  
- more consistent publication speed  
- better visibility into margin and risk  
- faster customer response on simple cases  
- cleaner operational decision making

## Required documentation companions  
- ARCHITECTURE_OVERVIEW.md  
- DATA_MODEL.md  
- INTEGRATION_MAP.md  
- EVENT_FLOW.md  
- SECURITY_AND_GUARDRAILS.md  
- PRODUCT_RULES_ENGINE.md  
- LISTING_FACTORY_SPEC.md  
- ORDER_AUTOMATION_SPEC.md  
- CUSTOMER_SUPPORT_POLICY.md  
- N8N_WORKFLOW_MAP.md

## Planned next documentation companions  
- SYNC_ENGINE_SPEC.md  
- CONTROL_TOWER_DASHBOARD.md  
- ESCALATION_RULES.md

## Open strategic questions  
- which supplier should define the first data contract  
- which sales channel gives the safest and fastest phase-one rollout  
- which categories provide healthy margins with manageable return risk  
- how aggressive or conservative should price synchronization be in v1

## Notes  
This document should stay readable to both strategy and implementation stakeholders.  
