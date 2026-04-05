# SECURITY_AND_GUARDRAILS.md

## Purpose  
Define the safety, access, data, pricing, AI, and operational guardrails that prevent the system from behaving dangerously or unreliably.

## Principle  
Automation is only useful when its failure modes are bounded. This document defines those boundaries.

## Guardrail categories  
- access and credentials  
- data integrity  
- business policy protection  
- AI behavior limits  
- pricing and stock safety  
- order routing safety  
- support safety  
- auditability and recovery

## 1. Access and credentials  
### Rules  
- store secrets outside repo in secure environment storage  
- never hardcode API keys in workflow exports  
- limit access by module role where possible  
- document credential ownership and rotation responsibility

### Minimum controls  
- separate credentials for supplier, BaseLinker, OpenAI, and alerts  
- revoke and rotate on incident or personnel change  
- keep development and production credentials separate if environment split exists

## 2. Data integrity guardrails  
### Rules  
- raw imports must be preserved  
- normalization must not overwrite raw payloads  
- missing critical identifiers should block downstream automation  
- invalid or partial records should be flagged, not silently coerced

### Critical fields to protect  
- supplier_sku  
- internal_sku  
- ean where applicable  
- cost fields  
- stock quantity  
- shipping time  
- channel listing id  
- order id

## 3. Pricing guardrails  
### Rules  
- never publish below minimum defined margin  
- never change live price above threshold without review or explicit rule support  
- never compute price without all mandatory cost components  
- all repricing actions must be logged

### Recommended pricing safeguards  
- hard minimum net margin threshold  
- warning band above threshold  
- maximum percent price movement per sync cycle  
- pause listing if cost becomes uncertain

## 4. Stock guardrails  
### Rules  
- never present unknown stock as confidently available  
- low-confidence stock should trigger pause or review depending on policy  
- stock freshness must be measurable  
- stock changes should produce history events

## 5. AI behavior guardrails  
### Rules  
- AI cannot invent product facts  
- AI cannot override hard rules  
- AI cannot approve banned categories  
- AI must use structured output schema  
- low confidence should escalate or produce safe fallback

### Prompt requirements  
- explicit forbidden behaviors  
- source grounding instructions  
- output schema instructions  
- escalation behavior when uncertain

## 6. Listing content guardrails  
### Rules  
- no unsupported technical claims  
- no unsupported certifications  
- no unsupported compatibility claims  
- no fabricated warranty language  
- no deceptive urgency or misleading delivery promises

## 7. Order routing guardrails  
### Rules  
- no supplier submission without validated order state  
- no duplicate submission without explicit retry control  
- missing SKU mapping should block submission  
- ambiguous supplier response should escalate  
- every supplier submission should be logged with reference id if available

## 8. Support automation guardrails  
### Rules  
- no autonomous handling of legal threats, safety incidents, compensation negotiations, or chargeback scenarios  
- no unsupported refund promises  
- no speculative shipment explanations  
- aggressive or unclear cases escalate

## 9. Exception guardrails  
### Rules  
- all critical workflow failures create exceptions  
- exceptions must have severity and status  
- unresolved critical exceptions should generate reminders or alerts

## 10. Auditability guardrails  
### Rules  
- important state changes produce audit logs  
- prompt versions are stored for AI actions  
- pricing and publication changes are traceable  
- order submission attempts are traceable

## 11. Recovery guardrails  
### Rules  
- workflows should have retry logic for transient failures  
- retries must avoid duplicate harmful actions  
- unresolved repeated failures should route to exception queue  
- backups or export paths should exist for critical system records

## 12. Recommended severity levels  
- low  
- medium  
- high  
- critical

## 13. Critical alert examples  
- supplier feed missing beyond freshness window  
- cost data missing for active listings  
- listings forced below margin threshold  
- large stock mismatch spike  
- supplier order submission failures above threshold  
- support messages classified as legal_or_reputational_risk

## 14. Acceptance criteria  
- hard constraints are documented and enforceable  
- AI limitations are explicit  
- pricing and order safety rules are reviewable  
- critical failures generate visible exceptions or alerts

## Open questions  
- exact alert thresholds for v1  
- exact credential management approach across environments  
- whether separate staging environment exists from the beginning  
