# SUPPLIER_ORDER_CONTRACT.md

## Purpose
Define the canonical contract between the internal order-routing layer and external supplier order submission adapters.

## Mission
The supplier order contract ensures that routed orders can be submitted to suppliers in a consistent, traceable, and safe format while preserving ambiguity, rejection, timeout, and acknowledgement as distinct outcomes.

## Scope
This contract covers:
- payload shape for supplier submission
- acknowledgement result shape
- retry/idempotency expectations
- timeout and ambiguity handling
- minimum supplier response semantics

This contract does not cover:
- supplier-specific HTTP/XML client details
- logistics tracking polling implementation
- invoice or accounting reconciliation

## Submission prerequisites
An order may only be submitted to supplier routing when:
- order status is validated
- payment status satisfies routing policy
- each item has a supplier SKU mapping
- destination is allowed by policy
- shipping address is materially complete

## Canonical supplier submission payload
Suggested payload fields:
- orderId
- supplierId
- submittedAt
- submissionReference
- items[]
- shippingAddress
- customerNotes

### Item fields
- supplierSku
- quantity

### Shipping address fields
- fullName
- line1
- line2 (optional)
- postalCode
- city
- region (optional)
- country
- phone (optional if policy/source allows)
- email (optional if policy/source allows)

## Idempotency
Every submission should carry a stable internal submission reference.

### Rules
- retries must reuse or reference the correct idempotency/submission key strategy
- duplicate risky submissions must not be invisible
- if supplier API cannot guarantee idempotency, the adapter must expose that risk clearly

## Canonical acknowledgement statuses
Recommended statuses:
- acknowledged
- rejected
- timeout
- ambiguous

### acknowledged
Supplier has clearly accepted the order for downstream fulfillment or tracking wait.

### rejected
Supplier has clearly refused the order.

### timeout
Supplier did not return a reliable response within accepted operational bounds.

### ambiguous
Supplier response was received but is not reliable enough to classify as success or clean rejection.

## Canonical supplier submission result
Suggested result fields:
- acknowledgementStatus
- submissionReference
- supplierOrderReference
- responseSummary
- retrySafe
- rawResponseReference (optional)

## Retry safety
The supplier submission result should indicate whether retry is operationally safe.

### Examples
- rejected with known validation issue: retrySafe may be false until human correction
- timeout with uncertain supplier processing: retrySafe may be false or cautionary
- network failure before any request confirmation: retrySafe may be true if adapter can prove non-delivery

## Exception triggers
Create or recommend exceptions when:
- supplier rejects order
- acknowledgement is ambiguous
- timeout occurs without safe retry certainty
- supplier returns contradictory identifiers
- submission payload is materially invalid for supplier contract

## Domain events
Suggested events:
- supplier_payload_built
- supplier_submission_started
- supplier_submission_acknowledged
- supplier_submission_rejected
- supplier_submission_timeout
- supplier_submission_ambiguous

## Guardrails
- do not collapse timeout into success
- do not collapse ambiguous response into acknowledged
- do not silently retry without idempotency consideration
- do not hide supplier rejection reasons

## Dependencies
- order routing policy
- validated order input
- exception service
- runtime logger
- future supplier-specific adapters

## Acceptance criteria
- acknowledged/rejected/timeout/ambiguous remain distinct
- payload contract is explicit and implementation-friendly
- submission references support traceability
- retry safety is surfaced, not guessed silently

## Open questions
- first supplier transport protocol in production
- whether supplier adapters will expose raw response archive references in v1
