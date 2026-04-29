---
name: create-release
description: Create a release PR by bumping package versions (patch, minor, or major).
disable-model-invocation: true
argument-hint: patch | minor | major
---

# Create Release

Ask the user for the bump type (patch | minor | major) if not provided.

## 1. Fetch latest origin/main

```bash
git fetch origin main
```

## 2. Compute new version

Read current version from `origin/main:packages/universal-cookie/package.json` (not the local working tree — local main may be ahead/dirty), then bump per the user's choice:

```bash
NEW_VERSION=$(node -p "const v=JSON.parse(require('child_process').execSync('git show origin/main:packages/universal-cookie/package.json')).version.split('.').map(Number); const t='<patch|minor|major>'; if(t==='major'){v[0]++;v[1]=0;v[2]=0}else if(t==='minor'){v[1]++;v[2]=0}else{v[2]++} v.join('.')")
echo "$NEW_VERSION"
```

## 3. Create release branch off origin/main

Branch off `origin/main` (not local `main`) so unpushed/local commits don't sneak into the PR:

```bash
git checkout -b release/v$NEW_VERSION origin/main
```

## 4. Bump versions

Bump every `packages/*/package.json` **except `react-cookie-demo`** (its version stays `0.0.0`):

```bash
for pkg in packages/react-cookie packages/universal-cookie packages/universal-cookie-express packages/universal-cookie-koa; do
  node -e "const f='$pkg/package.json';const p=require('./'+f);p.version='$NEW_VERSION';require('fs').writeFileSync(f,JSON.stringify(p,null,2)+'\n')"
done
```

Verify with `grep -H '"version"' packages/*/package.json`.

## 5. Commit, push, open PR with auto-merge

Commit with **no co-author trailer**. Match prior style (`Bump to vX.Y.Z`):

```bash
git add packages/*/package.json
git commit -m "Bump to v$NEW_VERSION"
git push -u origin HEAD
gh pr create --title "Bump to v$NEW_VERSION" --body "Release v$NEW_VERSION"
gh pr merge --auto --squash
```
