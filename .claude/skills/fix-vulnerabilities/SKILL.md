---
name: fix-vulnerabilities
description: Triage and fix dependency vulnerabilities in a yarn project. Use when the user asks to fix, address, or patch dependency/dependabot/yarn audit vulnerabilities.
---

# Fix Vulnerabilities

## 1. Sync main

```bash
git checkout main && git pull
```

## 2. Create branch

```bash
git checkout -b fix/vulnerabilities-$(date +%Y-%m-%d)
```

## 3. List Dependabot alerts

Use the repo's actual owner/name (don't leave `:owner/:repo`). The patched version lives under `vulnerabilities[].first_patched_version.identifier`.

```bash
gh api repos/<owner>/<repo>/dependabot/alerts --paginate \
  -q '.[] | select(.state=="open") | {pkg: .dependency.package.name, severity: .security_advisory.severity, summary: .security_advisory.summary, vulnerable: .security_vulnerability.vulnerable_version_range, patched: .security_advisory.vulnerabilities[0].first_patched_version.identifier, manifest: .dependency.manifest_path}'
```

Also check code scanning (often catches CI/workflow issues that audit misses):

```bash
gh api repos/<owner>/<repo>/code-scanning/alerts --paginate -q '.[] | select(.state=="open")'
```

## 4. Run yarn audit

```bash
yarn npm audit --recursive --json
```

Treat **deprecation notices** (e.g. `inflight`, `whatwg-encoding`, "Old versions of glob are not supported") as informational — they have no patched version and can't be "fixed" without replacing the upstream caller. Note them in the PR body and move on.

## 5. Fix in priority order

For each vulnerability, try in order:

1. **Bump the direct dependency.** Check both root `package.json` AND every workspace `package.json` (`packages/*/package.json`) — the vulnerable transitive may be reachable through a workspace. If a direct dep can be bumped to a version whose transitives no longer carry the vuln, do that:

   ```bash
   yarn up <pkg>@<safe-version>
   ```

   Always verify against `npm view <pkg> version` — if every direct dep is already at latest and the vuln persists, no direct bump can fix it.

2. **Add a `resolutions` entry** for transitives with no direct-bump path. **Yarn 4 syntax has sharp edges:**
   - Flat keys (`"pkg": "version"`) override every instance — only use when one safe version works for all callers.
   - Range-pattern keys **must** use the `npm:` protocol prefix AND match descriptors that actually appear in `yarn.lock`. `"minimatch@^3.0.0": "..."` is silently ignored; `"minimatch@npm:^3.1.1": "..."` works.
   - Find the real descriptors first:
     ```bash
     grep -E '^"<pkg>@' yarn.lock
     ```
   - When a package has multiple incompatible major lines in the tree (e.g. minimatch 3.x and 9.x have different APIs), pin each line **separately** — a single flat pin will break callers.

   Example block from this repo:

   ```json
   "resolutions": {
     "tar": "^7.5.11",
     "minimatch@npm:^3.1.1": "^3.1.4",
     "minimatch@npm:^9.0.4": "^9.0.9"
   }
   ```

   Then `yarn install` and confirm the resolution step output mentions the bumped versions — if it doesn't, the pattern didn't match.

3. **No fix available** — leave it and note it in the PR body.

Re-run `yarn npm audit --recursive` after each change.

## 6. Verify

Run the following commands — fix any failure before committing:

```bash
yarn format
yarn build
yarn size
yarn test
npx playwright install --with-deps
npx playwright test
```

Resolutions can break callers expecting older APIs (especially across major versions). Tests alone aren't enough — build pipelines (rollup, webpack, babel) often hit the bumped transitives at compile time.

**If a bump/resolution breaks the build and the incompatibility can't be reconciled** (caller depends on a removed API, peer-dep conflict between two libs, etc.), **roll back that specific change** — revert the `yarn up` or remove the offending `resolutions` entry, run `yarn install`, and move it to the "Unfixed" section of the PR body with a one-line reason. Do not commit a broken build.

## 7. Commit, push, open PR

Commit with **no co-author trailer**:

```bash
git add -A
git commit -m "fix: patch dependency vulnerabilities"
git push -u origin HEAD
gh pr create --title "fix: patch dependency vulnerabilities" --body "$(cat <<'EOF'
## Fixed
- <pkg>: <old> → <new> (direct bump / resolution)

## Unfixed (no patch available)
- <pkg> (<severity>): <summary>
EOF
)"
```
