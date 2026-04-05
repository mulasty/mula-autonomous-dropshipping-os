# SYNC_ENGINE_SPEC.md

## Purpose
Define the canonical sync engine responsible for evaluating and reacting to supplier-side price and stock changes against live or publication-ready listings.

## Mission
The sync engine exists to protect pricing safety, stock correctness, and listing visibility by making conservative, auditable decisions when source conditions change.

## Scope
This module covers:
- supplier state comparison
- stock change evaluation
- cost/price change evaluation
- repricing decision support
- pause/hide recommendations
- sync history persistence expectations
- sync-related exceptions and alerts

This module does not cover:
- full marketplace API update implementations
- advanced competitor repricing
- marketing price strategy
- support-case handling

## Core principle
Unknown or unsafe supplier state must never be treated as harmless for active listings.

## Inputs
Expected minimum inputs:
- supplier product state
- listing state
- current listing price
- current listing visibility/publish status
- pricing policy
- stock safety policy

## Canonical outputs
Suggested sync output fields:
- listingId
- syncStatus
- priceAction
- stockAction
- recommendedNextStep
- riskFlags
- reasonCodes
- pricingChangeCandidate
- domainEvents

## Sync statuses
Recommended statuses:
- no_change
- price_update_required
- stock_update_required
- listing_pause_required
- review_required
- blocked
- failed

## Stock sync rules
### Safe behavior
- if stock becomes clearly unavailable, active availability should not remain unchanged
- if stock becomes unknown, behavior should be conservative
- if stock is low-confidence, operator review or defensive pause may be required

### Example triggers
- supplier stock drops to zero -> hide/pause or mark unavailable
- supplier stock becomes null/unknown -> review or pause depending on policy
- large stock drift -> exception and control tower visibility

## Pricing sync rules
### Safe behavior
- if supplier cost rises and margin becomes unsafe, do not keep active price unchanged silently
- if proposed price movement exceeds threshold, require review or explicit rule path
- if cost inputs are incomplete, repricing should not guess

### Example outputs
- update_price
- pause_listing
- review_price_change
- no_change

## Repricing evaluation
The sync engine should use documented pricing/margin rules, not invent new logic.

Suggested checks:
- margin still above threshold
- minimum absolute profit still satisfied
- maximum allowed price delta not exceeded
- required minimum price derivable from current cost state

## Persistence expectations
The sync layer should eventually persist to:
- pricing_history
- stock_history
- exceptions
- audit logs

## Domain events
Suggested events:
- supplier_stock_changed
- supplier_cost_changed
- repricing_evaluation_started
- listing_price_update_required
- listing_stock_update_required
- listing_pause_required
- sync_exception_created

## Guardrails
- do not treat unknown stock as safe availability
- do not silently keep unsafe prices live
- do not exceed allowed price-change threshold without explicit review path
- do not conflate sync evaluation with publication success

## Dependencies
- listings data
- supplier product state
- pricing policy
- rules engine or repricing evaluation service
- exception service
- logger

## Acceptance criteria
- sync outcomes are conservative and explicit
- pricing and stock actions remain distinct
- review and blocked paths are supported
- outputs are suitable for persistence and later publication adapters

## Open questions
- exact threshold for price-change review in v1
- whether pause and hide are distinct actions in first runtime implementation
