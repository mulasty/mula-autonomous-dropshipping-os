# SUPPORT_WORKFLOW.md

## Purpose
Describe the workflow that receives customer messages, classifies them, decides whether automation is allowed, and either drafts/sends a response or escalates the case.

## Mission
Handle low-risk support cases quickly while ensuring risky or ambiguous cases are escalated instead of improvised.

## Scope
This workflow covers:
- inbound support message intake
- classification
- automation eligibility decision
- response drafting/sending
- escalation handling
- support-related logging

## Entry conditions
A message may enter this workflow when:
- inbound message text is captured
- message channel is known
- relevant order/product context is available when applicable
- support policy version is available

## Workflow stages
1. support_message_received
2. support_context_loaded
3. support_classification_started
4. support_classified
5. automation_allowed_decided
6. support_response_drafting_started OR support_escalation_started
7. support_response_drafted OR support_escalated
8. support_response_sent when permitted
9. support_case_closed OR awaiting_operator_action

## Inputs
- customer message
- order context if available
- tracking context if available
- support policy
- escalation rules
- prompt version if AI is used

## Outputs
- classification label
- automation_allowed decision
- response draft or sent response
- escalation record when needed
- support event log

## Branching rules
### Automation allowed
Low-risk, policy-safe cases may be drafted or sent according to rollout mode.

### Escalation required
Risky, ambiguous, legal, safety, or compensation-related cases must not auto-send a response that pretends to resolve the matter.

## Failure modes
- missing support context
- low-confidence classification in risky class
- malformed AI output
- response draft conflicts with support policy
- message cannot be safely interpreted

## Acceptance criteria
- escalation path is terminal for risky cases until operator action
- support auto-response path is limited to allowed classes
- risky cases do not silently continue to auto-send
- support workflow status is reconstructable from logs
