# INCIDENT_PLAYBOOK.md

## Purpose
Provide a simple response framework for common failures and risk incidents in the autonomous commerce system.

## Principle
Incidents should be handled with clear containment, visibility, and follow-up rather than ad hoc reactions.

## Core incident response steps
1. identify the incident
2. assess severity
3. contain unsafe automation if needed
4. create or update exception record
5. notify responsible operator if severity requires it
6. document cause and resolution
7. add preventive follow-up if needed

## Severity model
- low
- medium
- high
- critical

## Incident types
### 1. Supplier intake incident
Examples:
- feed unavailable
- malformed payload
- zero valid records

Immediate actions:
- stop assuming fresh supplier state
- review latest successful import timestamp
- create exception and alert if threshold exceeded

### 2. Qualification/rules incident
Examples:
- blocked path bypass suspected
- margin formula mismatch
- AI conflict with hard rules

Immediate actions:
- stop downstream auto-progression for affected items
- inspect latest decisions and reason codes
- open corrective review task

### 3. Listing/sync incident
Examples:
- unsafe live listing
- cost change not reflected
- stock mismatch on live listing

Immediate actions:
- pause or hide affected listing if needed
- review recent sync actions
- assess customer-visible risk

### 4. Order routing incident
Examples:
- duplicate supplier submission risk
- ambiguous supplier acknowledgement
- tracking missing beyond SLA

Immediate actions:
- halt blind retry if duplicate risk exists
- review submission logs
- escalate to order operations owner

### 5. Support automation incident
Examples:
- risky message auto-sent incorrectly
- escalation missed
- unsupported promise sent

Immediate actions:
- stop further auto-send if systemic
- review support classification/output path
- escalate affected customer case manually

## Post-incident follow-up
- document root cause
- identify missing guardrail or unclear policy
- update docs/specs if source of truth was insufficient
- add test case if branch was previously untested

## Acceptance criteria
- common incident classes have containment guidance
- severe incidents clearly demand visibility and escalation
- incident handling leads back into docs and test improvement
