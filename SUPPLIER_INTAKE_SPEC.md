# SUPPLIER_INTAKE_SPEC.md

## Purpose
Define how supplier data enters the system, how import jobs are tracked, and how malformed or incomplete source data is handled before normalization.

## Mission
Create a reliable, traceable supplier intake layer that can fetch source data, preserve raw payloads, and hand off records safely to normalization.

## Scope
This module covers:
- supplier source registration assumptions
- import triggers
- source fetching methods
- raw payload preservation
- import status tracking
- row-level validation before normalization
- import-level exception handling

## Supported source types for v1
- XML feed
- CSV file
- REST API
- email attachment
- FTP/SFTP file pickup

## Out of scope for v1
- multi-supplier orchestration logic
- supplier-side write operations
- advanced delta sync optimization
- automatic supplier reconciliation scoring beyond basic metrics

## Canonical intake stages
1. source_config_loaded
2. import_started
3. source_fetch_started
4. source_fetch_completed
5. source_fetch_failed
6. payload_parse_started
7. payload_parse_completed
8. raw_record_persist_started
9. raw_record_persist_completed
10. row_prevalidation_started
11. row_prevalidation_completed
12. normalization_dispatch_ready
13. import_completed
14. import_completed_with_warnings
15. import_failed

## Trigger model
### Primary trigger
- scheduled import job

### Optional triggers
- manual import trigger by operator
- supplier-specific delta trigger in future versions

## Input contract
Required source config inputs:
- supplier_id
- source_type
- source_location or endpoint
- authentication reference if needed
- expected format version if known
- import schedule
- file encoding expectation if relevant

## Output contract
For each import run, produce:
- supplier_import record
- raw product records
- import counts summary
- parse warnings summary
- row prevalidation result set
- exception record when major failure occurs

## Raw payload preservation rules
- raw payloads must be saved before destructive transformation
- source rows/items should remain traceable back to import_id
- parse-normalized values must not overwrite raw payload storage

## Prevalidation rules
Prevalidation occurs before full normalization and should detect:
- missing source product reference
- completely empty rows
- invalid cost fields
- invalid stock fields
- broken encoding or malformed row structures
- non-parseable XML/CSV/API payload fragments

Prevalidation should classify rows as:
- accepted_for_normalization
- rejected_invalid_row
- review_required_row

## Import status model
Suggested import statuses:
- pending
- started
- fetched
- parsed
- partially_valid
- completed
- completed_with_warnings
- failed

## Required metrics per import
- records_received
- records_parsed
- records_accepted
- records_rejected
- records_review_required
- parse_error_count
- fetch_duration_ms
- total_duration_ms

## Failure modes
- source unreachable
- auth failure
- malformed file
- unsupported encoding
- partial parse failure
- zero valid records
- duplicate import payload
- storage failure on raw record persistence

## Exception rules
Create import exception when:
- source cannot be fetched
- parse fails globally
- accepted records count is zero
- rejection ratio exceeds threshold
- duplicate import is suspected

## Logging requirements
Per import run, log:
- import_id
- supplier_id
- trigger type
- started_at
- finished_at
- final status
- summary counts
- exception references if any

## Acceptance criteria
- every import is traceable
- raw payloads are preserved
- invalid rows are detected before normalization
- import failures produce actionable exceptions
- successful imports produce a clean handoff for normalization

## Open questions
- first supplier source type for phase one
- acceptable warning threshold before marking import as failed
- file retention policy for raw payload snapshots
