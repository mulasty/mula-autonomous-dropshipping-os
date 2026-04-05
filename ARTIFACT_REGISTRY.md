# ARTIFACT_REGISTRY.md

## Purpose
Provide a lightweight, text-based registry of repository artifacts so Codex and human contributors can navigate the project without relying on binary indexes or external storage.

## Working rule
This registry is now the primary in-repo artifact index for the project.

Use it to:
- identify canonical source-of-truth files
- find the right spec before implementation
- see which artifacts already exist
- see which artifacts are planned next

## Current repository mode
The repository currently operates as a flat documentation workspace at repo root.

Until an intentional migration happens, new documentation artifacts should be added at repo root unless a task explicitly includes the folder split.

---

## 1. Orientation and governance artifacts

### START_HERE.md
Role: primary entry point for every contributor and Codex session.
Status: active
Priority: critical

### README.md
Role: high-level project summary, scope, and contributor orientation.
Status: active
Priority: critical

### REPOSITORY_BLUEPRINT.md
Role: defines current flat repo mode and future migration structure.
Status: active
Priority: critical

### IMPLEMENTATION_PHASES.md
Role: defines delivery order, dependencies, and phase gates.
Status: active
Priority: critical

### PROJECT_CHANGELOG.md
Role: logs repo-level structural and canonical changes.
Status: active
Priority: high

### ARTIFACT_REGISTRY.md
Role: text-based registry of all major repository artifacts.
Status: active
Priority: critical

### COMPENDIUM.txt
Role: strategic and operational master knowledge base.
Status: active
Priority: high

### PROJECT_INDEX.xlsx
Role: legacy binary artifact index.
Status: retained
Priority: low
Note: not ideal for Codex or text-based review workflows.

---

## 2. Architecture artifacts

### SYSTEM_OVERVIEW.md
Role: business-facing and implementation-facing whole-system overview.
Status: active
Priority: critical

### ARCHITECTURE_OVERVIEW.md
Role: layered technical architecture and responsibilities.
Status: active
Priority: critical

### DATA_MODEL.md
Role: canonical entities, relationships, and state enums.
Status: active
Priority: critical

### INTEGRATION_MAP.md
Role: external/internal integration map and ownership.
Status: active
Priority: critical

### EVENT_FLOW.md
Role: canonical business and technical event sequences.
Status: active
Priority: critical

### SECURITY_AND_GUARDRAILS.md
Role: hard limits, risk boundaries, and safety rules.
Status: active
Priority: critical

---

## 3. Core module specifications

### PRODUCT_RULES_ENGINE.md
Role: deterministic product eligibility and blocking logic.
Status: active
Priority: critical

### LISTING_FACTORY_SPEC.md
Role: grounded listing generation contract and controls.
Status: active
Priority: critical

### ORDER_AUTOMATION_SPEC.md
Role: order validation, routing, and supplier submission logic.
Status: active
Priority: critical

### CUSTOMER_SUPPORT_POLICY.md
Role: safe automation boundaries for customer support.
Status: active
Priority: critical

### AI_AGENT_PROMPT_LIBRARY.md
Role: registry of agent roles, prompt patterns, and schema discipline.
Status: active
Priority: high

### N8N_WORKFLOW_MAP.md
Role: workflow inventory and automation dependency map.
Status: active
Priority: high

### SUPPLIER_INTAKE_SPEC.md
Role: supplier import lifecycle, statuses, and failure handling.
Status: active
Priority: critical

### NORMALIZATION_RULES.md
Role: canonical transformation rules from raw supplier data to normalized records.
Status: active
Priority: critical

### MARGIN_CALCULATION_SPEC.md
Role: explicit profitability model and margin-related reason codes.
Status: active
Priority: critical

### QUALIFICATION_WORKFLOW.md
Role: branching workflow from normalized product to listing candidate readiness.
Status: active
Priority: critical

### ESCALATION_RULES.md
Role: machine-readable escalation triggers, severity model, and routing logic.
Status: active
Priority: critical

---

## 4. Codex execution artifacts

### CODEX_TASK_PACK.md
Role: execution-ready task map for phased implementation.
Status: active
Priority: high

### CODEX_START_PROMPT_PHASE_1.md
Role: initial execution prompt for first build block.
Status: active
Priority: medium

---

## 5. Current implementation-ready packs

### Pack A — Documentation foundation
Includes:
- START_HERE.md
- README.md
- REPOSITORY_BLUEPRINT.md
- IMPLEMENTATION_PHASES.md
- PROJECT_CHANGELOG.md
- ARTIFACT_REGISTRY.md

Purpose:
- establish navigation
- define repo operating mode
- prevent Codex drift

### Pack B — Architecture foundation
Includes:
- SYSTEM_OVERVIEW.md
- ARCHITECTURE_OVERVIEW.md
- DATA_MODEL.md
- INTEGRATION_MAP.md
- EVENT_FLOW.md
- SECURITY_AND_GUARDRAILS.md

Purpose:
- define structure before code
- lock core concepts and flows

### Pack C — Commerce logic foundation
Includes:
- PRODUCT_RULES_ENGINE.md
- LISTING_FACTORY_SPEC.md
- ORDER_AUTOMATION_SPEC.md
- CUSTOMER_SUPPORT_POLICY.md
- AI_AGENT_PROMPT_LIBRARY.md
- N8N_WORKFLOW_MAP.md

Purpose:
- define domain behavior for listings, orders, support, and workflows

### Pack D — Post-SQL execution pack
Includes:
- SUPPLIER_INTAKE_SPEC.md
- NORMALIZATION_RULES.md
- MARGIN_CALCULATION_SPEC.md
- QUALIFICATION_WORKFLOW.md
- ESCALATION_RULES.md

Purpose:
- support backend work after schema foundation
- guide intake, normalization, rules, and exception logic

---

## 6. Next planned artifacts for Codex support

### Highest-priority next pack
- SYNC_ENGINE_SPEC.md
- CONTROL_TOWER_DASHBOARD.md
- SUPPLIER_ORDER_CONTRACT.md
- LISTING_VALIDATION_SPEC.md
- CHANNEL_CONSTRAINTS.md

Purpose:
- prepare listing/sync/order layers ahead of implementation

### After that
- LISTING_WORKFLOW.md
- SYNC_WORKFLOW.md
- ORDER_ROUTING_WORKFLOW.md
- SUPPORT_WORKFLOW.md
- TEST_CASES.md
- ACCEPTANCE_CHECKLIST.md
- INCIDENT_PLAYBOOK.md

---

## 7. Suggested reading order by task type

### For schema/backend work
1. START_HERE.md
2. REPOSITORY_BLUEPRINT.md
3. ARCHITECTURE_OVERVIEW.md
4. DATA_MODEL.md
5. EVENT_FLOW.md
6. relevant module spec

### For intake/normalization work
1. SUPPLIER_INTAKE_SPEC.md
2. NORMALIZATION_RULES.md
3. DATA_MODEL.md
4. INTEGRATION_MAP.md
5. ESCALATION_RULES.md

### For rules/listing work
1. PRODUCT_RULES_ENGINE.md
2. MARGIN_CALCULATION_SPEC.md
3. QUALIFICATION_WORKFLOW.md
4. LISTING_FACTORY_SPEC.md
5. SECURITY_AND_GUARDRAILS.md

### For orders/support work
1. ORDER_AUTOMATION_SPEC.md
2. CUSTOMER_SUPPORT_POLICY.md
3. ESCALATION_RULES.md
4. EVENT_FLOW.md
5. N8N_WORKFLOW_MAP.md

---

## 8. Registry maintenance rules
- add every new canonical document here when created
- update status if an artifact becomes deprecated or replaced
- log structural registry changes in PROJECT_CHANGELOG.md
- do not treat binary indexes as primary navigation if a text registry exists

## 9. Status summary
Repository-first workflow is now active.
Google Drive is no longer required as the operating artifact layer for ongoing implementation.
The repository should be treated as the primary execution workspace for Codex and future project development.
