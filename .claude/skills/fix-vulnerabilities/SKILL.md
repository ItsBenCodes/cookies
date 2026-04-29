---
name: fix-vulnerabilities
description: Triage and fix dependency vulnerabilities in an npm project. Use when the user asks to fix, address, or patch dependency/dependabot/npm audit vulnerabilities.
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

## 4. Run npm audit

```bash
npm audit --json
```

`npm audit` walks workspaces by default. Treat **deprecation notices** (e.g. `inflight`, `whatwg-encoding`, "Old versions of glob are not supported") as informational — they have no patched version and can't be "fixed" without replacing the upstream caller. Note them in the PR body and move on.

## 5. Fix in priority order

For each vulnerability, try in order:

1. **Bump the direct dependency.** Check both root `package.json` AND every workspace `package.json` (`packages/*/package.json`) — the vulnerable transitive may be reachable through a workspace. If a direct dep can be bumped to a version whose transitives no longer carry the vuln, do that:

   ```bash
   npm install <pkg>@<safe-version>
   # or for a workspace:
   npm install <pkg>@<safe-version> -w <workspace-name>
   ```

   Always verify against `npm view <pkg> version` — if every direct dep is already at latest and the vuln persists, no direct bump can fix it.

2. **Add an `overrides` entry** in the root `package.json` for transitives with no direct-bump path:
   - Flat keys (`"pkg": "version"`) override every instance — only safe when one version works for all callers.
   - **When a package has multiple incompatible major lines in the tree** (e.g. minimatch 3.x and 9.x have different APIs), use range-keyed overrides — `"pkg@<major>": "<version>"` — so each major line is pinned separately. A single flat pin will silently force older callers onto an incompatible API and break the build.
   - npm overrides are nested-friendly: see `npm help package-json` for parent-scoped overrides if a flat or range-keyed key is too broad.

   Example block from this repo:

   ```json
   "overrides": {
     "tar": "^7.5.11",
     "minimatch@3": "^3.1.4",
     "minimatch@9": "^9.0.7"
   }
   ```

   Then `npm install` and confirm with `npm ls <pkg>` that each major resolves to the pinned version.

3. **No fix available** — leave it and note it in the PR body.

Re-run `npm audit` after each change.

## 6. Verify

Use the `validate` skill. Overrides can break callers expecting older APIs (especially across major versions). Tests alone aren't enough — build pipelines (rollup, webpack, babel) often hit the bumped transitives at compile time.

**If a bump/override breaks the build and the incompatibility can't be reconciled** (caller depends on a removed API, peer-dep conflict between two libs, etc.), **roll back that specific change** — revert the `npm install` or remove the offending `overrides` entry, run `npm install`, and move it to the "Unfixed" section of the PR body with a one-line reason. Do not commit a broken build.

## 7. Commit, push, open PR

Use the `commit` skill with title `fix: patch dependency vulnerabilities` and body:

```
## Fixed
- <pkg>: <old> → <new> (direct bump / override)

## Unfixed (no patch available)
- <pkg> (<severity>): <summary>
```
