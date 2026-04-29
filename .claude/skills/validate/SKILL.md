---
name: validate
description: Run the repo's full validation suite (format, build, size, tests, e2e). Invoke after any important change — finishing a feature, fix, refactor, or dependency bump — and always before committing.
---

# Validate

Run every step.

```bash
npm run format
npm run build
npm run size
npm test
npx playwright install
npx playwright test
```

If a step fails, fix the cause and **re-run the full suite from the top** — earlier steps may now produce different output (formatting, generated files, etc.). Repeat until a clean pass with no intervening changes.
