# ACCEPTANCE_CHECKLIST.md

## Purpose
Provide a concise go/no-go checklist for evaluating whether a module, workflow, or implementation block is ready to advance.

## Global readiness checks
- relevant source-of-truth docs were read before implementation
- file names and concepts match repository canon
- hard rules are explicit
- exceptions and escalation paths exist where risk matters
- outputs are machine-readable where automation depends on them
- logs or audit references are defined for state-changing actions

## Data layer checks
- schema supports documented entities
- status enums align with canonical docs
- raw vs normalized separation is preserved
- event or audit traceability exists

## Workflow checks
- entry conditions are explicit
- success, review, block, and failure branches are distinct where applicable
- unsafe paths do not fall through to success
- repeated failure behavior is defined

## AI checks
- prompt role is documented
- forbidden behaviors are explicit
- output schema is defined
- low-confidence behavior is safe
- AI cannot override hard rules

## Listing checks
- generation and validation are separate
- unsupported claims are blocked or reviewed
- publication readiness is explicit

## Order checks
- invalid orders do not route
- ambiguous supplier states do not masquerade as success
- tracking and exception behavior are defined

## Support checks
- risky classes escalate
- auto-send path is restricted to allowed classes
- support outputs remain grounded in verified context

## Control tower checks
- top risks are visible
- exception queue is actionable
- key health metrics are available

## Definition of done
A work item is ready only when:
- documentation and implementation are aligned
- major branch paths are covered conceptually or by tests
- unresolved ambiguities are logged, not hidden
- next dependent team or workflow can continue without guessing
