# Task 6 Report

## Implemented scope

- Added the requested controls: `Button`, `IconButton`, `Badge`, `StatusDot`, `Field`, `TextInput`, `TextArea`, `Toggle`, and `SegmentedControl`.
- Added the requested feedback and data-display components: `EmptyState`, `AsyncState`, `Spinner`, `Skeleton`, `Alert`, semantic table primitives, and `MetricGrid`.
- Added package-root exports, typed `@misoto22/kioku-ui/docs` catalog records, and Storybook stories for every stable Task 6 component.
- Added `@testing-library/user-event` as a core development dependency for real keyboard and pointer interaction tests.

## TDD evidence

### RED

Command:

```sh
pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/components/data-display.test.tsx
```

Initial result: exit 1. Vitest reported 18 expected failures: 17 new behavior tests failed because the Task 6 exports were undefined, and the docs catalog test failed because the 16 Task 6 records were absent.

### GREEN

The same command then exited 0 with 10 test files and 43 tests passed. The package test script currently runs the complete core `src` suite while accepting the requested focused paths, so this result includes all existing core regressions as well as the 17 new interaction and accessibility tests.

Covered behavior includes:

- native button keyboard activation and disabled suppression;
- required icon-button naming;
- generated field label, description, status, and invalid-state connections;
- controlled and uncontrolled text and toggle behavior;
- disabled-aware, wrapping roving focus for segmented radio options;
- distinct loading, empty, error, and ready rendering;
- polite status versus assertive error announcements;
- labelled progress and decorative skeleton behavior;
- native caption, header, row, and cell table semantics;
- description-list metric semantics.

## Verification evidence

- `pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/components/data-display.test.tsx && pnpm -F @misoto22/kioku-ui typecheck && pnpm -F @misoto22/kioku-ui build`: exit 0; 43/43 tests passed, core typecheck passed, and StyleX plus TypeScript build completed.
- `pnpm lint`: exit 0.
- `pnpm check:package-boundaries`: exit 0.
- `pnpm check:repo`: exit 0.
- Scoped Prettier check for every changed source, test, catalog, build configuration, and this report: exit 0.
- `git diff --check`: exit 0.
- Scoped Prettier check for Task 6 source, tests, docs, stories, and package configuration plus `git diff --check`: exit 0. The pnpm-managed lockfile is covered by lockfile installation and diff checks rather than Prettier because the repository's existing pnpm lock format differs from the configured Prettier YAML output.
- Neutrality audit found no router imports, request codes, domain data, product analytics labels, private URLs, or product defaults in Task 6 source and stories. Component styles consume the existing semantic StyleX token contract for visual values.

## Existing repository-wide gate limitations

These diagnostics are outside the Task 6 diff and do not block the scoped implementation:

- Root `pnpm typecheck` exits 2 in the existing `happy-dom@20.11.2` declaration because `node:stream/web` has no exported `UnderlyingDefaultSource`. Task 6 does not change the root TypeScript configuration, Node types, or happy-dom version; the core package typecheck passes.
- Root `pnpm format` exits 1 on five pre-existing unchanged source/configuration files: `internal/scripts/check-package-boundaries.test.mjs`, `internal/scripts/verify-exports.mjs`, `packages/core/src/theme/Theme.test.tsx`, `packages/core/src/theme/Theme.tsx`, and `packages/themes/kioku/package.json`. It also flags the pnpm-managed `pnpm-lock.yaml`; the `HEAD` lockfile likewise differs from the configured Prettier YAML output. All Task 6 source, tests, docs, stories, and package configuration pass the scoped formatting check.
- `pnpm verify-exports` exits 1 on two existing export targets: `@misoto22/kioku-ui-theme-kioku` lacks `dist/index.js`, and `@misoto22/kioku-ui` declares an existing `dist/authoring.js` target that is not emitted. The Task 6 package build and public docs package-consumer test pass.

## Blockers

No Task 6 blocker. Storybook build and axe gates remain intentionally deferred to Task 9 as specified by the task brief.

## Focused fix round 1

### Corrected scope

- Updated the core StyleX build with a post-transform that compiles JSX to the React automatic runtime and rewrites emitted `authoring.stylex` imports to executable `.js` paths. Published runtime modules no longer contain JSX or unresolved extensionless imports.
- Added a build regression that imports `Button` and `AsyncState` through the public `@misoto22/kioku-ui` package root and renders them with `react-dom/server`; it does not use source or deep package paths.
- Completed every Task 6 catalog record with its explicit public props and strengthened validation for blank/duplicate prop entries plus missing/blank inherited-native-props contracts.
- Required `SegmentedControl` to have `aria-label` or `aria-labelledby` by both TypeScript and runtime contracts, added orientation-aware roving keys, and covered controlled, disabled, Home/End, and vertical behavior.
- Required ready `AsyncState` values to have a renderer by both TypeScript and runtime contracts. `AsyncState` now keeps one persistent polite status region across loading, empty, ready, and error transitions while retaining a separate alert for errors.
- Added controlled and uncontrolled `TextArea` coverage and token-backed Spinner rotation using the semantic duration and easing contracts.

### RED evidence

- `pnpm -F @misoto22/kioku-ui exec vitest run src/package-build.test.ts --reporter=verbose`: exit 1 with 2 failed and 3 passed. `node --check` rejected `dist/components/Button.js` at the emitted `<button` JSX, and the public package runtime import failed with `ERR_MODULE_NOT_FOUND` for extensionless `dist/authoring.stylex`.
- `pnpm -F @misoto22/kioku-ui exec vitest run src/components/controls.test.tsx src/components/data-display.test.tsx src/docs/index.test.ts --reporter=verbose`: exit 1 with 8 failed and 19 passed. Failures captured the unnamed radiogroup, vertical arrow behavior, non-persistent async status root, missing ready renderer, missing Spinner animation, and incomplete Task 6 prop catalogs.
- `pnpm -F @misoto22/kioku-ui exec vitest run src/docs/types.test.ts --reporter=verbose`: exit 1 with 1 failed and 3 passed. A missing inherited-native-props declaration incorrectly validated with `[]` instead of `['inheritedProps']`.

### GREEN and final verification evidence

- Focused interaction and catalog suite: 4 files and 27 tests passed after the accessibility and documentation changes.
- `pnpm -F @misoto22/kioku-ui exec vitest run src/docs/types.test.ts src/docs/index.test.ts --reporter=verbose`: exit 0; 2 files and 5 tests passed.
- `pnpm -F @misoto22/kioku-ui exec vitest run src/package-build.test.ts --reporter=verbose`: exit 0; all 5 public-build tests passed, including `emits syntax-valid JavaScript for representative public runtime components` and `loads and renders components through the public package name`.
- `pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/components/data-display.test.tsx src/package-build.test.ts && pnpm -F @misoto22/kioku-ui typecheck && pnpm -F @misoto22/kioku-ui build && node --check packages/core/dist/components/Button.js && node --check packages/core/dist/components/AsyncState.js`: exit 0; the complete core suite passed with 10 files and 53 tests, core TypeScript passed, the StyleX/declaration build passed, and both representative emitted modules were syntax-valid.
- The public runtime test above starts a consumer process that resolves `@misoto22/kioku-ui`, imports the built `Button` and `AsyncState` values, and successfully renders both to static markup.
- `pnpm lint`: exit 0.
- `pnpm check:package-boundaries`: exit 0.
- `pnpm check:repo`: exit 0.
