---
name: prepare-release
description: Prepare a release PR by bumping package versions (patch, minor, or major).
disable-model-invocation: true
argument-hint: patch | minor | major
---

# Prepare Release

Ask the user for the bump type (patch | minor | major) if not provided.

Each publishable package is bumped **independently** — only packages that have changed since the last release tag are bumped (and later published). Packages may drift in version over time; this is fine because cross-package dependencies use caret ranges.

## 1. Fetch latest origin/main and tags

```bash
git fetch origin main --tags
```

## 2. Identify the last release tag

```bash
LAST_TAG=$(git describe --tags --abbrev=0 origin/main)
echo "Last release: $LAST_TAG"
```

## 3. Detect changed packages

For each publishable package (skip `react-cookie-demo`), check whether its directory has changed since `$LAST_TAG`:

```bash
BUMP_TYPE='<patch|minor|major>'
CHANGED=()
for pkg in react-cookie universal-cookie universal-cookie-express universal-cookie-koa; do
  if ! git diff --quiet "$LAST_TAG" origin/main -- "packages/$pkg/"; then
    CHANGED+=("$pkg")
  fi
done

if [ ${#CHANGED[@]} -eq 0 ]; then
  echo "No packages changed since $LAST_TAG — nothing to release."
  exit 1
fi

echo "Changed packages: ${CHANGED[*]}"
```

## 4. Compute new versions per package and pick release version

Each changed package bumps from its own current version on `origin/main`. The **release version** (used for the branch name and PR title) is the **highest** new version across all bumped packages.

```bash
RELEASE_VERSION=""
declare -A NEW_VERSIONS
for pkg in "${CHANGED[@]}"; do
  NV=$(node -p "
    const v = JSON.parse(require('child_process').execSync('git show origin/main:packages/$pkg/package.json')).version.split('.').map(Number);
    const t = '$BUMP_TYPE';
    if (t==='major') { v[0]++; v[1]=0; v[2]=0; }
    else if (t==='minor') { v[1]++; v[2]=0; }
    else { v[2]++; }
    v.join('.')
  ")
  NEW_VERSIONS[$pkg]=$NV
  if [ -z "$RELEASE_VERSION" ] || [ "$(printf '%s\n%s' "$NV" "$RELEASE_VERSION" | sort -V | tail -1)" = "$NV" ]; then
    RELEASE_VERSION=$NV
  fi
done
echo "Release version: v$RELEASE_VERSION"
for pkg in "${CHANGED[@]}"; do echo "  $pkg -> ${NEW_VERSIONS[$pkg]}"; done
```

## 5. Create release branch off origin/main

```bash
git checkout -b release/v$RELEASE_VERSION origin/main
```

## 6. Bump versions for changed packages only

```bash
for pkg in "${CHANGED[@]}"; do
  NV=${NEW_VERSIONS[$pkg]}
  node -e "const f='packages/$pkg/package.json';const p=require('./'+f);p.version='$NV';require('fs').writeFileSync(f,JSON.stringify(p,null,2)+'\n')"
done
```

Verify with `grep -H '"version"' packages/*/package.json`.

## 7. Commit, push, open PR with auto-merge

Use the `commit` skill. Stage only `packages/*/package.json`. Title `Bump to v$RELEASE_VERSION`. Body lists each bumped package:

```
Release v$RELEASE_VERSION

- <pkg> -> <new-version>
```

After PR is open, enable auto-merge:

```bash
gh pr merge --auto --squash
```
