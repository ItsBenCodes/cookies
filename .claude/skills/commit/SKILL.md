---
name: commit
description: Commit staged work, push the branch, and open a PR. Use when wrapping up changes that need to ship.
disable-model-invocation: true
---

# Commit

Commit → push → open PR. Never on `main`.

## 1. Stage

Stage only files relevant to this change. Prefer explicit paths over `git add -A` unless every modified file belongs to the change.

## 2. Commit

- Match the repo's commit style (see recent `git log`). Concise, focused on the why.
- **No co-author trailer.**
- Never use `--no-verify`. If a hook fails, fix the cause and make a new commit.

```bash
git commit -m "<message>"
```

## 3. Push

```bash
git push -u origin HEAD
```

## 4. Open PR

Title under 70 chars. Body via HEREDOC. Default base is `main`.

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
- ...

## Test plan
- [ ] ...
EOF
)"
```

Return the PR URL. Use `gh pr merge --auto --squash` only when the caller asks for auto-merge (e.g. release PRs).
