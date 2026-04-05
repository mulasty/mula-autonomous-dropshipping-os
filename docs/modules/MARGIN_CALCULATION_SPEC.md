# MARGIN_CALCULATION_SPEC.md

## Purpose
Define the deterministic profitability calculation used by the rules engine to evaluate listing viability.

## Mission
The margin calculation layer exists to determine whether a product can be sold safely under current assumptions before it reaches listing publication.

## Scope
This module covers:
- required cost inputs
- fee handling
- shipping/logistics inclusion
- risk buffer inclusion
- profit and margin outputs
- decision thresholds for approve/review/reject/block

This module does not cover:
- dynamic repricing strategy
- competitor-based pricing
- tax optimization logic
- supplier negotiation logic

## Core principle
No product should pass commercially if the system cannot explain the profitability assumptions behind it.

## Required cost inputs
Suggested minimum inputs:
- supplier cost net or equivalent base cost
- supplier cost gross if available
- projected sale price
- projected sale price gross if available
- channel fee rate
- payment fee rate
- shipping cost estimate
- handling buffer
- return risk buffer
- minimum absolute profit amount
- minimum net margin threshold
- review warning band upper

## Formula components
### Base supplier cost
The product base cost comes from the best trusted source among documented cost inputs. Missing cost data must be explicit.

### Variable fee total
Variable fee total should combine channel and payment fee rates applied to projected sale price.

### Logistics total
Logistics total should include shipping cost estimate and any documented fixed logistics cost if applicable.

### Risk buffer total
Risk buffer total should include handling buffer and return risk buffer.

## Canonical calculated outputs
Suggested output fields:
- formulaVersion
- baseCost
- variableFeeTotal
- logisticsTotal
- riskBufferTotal
- requiredMinimumPrice
- projectedSalePrice
- projectedProfitAmount
- projectedNetMargin
- projectedGrossMargin
- marginDecision
- marginReasonCodes

## Margin decisions
Recommended canonical decisions:
- approved
- review_required
- rejected
- blocked

### approved
All required cost data exists and profitability meets threshold safely.

### review_required
Profitability is borderline or some non-critical assumptions are incomplete but review is allowed by policy.

### rejected
Data exists but profitability fails commercial minimums.

### blocked
Core pricing assumptions are invalid or too incomplete for safe evaluation.

## Reason code examples
- INVALID_PROJECTED_SALE_PRICE
- MISSING_COST_DATA
- MISSING_FEE_MODEL
- MISSING_SHIPPING_ESTIMATE
- NEGATIVE_PROFIT
- BELOW_MINIMUM_ABSOLUTE_PROFIT
- LOW_MARGIN
- BORDERLINE_MARGIN

## Conservative handling rules
- invalid sale price must block evaluation
- missing supplier cost must block unless policy explicitly allows a review path and documented logic supports it
- missing fee model must not be silently treated as zero fees
- missing shipping estimate must not be silently treated as free shipping

## Warning band logic
If projected net margin is above minimum threshold but below or equal to warning band upper threshold, the result should be `review_required` with `BORDERLINE_MARGIN`.

## Required minimum price
If fee rate total is valid and less than 1, the module may compute the minimum price required to satisfy base costs and minimum absolute profit.

This output is advisory and should not automatically trigger repricing in this phase.

## Gross margin
Gross margin is optional and should only be computed when gross inputs are present and coherent.

## Guardrails
- do not invent missing cost inputs
- do not collapse missing fees into zero
- do not report approved when major pricing assumptions are incomplete
- preserve margin reason codes for downstream auditability

## Downstream usage
The margin calculation output feeds:
- product rules engine
- qualification decisions
- future repricing logic
- audit logs and operator review

## Acceptance criteria
- same input yields same output
- reason codes explain non-approved outcomes
- blocked vs rejected are clearly distinguishable
- margin output is suitable for persistence in `product_rule_decisions`

## Open questions
- whether tax treatment will remain outside v1 margin formula
- whether channel-specific fee tables will be loaded from policy storage in later phases
