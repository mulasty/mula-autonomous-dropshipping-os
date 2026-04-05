# IMPLEMENTATION_PHASES.md

## Purpose  
This file defines the execution order of the project and keeps implementation disciplined. It should be used to plan Codex tasks, development sprints, and acceptance gates.

## Guiding rule  
Do not jump ahead. Each phase depends on the reliability of the previous phase.

---

## Phase 0 - Strategic foundation  
### Goal  
Define what the system is allowed to do and what it must never do.

### Deliverables  
- business model assumptions  
- first supplier selection  
- first primary sales channel selection  
- allowed category list  
- banned category list  
- pricing policy assumptions  
- margin guardrails  
- escalation policy  
- customer support automation boundaries

### Exit criteria  
- project assumptions documented  
- phase 1 supplier chosen  
- first channel chosen  
- minimum margin framework agreed

---

## Phase 1 - Supplier intake and normalized product layer  
### Goal  
Ingest supplier product data and transform it into reliable internal records.

### Deliverables  
- supplier intake contract  
- importer workflow  
- raw product storage  
- normalized product schema  
- field mapping rules  
- quality scoring draft

### Exit criteria  
- supplier feed ingests successfully  
- normalized records are usable  
- missing or invalid fields are detectable  
- sample products are reviewable by operator

---

## Phase 2 - Product rules engine  
### Goal  
Make publication decisions safe and rule-driven.

### Deliverables  
- minimum margin logic  
- shipping time thresholds  
- category eligibility rules  
- supplier trust scoring logic  
- publication blocks and warnings  
- exception triggers

### Exit criteria  
- every product can be classified as approved, rejected, review_required, improve_required, or blocked  
- unsafe products are blocked before listing generation

---

## Phase 3 - Product intelligence layer  
### Goal  
Use AI to support product selection and enrichment without replacing rules.

### Deliverables  
- product selection agent prompt  
- output schema  
- selection scoring criteria  
- confidence and escalation rules  
- quality improvement recommendations

### Exit criteria  
- AI decisions are structured and logged  
- AI cannot override hard safety rules  
- operator can review selection outcomes clearly

---

## Phase 4 - Listing factory  
### Goal  
Generate channel-ready listings from approved or improve_required products that remain eligible.

### Deliverables  
- listing content rules  
- title generation logic  
- description generation logic  
- attribute completion logic  
- SEO metadata logic  
- listing payload schema

### Exit criteria  
- approved products can produce consistent listings  
- generated listings respect channel constraints  
- hallucination risk is bounded by source data rules

---

## Phase 5 - Publication and sync engine  
### Goal  
Publish listings and keep them synchronized safely.

### Deliverables  
- BaseLinker publication integration  
- channel mapping logic  
- price update logic  
- stock sync logic  
- visibility and unpublish safeguards  
- sync error handling

### Exit criteria  
- listings publish successfully  
- price changes respect thresholds  
- stock changes do not create false availability

---

## Phase 6 - Order routing automation  
### Goal  
Process new orders and forward them to the supplier reliably.

### Deliverables  
- order ingestion workflow  
- address validation rules  
- SKU match checks  
- supplier order forwarding flow  
- confirmation and tracking flow  
- order event logging

### Exit criteria  
- orders can flow from channel to supplier  
- failures enter exception queue  
- tracking updates can be associated with orders

---

## Phase 7 - Customer support automation  
### Goal  
Automate low-risk support without exposing the business to policy or reputation risk.

### Deliverables  
- support message classification  
- approved response types  
- forbidden response types  
- support escalation tree  
- support prompt library  
- message logging and QA process

### Exit criteria  
- simple inquiries can be answered automatically  
- high-risk cases are escalated without auto-resolution

---

## Phase 8 - Control tower and reporting  
### Goal  
Create an operator view of system health, exceptions, and business performance.

### Deliverables  
- exception queue dashboard  
- KPI reporting view  
- supplier health indicators  
- margin monitoring  
- automation success and failure reports  
- daily summary workflow

### Exit criteria  
- operator can review system status daily  
- critical failures trigger alerts  
- exception backlog is visible and actionable

---

## Phase 9 - Stabilization and hardening  
### Goal  
Make the system resilient enough for consistent use.

### Deliverables  
- retry logic  
- audit logs  
- incident playbook  
- acceptance checklist  
- backup routines  
- monitoring thresholds

### Exit criteria  
- common failures are recoverable  
- important actions are auditable  
- incident response is documented

---

## Suggested sprint rhythm  
### Sprint 1  
Phase 0 plus start of Phase 1

### Sprint 2  
Finish Phase 1 plus Phase 2

### Sprint 3  
Phase 3 plus start of Phase 4

### Sprint 4  
Finish Phase 4 plus Phase 5

### Sprint 5  
Phase 6

### Sprint 6  
Phase 7 plus Phase 8

### Sprint 7  
Phase 9 plus QA hardening

---

## Non-negotiable dependencies  
- no AI selection before normalized data exists  
- no publication before rules engine exists  
- no full sync before price guardrails exist  
- no customer support automation before escalation rules exist  
- no scaling before exception queue exists

---

## How to use this file with Codex  
Every coding task should reference:  
- current phase  
- target artifact  
- dependency files  
- expected acceptance criteria  
- known blocked items

---

## Notes  
This file is intended to prevent chaotic implementation and keep the project moving in a controlled order.
