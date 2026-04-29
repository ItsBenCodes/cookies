---
name: execute-plan
description: Execute an implementation plan. Implements every task, runs validation, commits, and opens a PR. Use when the user asks to execute, implement, or run a plan file.
argument-hint: path to plan file
---

# Execute Plan

Implement a plan end-to-end: code the tasks, validate, commit, and open a PR.

## 1. Load the plan

Read the plan file passed in `$ARGUMENTS`. If no path is given, list `.agents/plans/` and ask which one. Re-read the plan whenever you need to refresh context — do not paraphrase from memory.

## 2. Set up the branch

Never commit to `main`. Check the current branch:

- If on `main`, create a new branch named after the plan slug (e.g., `<slug>` from `YYYY-MM-DD-<slug>.md`).
- If already on a feature branch, stay on it.

## 3. Seed todos

Use TaskCreate to mirror every item from the plan's "Tasks" section as a todo, in order. The final todo must be "Run validation steps" (this should already be the last task in the plan). Do not skip, merge, or reorder tasks.

## 4. Implement

Work through todos one at a time. Mark each completed as soon as it is done — do not batch. If you discover the plan is wrong or incomplete, stop and ask the user before diverging.

## 5. Validate

Use the `validate` skill.

## 6. Commit, push, open PR

Use the `commit` skill. Stage only plan-related files. Default base is `main` (see memory).

## 7. Report

One or two sentences: what shipped, PR link, anything the user should know (skipped items, open questions, follow-ups).
