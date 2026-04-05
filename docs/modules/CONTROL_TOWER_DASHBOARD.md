# CONTROL_TOWER_DASHBOARD.md

## Purpose
Define the first usable control-tower view of system health, exceptions, and operational signals.

## Mission
The control tower provides operators with a truthful summary of what the system is doing, what is failing, and what requires attention.

## Scope
This module covers:
- exception queue visibility
- supplier health visibility
- workflow/runtime health visibility
- margin/risk visibility at summary level
- operator review backlog visibility
- daily summary expectations

This module does not cover:
- full BI implementation
- advanced visual dashboard UI design
- deep historical analytics beyond first operational views

## Core principle
The control tower should surface reality, not hide uncertainty behind green-looking summary states.

## Primary dashboard sections
### 1. Exception queue
Show at minimum:
- total open exceptions
- count by severity
- count by domain
- count by status
- oldest unresolved exception age

### 2. Supplier health
Show at minimum:
- last successful import time
- repeated import failure indicator
- supplier trust score or trust status
- cancellation/error trend where available
- feed freshness risk

### 3. Product pipeline health
Show at minimum:
- imports completed / partial / failed
- normalized products created
- products blocked / review_required / improve_required / approved
- qualification backlog

### 4. Listing and sync visibility
Show at minimum:
- listing drafts generated
- validation failures
- publication-ready count
- paused listings count
- sync alerts count

### 5. Order routing health
Show at minimum:
- routed orders count
- supplier rejected count
- ambiguous/timeouts count
- awaiting tracking count
- unresolved routing exceptions

### 6. Support visibility
Show at minimum:
- inbound message count
- auto-handled low-risk count
- escalated support count
- critical support cases open

## Daily summary expectations
The control tower should be able to power a daily summary containing:
- key counts
- top risks
- unresolved critical issues
- suggested operator priorities

## Read-model expectations
Useful read models or views include:
- exception_queue_view
- supplier_health_view
- margin_monitoring_view
- order_routing_health_view
- support_automation_view
- runtime_health_view

## Severity presentation
Severities should remain explicit:
- low
- medium
- high
- critical

Critical states should never be visually merged with ordinary backlog noise.

## Operator actions supported
The control tower should support or point to:
- review next exception
- review blocked products
- review routing failures
- review sync risks
- review critical support escalations

## Guardrails
- do not collapse ambiguous states into success summary
- do not hide unresolved critical exceptions
- do not report “healthy” when freshness or routing exceptions suggest otherwise
- preserve distinction between no data and good data

## Dependencies
- exceptions persistence
- supplier import visibility
- rules/qualification persistence
- order routing persistence
- future sync/support persistence

## Acceptance criteria
- dashboard spec covers the major runtime domains
- critical queue visibility is explicit
- summary logic can be implemented from persisted facts and views
- operator priorities are supportable from the model

## Open questions
- whether phase-one control tower is API/read-model only or includes an internal route
- exact daily summary transport channel in first runtime version
