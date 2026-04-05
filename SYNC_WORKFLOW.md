# SYNC_WORKFLOW.md

## Purpose
Describe the operational workflow that evaluates supplier changes and safely updates or pauses live listings.

## Mission
Ensure that stock and cost changes propagate into commerce operations without leaving unsafe listings live.

## Scope
This workflow covers:
- sync trigger handling
- supplier state comparison
- margin recalculation trigger
- listing update, pause, or hide actions
- sync exceptions

## Entry conditions
Sync may run when:
- latest supplier state is available
- target product has active or relevant listing context
- active pricing policy and thresholds are available

## Workflow stages
1. sync_requested
2. source_state_loaded
3. live_state_loaded
4. stock_evaluation_started
5. cost_evaluation_started
6. margin_recalculation_completed when required
7. sync_action_decided
8. listing_updated OR listing_paused OR listing_hidden OR no_change_needed
9. sync_completed OR sync_completed_with_warnings OR sync_failed
10. exception_created when needed

## Inputs
- supplier product state
- normalized product record
- active listing state
- pricing policy
- margin thresholds
- channel constraints if relevant

## Outputs
- updated stock state
- updated price if allowed
- listing visibility action
- sync history events
- exception record when needed

## Core decision outcomes
- no_change_needed
- stock_updated
- price_updated
- listing_paused
- listing_hidden
- review_required

## Failure modes
- missing supplier state
- invalid source cost
- invalid source stock
- price change threshold exceeded
- listing update call failure
- repeated sync instability

## Acceptance criteria
- sync outcomes are explicit and logged
- unsafe listings do not stay live silently
- repricing never bypasses margin policy
- repeated failures surface as exceptions
