# SUPPLIER_ORDER_CONTRACT.md

## Purpose
Define the contract for submitting validated orders from the system to a supplier execution endpoint or supplier-compatible handoff channel.

## Mission
Ensure that supplier order forwarding is structured, traceable, idempotent where possible, and safe against malformed payloads or ambiguous acknowledgement states.

## Scope
This contract covers:
- outbound order payload shape
- required fields
- acknowledgement expectations
- failure handling
- idempotency expectations
- tracking handoff assumptions

## Principles
- no supplier submission before internal validation passes
- payloads should be minimal but complete
- supplier acknowledgement must be logged
- ambiguous supplier states must escalate
- retries must avoid silent duplicate submissions

## Entry conditions
An order may be sent to supplier only when:
- order validation passed
- payment status meets routing policy
- item mappings are complete
- supplier_sku exists for every routed item
- destination country is supported

## Minimum outbound payload
Suggested canonical payload:
```json
{
  "order_id": "string",
  "supplier_id": "string",
  "submitted_at": "timestamp",
  "items": [
    {
      "supplier_sku": "string",
      "quantity": 1
    }
  ],
  "shipping_address": {
    "full_name": "string",
    "line1": "string",
    "line2": "string or null",
    "postal_code": "string",
    "city": "string",
    "country": "string",
    "phone": "string or null"
  },
  "customer_notes": "string or null"
}
```

## Required fields
- order_id
- supplier_id
- at least one item
- supplier_sku for each item
- quantity for each item
- shipping full_name
- shipping line1
- shipping postal_code
- shipping city
- shipping country

## Optional fields
- line2
- phone
- customer_notes
- internal metadata not sent to supplier but logged internally

## Acknowledgement model
Supplier response should ideally return:
- acknowledgement status
- supplier order reference if available
- accepted/rejected result
- error code or message if rejected
- tracking reference if immediately available

Suggested canonical internal interpretation:
- acknowledged
- rejected
- ambiguous
- timeout

## Idempotency rules
- each outbound submission attempt should include internal submission reference
- repeated attempts should be detectable internally
- timeout without acknowledgement should not assume success
- ambiguous responses should escalate before blind repeat submission where duplicate risk is material

## Failure modes
- supplier endpoint unavailable
- malformed request rejected
- supplier rejects one or more items
- unsupported destination
- duplicate submission risk
- acknowledgement missing
- tracking never received after accepted submission

## Exception triggers
Escalate when:
- supplier rejects order
- supplier response is ambiguous
- timeout occurs without safe retry certainty
- partial acceptance occurs
- tracking missing beyond SLA

## Logging requirements
For each submission attempt, store:
- order_id
- supplier_id
- submission_reference
- outbound payload snapshot reference
- response snapshot reference
- acknowledgement status
- supplier_order_reference if available
- created_at

## Acceptance criteria
- contract is sufficient for supplier handoff implementation
- required fields are explicit
- acknowledgement handling is standardized
- duplicate risk is controlled by process, not guesswork

## Open questions
- first supplier submission channel for v1: API, email, file, or panel-assisted
- whether per-supplier adapters will wrap this canonical contract in later phases
