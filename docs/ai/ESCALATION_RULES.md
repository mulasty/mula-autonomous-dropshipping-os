# ESCALATION_RULES.md

## Purpose
Define the canonical escalation triggers, severity logic, and operator handoff expectations across the system.

## Mission
Escalation rules exist to prevent uncertain, risky, or policy-sensitive scenarios from being treated as routine automation success.

## Scope
This document covers escalation across:
- supplier intake
- normalization
- rules engine
- qualification
- order routing
- support
- sync engine
- control tower visibility

## Core principle
When confidence is low or risk is high, the system must surface reality and hand off explicitly rather than improvise.

## Canonical severity levels
Recommended levels:
- low
- medium
- high
- critical

## Escalation domains
- supplier_intake
- normalization
- qualification
- order_routing
- support
- sync
- publication
- control_tower

## Intake escalation triggers
Escalate when:
- source is unreachable
- parsing fails materially
- zero accepted rows remain after prevalidation
- source freshness is materially broken
- payload structure changes unexpectedly

Recommended severity:
- parsing/source failures: high
- repeated import failure across cycles: critical

## Normalization escalation triggers
Escalate when:
- critical identity fields cannot be resolved
- canonical mapping becomes impossible
- source records are partially usable but structurally suspicious
- category mapping is materially uncertain in sensitive categories

Recommended severity:
- review ambiguity: medium
- normalization impossible for strategic import set: high

## Rules engine escalation triggers
Escalate when:
- product status is blocked
- required cost assumptions are missing in strategic contexts
- supplier trust is below minimum threshold
- policy conflict makes auto-progression unsafe

Recommended severity:
- blocked product: medium or high depending on business priority
- repeated policy breach patterns: high

## Qualification escalation triggers
Escalate when:
- blocked qualification is returned
- review_required intersects with high business priority
- downstream next step would be risky without operator decision

Recommended severity:
- blocked: high
- high-priority review: high
- ordinary review queue item: medium

## Order routing escalation triggers
Escalate when:
- routing validation fails
- supplier rejects order
- supplier response is ambiguous
- supplier submission times out without safe retry confidence
- address/payment/item mapping is invalid

Recommended severity:
- validation failure: high
- rejection: high
- ambiguous/timeout with delivery risk: critical

## Support escalation triggers
Escalate immediately when:
- legal threat appears
- safety incident appears
- fraud or scam accusation appears
- compensation/chargeback dispute appears
- AI confidence is low
- order state or facts are contradictory

Recommended severity:
- legal/safety/fraud: critical
- low-confidence but non-hostile: high

## Sync escalation triggers
Escalate when:
- live listing price becomes unsafe
- stock state becomes unknown for active listing
- sync drift suggests overselling risk
- price movement exceeds allowed threshold

Recommended severity:
- overselling risk: critical
- missing/unsafe cost state: high
- threshold breach requiring operator approval: medium or high

## Publication escalation triggers
Escalate when:
- listing validation fails critically
- channel response is contradictory
- publication status is ambiguous
- listing would publish with unsafe or incomplete data

## Escalation output requirements
Every escalation should preserve:
- entityType
- entityId
- domain
- severity
- reasonCode
- summary
- details
- recommendedNextStep
- exception reference when persisted

## Handoff expectations
Escalated cases should be routed to:
- operator review queue
- exception queue
- control tower summary
- alert channel when severity justifies it

## Guardrails
- do not auto-resolve escalated cases silently
- do not downgrade critical ambiguity to success
- preserve original reason codes and supporting facts
- make severity explainable and reviewable

## Acceptance criteria
- each critical domain has explicit escalation triggers
- severity mapping is understandable
- escalation outputs are persistence-friendly
- operator handoff path remains visible

## Open questions
- exact severity thresholds for automated alerts in v1
- whether certain domains should auto-page or only enter queue in early rollout
