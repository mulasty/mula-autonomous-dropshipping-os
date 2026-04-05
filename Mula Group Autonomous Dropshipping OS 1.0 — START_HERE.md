# START_HERE.md

## Purpose  
This is the primary entry point for the project. Every contributor, operator, developer, or Codex session should begin here before touching any implementation detail.

## What this project is  
Mula Group Autonomous Dropshipping OS 1.0 is a modular operating system for automated online sales in a dropshipping model. It is designed to automate repetitive ecommerce operations while preserving human control over high-risk or ambiguous decisions.

## What this project is not  
- not a fully uncontrolled autonomous company  
- not an AI-only system without rules  
- not a broad multi-supplier, multi-marketplace rollout at day one  
- not a project that starts with code before policies and architecture

## Primary objective  
Build a safe, scalable, Codex-friendly commerce system that can:  
- ingest supplier product feeds  
- normalize product data  
- calculate eligibility and margin safety  
- generate listing content  
- publish listings  
- synchronize stock and price  
- route orders to suppliers  
- answer low-risk customer questions  
- report exceptions to an operator

## Required reading order  
1. COMPENDIUM  
2. REPOSITORY_BLUEPRINT.md  
3. README.md  
4. PROJECT_CHANGELOG.md  
5. IMPLEMENTATION_PHASES.md  
6. SYSTEM_OVERVIEW.md  
7. ARCHITECTURE_OVERVIEW.md  
8. Target module spec for the current task

## Working rules for Codex  
1. Never start coding from assumptions that are not documented.  
2. Always identify the target module before implementation.  
3. Check business rules before building AI behavior.  
4. Prefer explicit schemas over implicit behavior.  
5. Every state-changing action must be loggable.  
6. Every risky workflow must include escalation.  
7. Keep source-of-truth data separate from generated text.  
8. Build one supplier and one primary sales channel first.

## Golden implementation sequence  
1. strategy and policies  
2. data intake  
3. normalization  
4. pricing and eligibility rules  
5. AI selection  
6. listing generation  
7. publication  
8. sync engine  
9. order routing  
10. customer support automation  
11. control tower and dashboards

## Current top-priority files  
- README.md  
- IMPLEMENTATION_PHASES.md  
- SYSTEM_OVERVIEW.md  
- ARCHITECTURE_OVERVIEW.md  
- PRODUCT_RULES_ENGINE.md  
- LISTING_FACTORY_SPEC.md  
- ORDER_AUTOMATION_SPEC.md

## Current repo mode  
- this workspace currently operates as a flat documentation pack at repo root  
- REPOSITORY_BLUEPRINT.md describes the future foldered structure, not a finished current layout  
- until the repo is intentionally migrated, keep new documentation files at repo root

## Target folder logic after migration  
- `/docs` = knowledge and technical specs  
- `/prompts` = AI prompts and output schemas  
- `/db` = schema and views  
- `/automation` = workflow exports and scripts  
- `/qa` = acceptance, tests, incident playbooks  
- `/assets` = diagrams and templates

## Decision hierarchy  
When conflicts happen, resolve them in this order:  
1. safety and compliance  
2. business rules  
3. architecture constraints  
4. workflow reliability  
5. speed of automation  
6. content quality improvements

## Implementation discipline  
Before coding any feature, confirm:  
- purpose  
- inputs  
- outputs  
- dependencies  
- business rules  
- failure modes  
- escalation path  
- acceptance criteria

## Rule for AI usage  
AI is allowed to:  
- classify  
- summarize  
- score  
- generate constrained content  
- recommend actions within defined policies

AI is not allowed to:  
- invent supplier facts  
- silently override pricing guardrails  
- auto-resolve complex complaints  
- change strategic business policies without approval

## Session update protocol  
At the end of each meaningful work block, update:  
- COMPENDIUM  
- PROJECT_CHANGELOG when repo structure or canonical rules change  
- PROJECT_INDEX  
- relevant module file

## Immediate next actions  
1. finish core orientation docs  
2. write module specs  
3. define product rules engine  
4. define listing generation contract  
5. prepare order automation contract  
6. prepare prompt library and escalation rules

## Notes  
This file should remain concise, directive, and practical. It is the operational doorway into the project.  
