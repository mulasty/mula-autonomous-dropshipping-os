# SYNC_ENGINE_SPEC.md

## Purpose
Define how live listings stay synchronized with supplier changes in stock, cost, availability, and other operationally relevant fields.

## Mission
Protect live commerce operations by ensuring that product state changes from supplier sources are processed safely, predictably, and with clear guardrails.

## Scope
This module covers:
- stock synchronization
- cost change handling
- repricing triggers
- listing pause conditions
- listing unpublish/hide conditions
- sync-related exception handling
- history tracking for price and stock changes

## Principles
- never keep unsafe listings live silently
- never present unknown stock as confidently available
- never allow repricing to bypass margin guardrails
- every important sync change must be traceable
- sync should be conservative in uncertain states

## Inputs
- latest supplier product state
- current normalized product state
- current published listing state
- active pricing policy
- active margin thresholds
- channel constraints if relevant

## Outputs
- updated stock state
- updated listing price if allowed
- listing pause action if required
- listing hide/unpublish recommendation if required
- stock history event
- pricing history event
- exception record when needed

## Core sync domains
### 1. Stock sync
Keep listing availability aligned with supplier stock.

### 2. Cost sync
React to supplier cost changes affecting profitability.

### 3. Availability sync
Handle supplier-level status changes such as discontinued, inactive, or unknown.

### 4. Listing safety sync
Pause or escalate listings that become unsafe to keep live.

## Canonical sync states
Suggested internal workflow states:
- sync_requested
- sync_started
- stock_evaluated
- cost_evaluated
- pricing_evaluated
- listing_updated
- listing_paused
- listing_hidden
- sync_completed
- sync_completed_with_warnings
- sync_failed

## Stock sync rules
- valid stock delta should create stock history entry
- zero or unavailable stock should trigger channel-appropriate pause/hide logic
- unknown stock should not remain fully sellable without policy support
- repeated stock oscillation may trigger review or escalation

## Cost sync rules
- supplier cost change must trigger margin recalculation
- cost increase that breaks minimum margin must not leave listing untouched silently
- cost decrease may allow repricing only within policy
- missing or invalid cost after change must block unsafe continuation

## Repricing rules
Repricing may occur only when:
- all required cost inputs are present
- active pricing policy is available
- projected margin remains above safe threshold
- resulting price movement stays within allowed change threshold

Suggested repricing outcomes:
- price_updated
- no_change_needed
- review_required
- listing_paused

## Listing pause conditions
Pause or hide listing when:
- margin drops below pause threshold
- stock becomes unavailable or unreliable
- supplier marks product inactive/discontinued
- price change required exceeds allowed threshold
- critical source field becomes invalid

## Sync exception triggers
Create exception when:
- active listing becomes economically unsafe
- active listing has contradictory stock signals
- repeated sync failures occur
- required source data becomes invalid
- unsafe listing could remain customer-visible

## Reason code examples
- LIVE_MARGIN_UNSAFE
- STOCK_UNAVAILABLE
- STOCK_UNRELIABLE
- COST_DATA_INVALID
- PRICE_CHANGE_THRESHOLD_EXCEEDED
- PRODUCT_DISCONTINUED
- REPEATED_SYNC_FAILURE

## Logging requirements
For each sync action, store:
- product_id
- listing_id if applicable
- sync run reference
- source values snapshot
- previous live values
- new computed values
- action taken
- reason codes
- timestamp

## Acceptance criteria
- stock and cost changes are reflected predictably
- unsafe listings do not remain active silently
- pricing changes are traceable and policy-bound
- sync failures create actionable exceptions

## Open questions
- exact threshold for allowed price movement per sync cycle
- whether zero stock always pauses or sometimes hides depending on channel
- whether discontinued products are archived immediately or queued for review
