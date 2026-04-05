# CODEX_TASK_PACK.md

## Purpose  
This document turns the project documentation into an execution-ready implementation pack for Codex. Each task is scoped, ordered, and tied to dependencies and acceptance criteria.

## Usage rule  
Codex should execute tasks in order unless a task is explicitly marked parallel-safe.

## Global coding rules for Codex  
- follow the repository blueprint  
- do not invent undocumented business rules  
- prefer explicit schemas and typed contracts  
- log state-changing actions  
- keep AI outputs schema-bound  
- implement exception creation wherever failure matters  
- keep modules small and composable

## Phase-oriented task map

### Wave 1 — Repository and project skeleton  
These tasks create the initial repo structure and foundational docs.

#### TASK-001 Create repository scaffold  
Goal: create the folder structure from REPOSITORY_BLUEPRINT.md.

Deliverables:  
- root files  
- docs folders  
- prompts folders  
- db folders  
- automation folders  
- qa folders  
- assets folders

Dependencies:  
- REPOSITORY_BLUEPRINT.md

Acceptance criteria:  
- all core folders exist  
- root navigation files exist  
- structure matches blueprint exactly enough for further work

#### TASK-002 Add initial root markdown files  
Goal: add START_HERE.md, README.md, IMPLEMENTATION_PHASES.md, REPOSITORY_BLUEPRINT.md to the repo.

Dependencies:  
- TASK-001

Acceptance criteria:  
- files are present in root  
- content is aligned with planning docs  
- links between files are valid where relevant

#### TASK-003 Add architecture and vision docs  
Goal: add SYSTEM_OVERVIEW.md, ARCHITECTURE_OVERVIEW.md, DATA_MODEL.md, INTEGRATION_MAP.md, EVENT_FLOW.md, SECURITY_AND_GUARDRAILS.md.

Dependencies:  
- TASK-001  
- TASK-002

Acceptance criteria:  
- docs added under correct folders  
- no placeholder-only files  
- docs are readable and structured

---

### Wave 2 — Database schema foundation  
These tasks create the technical source-of-truth layer.

#### TASK-010 Create core SQL schema files  
Goal: create SQL files for core tables.

Files:  
- db/schema/001_core_tables.sql  
- db/schema/002_event_tables.sql  
- db/schema/003_policy_tables.sql  
- db/schema/004_logging_tables.sql

Dependencies:  
- TASK-003  
- DATA_MODEL.md

Acceptance criteria:  
- tables exist for suppliers, imports, raw products, normalized products, decisions, listings, orders, messages, exceptions, prompts, policies, audit logs  
- foreign keys are sensible  
- created_at / updated_at patterns are consistent

#### TASK-011 Create initial SQL views  
Goal: add analytical views for operational visibility.

Files:  
- db/views/margin_monitoring.sql  
- db/views/exception_queue.sql  
- db/views/supplier_health.sql

Dependencies:  
- TASK-010

Acceptance criteria:  
- views compile logically against schema  
- fields support control tower use cases

#### TASK-012 Create seed files for policy defaults  
Goal: add basic seed files for initial policy values.

Files:  
- db/seeds/policy_defaults.sql  
- db/seeds/category_allowlist.sql  
- db/seeds/escalation_defaults.sql

Dependencies:  
- TASK-010  
- PRODUCT_RULES_ENGINE.md  
- CUSTOMER_SUPPORT_POLICY.md

Acceptance criteria:  
- seeds reflect documented policy structure  
- values are easy to edit later

---

### Wave 3 — Supplier intake and normalization  
These tasks build the first real data pipeline.

#### TASK-020 Create SUPPLIER_INTAKE_SPEC.md in repo  
Goal: add supplier intake specification under docs/modules.

Dependencies:  
- TASK-003

Acceptance criteria:  
- spec includes input methods, parsing logic, failure modes, and acceptance criteria

#### TASK-021 Build raw supplier import parser contract  
Goal: create parser interface contract and staging rules.

Suggested files:  
- automation/scripts/feed_parser/README.md  
- automation/scripts/feed_parser/parser_contract.md

Dependencies:  
- TASK-020  
- INTEGRATION_MAP.md

Acceptance criteria:  
- parser contract defines input format, output format, and validation behavior

#### TASK-022 Implement normalization mapping spec  
Goal: create normalization rules and canonical field map.

Suggested files:  
- docs/architecture/NORMALIZATION_RULES.md  
- automation/scripts/normalization/README.md

Dependencies:  
- TASK-021  
- DATA_MODEL.md

Acceptance criteria:  
- field mapping is explicit  
- required fields are identified  
- normalization statuses are defined

---

### Wave 4 — Rules engine and qualification layer  
These tasks create safe product decisioning.

#### TASK-030 Implement product rules engine spec in repo  
Goal: add PRODUCT_RULES_ENGINE.md to repo and align it with actual policy structure.

Dependencies:  
- TASK-010  
- TASK-012

Acceptance criteria:  
- all rule groups are represented  
- decision statuses and reason codes are explicit

#### TASK-031 Define margin calculation contract  
Goal: create a dedicated formula spec for product profitability evaluation.

Suggested file:  
- docs/modules/MARGIN_CALCULATION_SPEC.md

Dependencies:  
- TASK-030

Acceptance criteria:  
- all cost components are named  
- output fields are defined  
- warning band logic is defined

#### TASK-032 Implement eligibility workflow contract  
Goal: create the workflow contract for moving normalized products through rule evaluation.

Suggested file:  
- docs/workflows/QUALIFICATION_WORKFLOW.md

Dependencies:  
- TASK-030  
- EVENT_FLOW.md  
- N8N_WORKFLOW_MAP.md

Acceptance criteria:  
- inputs, outputs, decision transitions, and exceptions are defined

---

### Wave 5 — AI layer and prompt implementation  
These tasks make the AI pieces executable but constrained.

#### TASK-040 Add prompt files for product selection  
Files:  
- prompts/product_selection/selection_system_prompt.md  
- prompts/product_selection/selection_output_schema.json

Dependencies:  
- AI_AGENT_PROMPT_LIBRARY.md  
- TASK-030

Acceptance criteria:  
- prompt forbids invention  
- schema is strict and parseable

#### TASK-041 Add prompt files for listing generation  
Files:  
- prompts/listing_generation/listing_system_prompt.md  
- prompts/listing_generation/listing_output_schema.json

Dependencies:  
- LISTING_FACTORY_SPEC.md  
- AI_AGENT_PROMPT_LIBRARY.md

Acceptance criteria:  
- prompt is channel-aware  
- schema supports title, bullets, description, attributes, SEO

#### TASK-042 Add prompt files for support classification and response  
Files:  
- prompts/support/support_system_prompt.md  
- prompts/support/support_output_schema.json

Dependencies:  
- CUSTOMER_SUPPORT_POLICY.md  
- AI_AGENT_PROMPT_LIBRARY.md

Acceptance criteria:  
- escalation behavior is explicit  
- risky classes are protected

---

### Wave 6 — Listing factory and publication contracts  
These tasks prepare actual sales output.

#### TASK-050 Implement listing factory docs in repo  
Goal: add LISTING_FACTORY_SPEC.md and any supporting channel constraints file.

Suggested supporting file:  
- docs/modules/CHANNEL_CONSTRAINTS.md

Dependencies:  
- TASK-041  
- TASK-030

Acceptance criteria:  
- factory inputs and outputs are explicit  
- validation rules are present

#### TASK-051 Create listing validation spec  
Suggested file:  
- docs/modules/LISTING_VALIDATION_SPEC.md

Dependencies:  
- TASK-050

Acceptance criteria:  
- empty output, unsupported claims, channel overflow, and attribute mismatch checks are defined

#### TASK-052 Create publication workflow doc  
Suggested file:  
- docs/workflows/LISTING_WORKFLOW.md

Dependencies:  
- TASK-050  
- INTEGRATION_MAP.md  
- N8N_WORKFLOW_MAP.md

Acceptance criteria:  
- publication triggers, payload path, result states, and failure handling are defined

---

### Wave 7 — Sync engine  
These tasks keep live offers safe.

#### TASK-060 Create SYNC_ENGINE_SPEC.md  
Dependencies:  
- TASK-030  
- TASK-052

Acceptance criteria:  
- pricing and stock rules are both covered  
- pause conditions are explicit

#### TASK-061 Create sync workflow doc  
Suggested file:  
- docs/workflows/SYNC_WORKFLOW.md

Dependencies:  
- TASK-060  
- EVENT_FLOW.md

Acceptance criteria:  
- scheduled sync flow is documented  
- change thresholds and exception behavior are defined

---

### Wave 8 — Order automation  
These tasks enable order pass-through.

#### TASK-070 Implement ORDER_AUTOMATION_SPEC.md in repo  
Dependencies:  
- TASK-010  
- TASK-052

Acceptance criteria:  
- order states and validation rules are explicit  
- supplier submission logic is documented

#### TASK-071 Create order routing workflow doc  
Suggested file:  
- docs/workflows/ORDER_ROUTING_WORKFLOW.md

Dependencies:  
- TASK-070  
- N8N_WORKFLOW_MAP.md  
- EVENT_FLOW.md

Acceptance criteria:  
- order intake, validation, supplier submission, and tracking association are covered

#### TASK-072 Create supplier order contract spec  
Suggested file:  
- docs/integrations/SUPPLIER_ORDER_CONTRACT.md

Dependencies:  
- TASK-070  
- INTEGRATION_MAP.md

Acceptance criteria:  
- payload schema, acknowledgement logic, and failure handling are explicit

---

### Wave 9 — Customer support automation  
These tasks enable controlled AI support.

#### TASK-080 Implement CUSTOMER_SUPPORT_POLICY.md in repo  
Dependencies:  
- TASK-042

Acceptance criteria:  
- allowed and forbidden automated responses are explicit  
- escalation triggers are clear

#### TASK-081 Create support workflow doc  
Suggested file:  
- docs/workflows/SUPPORT_WORKFLOW.md

Dependencies:  
- TASK-080  
- EVENT_FLOW.md  
- N8N_WORKFLOW_MAP.md

Acceptance criteria:  
- inbound message path, classification, drafting, sending, and escalation are defined

---

### Wave 10 — Control tower and QA  
These tasks make the system operable and reviewable.

#### TASK-090 Create CONTROL_TOWER_DASHBOARD.md  
Dependencies:  
- TASK-011  
- TASK-013 Exception queue builder concept from N8N_WORKFLOW_MAP.md

Acceptance criteria:  
- KPI sections are defined  
- exception queue view is described  
- supplier health and workflow health are included

#### TASK-091 Create TEST_CASES.md and ACCEPTANCE_CHECKLIST.md  
Dependencies:  
- all major module docs above

Acceptance criteria:  
- test cases exist for import, rules, listing, sync, orders, and support  
- acceptance checklist is implementation-ready

#### TASK-092 Create INCIDENT_PLAYBOOK.md  
Dependencies:  
- SECURITY_AND_GUARDRAILS.md  
- EVENT_FLOW.md

Acceptance criteria:  
- common failures have response steps  
- escalation ownership is clear

---

## Parallel-safe tasks  
These may be done in parallel after dependencies are met:  
- TASK-040, TASK-041, TASK-042  
- TASK-051 and TASK-060 after listing/publication logic stabilizes  
- TASK-090 and TASK-091 after enough schema and workflow contracts exist

## Minimum viable Codex build order  
If speed is critical, use this compressed order:  
1. TASK-001  
2. TASK-002  
3. TASK-003  
4. TASK-010  
5. TASK-020  
6. TASK-022  
7. TASK-030  
8. TASK-040  
9. TASK-050  
10. TASK-052  
11. TASK-060  
12. TASK-070  
13. TASK-071  
14. TASK-080  
15. TASK-081  
16. TASK-090  
17. TASK-091

## Definition of done for each task  
A task is done only when:  
- target file exists in correct repo location  
- content is not placeholder-only  
- dependencies are respected  
- acceptance criteria are met  
- related docs are cross-referenced where helpful

## Recommended next immediate execution block  
Start with:  
- TASK-001 Create repository scaffold  
- TASK-002 Add initial root markdown files  
- TASK-003 Add architecture and vision docs  
- TASK-010 Create core SQL schema files

These four tasks unlock nearly everything else.  
