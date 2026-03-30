# Dependency Upgrade Plan

## Context

All dependencies need upgrading to their latest versions. This is a published library — **no breaking changes for consumers**. The React peer dependency must remain `react >= 16.3.0`. Node.js is v24.14.0.

## Phase 1: Cleanup — Remove Dead/Deprecated Dependencies

Remove packages that are unused or deprecated:

- **Root `package.json`**: Remove `rollup-plugin-replace` (deprecated, not imported anywhere — `@rollup/plugin-replace` is already used)
- **`packages/react-cookie-demo/package.json`**:
  - Remove `@babel/plugin-proposal-class-properties` (deprecated, replaced by `@babel/plugin-transform-class-properties` which is included in preset-env)
  - Remove `@babel/preset-stage-2` (deprecated since Babel 7, all features are in preset-env)
  - Remove `@types/testing-library__dom` (stub — `@testing-library/dom` ships its own types)

**Verify**: `yarn install && yarn build && yarn test`

## Phase 2: Minor/Patch Bumps (Non-Breaking)

All semver-compatible updates across the monorepo:

| Package                          | Current   | Latest   | Scope                                                  |
| -------------------------------- | --------- | -------- | ------------------------------------------------------ |
| `@babel/cli`                     | ^7.26.4   | ^7.28.6  | root + universal-cookie + react-cookie + express + koa |
| `@babel/core`                    | ^7.26.10  | ^7.29.0  | root + demo                                            |
| `@babel/preset-env`              | ^7.26.9   | ^7.29.2  | root + demo                                            |
| `@babel/preset-react`            | ^7.26.3   | ^7.28.5  | root + demo                                            |
| `@babel/preset-typescript`       | ^7.26.0   | ^7.28.5  | root + demo                                            |
| `@babel/register`                | ^7.25.9   | ^7.28.6  | demo                                                   |
| `@playwright/test`               | ^1.51.1   | ^1.58.2  | root                                                   |
| `@rollup/plugin-node-resolve`    | ^16.0.1   | ^16.0.3  | root                                                   |
| `@rollup/plugin-replace`         | ^6.0.2    | ^6.0.3   | root                                                   |
| `@rollup/plugin-typescript`      | ^12.1.2   | ^12.3.0  | root                                                   |
| `@testing-library/jest-dom`      | ^6.6.3    | ^6.9.1   | root                                                   |
| `@testing-library/react`         | ^16.2.0   | ^16.3.2  | root + demo                                            |
| `@types/express`                 | ^5.0.1    | ^5.0.6   | demo                                                   |
| `@types/node`                    | ^22.13.10 | ^25.5.0  | root + demo                                            |
| `@types/hoist-non-react-statics` | ^3.3.6    | ^3.3.7   | react-cookie                                           |
| `cookie`                         | ^1.0.2    | ^1.1.1   | universal-cookie (production dep)                      |
| `prettier`                       | ^3.5.3    | ^3.8.1   | root                                                   |
| `rimraf`                         | ^6.0.1    | ^6.1.3   | root + universal-cookie + react-cookie                 |
| `rollup`                         | ^4.36.0   | ^4.60.1  | root + universal-cookie + react-cookie                 |
| `tsx`                            | ^4.19.3   | ^4.21.0  | demo                                                   |
| `ts-loader`                      | ^9.5.2    | ^9.5.4   | demo                                                   |
| `webpack`                        | ^5.98.0   | ^5.105.4 | demo                                                   |
| `react` / `react-dom`            | ^19.0.0   | ^19.2.4  | react-cookie (dev) + demo                              |
| `react-test-renderer`            | ^19.0.0   | ^19.2.4  | demo                                                   |

**Verify**: `yarn install && yarn build && yarn test && yarn size && yarn format`

## Phase 3: Rollup Plugin Major Bumps

| Package                   | Current | Latest  |
| ------------------------- | ------- | ------- |
| `@rollup/plugin-babel`    | ^6.0.4  | ^7.0.0  |
| `@rollup/plugin-commonjs` | ^28.0.3 | ^29.0.2 |
| `@rollup/plugin-terser`   | ^0.4.4  | ^1.0.0  |

These are primarily Node.js version requirement bumps. The rollup configs use standard plugin invocations — no API changes expected.

**Files**: Root `package.json`
**Verify**: `yarn install && yarn build && yarn test && yarn size`

## Phase 4: TypeScript 5.8 → 6.0

**The highest-risk phase.** TS6 deprecates/removes several tsconfig options.

### Version bump

Update `typescript` from `^5.8.2` to `^6.0.2` in:

- Root, universal-cookie, react-cookie, react-cookie-demo package.json files

### tsconfig migrations

All library tsconfigs need:

- `"module": "es6"` → `"module": "esnext"` (es6 removed in TS6)
- `"moduleResolution": "node"` → `"moduleResolution": "bundler"` (node/node10 deprecated)

Using `"bundler"` (not `"nodenext"`) because the source uses extensionless imports and Rollup handles module resolution.

**Files to update:**

- `/tsconfig.json` — change `moduleResolution` to `"bundler"`
- `/packages/universal-cookie/tsconfig.json` — change `module` + `moduleResolution`
- `/packages/react-cookie/tsconfig.json` — change `module` + `moduleResolution`
- `/packages/universal-cookie-express/tsconfig.json` — change `module` + `moduleResolution`
- `/packages/universal-cookie-koa/tsconfig.json` — change `module` + `moduleResolution`
- `/packages/react-cookie-demo/tsconfig.json` — change `module` to `"esnext"`, `moduleResolution` to `"bundler"`

### Safety notes

- `strict: true` already set everywhere — TS6 default change is a no-op
- `esModuleInterop: true` already set where needed — TS6 can't set it to `false` (fine)
- `types` defaults to `[]` in TS6 — library packages don't rely on ambient `@types`, demo might need explicit `"types"` array if build breaks

**Verify**: `yarn install && yarn build && yarn test && yarn size` + diff emitted `.d.ts` files to confirm no type declaration regressions

## Phase 5: Jest 29 → 30

| Package                  | Current  | Latest  | Location    |
| ------------------------ | -------- | ------- | ----------- |
| `jest`                   | ^29.7.0  | ^30.3.0 | root + demo |
| `babel-jest`             | ^29.7.0  | ^30.3.0 | root + demo |
| `jest-environment-jsdom` | ^29.7.0  | ^30.3.0 | root        |
| `@types/jest`            | ^29.5.14 | ^30.0.0 | root + demo |

### Breaking changes that affect us

- JSDOM upgraded to v22 — better spec compliance, may make the `TextEncoder`/`TextDecoder` polyfills in `setup-tests.ts` redundant (harmless to keep)
- Deprecated matchers removed (`.toBeCalled()` etc.) — **not used in this codebase** (verified via grep)
- `jest.genMockFromModule()` removed — **not used**

**Verify**: `yarn install && yarn test`

## Phase 6: Tooling Major Bumps

| Package                        | Current | Latest  |
| ------------------------------ | ------- | ------- |
| `size-limit`                   | ^11.2.0 | ^12.0.1 |
| `@size-limit/preset-small-lib` | ^11.2.0 | ^12.0.1 |
| `lint-staged`                  | ^15.5.0 | ^16.4.0 |

- **size-limit 12**: Dropped Node 18 (fine on Node 24). No config changes needed.
- **lint-staged 16**: Uses nano-spawn instead of execa. Current config is a simple glob→command mapping — fully compatible. `--shell` flag removed but not used.

**Verify**: `yarn install && yarn size` + test lint-staged via a staged file

## Phase 7: Demo-Only Major Bumps (Express 5, webpack-cli 7)

| Package       | Current | Latest |
| ------------- | ------- | ------ |
| `express`     | ^4.21.2 | ^5.2.1 |
| `webpack-cli` | ^6.0.1  | ^7.0.2 |

### Express 4 → 5

The demo `server.ts` uses only `express.static()` and `app.use()` with simple middleware — no path parameters, regex routes, or `/*` patterns. Should work without code changes.

### webpack-cli 6 → 7

Config is `webpack.config.cjs` with basic `module.exports`. CJS configs still supported. No `--node-env` flag used.

**Zero risk to library consumers** — demo is private/unpublished.

**Verify**: `yarn install && yarn build-demo` + `yarn e2e`

## Verification Checklist (after all phases)

1. `yarn build` — all packages compile
2. `yarn test` — all unit tests pass
3. `yarn size` — bundle sizes within limits
4. `yarn format` — prettier works
5. `yarn e2e` — end-to-end tests pass
6. Diff emitted `.d.ts`/`.d.mts` files against pre-upgrade to confirm no public API changes
7. Confirm `react >= 16.3.0` peer dependency is unchanged in `react-cookie/package.json`
