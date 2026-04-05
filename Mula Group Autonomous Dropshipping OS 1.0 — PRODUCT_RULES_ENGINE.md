# PRODUCT_RULES_ENGINE.md

## Purpose  
Define the explicit business rules that determine whether a product is allowed to move through the system toward listing publication.

## Principle  
The rules engine is the non-negotiable safety layer. AI may support analysis, but it may never override hard rules.

## Scope  
This module governs:  
- product eligibility  
- margin safety  
- category safety  
- shipping promise feasibility  
- supplier trust constraints  
- review and escalation triggers

## Inputs  
- normalized product record  
- supplier metadata  
- pricing assumptions  
- marketplace/channel fee assumptions  
- shipping assumptions  
- policy configuration

## Outputs  
For each product, return:  
- decision_status  
- decision_reason_codes  
- computed_margin_metrics  
- risk_flags  
- recommended_next_step

## Standard decision statuses  
- approved  
- rejected  
- review_required  
- improve_required  
- blocked

## Core rule groups

### 1. Margin rules  
A product must not be published if the projected margin falls below minimum threshold.

Recommended fields:  
- cost_net  
- cost_gross  
- shipping_cost_estimate  
- marketplace_fee_estimate  
- payment_fee_estimate  
- handling_buffer  
- return_risk_buffer  
- target_profit  
- projected_net_margin  
- projected_gross_margin

Example rules:  
- reject if projected_net_margin < minimum_net_margin  
- review_required if projected_net_margin is within warning band above threshold  
- block if cost data is incomplete

### 2. Stock rules  
A product must not be treated as safely sellable if stock reliability is weak.

Example rules:  
- block if stock is null or invalid  
- review_required if stock is low and supplier freshness is poor  
- approved only if stock data freshness is within defined time window

### 3. Category rules  
Only allowed categories may pass automatically.

Example rules:  
- reject if product category is in banned list  
- review_required if category mapping confidence is low  
- improve_required if category is allowed but attribute completeness is weak

### 4. Data quality rules  
Weak product data should not create weak listings.

Example rules:  
- review_required if fewer than minimum required images  
- improve_required if title is too short or generic  
- block if core identifiers such as SKU are missing  
- review_required if attributes required by channel are missing

### 5. Supplier trust rules  
Supplier reliability directly affects automation depth.

Signals may include:  
- supplier error rate  
- cancellation rate  
- stock drift rate  
- average fulfillment delay  
- response SLA

Example rules:  
- block auto-publication if supplier trust score is below threshold  
- review_required if supplier trust is borderline

### 6. Shipping promise rules  
The system should not make promises that the supplier cannot meet.

Example rules:  
- reject for channels where delivery promise exceeds allowed range  
- review_required if declared shipping time is missing  
- block if shipping method is undefined for target channel

### 7. Compliance and policy rules  
Certain products may be prohibited for legal, marketplace, or brand reasons.

Example rules:  
- reject products in restricted or prohibited categories  
- block products with unverifiable or risky claims  
- review_required for products that imply certification without source proof

## Decision logic order  
Rules should execute in this order:  
1. hard compliance and banned categories  
2. required data integrity  
3. margin safety  
4. supplier trust  
5. shipping promise feasibility  
6. improvement opportunities  
7. AI enrichment eligibility

## Reason code examples  
- BANNED_CATEGORY  
- MISSING_SKU  
- MISSING_REQUIRED_ATTRIBUTES  
- LOW_MARGIN  
- BORDERLINE_MARGIN  
- LOW_STOCK_CONFIDENCE  
- LOW_SUPPLIER_TRUST  
- MISSING_SHIPPING_TIME  
- WEAK_IMAGE_SET  
- IMPROVE_DESCRIPTION  
- REVIEW_CATEGORY_MAPPING

## Canonical product rule response schema  
```json  
{  
  "product_id": "string",  
  "decision_status": "approved|rejected|review_required|improve_required|blocked",  
  "decision_reason_codes": ["LOW_MARGIN"],  
  "projected_net_margin": 0.0,  
  "projected_gross_margin": 0.0,  
  "risk_flags": ["low_stock_confidence"],  
  "recommended_next_step": "send_to_listing_factory"  
}  
```

## Escalation rules  
Escalate to operator when:  
- product is near profitability threshold  
- category mapping is uncertain  
- supplier trust score changes materially  
- product could create reputational risk  
- important cost inputs are incomplete

## Logging requirements  
For every decision, store:  
- product_id  
- timestamp  
- rules version  
- policy version  
- computed margin values  
- triggered reason codes  
- final decision status

## Acceptance criteria  
- same input produces same rule outcome  
- hard rules are deterministic  
- margin calculation is explainable  
- reason codes are always present for non-approved outcomes  
- blocked items never reach publication stage automatically

## Open questions  
- exact minimum margin threshold for v1  
- warning band definition above threshold  
- allowed stock freshness window  
- supplier trust scoring formula  
- allowed categories for phase one  
