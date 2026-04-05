# MARGIN_CALCULATION_SPEC.md

## Purpose
Define how profitability is computed for a normalized product before listing publication.

## Mission
Protect the business from false-positive profitability by making margin logic explicit, explainable, and consistent across rules, listings, and sync operations.

## Scope
This spec covers:
- required pricing inputs
- computed output metrics
- minimum margin thresholds
- warning bands
- missing-data behavior
- margin-related reason codes

## Principles
- never compute confidence from incomplete cost data
- keep formulas simple and explainable in v1
- use explicit buffers for operational risk
- separate raw cost from derived selling price
- margin calculations must be reproducible

## Required inputs
Minimum required inputs for margin calculation:
- cost_net or cost_gross with tax context
- target channel
- channel fee estimate
- payment fee estimate
- shipping cost estimate
- handling/ops buffer
- return risk buffer
- target profit floor
- tax assumptions if needed

## Recommended derived values
- base_cost
- variable_fee_total
- logistics_total
- risk_buffer_total
- required_minimum_price
- projected_sale_price
- projected_profit_amount
- projected_net_margin
- projected_gross_margin

## Canonical formula model
Suggested conceptual model:

1. Base cost foundation
`base_cost = supplier_cost + logistics_total + variable_fee_total + risk_buffer_total`

2. Profit amount
`projected_profit_amount = projected_sale_price - base_cost`

3. Net margin
`projected_net_margin = projected_profit_amount / projected_sale_price`

4. Gross margin
Use only if tax context is explicit and consistent.

## Mandatory cost components
### supplier cost
Imported from normalized product cost field.

### shipping cost estimate
Can be channel-specific or product-band-specific.

### marketplace/channel fee estimate
Must reflect target channel assumptions.

### payment fee estimate
Must be explicit if payment provider cost applies.

### handling/ops buffer
Operational safety amount for packing, processing, or generic friction.

### return risk buffer
Expected protection for returns, cancellations, and related leakage.

## Missing-data rules
- missing supplier cost => blocked
- missing channel fee estimate => blocked or review_required depending on policy maturity
- missing shipping estimate => blocked if product cannot be priced safely
- unknown tax treatment => do not present gross margin as canonical

## Decision thresholds
Suggested policy fields:
- minimum_net_margin
- review_warning_band_upper
- pause_margin_threshold
- minimum_absolute_profit_amount

### Example behavior
- below minimum_net_margin => blocked or rejected
- inside warning band => review_required
- above safe band => eligible for approval if other rules pass

## Reason code examples
- LOW_MARGIN
- BORDERLINE_MARGIN
- MISSING_COST_DATA
- MISSING_FEE_MODEL
- MISSING_SHIPPING_ESTIMATE
- NEGATIVE_PROFIT
- BELOW_MINIMUM_ABSOLUTE_PROFIT

## Output contract
Suggested output fields:
- product_id
- channel
- projected_sale_price
- projected_profit_amount
- projected_net_margin
- projected_gross_margin
- margin_decision
- margin_reason_codes

## Sync behavior implications
Margin logic must also be reusable by sync workflows.

If supplier cost changes:
- recompute projected margin
- update price only if policy allows
- pause listing if margin falls below safe threshold
- create exception if active listing becomes unsafe

## Logging requirements
Store:
- formula version
- input assumptions snapshot
- computed outputs
- decision threshold values used
- timestamp

## Acceptance criteria
- formula is understandable by operator
- same inputs always produce same outputs
- missing critical inputs do not create fake profitability
- reason codes support audit and exception handling

## Open questions
- exact margin thresholds for v1
- whether formula starts channel-specific from day one
- whether shipping cost is flat, category-based, or weight-based in phase one
