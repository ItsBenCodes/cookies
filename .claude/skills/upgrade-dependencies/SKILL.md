---
name: upgrade-dependencies
description: Upgrade all dependencies in an npm project to their latest versions.
disable-model-invocation: true
---

# Upgrade Dependencies

## 1. Sync main

```bash
git checkout main && git pull
```

## 2. Create branch

```bash
git checkout -b chore/upgrade-deps-$(date +%Y-%m-%d)
```

## 3. Inspect outdated packages

```bash
npm outdated
```

`npm outdated` walks the workspace tree by default. The `Wanted` column is the highest match for the existing range; `Latest` is the absolute newest. Anything where `Latest > Wanted` is a major bump.

## 4. Upgrade in priority order

Group upgrades by risk so a breakage is easy to bisect. Commit each group separately.

1. **Patch + minor** within existing ranges:

   ```bash
   npm update --workspaces --include-workspace-root
   ```

   This respects the semver ranges already in `package.json`, so it only pulls in patches and minors.

2. **Major bumps** — one package (or tightly-coupled set) at a time. Use `npm-check-updates` to rewrite the range, then reinstall:

   ```bash
   npx npm-check-updates -u --filter <pkg>
   npm install
   ```

   For a workspace package, run `ncu` from inside that workspace directory or pass `--packageFile packages/<name>/package.json`. Read each package's CHANGELOG/release notes for breaking changes before bumping. Update call sites in the same commit.

3. **devDependencies / build tooling** (typescript, rollup, eslint, playwright, etc.) — bump last; these often need config tweaks.

Always verify with `npm view <pkg> version` that "latest" is what you got.

## 5. Overrides

If `package-lock.json` still pins an old transitive after a direct bump, add an `overrides` entry in the root `package.json`. Use range-keyed overrides (`"<pkg>@<major>": "<version>"`) when different majors of the same package coexist in the tree — a flat override forces every consumer onto the same version and routinely breaks packages that depend on the old API. Confirm with `npm ls <pkg>` that each major resolves where you expect.

Remove any `overrides` entries that are now redundant (the direct dep already carries a safe version).

## 6. Verify

Use the `validate` skill after every group; fix failures before moving on.

**If a major bump breaks the build and the migration is non-trivial**, roll back that specific upgrade (`npm install <pkg>@<previous>`), note it in the PR body under "Deferred", and keep moving. Do not commit a broken build.

## 7. Commit, push, open PR

Use the `commit` skill with title `chore: upgrade dependencies` and body:

```
## Upgraded
- <pkg>: <old> → <new>

## Deferred (breaking, needs follow-up)
- <pkg> <old> → <new>: <reason>
```
