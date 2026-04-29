---
name: create-plan
description: Draft an implementation plan for a feature in .agents/plans. Does not execute the plan. Use when the user asks to plan, design, or scope a feature without building it.
argument-hint: feature description
---

# Create Plan

Write a plan to `.agents/plans/`. Do not implement.

## 1. Clarify

Ask questions in batches until the feature is unambiguous. Read the code instead of asking whenever the answer is in the repo. Stop at nitpicks.

## 2. Offer options

Present 2–4 high-level approaches. For each: shape, main upside, main cost. Ask which to take. Wait.

## 3. Write the plan

Save to `.agents/plans/YYYY-MM-DD-<slug>.md` (create the dir if missing). Use this template:

The plan can cover a feature, bug fix, refactor, or technical task. Adapt the user story and acceptance criteria accordingly (e.g., for a refactor, "user" may be a developer; for a bug fix, frame the story around the broken behavior).

```markdown
# <Title>

## User story

As a <user>, I want <goal> so that <benefit>.

## Description

A few paragraphs explaining what this is, the motivation, the current state, and the desired state. Include enough context that a reader unfamiliar with the work can understand it without external references.

## Acceptance criteria

User-perspective only. No technical terms, file names, or APIs.

- [ ] ...

## Out of scope

- ...

## Implementation details

Architecture, key types, dependencies, relevant patterns, trade-offs.

## Testing strategy

What to cover and how: unit, integration, e2e (Playwright). Note any new fixtures, mocks, or manual verification steps.

## Tasks

- [ ] ...
- [ ] Run the `validate` skill (must be the last task)

## Open questions

- ...
```

Tell the user the file path.

## 4. Iterate

Apply requested edits, repeat until approved. Do not implement.
