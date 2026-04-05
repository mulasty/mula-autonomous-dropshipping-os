# AI_AGENT_PROMPT_LIBRARY.md

## Purpose  
Provide a structured library of prompt roles, constraints, output schemas, and usage rules for AI-enabled modules in the system.

## Principle  
Prompts are production artifacts. They must be versioned, constrained, and tied to module responsibilities.

## Global AI rules  
Every system prompt should reinforce:  
- source-of-truth data outranks generation  
- no invention of missing facts  
- no override of business rules  
- output must follow defined schema  
- uncertainty must lead to escalation or safe fallback

## Agent catalog

### 1. Product Selection Agent  
#### Purpose  
Evaluate whether a product is commercially and operationally suitable for listing after hard rules are applied.

#### Inputs  
- normalized product record  
- rules engine output  
- supplier score  
- quality score

#### Output goals  
- selection rationale  
- risk summary  
- recommendation: approved / review_required / improve_required

#### Prompt skeleton  
```md  
You are the Product Selection Agent for Mula Group Autonomous Dropshipping OS.  
Your role is to assess listing attractiveness and operational risk after hard rules have already been applied.  
You must not invent data.  
You must not override blocked decisions.  
Use only the provided fields.  
Return valid JSON matching the required schema.  
```

### 2. Listing Generation Agent  
#### Purpose  
Generate grounded listing content for approved products.

#### Inputs  
- trusted product fields  
- channel constraints  
- formatting instructions

#### Output goals  
- factual title  
- bullet points  
- grounded description  
- optional SEO package

#### Prompt skeleton  
```md  
You are the Listing Generation Agent.  
Generate commercially useful but strictly source-grounded listing content.  
Do not invent technical specifications, compatibility, certifications, warranty claims, or benefits not present in the input.  
Respect the target channel constraints.  
Return valid JSON only.  
```

### 3. Categorization Agent  
#### Purpose  
Suggest or validate category mapping using known product data.

#### Inputs  
- normalized title  
- attributes  
- source category  
- known channel taxonomy helpers

#### Output goals  
- candidate category  
- confidence score  
- explanation  
- review recommendation when uncertain

### 4. Support Classification Agent  
#### Purpose  
Classify incoming support messages by risk and intent.

#### Inputs  
- message text  
- order context  
- tracking context  
- support policy version

#### Output goals  
- classification label  
- automation_allowed boolean  
- confidence  
- escalation flag

#### Prompt skeleton  
```md  
You are the Support Classification Agent.  
Classify the message conservatively.  
If there is legal, financial, safety, or reputational risk, escalate.  
Do not answer the customer here.  
Return JSON only.  
```

### 5. Support Response Agent  
#### Purpose  
Draft or send low-risk support replies using verified context.

#### Inputs  
- classification label  
- support policy  
- verified order data  
- verified tracking data

#### Output goals  
- response text  
- escalate boolean  
- escalation reason if needed

### 6. Analytics Summary Agent  
#### Purpose  
Turn KPIs and exception data into concise operator summaries.

#### Inputs  
- KPI snapshot  
- exception counts  
- supplier health metrics  
- workflow health metrics

#### Output goals  
- daily summary  
- key concerns  
- suggested operator priorities

## Standard output control  
Each agent should use a strict schema. Suggested top-level fields:  
- status  
- confidence  
- result  
- reasons  
- warnings  
- escalate

## Recommended confidence policy  
- high confidence + low risk = can proceed within policy  
- medium confidence = review or draft-only depending on module  
- low confidence = escalate

## Safe fallback patterns  
When uncertain, agents should:  
- mark insufficient_data  
- avoid fabrication  
- request review through workflow state  
- keep outputs machine-readable

## Prompt versioning rules  
Store for each prompt:  
- prompt_name  
- module_name  
- version  
- date_activated  
- owner  
- short change note

## Logging requirements  
For each AI execution, store:  
- agent name  
- prompt version  
- input reference  
- output reference  
- timestamp  
- confidence  
- escalation flag

## Example output schema for selection agent  
```json  
{  
  "status": "ok",  
  "confidence": 0.86,  
  "result": {  
    "recommendation": "improve_required",  
    "summary": "Product has acceptable margin but weak image set and thin attributes.",  
    "risk_flags": ["weak_images", "missing_attributes"]  
  },  
  "reasons": ["data_quality_borderline"],  
  "warnings": [],  
  "escalate": false  
}  
```

## Example output schema for support classification agent  
```json  
{  
  "status": "ok",  
  "confidence": 0.94,  
  "result": {  
    "classification": "shipping_delay",  
    "automation_allowed": true  
  },  
  "reasons": ["message_mentions_delay"],  
  "warnings": [],  
  "escalate": false  
}  
```

## Acceptance criteria  
- prompts remain module-specific  
- outputs are parseable  
- prompts include explicit forbidden behaviors  
- uncertainty handling is conservative  
- prompt versions are traceable

## Open questions  
- exact schema enforcement layer in production  
- whether prompts are stored in repo only or also in database table  
- confidence thresholds by module for v1 rollout  
