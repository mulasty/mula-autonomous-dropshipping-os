# CHANNEL_CONSTRAINTS.md

## Purpose
Define channel-specific limits, required fields, and formatting rules that affect listing generation, validation, sync, and publication behavior.

## Mission
Provide a single reference for channel differences so that listings can be adapted safely without scattering marketplace rules across multiple modules.

## Scope
This document covers:
- title constraints
- description constraints
- required attribute expectations
- delivery/promise wording constraints
- publication safety implications
- channel-specific validation hooks

## Principles
- channel rules should be centralized
- hard constraints should be machine-enforceable where possible
- unknown channel constraints should default to conservative handling
- channel adaptation must never override core truth from normalized data

## Channel model for v1
Initial channels in scope conceptually:
- Allegro
- Amazon
- eBay
- own store

Note: exact implementation rollout may start with one primary channel, but this document exists to prevent future rule scattering.

## Canonical channel rule fields
Suggested fields per channel:
- channel_name
- title_max_length
- description_required
- bullets_supported
- required_attribute_groups
- banned_claim_patterns
- shipping_promise_restrictions
- publication_notes

## Allegro (placeholder policy model)
Suggested handling:
- title should obey marketplace-specific length limit configured in policy
- required attributes depend on category mapping
- unsupported claims and misleading urgency language should be blocked
- delivery promise language must align with actual policy and logistics reality

## Amazon (placeholder policy model)
Suggested handling:
- bullet structure is important if channel enabled later
- attribute completeness requirements tend to be stronger
- unsupported compliance/safety claims must be blocked aggressively

## eBay (placeholder policy model)
Suggested handling:
- title length limit must be policy-driven
- description structure may be more flexible but still grounded
- item specifics completeness should influence validation

## Own store (placeholder policy model)
Suggested handling:
- richest content flexibility
- still must remain source-grounded
- can tolerate more descriptive richness if facts remain accurate

## Shared hard constraints across channels
- no unsupported technical claims
- no fabricated certifications
- no fabricated warranty promises
- no misleading delivery guarantees
- no contradiction with structured product data

## Channel adaptation rules
The listing layer may adapt:
- title length and formatting
- presence/shape of bullet sections
- metadata packaging
- attribute payload structure

The listing layer may not adapt by:
- inventing facts
- changing economic rules
- bypassing blocked validation outcomes

## Validation interplay
This document should be used by:
- LISTING_FACTORY_SPEC.md
- LISTING_VALIDATION_SPEC.md
- SYNC_ENGINE_SPEC.md when channel-specific pause/hide behavior differs

## Acceptance criteria
- channel differences are documented centrally
- exact numeric constraints can be filled from policy without changing module logic
- modules know where to look for channel-specific behavior

## Open questions
- which channel becomes the true phase-one publication target
- exact numeric limits and required attribute groups per enabled channel
- whether channel rules live only here or also in policy tables for runtime use
