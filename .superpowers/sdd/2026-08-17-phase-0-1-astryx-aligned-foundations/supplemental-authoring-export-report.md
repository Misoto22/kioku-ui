# Supplemental repair: compiled authoring export

## Status

DONE

## Diagnosis

The inherited `@misoto22/kioku-ui/authoring` export targeted
`./dist/authoring.js`, but the established core build emits the StyleX variable
module as `dist/authoring.stylex.js` with its declaration at
`dist/authoring.stylex.d.ts`. The missing target left the documented compiled
authoring subpath unusable and made the workspace export verifier fail after a
fresh core build.

The approved Task 3 source-distribution contract remains unchanged:

- `@misoto22/kioku-ui/authoring.stylex` still resolves its `import` and
  `default` conditions to the shipped canonical
  `src/authoring.stylex.ts`. StyleX consumers therefore compile the same source
  path and retain the CSS-variable hash compatibility already covered by the
  predecessor package test.
- `@misoto22/kioku-ui/authoring` now resolves `types`, `import`, and `default`
  to the real compiled declaration and JavaScript artifacts. It is consumable
  without asking a host to execute an uncompiled `stylex.defineVars` call.

No authoring source, token shape, build script, theme, example, plan, or ledger
was changed.

## Before diagnostics

After the existing core build, the export verifier reported exactly:

```text
$ pnpm verify-exports
@misoto22/kioku-ui: missing export target: ./dist/authoring.js
[ELIFECYCLE] Command failed with exit code 1.
```

A direct package self-reference reproduced the runtime defect:

```text
ERR_MODULE_NOT_FOUND Cannot find module
'packages/core/dist/authoring.js'
```

## RED evidence

I first added public consumer regressions for the documented compiled subpath:
one strict NodeNext TypeScript consumer and one Node runtime consumer with only
CSS loading neutralized.

```text
$ pnpm -F @misoto22/kioku-ui test -- src/package-build.test.ts -t 'compiled authoring'
Test Files 1 failed | 9 passed (10)
Tests 2 failed | 53 passed (55)
```

The failures were the expected contract failures:

```text
TS2307: Cannot find module '@misoto22/kioku-ui/authoring' or its
corresponding type declarations.

Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'packages/core/dist/authoring.js'
```

## Minimal fix

Changed only the compiled `./authoring` export from a nonexistent string target
to a conditional export:

```json
{
  "types": "./dist/authoring.stylex.d.ts",
  "import": "./dist/authoring.stylex.js",
  "default": "./dist/authoring.stylex.js"
}
```

All three conditions now target emitted, publishable files. The source
`./authoring.stylex` export and its public `semanticTokens` type contract were
preserved.

## After diagnostics and verification

Focused GREEN immediately after the manifest repair:

```text
$ pnpm -F @misoto22/kioku-ui test -- src/package-build.test.ts -t 'compiled authoring'
Test Files 10 passed (10)
Tests 55 passed (55)
```

Fresh build, export verification, core typecheck, and public consumer suite:

```text
$ pnpm -F @misoto22/kioku-ui build
exit 0

$ pnpm verify-exports
exit 0

$ pnpm -F @misoto22/kioku-ui typecheck
exit 0

$ pnpm -F @misoto22/kioku-ui test -- src/package-build.test.ts
Test Files 10 passed (10)
Tests 55 passed (55)
```

Emitted artifact checks after another fresh core build:

```text
$ node --check packages/core/dist/authoring.stylex.js
exit 0

$ test -f packages/core/dist/authoring.stylex.d.ts
exit 0

$ test -f packages/core/src/authoring.stylex.ts
exit 0

dist/authoring.stylex.js:
colorText: "var(--xfrcqq4)"
__varGroupHash__: "xrmadwz"

dist/authoring.stylex.d.ts:
semanticTokens: stylex.VarGroup<...>
colorText: string
```

Repository checks:

```text
$ pnpm lint
exit 0

$ pnpm check:package-boundaries
exit 0

$ pnpm exec prettier --check packages/core/package.json packages/core/src/package-build.test.ts
All matched files use Prettier code style!

$ git diff --check
exit 0
```

The repository-wide formatter remains blocked by five inherited files outside
this bounded repair:

```text
$ pnpm format
[warn] internal/scripts/check-package-boundaries.test.mjs
[warn] internal/scripts/verify-exports.mjs
[warn] packages/core/src/theme/Theme.test.tsx
[warn] packages/core/src/theme/Theme.tsx
[warn] pnpm-lock.yaml
[warn] Code style issues found in 5 files.
```

Those unrelated files were not modified. No publish, push, theme/example change,
or external write occurred.
