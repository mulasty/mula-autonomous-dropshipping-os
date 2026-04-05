# CONTROL_TOWER_DASHBOARD.md

## Purpose
Define the operator-facing visibility layer for monitoring system health, exceptions, performance, and required human actions.

## Mission
Give the operator one coherent place to understand what the autonomous system is doing, where risk exists, and what requires intervention.

## Scope
This module covers:
- KPI visibility
- exception queue visibility
- supplier health visibility
- workflow health visibility
- listing safety visibility
- order routing visibility
- support automation visibility
- daily summary structure

## Principles
- surface risk before damage compounds
- make exceptions actionable, not just visible
- prefer operator clarity over dashboard vanity
- focus on decisions and bottlenecks, not noise

## Core dashboard sections

### 1. Executive summary
Primary metrics at a glance:
- products imported
- products qualified
- listings published
- active listings paused
- order routing success rate
- support automation rate
- open exceptions by severity

### 2. Exception queue
Display fields:
- exception_id
- entity_type
- entity_id
- domain
- severity
- reason_code
- summary
- created_at
- status

Recommended filters:
- severity
- domain
- status
- age

### 3. Supplier health panel
Suggested metrics:
- last import status
- import freshness
- parse failure rate
- zero-valid-record incidents
- stock reliability score
- cancellation rate
- fulfillment delay trend

### 4. Product qualification panel
Suggested metrics:
- approved count
- blocked count
- review_required count
- improve_required count
- rejected count
- top reason codes

### 5. Listing and sync panel
Suggested metrics:
- active listings
- listings paused by sync
- listings hidden/unpublished by sync
- pricing updates in last period
- stock changes in last period
- repeated sync failures

### 6. Order operations panel
Suggested metrics:
- orders received
- orders validated
- orders submitted to supplier
- supplier submission failures
- tracking missing beyond SLA
- stock conflicts after purchase

### 7. Support automation panel
Suggested metrics:
- messages received
- auto-classified count
- auto-responded count
- escalated count
- top escalation reason codes
- low-confidence cases

### 8. Workflow health panel
Suggested metrics:
- workflow success rate by workflow
- failure count by workflow
- retry count
- last successful run per critical workflow
- repeated failure alerts

## Daily summary structure
Suggested sections:
- system health snapshot
- major exceptions requiring attention
- supplier issues
- listing safety issues
- order/logistics issues
- support risk issues
- recommended operator priorities for the day

## Operator action model
The dashboard should support:
- prioritization by severity
- filtering by domain
- drilling into entity-specific context
- reviewing reason codes and history
- resolving or acknowledging exceptions

## Recommended supporting views
- exception_queue_view
- supplier_health_view
- margin_monitoring_view
- order_routing_health_view
- support_automation_view
- workflow_health_view

## Alert alignment
Dashboard should align with alerting rules:
- critical alerts demand immediate visibility
- high-severity items appear in top queue
- medium severity may batch but stay visible

## Acceptance criteria
- operator can identify top risks quickly
- exception handling is not hidden behind analytics clutter
- dashboard structure maps directly to system domains
- daily summary can be generated from dashboard data model

## Open questions
- whether control tower starts as SQL views + manual reporting or immediate UI
- whether first version lives in BI tool, internal app, or both
