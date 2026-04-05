# LISTING_FACTORY_SPEC.md

## Purpose  
Define how approved products are transformed into structured, channel-ready sales listings.

## Mission  
The listing factory should produce consistent, accurate, policy-safe listing assets derived from trusted source data and constrained generation logic.

## Inputs  
- approved or improve_required product record  
- normalized attributes  
- category mapping  
- product rules outcome  
- channel requirements  
- prompt template version

## Outputs  
- listing title  
- short description or bullets  
- long description  
- channel attributes payload  
- SEO fields  
- content quality signals  
- listing generation log

## Listing factory responsibilities  
1. title generation  
2. bullet point generation  
3. structured long-form description  
4. attribute completion from trusted source fields  
5. SEO metadata generation  
6. channel formatting adaptation  
7. content quality validation

## Non-responsibilities  
The listing factory must not:  
- invent technical specs not present in source data  
- claim certifications not verified by source data  
- override blocked product decisions  
- change pricing logic  
- decide final publication safety

## Content generation rules  
### Title rules  
- clear and factual  
- include brand when available  
- include model or identifying variant when available  
- avoid spammy repetition  
- respect channel length limits  
- avoid unverifiable superlatives

### Bullet rules  
- highlight concrete product facts  
- prefer structured, scan-friendly benefits  
- never restate unsupported claims

### Description rules  
- use source-backed features  
- preserve readability  
- avoid excessive fluff  
- avoid hallucinated compatibility claims  
- avoid unsupported warranty promises

### Attribute rules  
- attributes should come from normalized structured data first  
- AI may suggest derived normalization, but not invent values  
- missing required attributes should trigger improve_required or review_required upstream

### SEO rules  
- support discoverability without keyword stuffing  
- stay channel-safe  
- align with product category and real attributes

## Required content blocks  
Suggested content package:  
- title  
- short bullets  
- overview paragraph  
- technical details section  
- package contents section if known  
- shipping or delivery notes only if policy allows

## Channel adaptation  
The listing factory should prepare channel-aware variants when needed.

Examples:  
- Allegro title character constraints  
- Amazon bullet structure expectations  
- eBay variation in description style  
- own store richer product page structure

## Quality controls  
Every generated listing should be validated for:  
- empty output  
- unsupported claims  
- duplicated phrases  
- missing core identifiers  
- channel length overflow  
- inconsistent brand/model references

## Canonical states used by this module  
### listing_status values  
- draft  
- generated  
- validation_failed  
- ready_for_publication

### listing_validation_status values  
- passed  
- failed  
- review_required

Published, paused, and archived are downstream publication or sync states, not primary generation outputs.

## Suggested content package schema  
```json  
{  
  "product_id": "string",  
  "channel": "string",  
  "title": "string",  
  "bullets": ["string"],  
  "description": "string",  
  "attributes": {"key": "value"},  
  "seo": {  
    "meta_title": "string",  
    "meta_description": "string",  
    "keywords": ["string"]  
  },  
  "validation_status": "passed|failed|review_required"  
}  
```

## Prompt discipline  
Each listing generation request should include:  
- allowed source fields  
- forbidden behaviors  
- channel constraints  
- output schema  
- tone constraints

## Escalation triggers  
Escalate when:  
- source data is too thin to create a reliable listing  
- category-specific claims are sensitive  
- generated output conflicts with structured attributes  
- required fields for the target channel remain missing

## Logging requirements  
Store:  
- product_id  
- channel  
- prompt version  
- input snapshot reference  
- generation timestamp  
- validation result  
- review flags

## Acceptance criteria  
- listings are grounded in source data  
- channel constraints are respected  
- generated content is readable and commercially useful  
- unsupported claims are absent  
- repeated generation on same input is stable enough for production use

## Open questions  
- first target channel format for v1  
- exact title length rule per channel  
- required mandatory attribute groups by category  
- whether image caption suggestions belong in this module or later  
