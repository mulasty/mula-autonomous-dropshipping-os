# REPOSITORY_BLUEPRINT.md

## Purpose  
Define how the repository is organized today, which files are canonical during the current documentation phase, and how the repo should evolve later without confusing contributors or Codex sessions.

## Current repository mode  
The repository currently operates as a documentation-first workspace with initial implementation directories. Canonical documents still live at repo root, while execution assets are now starting under `db/` and `automation/`.

## Current source-of-truth files  
### Orientation and governance  
- START_HERE.md  
- README.md  
- IMPLEMENTATION_PHASES.md  
- PROJECT_CHANGELOG.md  
- COMPENDIUM.txt  
- PROJECT_INDEX.xlsx

### Architecture and system model  
- SYSTEM_OVERVIEW.md  
- ARCHITECTURE_OVERVIEW.md  
- DATA_MODEL.md  
- INTEGRATION_MAP.md  
- EVENT_FLOW.md  
- SECURITY_AND_GUARDRAILS.md

### Core module and workflow specs  
- PRODUCT_RULES_ENGINE.md  
- LISTING_FACTORY_SPEC.md  
- ORDER_AUTOMATION_SPEC.md  
- CUSTOMER_SUPPORT_POLICY.md  
- AI_AGENT_PROMPT_LIBRARY.md  
- N8N_WORKFLOW_MAP.md

### Codex execution aids  
- CODEX_START_PROMPT_PHASE_1.md  
- CODEX_TASK_PACK.md

### Implemented structure already present  
- db/schema/  
- db/views/  
- db/seeds/  
- automation/contracts/

## Working rules during the current phase  
- add new canonical documentation files at repo root unless the task explicitly performs the full docs migration  
- add database and workflow implementation assets under their actual runtime folders  
- do not rename or move canonical docs casually  
- keep filenames stable so cross-references and IDE tabs do not drift  
- treat the files listed above as the current navigation layer for work

## Recommended reading order  
1. START_HERE.md  
2. REPOSITORY_BLUEPRINT.md  
3. README.md  
4. PROJECT_CHANGELOG.md  
5. IMPLEMENTATION_PHASES.md  
6. SYSTEM_OVERVIEW.md  
7. ARCHITECTURE_OVERVIEW.md  
8. target module spec for the current task

## Planned target structure later  
This is the intended next-stage layout after the current hybrid phase stabilizes.

```text
repo/
|-- docs/
|   |-- vision/
|   |-- architecture/
|   |-- modules/
|   |-- ai/
|   |-- workflows/
|   |-- integrations/
|   `-- operations/
|-- prompts/
|-- db/
|-- automation/
|-- data/
|-- qa/
`-- assets/
```

## Migration triggers  
Move from the current hybrid layout to the fuller foldered layout only when all of the following are true:
- the core documentation set stops changing rapidly  
- first implementation assets need cleaner separation  
- cross-file references can be updated in one pass  
- the team agrees on stable module boundaries

## Planned next documents  
These are planned artifacts, not missing mandatory files for the current flat phase.

### Next module specs  
- SUPPLIER_INTAKE_SPEC.md  
- PRODUCT_INTELLIGENCE_SPEC.md  
- SYNC_ENGINE_SPEC.md  
- CONTROL_TOWER_DASHBOARD.md

### Next policy and AI docs  
- AGENT_DECISION_POLICIES.md  
- CLASSIFICATION_SCHEMAS.md  
- ESCALATION_RULES.md

### Next workflow docs  
- IMPORT_WORKFLOW.md  
- LISTING_WORKFLOW.md  
- SYNC_WORKFLOW.md  
- ORDER_ROUTING_WORKFLOW.md  
- SUPPORT_WORKFLOW.md  
- DAILY_REPORTING_WORKFLOW.md

### Next integration docs  
- BASELINKER_INTEGRATION.md  
- SUPABASE_SETUP.md  
- OPENAI_INTEGRATION.md  
- TELEGRAM_ALERTS.md  
- EMAIL_INTEGRATION.md

### Next QA and planning docs  
- BUSINESS_MODEL_ASSUMPTIONS.md  
- SUCCESS_METRICS.md  
- RISK_REGISTER.md  
- TEST_CASES.md  
- ACCEPTANCE_CHECKLIST.md  
- INCIDENT_PLAYBOOK.md

## Codex working contract  
- do not assume planned files already exist  
- use the current flat files first when gathering context  
- if a planned implementation file belongs to `db/`, `automation/`, or another runtime folder, place it there now  
- if a planned documentation file is created before migration, place it at repo root unless the task also performs the folder split  
- log repo-level structural changes in PROJECT_CHANGELOG.md

## Acceptance criteria  
- current repo shape is explicit  
- current and planned structure are clearly separated  
- next sessions can navigate without guessing  
- the blueprint no longer conflicts with the actual workspace
