# README.md

## Project name  
Mula Group Autonomous Dropshipping OS 1.0

## Summary  
A modular operating system for automated online sales in a dropshipping model. The platform combines structured business rules, workflow automation, and constrained AI agents to handle repetitive ecommerce operations with human oversight over exceptions.

## Core value proposition  
This project aims to create a production-oriented sales system that can reduce manual operational workload, increase listing throughput, protect margin, improve data consistency, and support controlled business scaling.

## Main capabilities  
- supplier feed ingestion  
- product normalization  
- quality scoring  
- margin and rule-based eligibility checks  
- AI-assisted product selection  
- AI-assisted listing generation  
- channel publication  
- price and stock synchronization  
- automated order routing  
- low-risk customer support automation  
- exception reporting and control tower oversight

## Design philosophy  
- automate repetitive work  
- constrain AI with explicit policies  
- keep the source of truth outside AI  
- optimize for safe growth, not uncontrolled autonomy  
- design for modular expansion later

## Version 1.0 scope  
### Included  
- one supplier in phase one  
- one primary sales channel in phase one  
- BaseLinker as commerce operations hub  
- n8n as workflow layer  
- Supabase/Postgres as source-of-truth database  
- OpenAI as AI layer  
- operator alerts and exception queue

### Excluded from initial scope  
- multi-tenant architecture  
- broad multi-supplier rollout  
- complex legal complaint automation  
- uncontrolled repricing  
- deep BI platform beyond core dashboards

## High-level system modules  
1. Supplier Intake  
2. Product Intelligence  
3. Product Rules Engine  
4. Listing Factory  
5. Sync Engine  
6. Order Router  
7. Customer Support AI  
8. Control Tower

## Primary stack  
- BaseLinker  
- n8n  
- Supabase / PostgreSQL  
- OpenAI  
- Google Sheets  
- Telegram  
- email / Gmail

## Repo orientation  
### Core docs  
- START_HERE.md  
- IMPLEMENTATION_PHASES.md  
- REPOSITORY_BLUEPRINT.md  
- PROJECT_CHANGELOG.md  
- SYSTEM_OVERVIEW.md  
- ARCHITECTURE_OVERVIEW.md

### Important module specs  
- DATA_MODEL.md  
- INTEGRATION_MAP.md  
- EVENT_FLOW.md  
- SECURITY_AND_GUARDRAILS.md  
- PRODUCT_RULES_ENGINE.md  
- LISTING_FACTORY_SPEC.md  
- ORDER_AUTOMATION_SPEC.md  
- CUSTOMER_SUPPORT_POLICY.md  
- AI_AGENT_PROMPT_LIBRARY.md

## Current repo shape  
- the repository is currently a flat documentation pack at repo root  
- the planned foldered layout is described in REPOSITORY_BLUEPRINT.md  
- repo-level structural changes should be logged in PROJECT_CHANGELOG.md

## Core operating principle  
Every workflow should answer these questions clearly:  
- what data enters  
- what rules apply  
- what the system decides  
- what gets logged  
- what gets escalated  
- what counts as success

## Success criteria for v1  
- valid supplier feed ingestion  
- stable normalized product records  
- safe listing qualification rules  
- first publishable product set  
- successful automated price and stock sync  
- successful automated order routing  
- visible exception queue  
- operator-friendly daily reporting

## Risks  
- poor supplier data quality  
- thin margin hidden by marketplace fees  
- out-of-stock errors  
- category mismatch on channels  
- overly permissive AI behavior  
- unreliable supplier fulfillment speed  
- missing escalation coverage

## Recommended workflow for contributors  
1. read START_HERE.md  
2. read COMPENDIUM  
3. identify target module  
4. read target spec  
5. implement only within defined scope  
6. log changes in project docs

## Future growth directions  
- more suppliers  
- more sales channels  
- smarter repricing layer  
- richer operator dashboard  
- quality scoring models by category  
- multi-brand or multi-client architecture

## Status  
Documentation foundation normalized and ready for further specification work.  
