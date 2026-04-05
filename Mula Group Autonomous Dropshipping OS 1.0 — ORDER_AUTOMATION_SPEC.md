# ORDER_AUTOMATION_SPEC.md

## Purpose  
Define the workflow and safeguards for receiving, validating, forwarding, and tracking customer orders in the dropshipping system.

## Mission  
Move valid orders from sales channel to supplier execution with high traceability, controlled failure handling, and minimal manual intervention.

## Inputs  
- incoming order from BaseLinker or primary channel  
- product and supplier mapping data  
- order item SKUs  
- shipping address  
- customer contact data  
- payment status  
- supplier submission rules

## Outputs  
- validated order record  
- supplier submission payload  
- supplier submission status  
- tracking association record  
- order event log  
- exception record when needed

## Core responsibilities  
1. ingest new orders  
2. validate order readiness  
3. verify SKU and supplier mapping  
4. verify stock and product state if required  
5. submit order to supplier  
6. receive submission acknowledgement  
7. associate tracking updates  
8. update status in commerce layer  
9. escalate failed cases

## Required validations  
### Order integrity  
- order has at least one item  
- order has valid status for routing  
- payment state matches policy for forwarding  
- destination data is present

### Item integrity  
- every item has known internal product mapping  
- supplier SKU mapping exists  
- product is not blocked or archived

### Address integrity  
- required fields present  
- country supported by target supplier workflow  
- obviously malformed values flagged

### Financial integrity  
- payment cleared if required by policy  
- suspicious mismatch cases escalated

## Canonical order states  
- received  
- validated  
- validation_failed  
- queued_for_supplier  
- submitted_to_supplier  
- supplier_acknowledged  
- awaiting_tracking  
- in_transit  
- delivered  
- exception  
- cancelled

## Failure modes  
- missing SKU mapping  
- blocked product still ordered  
- supplier API unavailable  
- supplier rejects order  
- stock mismatch after purchase  
- address validation failure  
- tracking never arrives  
- duplicate submission risk

## Idempotency requirement  
The order automation layer must minimize duplicate supplier submissions. Every submission attempt should have a unique internal event key and submission log.

## Suggested order routing workflow  
1. receive new order event  
2. normalize order payload  
3. validate payment and routing eligibility  
4. validate item mappings  
5. prepare supplier payload  
6. submit to supplier  
7. log response  
8. if accepted, move to awaiting_tracking  
9. poll or receive tracking event  
10. update commerce layer and customer-facing status

## Suggested supplier payload schema  
```json  
{  
  "order_id": "string",  
  "supplier_id": "string",  
  "items": [  
    {  
      "supplier_sku": "string",  
      "quantity": 1  
    }  
  ],  
  "shipping_address": {  
    "name": "string",  
    "line1": "string",  
    "postal_code": "string",  
    "city": "string",  
    "country": "string",  
    "phone": "string"  
  },  
  "customer_notes": "string"  
}  
```

## Escalation triggers  
Escalate when:  
- supplier rejects order  
- supplier response is ambiguous  
- stock mismatch occurs after sale  
- order contains unmapped SKU  
- address data is incomplete  
- tracking is missing beyond allowed SLA  
- order cancellation arrives mid-process

## Logging requirements  
For each order event, store:  
- order_id  
- event_type  
- timestamp  
- payload reference  
- supplier submission id if available  
- response code  
- exception code if any  
- current state

## Operator queue categories  
- mapping_issue  
- supplier_rejection  
- tracking_missing  
- payment_hold  
- stock_conflict  
- cancellation_conflict

## Acceptance criteria  
- valid orders route successfully to supplier  
- invalid orders do not route silently  
- every failed order creates an actionable exception  
- duplicate submission risk is controlled  
- tracking can be associated back to the correct order

## Open questions  
- exact payment state required before supplier forwarding  
- whether stock check is pre-forwarding or policy-based  
- how supplier-specific submission acknowledgements are normalized  
- how long to wait before raising missing tracking exception  
