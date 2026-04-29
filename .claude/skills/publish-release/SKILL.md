---
name: publish-release
description: Create a GitHub release and publish to NPM.
disable-model-invocation: true
---

# Publish Release

## 1. Sync main

```bash
git fetch origin main --tags
git checkout main
git pull origin main
```

## 2. Compute release version

Highest version across publishable packages on `origin/main`:

```bash
VERSION=$(node -p "
  ['react-cookie','universal-cookie','universal-cookie-express','universal-cookie-koa']
    .map(p => JSON.parse(require('child_process').execSync('git show origin/main:packages/'+p+'/package.json')).version)
    .sort((a,b) => a.split('.').map(Number).reduce((_,n,i)=>_||n-b.split('.').map(Number)[i],0))
    .pop()
")
echo "v$VERSION"
```

Abort if `v$VERSION` tag already exists:

```bash
git rev-parse "v$VERSION" >/dev/null 2>&1 && { echo "Tag v$VERSION already exists"; exit 1; }
```

## 3. Tag, push, release

Always create an annotated tag with a message (some local configs enable `tag.gpgsign`, which makes a plain `git tag NAME` fail without a message):

```bash
git tag -a "v$VERSION" -m "v$VERSION"
git push origin "v$VERSION"
gh release create "v$VERSION" --title "v$VERSION" --generate-notes
```
