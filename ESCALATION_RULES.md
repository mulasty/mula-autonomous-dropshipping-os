# ESCALATION_RULES.md

## Purpose
Define when the system must stop autonomous progression and route a case to operator review or intervention.

## Mission
Protect the business by making escalation explicit, predictable, and reusable across imports, product qualification, listings, orders, sync jobs, and customer support.

## Principle
When uncertainty or risk crosses a defined threshold, the system must escalate instead of improvising.

## Escalation domains
- supplier intake
- normalization
- product qualification
- listing generation and validation
- publication and sync
- order routing
- tracking/logistics
- customer support
- AI execution

## Generic escalation schema
Recommended common fields:
- escalation_id
- entity_type
- entity_id
- domain
- severity
- escalation_reason_code
- summary
- details_json
- created_at
- status

## Severity levels
- low
- medium
- high
- critical

## Core escalation rules by domain

### 1. Supplier intake escalations
Escalate when:
- source cannot be fetched
- parse fails globally
- accepted rows count is zero
- rejection ratio exceeds threshold
- duplicate import is suspected

Suggested reason codes:
- SOURCE_UNREACHABLE
- AUTH_FAILURE
- PARSE_FAILURE
- ZERO_VALID_RECORDS
- HIGH_REJECTION_RATIO
- DUPLICATE_IMPORT_SUSPECTED

### 2. Normalization escalations
Escalate when:
- required identifiers cannot be resolved
- category mapping is highly uncertain for important products
- cost/stock data is contradictory
- encoding corruption prevents reliable normalization

Suggested reason codes:
- MISSING_REQUIRED_IDENTIFIER
- CONTRADICTORY_COST_DATA
- CONTRADICTORY_STOCK_DATA
- HIGH_CATEGORY_UNCERTAINTY
- ENCODING_CORRUPTION

### 3. Product qualification escalations
Escalate when:
- blocked product is strategically important
- review_required product sits near approval threshold
- supplier trust deterioration changes expected eligibility materially
- AI output conflicts with deterministic rules

Suggested reason codes:
- STRATEGIC_BLOCKED_PRODUCT
- BORDERLINE_MARGIN_REVIEW
- SUPPLIER_TRUST_DROP
- AI_RULE_CONFLICT

### 4. Listing generation and validation escalations
Escalate when:
- generated content conflicts with structured product facts
- required channel attributes remain missing
- validation repeatedly fails
- high-risk claims appear in output

Suggested reason codes:
- FACT_CONFLICT
- MISSING_CHANNEL_ATTRIBUTE
- REPEATED_VALIDATION_FAILURE
- RISKY_CLAIM_DETECTED

### 5. Publication and sync escalations
Escalate when:
- active listing falls below safe margin threshold
- cost changes require price movement beyond allowed threshold
- stock becomes unreliable for live listing
- publication fails repeatedly

Suggested reason codes:
- LIVE_MARGIN_UNSAFE
- PRICE_CHANGE_THRESHOLD_EXCEEDED
- STOCK_UNRELIABLE
- REPEATED_PUBLICATION_FAILURE

### 6. Order routing escalations
Escalate when:
- supplier rejects order
- supplier response is ambiguous
- order has unmapped SKU
- stock mismatch occurs after purchase
- tracking is missing beyond SLA

Suggested reason codes:
- SUPPLIER_ORDER_REJECTED
- SUPPLIER_RESPONSE_AMBIGUOUS
- UNMAPPED_SKU
- POST_PURCHASE_STOCK_CONFLICT
- TRACKING_MISSING_SLA

### 7. Customer support escalations
Escalate immediately when:
- customer mentions lawyer, court, regulator, fraud, scam, chargeback
- customer reports product safety issue or injury
- customer requests compensation outside policy
- customer is highly aggressive or threatening
- AI confidence is low in a risky class

Suggested reason codes:
- LEGAL_RISK
- REGULATORY_RISK
- FRAUD_OR_SCAM_CLAIM
- CHARGEBACK_RISK
- SAFETY_INCIDENT
- COMPENSATION_EXCEPTION_REQUEST
- AGGRESSIVE_CUSTOMER
- LOW_CONFIDENCE_RISK_CLASS

### 8. AI execution escalations
Escalate when:
- output is malformed and non-recoverable by retry
- confidence is below module threshold
- output contradicts hard rules
- prompt/schema mismatch is detected

Suggested reason codes:
- MALFORMED_AI_OUTPUT
- LOW_CONFIDENCE
- HARD_RULE_CONFLICT
- PROMPT_SCHEMA_MISMATCH

## Escalation handling rules
- critical escalation should trigger immediate alert
- high severity should enter operator queue and alert on defined channels
- medium severity should enter queue for same-day review
- low severity may remain queued without immediate alert

## Routing recommendations
Suggested operator destinations:
- intake/ops owner for supplier failures
- catalog/listing owner for product and listing issues
- order operations owner for routing/logistics issues
- support owner for customer escalations
- project owner for repeated systemic failures

## Acceptance criteria
- every major module has explicit escalation triggers
- reason codes are reusable and machine-readable
- severity logic supports alerts and queues
- escalation replaces unsafe automation, not supplements it silently

## Open questions
- exact alert channels and SLAs by severity
- whether some medium-severity cases auto-batch into daily review instead of immediate queueing
