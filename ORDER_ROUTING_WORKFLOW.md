# ORDER_ROUTING_WORKFLOW.md

## Purpose
Describe the workflow that receives validated internal orders and routes them to the supplier using the canonical supplier order contract.

## Mission
Move orders safely from internal commerce state to supplier execution with traceability, exception handling, and controlled acknowledgement logic.

## Scope
This workflow covers:
- routable order intake
- final routing checks
- supplier payload creation
- supplier submission
- acknowledgement handling
- tracking follow-up triggers

## Entry conditions
An order may enter this workflow only when:
- order validation passed
- payment/routing policy conditions are satisfied
- supplier mapping exists for all routed items
- destination is supported by supplier policy

## Workflow stages
1. order_routing_requested
2. routable_order_loaded
3. final_routing_validation_started
4. final_routing_validation_passed OR final_routing_validation_failed
5. supplier_payload_built
6. supplier_submission_started
7. supplier_submission_acknowledged OR supplier_submission_rejected OR supplier_submission_ambiguous OR supplier_submission_timeout
8. awaiting_tracking_marked when applicable
9. exception_created when needed

## Inputs
- order record
- order items
- supplier mapping data
- supplier order contract
- routing policy

## Outputs
- supplier submission record
- order event log entries
- supplier acknowledgement status
- exception record when needed

## Failure modes
- final mapping inconsistency
- malformed supplier payload
- supplier rejection
- ambiguous supplier acknowledgement
- duplicate submission risk
- timeout without safe retry certainty

## Acceptance criteria
- invalid orders do not route to supplier
- supplier acknowledgement states are explicit
- timeout and ambiguity do not masquerade as success
- order routing failures are actionable through exceptions
