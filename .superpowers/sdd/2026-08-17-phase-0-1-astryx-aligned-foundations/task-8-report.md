# Task 8 Report: StyleX build integrations and distribution matrix

Date: 2026-08-17
Commit message: `feat: add StyleX distribution integrations`

## Outcome

Task 8 is implemented. `@misoto22/kioku-ui-build` is now a publishable,
typed package with working Babel, PostCSS, and Vite integrations backed by the
official StyleX packages. Four workspace-isolated reference applications prove
the compiled and public-source paths for Vite and Next.js.

Compiled examples import only the public core reset/compiled CSS and public
theme CSS. They do not depend on or configure the build package. Source
examples use the public build-package entrypoints and the public
`@misoto22/kioku-ui/source` export; neither uses a `packages/core` alias or an
arbitrary workspace-relative source import.

Every example renders `ThemeProvider` with the external `kiokuThemes`
definitions plus `Button`, `Field`, `TextInput`, and `Card`.

## Implementation

- Added the real StyleX Babel adapter and config builder. Its custom module
  resolver maps emitted NodeNext `.js` specifiers back to installed TypeScript
  source and derives package-canonical paths, preserving StyleX variable hashes
  across source compilation.
- Added the real StyleX PostCSS plugin, source include globs, a framework-loadable
  package-key config builder, and a CommonJS bridge required by Next.js 16's
  PostCSS loader.
- Added the real StyleX Vite integration. It selects the public
  `@misoto22/kioku-ui/source` entrypoint through an exact package-root alias,
  leaves CSS subpaths untouched, and excludes the compiled root from dependency
  optimization.
- Published root and per-tool JavaScript/type exports, documentation, package
  contents, and dependencies for `@misoto22/kioku-ui-build`.
- Published the core `./source` entrypoint and included the source tree in the
  core package artifact. Compiled root behavior remains the default.
- Added standalone compiled/source Vite and Next.js examples with isolated
  lockfiles pinned to pnpm 11.10.0.
- Added generated example output ignores to Git, ESLint, and Prettier so source
  control and repository quality commands inspect authored files rather than
  `.next`/`dist` products.

No plan or progress ledger was edited. Nothing was pushed or published.

## TDD evidence

### Initial RED

Command:

```text
pnpm -F @misoto22/kioku-ui-build test -- src/build.test.ts
```

After adding only the compiler test dependency, Vitest exited 1 because
`packages/build/src/build.test.ts` could not import the missing `./babel.js`.
This was the intended missing-integration RED.

The first implementation run then reported four application/config failures:
the PostCSS extraction did not have a consumer working directory and all four
reference manifests were absent.

### Framework contract REDs

Each subsequent integration defect was captured before its minimal repair:

- PostCSS config test: expected `Array.isArray(config.plugins)` to be `false`
  but received `true`. Next requires a package-key plugin object.
- CommonJS loading test: expected
  `require('@misoto22/kioku-ui-build/postcss')` to be a function but received an
  ESM namespace object.
- Source-distribution tests: the Vite integration returned an installed
  filesystem path rather than `@misoto22/kioku-ui/source`, and the source Next
  page still imported the compiled root.
- Source Next config test: `nextSourceConfig.webpack` was undefined, so emitted
  `.js` source specifiers could not resolve to `.ts`/`.tsx`.
- Installed-package Babel regression: compiling
  `node_modules/@misoto22/kioku-ui/src/components/Card.tsx` failed on
  `../authoring.stylex.js`; StyleX's CommonJS resolver did not map it to the
  shipped `authoring.stylex.ts`.

The corresponding real source-build failures were:

```text
TypeError: createContext is not a function
```

for server-rendering a Next page before making the provider example a client
component;

```text
The Next.js Babel loader does not support .mjs or .cjs config files.
```

before switching to the supported ESM `babel.config.js`;

```text
Malformed PostCSS Configuration
An unknown PostCSS plugin was provided ([object Object])
```

before using the package-key PostCSS configuration;

```text
TypeError: require(...) is not a function
```

before adding the published CommonJS PostCSS bridge;

```text
Module not found: Can't resolve './tokens/contracts.js'
```

before the Next webpack extension mapping; and

```text
Could not resolve the path to the imported file.
import {semanticTokens} from '../authoring.stylex.js';
```

before the canonical TypeScript-aware StyleX resolver.

An attempted esbuild bridge was rejected by the workspace supply-chain policy:

```text
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.28.2
```

It was removed. No dependency build allowlist was weakened; the final bridge is
a small published CommonJS wrapper and the package declares the workspace's
Node 24 minimum.

### Final focused GREEN

Command:

```text
pnpm -F @misoto22/kioku-ui-build test -- src/build.test.ts
```

Result: exit 0; 1 file and 13 tests passed. Coverage includes real Babel
transformation, installed TypeScript theme resolution, real PostCSS extraction,
CommonJS PostCSS loading, semantic Vite/Next config behavior, public source
resolution, and compiled/source manifest contracts.

## Standalone consumer verification

Frozen workspace-isolated installs:

```text
for app_dir in apps/example-vite apps/example-vite-source apps/example-nextjs apps/example-nextjs-source; do
  pnpm --dir "$app_dir" install --ignore-workspace --frozen-lockfile --ignore-scripts || exit
done
```

Result: exit 0 for all four applications under pnpm 11.10.0. Each lockfile
passed the repository supply-chain policy.

The exact Task 8 verification chain:

```text
pnpm -F @misoto22/kioku-ui-build test -- src/build.test.ts && \
pnpm --dir apps/example-vite build && \
pnpm --dir apps/example-vite-source build && \
pnpm --dir apps/example-nextjs build && \
pnpm --dir apps/example-nextjs-source build
```

Result: exit 0.

- Build integration: 13/13 tests passed.
- Compiled Vite: 58 modules; 43.62 kB CSS and 201.02 kB JavaScript.
- Source Vite: 57 modules; 31.90 kB extracted CSS and 201.04 kB JavaScript.
- Compiled Next.js: Next 16.3.1 Turbopack compiled, typechecked, and statically
  generated `/`.
- Source Next.js: Next 16.3.1 webpack compiled through public Babel/PostCSS
  integrations, typechecked, and statically generated `/`.

To rule out build-cache-only success, the four existing output directories were
moved to `/tmp/kioku-ui-task8-builds.qB5vQV` and all four build commands were
run again with empty output locations. Result: exit 0 for all four. The clean
source Next build took 9.7 seconds and explicitly loaded the external Babel
configuration.

## Artifact behavior

The final source artifact audit asserted:

- source Vite CSS contains extracted StyleX atom/layer and semantic-token rules;
- source Vite JavaScript contains no `stylex.create`;
- the clean source Next trace contains installed
  `@misoto22/kioku-ui/src/components/...` modules;
- the clean source Next trace contains no
  `@misoto22/kioku-ui/dist/styles/stylex.css`;
- source Next CSS contains extracted atom classes; and
- source Next static/server JavaScript contains no `stylex.create`.

Result: all assertions passed.

```text
node -e "const plugin=require('@misoto22/kioku-ui-build/postcss'); ..."
```

Result: exit 0 and `typeof plugin === 'function'`.

`npm pack --dry-run --json` for the build package includes `README.md`,
`postcss.cjs`, and JavaScript/declaration artifacts for root, Babel, PostCSS,
and Vite. The same command for core includes compiled root/CSS plus
`src/index.ts`, `src/authoring.stylex.ts`, and component source such as
`src/components/Button.tsx`.

## Package and repository gates

Passed:

```text
pnpm -F @misoto22/kioku-ui-build typecheck
pnpm -F @misoto22/kioku-ui-build build
pnpm -F @misoto22/kioku-ui-build test
pnpm -r --if-present typecheck
pnpm check:repo
pnpm check:package-boundaries
pnpm lint
pnpm test
pnpm build
pnpm verify-exports
```

Results:

- build package: typecheck/build exit 0; 13/13 tests passed;
- all package-specific typechecks exit 0;
- workspace/repository, boundary, and lint checks exit 0;
- internal repository suite: 8/8 tests passed;
- recursive workspace build and public export verification exit 0.

Package behavior tests were also run in dependency order because the existing
core package suite removes its own `dist` in `afterAll`:

```text
pnpm -F @misoto22/kioku-ui test && \
pnpm -F @misoto22/kioku-ui build && \
pnpm -F @misoto22/kioku-ui-theme-kioku test && \
pnpm -F @misoto22/kioku-ui-theme-kioku build && \
pnpm verify-exports
```

Result: exit 0; core 55/55 tests and theme 13/13 tests passed, followed by
successful builds and export verification.

Scoped Prettier checking for every Task 8 authored source/configuration file and
`git diff --check` both exit 0.

## Known inherited limitations

Root `pnpm typecheck` remains red in the unchanged installed dependency:

```text
node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/window/BrowserWindow.d.ts(684,67):
error TS2694: Namespace '"node:stream/web"' has no exported member 'UnderlyingDefaultSource'.
```

This is the same baseline limitation documented by Tasks 6 and 7. All package
typechecks, including the new build package, pass.

`pnpm -r --if-present test` also exposes an existing parallel scheduling race:
core passed all 55 tests and then removed `packages/core/dist` in its `afterAll`
while the theme suite attempted to resolve `@misoto22/kioku-ui/theme`. The
dependency-ordered command above passes all 68 core/theme tests.

Root `pnpm format` is reduced to the five documented baseline warnings:

```text
internal/scripts/check-package-boundaries.test.mjs
internal/scripts/verify-exports.mjs
packages/core/src/theme/Theme.test.tsx
packages/core/src/theme/Theme.tsx
pnpm-lock.yaml
```

No Task 8 authored source/configuration formatting warnings remain.
