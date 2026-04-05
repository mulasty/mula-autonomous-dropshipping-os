# CODEX_START_PROMPT_DOCS_PACK_REPO_HYGIENE_AND_TRACKING.md

```md
You are working on the repository: `mulasty/mula-autonomous-dropshipping-os`.

Your goal is to complete the next documentation pack focused on repository hygiene, decision traceability, artifact tracking, and phase/status visibility.

## Objective
Create and fully populate the management and traceability documentation layer so the repository remains understandable as the architecture, runtime, and documentation all grow in parallel.

This pack is documentation-only.

## Files to create
Create and fully populate these files:

1. `ARTIFACT_REGISTRY.md`
2. `DECISION_LOG.md`
3. `PHASE_STATUS.md`
4. `OPEN_QUESTIONS.md`
5. `RUNTIME_GAP_NOTES.md`
6. `REPO_HYGIENE_RULES.md`
7. `CONTRIBUTION_WORKFLOW.md`
8. `DOC_INDEX.md`

## Non-negotiable rules
1. Follow existing repo terminology exactly.
2. Align with the current phase model, runtime modules, and documentation structure already present in the repository.
3. Keep the documents operational and contributor-friendly.
4. Do not invent undocumented business or architecture decisions.
5. Do not modify runtime code in this pack.
6. Preserve the difference between current state, planned state, and open questions.
7. Make it easy for future Codex runs and human contributors to understand what is authoritative.

## Required reading before writing
Read and align with at least these files:
- `START_HERE.md`
- `README.md`
- `IMPLEMENTATION_PHASES.md`
- `REPOSITORY_BLUEPRINT.md`
- `PROJECT_CHANGELOG.md`
- `ARCHITECTURE_OVERVIEW.md`
- `DATA_MODEL.md`
- `EVENT_FLOW.md`
- `SECURITY_AND_GUARDRAILS.md`
- `CODEX_TASK_PACK.md`
- all existing `CODEX_START_PROMPT_*.md` files
- current docs folder structure in the repo
- current backend/runtime module structure in the repo

## File expectations

### 1. ARTIFACT_REGISTRY.md
Must define a practical registry of the main artifact classes in the repo.

Include at minimum:
- root documents
- architecture docs
- module specs
- workflow docs
- AI governance docs
- operations docs
- QA docs
- prompt packs
- runtime/backend code areas
- DB schema/views/seeds areas

For each category, include:
- purpose
- where it lives
- whether it is source-of-truth, implementation-support, runtime code, or future-plan artifact

### 2. DECISION_LOG.md
Must define a durable log structure for architectural and operational decisions.

Include:
- decision ID format
- date
- title
- status (proposed / accepted / superseded / rejected)
- context
- decision
- implications
- affected files/modules

Populate the file with a few initial entries derived from already-established project decisions, but only if they are clearly documented in the repo.

### 3. PHASE_STATUS.md
Must define the current phase-tracking model.

Include:
- phase list
- each phase purpose
- current status options (not started / in progress / review / stabilized / blocked / complete)
- what counts as entering a phase
- what counts as exiting a phase
- how phase status should be updated

Also include a first current-status snapshot based on the repository’s clearly documented progress so far, keeping uncertainty explicit.

### 4. OPEN_QUESTIONS.md
Must define the living backlog of unresolved questions.

Group questions by domain, such as:
- supplier strategy
- category policy
- persistence behavior
- AI governance
- listing/publication
- sync and support
- operator workflows

Questions should be phrased so they can later be resolved and moved into decisions.

### 5. RUNTIME_GAP_NOTES.md
Must define the gap between current runtime and intended architecture.

Include sections for:
- what is implemented
- what is scaffold-only
- what is documented but not yet implemented
- what is risky or incomplete
- what should be prioritized next

This file should help prevent future contributors from assuming the system is more complete than it really is.

### 6. REPO_HYGIENE_RULES.md
Must define practical repo hygiene expectations.

Include:
- naming consistency
- folder placement rules
- prompt pack naming rules
- documentation update expectations after runtime changes
- changelog usage expectations
- when to add new docs vs extend existing docs
- consistency rules for states/status names
- prohibition on leaving misleading placeholders

### 7. CONTRIBUTION_WORKFLOW.md
Must define a lightweight contribution process for both human contributors and Codex runs.

Include:
- how to start work safely
- what to read first
- how to choose the right phase/prompt pack
- when to update docs/changelog
- when to pause for review
- how to record open questions and decisions
- what “done” should mean before moving on

### 8. DOC_INDEX.md
Must define a navigable index of important docs in the repository.

Include grouped sections for:
- start here
- project planning
- architecture
- modules
- workflows
- AI governance
- operations
- QA
- prompt packs

Each item should include a short one-line description of why it matters.

## Required structure template
Use this structure where applicable:

# File Title
## Purpose
## Scope
## Core rules / structure
## Current usage guidance
## Acceptance criteria
## Open questions

## Extra guidance
- Be explicit about “current state” vs “planned future state”.
- Make the documents useful for onboarding both Codex and human contributors.
- Prefer concise structure over long narrative.
- Where current status is uncertain, say so directly.

## Output expectations
At the end, provide:
1. list of created files
2. summary of each file in 1–3 sentences
3. any terminology conflicts found and resolved
4. any open questions that remain

## Definition of done
This pack is complete only if:
- all eight files exist
- documents are substantive and usable
- current-state vs future-state distinctions are clear
- contributors can use the repo more safely after these docs exist
- naming aligns with existing docs/runtime
```
