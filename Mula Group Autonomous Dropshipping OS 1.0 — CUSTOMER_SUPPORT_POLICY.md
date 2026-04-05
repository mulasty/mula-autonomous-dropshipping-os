# CUSTOMER_SUPPORT_POLICY.md

## Purpose  
Define what the automated support layer is allowed to answer, what it must escalate, and how support behavior remains safe for the business.

## Principle  
Support automation exists to reduce repetitive workload, not to improvise on sensitive customer issues.

## Objectives  
- answer low-risk, repetitive questions quickly  
- maintain a consistent support tone  
- avoid risky promises  
- escalate ambiguous or sensitive matters early  
- log support behavior for review

## Supported support categories  
### Allowed for automation  
- order status questions  
- shipping progress questions  
- basic availability questions  
- basic product detail questions grounded in known data  
- return policy explanation in standard form  
- delivery timeframe explanation when sourced from policy or order status

### Not allowed for full automation  
- legal disputes  
- chargeback threats  
- compensation negotiations  
- product safety incidents  
- aggressive complaint handling  
- exceptional refund decisions outside written policy  
- claims requiring human judgment or supplier negotiation

## Message classification labels  
- pre_sale_question  
- order_status  
- shipping_delay  
- return_request  
- complaint_low_risk  
- complaint_high_risk  
- refund_request  
- cancellation_request  
- legal_or_reputational_risk  
- unclear

## Support automation rules  
1. Use only verified order and product data.  
2. Never invent shipment status.  
3. Never promise a refund unless policy and state clearly allow it.  
4. Never blame the customer.  
5. Never blame the supplier in speculative terms.  
6. Use calm, concise, professional language.  
7. Escalate when confidence is low.

## Tone guidelines  
- professional  
- helpful  
- calm  
- transparent  
- non-confrontational  
- concise

## Required context inputs for AI support  
- message text  
- message classification  
- order state if available  
- tracking state if available  
- support policy version  
- return/refund policy snippets  
- escalation rules version

## Allowed response patterns  
### Order status  
Provide known status and next expected step.

### Shipping delay  
Acknowledge delay, share verified information, avoid speculative delivery promises, and offer next review point if policy allows.

### Basic product question  
Use trusted product fields only.

### Return request  
Explain the standard process and next action path without granting exceptions automatically.

## Forbidden response patterns  
- unsupported promises  
- emotional escalation  
- legal interpretation  
- speculative diagnosis of supplier behavior  
- unsupported compensation offers  
- unverifiable technical claims about product use

## Escalation triggers  
Escalate immediately when:  
- customer mentions lawyer, court, regulator, fraud, scam, or chargeback  
- customer claims injury or safety issue  
- customer requests compensation outside policy  
- customer uses highly aggressive or threatening language  
- AI confidence is low  
- message requires exception handling  
- order state is contradictory or missing

## Suggested support response schema  
```json  
{  
  "message_id": "string",  
  "classification": "order_status",  
  "automation_allowed": true,  
  "confidence": 0.0,  
  "response_text": "string",  
  "escalate": false,  
  "escalation_reason": null  
}  
```

## QA and review requirements  
- sample auto-responses should be reviewed regularly  
- high-risk false positives and false negatives should be logged  
- prompt versions must be traceable  
- rejected automated drafts should inform policy refinement

## Acceptance criteria  
- low-risk messages can be handled consistently  
- risky cases are escalated reliably  
- responses stay grounded in known data  
- support language remains professional and controlled

## Open questions  
- exact refund/return policy wording for phase one  
- channels included in v1 support automation  
- acceptable AI confidence threshold for auto-send  
- whether first response should always be draft-only before auto-send in early rollout  
