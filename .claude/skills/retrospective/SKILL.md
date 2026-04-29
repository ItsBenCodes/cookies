---
name: retrospective
description: Analyze past Claude Code session(s) for mistakes and propose targeted improvements. Use when the user asks for a retrospective, post-mortem, or session review. Outputs concise findings plus suggested edits to CLAUDE.md (general lessons) or new/updated skills (specific workflows).
argument-hint: '[N days] [extra context]'
---

# Retrospective

Review session transcripts, list mistakes, propose improvements.

## 1. Resolve scope

Parse `$ARGUMENTS`:

- empty → **current session** — analyze from your existing conversation context. Do **not** read any jsonl file; the conversation is already loaded.
- contains a number + `d`/`day(s)` → past sessions modified within that many days. Read jsonl files from `~/.claude/projects/<encoded-cwd>/`:
  ```bash
  SESSION_DIR=~/.claude/projects/$(pwd | sed 's|/|-|g')
  find "$SESSION_DIR" -name '*.jsonl' -mtime -N
  ```
- remaining text → extra focus/context to bias the analysis (e.g. "focus on test failures")

## 2. Analyze

**Current session:** scan your own conversation context. Extract user corrections, retried tool calls, reverts, "no"/"don't"/"stop", failed builds/tests, repeated identical commands, dead-end paths.

**Past sessions (N days):** spawn one `Explore` subagent per jsonl **in parallel** (single message, multiple Agent calls). Brief each:

> Read `<path>`. List only the mistakes Claude made: user corrections, wrong assumptions, repeated failures, wasted tool calls, friction points. One bullet each, ≤15 words. No fixes, no praise. Under 200 words.

Then reconcile: dedupe, group by theme, keep frequency counts.

## 3. Report

Output to the user in this shape (no preamble):

```
## Mistakes
- <mistake> (×N)
- ...

## Improvements
**CLAUDE.md** (general, always-on):
- <rule> — <one-line why>

**Skill: <name>** (specific workflow):
- Trigger: <when to invoke>
- Body: <2-3 bullet behavior>

## Apply?
```

Routing rule:

- **CLAUDE.md** = always-relevant rules (style, conventions, repo invariants).
- **Skill** = workflow that fires on a specific trigger (slash command, task type).

Wait for confirmation before editing CLAUDE.md or creating skill files.

## 4. Apply (on confirmation)

- CLAUDE.md edits: append/modify in place, keep terse.
- New skill: write `.claude/skills/<name>/SKILL.md` with frontmatter (`name`, `description`, optional `argument-hint`).

Stop. Do not auto-commit.
