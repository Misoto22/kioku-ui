# Astryx-Aligned Kioku UI Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first publishable, Astryx-shaped Kioku UI foundation: a public pnpm monorepo with StyleX-authored React 19 core, configurable themes, compiled and source distributions, reference applications, and release-quality verification.

**Architecture:** The repository follows Astryx's `apps/`, `packages/`, and `internal/` boundary from the first commit. `packages/core` supplies a router- and domain-neutral component/runtime surface; `packages/themes/kioku` supplies the former Console visual identities as a theme pack; `packages/build` enables optional source distribution. The Kioku application is not modified in this phase—its current UI becomes a separate host-consumer migration in Phase 2 after the packages are published and proven externally.

**Tech Stack:** Node 24+, pnpm 11, React 19, TypeScript 6, StyleX, Vite 8, Vitest 4, React Testing Library, Storybook, Playwright with axe-core, Changesets, GitHub Actions, npm trusted publishing.

**Spec:** `docs/superpowers/specs/2026-08-17-kioku-ui-astryx-alignment-design.md`

## Global Constraints

- Preserve the Astryx product shape while independently implementing every source file under the `@misoto22/kioku-ui*` namespace.
- Use English for identifiers, code comments, commit messages, public API text, and repository documentation.
- Publish `@misoto22/kioku-ui` as the core package; use `@misoto22/kioku-ui-cli`, `@misoto22/kioku-ui-build`, and `@misoto22/kioku-ui-theme-kioku` for the aligned package family.
- Require React 19 as a peer dependency of core; do not import React Router, Kioku APIs, domain types, translated product copy, or personal-data concepts in any public package.
- Author component styles with StyleX. Ship tested compiled JavaScript/CSS by default and opt-in Babel, PostCSS, and Vite source-distribution integrations.
- Every component consumes semantic token roles. Only a theme definition may contain visual source values; core must not name or default to Washi, Muji, Sumi, a theme storage key, or a host persistence mechanism.
- Use test-driven development: add and run a focused failing test before implementing each production behavior, then rerun it green before refactoring.
- Stable components require typed docs metadata, Storybook stories, keyboard and screen-reader tests, light/dark visual coverage, and public export-map verification.
- Keep charts, Vega, CLI commands, docsite implementation, and Kioku Console migration out of this phase except for package directories and documented boundaries. They are later standalone plans.
- Use Changesets and semantic versioning. Do not publish until npm trusted publishing is configured and the full release matrix passes.

---

### Task 1: Create the Astryx-shaped workspace and repository quality baseline

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.gitignore`
- Create: `.changeset/config.json`
- Create: `LICENSE`
- Create: `README.md`
- Create: `internal/scripts/check-workspace.test.mjs`
- Create: `internal/scripts/check-workspace.mjs`
- Create: `.github/workflows/ci.yml`
- Modify: `docs/adr/0001-astryx-aligned-product-architecture.md`
- Test: `internal/scripts/check-workspace.test.mjs`

**Interfaces:**
- Consumes: the approved repository structure from the design spec.
- Produces: root `check`, `test`, `lint`, `typecheck`, `build`, `check:repo`, `verify-exports`, `changeset`, and `release` scripts; pnpm workspace discovery for `apps/*`, `packages/*`, `packages/themes/*`, and `internal/*`.

- [ ] **Step 1: Write the failing workspace-shape test**

```js
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {workspaceProblems} from './check-workspace.mjs';

test('accepts the required Astryx-aligned top-level directories', async () => {
  assert.deepEqual(await workspaceProblems(process.cwd()), []);
});
```

- [ ] **Step 2: Run the test to verify it fails for the missing checker**

Run: `node --test internal/scripts/check-workspace.test.mjs`

Expected: failure because `check-workspace.mjs` does not exist.

- [ ] **Step 3: Add root configuration and the minimal checker**

```js
export async function workspaceProblems(root) {
  const required = ['apps', 'packages', 'internal', '.changeset'];
  const missing = [];
  for (const name of required) {
    try {
      await stat(join(root, name));
    } catch {
      missing.push(`missing top-level directory: ${name}`);
    }
  }
  return missing;
}
```

Set the root package to private `kioku-ui`, `packageManager: "pnpm@11.10.0"`, `engines.node: ">=24"`, and scripts equivalent to Astryx's `check:repo`, `check:package-boundaries`, `sync:exports`, `verify-exports`, `storybook`, `docsite`, `changeset`, and `release`. Configure workspace discovery as `apps/*`, `packages/*`, `packages/themes/*`, and `internal/*`; exclude standalone `apps/example-*` from workspace linking. Use MIT text in `LICENSE`, explain the product and install target in `README.md`, and add the ADR amendment that names MIT and the `@misoto22` namespace.

- [ ] **Step 4: Run the focused test and root static checks**

Run: `node --test internal/scripts/check-workspace.test.mjs && pnpm install --frozen-lockfile=false && pnpm lint && pnpm typecheck`

Expected: the workspace test passes and lint/typecheck complete with exit code 0.

- [ ] **Step 5: Commit the self-contained workspace baseline**

```bash
git add package.json pnpm-workspace.yaml tsconfig.json vitest.config.ts eslint.config.js \
  .prettierrc.json .gitignore .changeset LICENSE README.md internal/scripts .github \
  docs/adr/0001-astryx-aligned-product-architecture.md pnpm-lock.yaml
git commit -m "chore: initialize Astryx-aligned workspace"
```

### Task 2: Establish package boundaries, shared test utilities, and public export verification

**Files:**
- Create: `internal/test-utils/package.json`
- Create: `internal/test-utils/src/index.ts`
- Create: `internal/test-utils/src/render.tsx`
- Create: `internal/scripts/check-package-boundaries.test.mjs`
- Create: `internal/scripts/check-package-boundaries.mjs`
- Create: `internal/scripts/verify-exports.test.mjs`
- Create: `internal/scripts/verify-exports.mjs`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/build/package.json`
- Create: `packages/cli/package.json`
- Create: `packages/lab/package.json`
- Create: `packages/charts/package.json`
- Create: `packages/vega/package.json`
- Create: `packages/themes/kioku/package.json`
- Test: `internal/scripts/check-package-boundaries.test.mjs`
- Test: `internal/scripts/verify-exports.test.mjs`

**Interfaces:**
- Consumes: root workspace scripts from Task 1.
- Produces: a test renderer with `renderUi`, a core package export map, and scripts that reject a forbidden dependency edge or an undeclared export target.

- [ ] **Step 1: Write failing boundary and export-map tests**

```js
test('rejects core imports from the Kioku host application', async () => {
  const problems = await packageBoundaryProblems({
    files: {'packages/core/src/Bad.tsx': "import {api} from '../../../kioku/web/src/lib/api'"},
  });
  assert.deepEqual(problems, ['packages/core/src/Bad.tsx imports a host application path']);
});

test('rejects an export map target that is absent from the package', async () => {
  const problems = await exportProblems({
    exports: {'./theme': './dist/theme.js'},
    files: new Set(['dist/index.js']),
  });
  assert.deepEqual(problems, ['missing export target: ./dist/theme.js']);
});
```

- [ ] **Step 2: Run the tests to verify both fail because the checkers are missing**

Run: `node --test internal/scripts/check-package-boundaries.test.mjs internal/scripts/verify-exports.test.mjs`

Expected: failure because neither checker module exists.

- [ ] **Step 3: Implement the test utility and package contract**

```tsx
export function renderUi(ui: React.ReactElement) {
  return render(ui, {wrapper: ({children}) => <React.StrictMode>{children}</React.StrictMode>});
}
```

Make `@misoto22/kioku-ui` public with explicit exports for `.`, `./reset.css`, `./styles.css`, `./theme`, and `./authoring`; declare React and React DOM 19 as peers. Build `check-package-boundaries.mjs` to deny `packages/core/**` imports that contain `kioku`, `react-router-dom`, `apps/`, or `web/src`, and to deny dependency direction from `core` to `cli`, `build`, theme, charts, or Vega. Build `verify-exports.mjs` to read each published package's `package.json` and require every export target to exist after build. Define all future package manifests now with `private: true` for `lab` and `publishConfig.access: public` for publishable scoped packages.

- [ ] **Step 4: Run package-boundary, export, and TypeScript tests green**

Run: `pnpm test -- internal/scripts/check-package-boundaries.test.mjs internal/scripts/verify-exports.test.mjs && pnpm -F @misoto22/kioku-ui typecheck && pnpm check:package-boundaries`

Expected: the focused tests pass, core typechecks, and no current package edge violates the policy.

- [ ] **Step 5: Commit the package boundary baseline**

```bash
git add internal/test-utils internal/scripts packages pnpm-lock.yaml package.json
git commit -m "chore: define package boundaries and exports"
```

### Task 3: Define the semantic token contract and StyleX authoring layer

**Files:**
- Create: `packages/core/src/tokens/contracts.ts`
- Create: `packages/core/src/tokens/contracts.test.ts`
- Create: `packages/core/src/tokens/stylex.ts`
- Create: `packages/core/src/styles/reset.css`
- Create: `packages/core/src/styles/global.stylex.ts`
- Create: `packages/core/src/styles/index.css`
- Create: `packages/core/src/styles/index.test.ts`
- Modify: `packages/core/src/index.ts`
- Modify: `packages/core/package.json`
- Test: `packages/core/src/tokens/contracts.test.ts`
- Test: `packages/core/src/styles/index.test.ts`

**Interfaces:**
- Consumes: core package export map and test renderer from Task 2.
- Produces: `TokenContract`, `ThemeDefinition`, `density` roles, reset CSS, and `@misoto22/kioku-ui/styles.css` that composes compiled StyleX output without a host-specific selector.

- [ ] **Step 1: Write failing contract tests**

```ts
import {describe, expect, it} from 'vitest';
import {validateThemeDefinition} from './contracts';

describe('validateThemeDefinition', () => {
  it('reports every missing semantic color role', () => {
    expect(validateThemeDefinition({id: 'incomplete', tokens: {}})).toEqual([
      'color.canvas', 'color.surface', 'color.text', 'color.focus',
    ]);
  });
});
```

```ts
it('exports CSS that declares semantic focus styling without a Kioku selector', async () => {
  const css = await readFile(new URL('./index.css', import.meta.url), 'utf8');
  expect(css).toContain(':focus-visible');
  expect(css).not.toContain('kioku.skin');
});
```

- [ ] **Step 2: Run the tests to verify they fail because the token modules do not exist**

Run: `pnpm -F @misoto22/kioku-ui test -- src/tokens/contracts.test.ts src/styles/index.test.ts`

Expected: module-resolution failures for `contracts` and `index.css`.

- [ ] **Step 3: Implement the token contract and StyleX source**

```ts
export interface ThemeDefinition {
  readonly id: string;
  readonly label: string;
  readonly tokens: Readonly<Record<TokenName, string>>;
}

export function validateThemeDefinition(theme: ThemeDefinition): TokenName[] {
  return tokenNames.filter((name) => theme.tokens[name] === undefined);
}
```

Define semantic groups for canvas/surface/text/border/status/focus, typography, spacing, radius, elevation, motion, and density. Keep source values out of component styles. Configure StyleX compilation with CSS custom properties whose names are public only at the semantic-contract boundary. `reset.css` covers box sizing, document typography inheritance, reduced motion, and form-control inheritance; `index.css` exports reset, compiled component CSS, and global focus rules in a documented cascade-layer order.

- [ ] **Step 4: Run focused tests, StyleX compilation, and package typecheck green**

Run: `pnpm -F @misoto22/kioku-ui test -- src/tokens/contracts.test.ts src/styles/index.test.ts && pnpm -F @misoto22/kioku-ui build && pnpm -F @misoto22/kioku-ui typecheck`

Expected: validation tests pass, CSS artifacts are emitted, and no TypeScript error appears.

- [ ] **Step 5: Commit the token contract**

```bash
git add packages/core/src/tokens packages/core/src/styles packages/core/src/index.ts packages/core/package.json
git commit -m "feat: add semantic token contract"
```

### Task 4: Implement router-neutral theme and link providers

**Files:**
- Create: `packages/core/src/theme/Theme.tsx`
- Create: `packages/core/src/theme/Theme.test.tsx`
- Create: `packages/core/src/theme/index.ts`
- Create: `packages/core/src/navigation/LinkProvider.tsx`
- Create: `packages/core/src/navigation/LinkProvider.test.tsx`
- Create: `packages/core/src/navigation/index.ts`
- Modify: `packages/core/src/index.ts`
- Modify: `packages/core/package.json`
- Test: `packages/core/src/theme/Theme.test.tsx`
- Test: `packages/core/src/navigation/LinkProvider.test.tsx`

**Interfaces:**
- Consumes: `ThemeDefinition` and semantic token CSS from Task 3.
- Produces: `ThemeProvider`, `useTheme`, `LinkProvider`, `Link`, and the `./theme` export path.

- [ ] **Step 1: Write failing provider behavior tests**

```tsx
it('uses the supplied default theme rather than a built-in theme name', () => {
  renderUi(<ThemeProvider themes={[paper]} defaultThemeId="paper"><Probe /></ThemeProvider>);
  expect(screen.getByTestId('theme')).toHaveTextContent('paper');
});

it('delegates a link to the host-supplied renderer', () => {
  renderUi(<LinkProvider renderLink={({href, children}) => <a data-host-link href={href}>{children}</a>}><Link href="/settings">Settings</Link></LinkProvider>);
  expect(screen.getByTestId('host-link')).toHaveAttribute('href', '/settings');
});
```

- [ ] **Step 2: Run the tests to verify they fail because provider exports are absent**

Run: `pnpm -F @misoto22/kioku-ui test -- src/theme/Theme.test.tsx src/navigation/LinkProvider.test.tsx`

Expected: import failures for `ThemeProvider`, `useTheme`, `LinkProvider`, and `Link`.

- [ ] **Step 3: Implement dependency-injected providers**

```tsx
export function ThemeProvider({themes, defaultThemeId, persistence, children}: ThemeProviderProps) {
  const [themeId, setThemeId] = useState(() => persistence?.read() ?? defaultThemeId);
  const theme = requiredTheme(themes, themeId);
  return <ThemeContext value={{theme, setThemeId}}>{children}</ThemeContext>;
}
```

The theme provider applies only the supplied theme's data attribute and semantic token values. Validate duplicate IDs and missing token roles before rendering. Persistence is an optional `read`/`write` adapter owned by the host. The link provider accepts a host `renderLink` function and falls back to a normal `<a>` only when no adapter is supplied. No module imports `react-router-dom`.

- [ ] **Step 4: Run focused tests and the public export check green**

Run: `pnpm -F @misoto22/kioku-ui test -- src/theme/Theme.test.tsx src/navigation/LinkProvider.test.tsx && pnpm -F @misoto22/kioku-ui build && pnpm verify-exports`

Expected: both providers pass behavioral tests and `./theme` resolves from the packed core build.

- [ ] **Step 5: Commit theme and navigation runtime**

```bash
git add packages/core/src/theme packages/core/src/navigation packages/core/src/index.ts packages/core/package.json
git commit -m "feat: add configurable theme and link providers"
```

### Task 5: Implement accessible foundation and layout components

**Files:**
- Create: `packages/core/src/components/Text.tsx`
- Create: `packages/core/src/components/Heading.tsx`
- Create: `packages/core/src/components/Stack.tsx`
- Create: `packages/core/src/components/Grid.tsx`
- Create: `packages/core/src/components/Section.tsx`
- Create: `packages/core/src/components/Card.tsx`
- Create: `packages/core/src/components/VisuallyHidden.tsx`
- Create: `packages/core/src/components/Text.doc.ts`
- Create: `packages/core/src/components/Heading.doc.ts`
- Create: `packages/core/src/components/Stack.doc.ts`
- Create: `packages/core/src/components/Grid.doc.ts`
- Create: `packages/core/src/components/Section.doc.ts`
- Create: `packages/core/src/components/Card.doc.ts`
- Create: `packages/core/src/components/VisuallyHidden.doc.ts`
- Create: `packages/core/src/docs/types.ts`
- Create: `packages/core/src/docs/types.test.ts`
- Create: `packages/core/src/components/index.ts`
- Create: `packages/core/src/components/foundations.test.tsx`
- Create: `apps/storybook/stories/foundations.stories.tsx`
- Test: `packages/core/src/components/foundations.test.tsx`

**Interfaces:**
- Consumes: semantic tokens, `ThemeProvider`, and shared render helper.
- Produces: documented layout primitives with no host selector, router dependency, or domain language.

- [ ] **Step 1: Write failing semantic and accessibility tests**

```tsx
it('renders Heading with the requested semantic level and token-backed variant', () => {
  renderUi(<Heading level={2} size="section">Account settings</Heading>);
  expect(screen.getByRole('heading', {level: 2, name: 'Account settings'})).toBeVisible();
});

it('hides VisuallyHidden text visually while preserving its accessible name', () => {
  renderUi(<button><VisuallyHidden>Open navigation</VisuallyHidden></button>);
  expect(screen.getByRole('button', {name: 'Open navigation'})).toBeVisible();
});
```

```ts
it('requires a canonical name, public props, example, and story ID in component metadata', () => {
  expect(validateComponentDoc({name: 'Button'})).toEqual([
    'description', 'props', 'example', 'storyId',
  ]);
});
```

- [ ] **Step 2: Run the test to verify it fails for absent foundation components**

Run: `pnpm -F @misoto22/kioku-ui test -- src/components/foundations.test.tsx src/docs/types.test.ts`

Expected: test compilation fails because the named foundation exports are absent.

- [ ] **Step 3: Implement foundations with StyleX recipes**

```tsx
export function Stack({gap = 'md', align = 'stretch', children}: StackProps) {
  return <div {...stylex.props(styles.base, gaps[gap], aligns[align])}>{children}</div>;
}
```

Implement a `ComponentDoc` type and `validateComponentDoc` first, then implement `Text`, `Heading`, `Stack`, `Grid`, `Section`, `Card`, `CardHeader`, `CardFooter`, `Divider`, `Center`, and `VisuallyHidden`. Use polymorphic elements only where semantics require them; preserve native heading levels and do not replace a semantic button or link with a generic `div`. Every size, gap, color, border, and focus treatment comes from semantic tokens. Add one typed `*.doc.ts` record beside each stable component with its canonical name, description, public props, accessible usage example, and the story ID that documents it; the later CLI consumes these same records rather than duplicating the catalog.

- [ ] **Step 4: Add Storybook coverage and verify tests, typecheck, and story build**

Run: `pnpm -F @misoto22/kioku-ui test -- src/components/foundations.test.tsx src/docs/types.test.ts && pnpm -F @misoto22/kioku-ui typecheck && pnpm -F @misoto22/kioku-ui build`

Expected: component tests pass, types are clean, and the core package emits the foundation artifacts. Storybook compilation is performed after its application is configured in Task 9.

- [ ] **Step 5: Commit the foundation layer**

```bash
git add packages/core/src/components apps/storybook
git commit -m "feat: add foundation and layout components"
```

### Task 6: Implement core controls, feedback, and data-display primitives

**Files:**
- Create: `packages/core/src/components/Button.tsx`
- Create: `packages/core/src/components/IconButton.tsx`
- Create: `packages/core/src/components/Badge.tsx`
- Create: `packages/core/src/components/StatusDot.tsx`
- Create: `packages/core/src/components/Field.tsx`
- Create: `packages/core/src/components/TextInput.tsx`
- Create: `packages/core/src/components/TextArea.tsx`
- Create: `packages/core/src/components/Toggle.tsx`
- Create: `packages/core/src/components/SegmentedControl.tsx`
- Create: `packages/core/src/components/EmptyState.tsx`
- Create: `packages/core/src/components/AsyncState.tsx`
- Create: `packages/core/src/components/Table.tsx`
- Create: `packages/core/src/components/MetricGrid.tsx`
- Create: `packages/core/src/components/Button.doc.ts`
- Create: `packages/core/src/components/IconButton.doc.ts`
- Create: `packages/core/src/components/Badge.doc.ts`
- Create: `packages/core/src/components/StatusDot.doc.ts`
- Create: `packages/core/src/components/Field.doc.ts`
- Create: `packages/core/src/components/TextInput.doc.ts`
- Create: `packages/core/src/components/TextArea.doc.ts`
- Create: `packages/core/src/components/Toggle.doc.ts`
- Create: `packages/core/src/components/SegmentedControl.doc.ts`
- Create: `packages/core/src/components/EmptyState.doc.ts`
- Create: `packages/core/src/components/AsyncState.doc.ts`
- Create: `packages/core/src/components/Table.doc.ts`
- Create: `packages/core/src/components/MetricGrid.doc.ts`
- Create: `packages/core/src/components/controls.test.tsx`
- Create: `packages/core/src/components/data-display.test.tsx`
- Create: `apps/storybook/stories/controls.stories.tsx`
- Create: `apps/storybook/stories/data-display.stories.tsx`
- Test: `packages/core/src/components/controls.test.tsx`
- Test: `packages/core/src/components/data-display.test.tsx`

**Interfaces:**
- Consumes: Task 5 layout components, injected `Link`, tokens, and test utilities.
- Produces: accessible interactive components needed by Console extraction without moving Console business semantics.

- [ ] **Step 1: Write failing keyboard, form-label, and async-state tests**

```tsx
it('activates a Button with Space and exposes disabled state natively', async () => {
  const user = userEvent.setup();
  const action = vi.fn();
  renderUi(<Button onClick={action}>Save</Button>);
  await user.tab();
  await user.keyboard(' ');
  expect(action).toHaveBeenCalledOnce();
});

it('connects Field label and validation message to TextInput', () => {
  renderUi(<Field label="Email" status="Enter a valid address"><TextInput /></Field>);
  expect(screen.getByRole('textbox', {name: 'Email'})).toHaveAccessibleDescription('Enter a valid address');
});

it('does not represent a failed request as an empty result', () => {
  renderUi(<AsyncState state={{kind: 'error', title: 'Request failed'}} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Request failed');
});
```

- [ ] **Step 2: Run the tests to verify the imports fail before implementation**

Run: `pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/components/data-display.test.tsx`

Expected: compilation fails because controls and data-display exports have not been created.

- [ ] **Step 3: Implement the neutral component contracts**

```tsx
export type AsyncStateValue<T> =
  | {kind: 'loading'; label?: string}
  | {kind: 'empty'; title: ReactNode; detail?: ReactNode; action?: ReactNode}
  | {kind: 'error'; title: ReactNode; detail?: ReactNode; retry?: ReactNode}
  | {kind: 'ready'; data: T};
```

Implement native-button based actions, ARIA-labelled icon actions, field IDs created with `useId`, status variations, controlled/uncontrolled input contracts, a roving-focus segmented control, semantic table primitives, `MetricGrid`, `EmptyState`, spinner, skeleton, alert, and `AsyncState`. Add a typed `*.doc.ts` record beside every stable component using the same metadata convention established in Task 5. Do not encode request status numbers, domain error copy, selection nouns, table row data, or Kioku analytics labels.

- [ ] **Step 4: Verify interaction, accessibility, Storybook, and package build**

Run: `pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/components/data-display.test.tsx && pnpm -F @misoto22/kioku-ui typecheck && pnpm -F @misoto22/kioku-ui build`

Expected: all focused tests pass, types are clean, and the core package emits its public artifacts. Axe and Storybook build gates are introduced by Task 9 once the Storybook application exists.

- [ ] **Step 5: Commit core controls and states**

```bash
git add packages/core/src/components apps/storybook
git commit -m "feat: add accessible controls and data states"
```

### Task 7: Package the Kioku theme collection without hard-coding it in core

**Files:**
- Create: `packages/themes/kioku/src/themes.ts`
- Create: `packages/themes/kioku/src/themes.test.ts`
- Create: `packages/themes/kioku/src/theme.css`
- Create: `packages/themes/kioku/src/index.ts`
- Create: `packages/themes/kioku/README.md`
- Modify: `packages/themes/kioku/package.json`
- Create: `apps/storybook/stories/kioku-themes.stories.tsx`
- Test: `packages/themes/kioku/src/themes.test.ts`

**Interfaces:**
- Consumes: `ThemeDefinition` from `@misoto22/kioku-ui/theme`.
- Produces: `washiTheme`, `mujiTheme`, and `sumiTheme` as registered `ThemeDefinition` values plus compiled CSS that supplies every core token role.

- [ ] **Step 1: Write failing theme-pack tests**

```ts
it.each([washiTheme, mujiTheme, sumiTheme])('fulfills the complete token contract for $id', (theme) => {
  expect(validateThemeDefinition(theme)).toEqual([]);
});

it('does not export a persistence key or a default theme choice', () => {
  expect(Object.keys(themeModule)).not.toContain('defaultThemeId');
  expect(JSON.stringify(themeModule)).not.toContain('localStorage');
});
```

- [ ] **Step 2: Run the test to verify it fails before the theme pack exists**

Run: `pnpm -F @misoto22/kioku-ui-theme-kioku test -- src/themes.test.ts`

Expected: import failure for `themes.ts`.

- [ ] **Step 3: Implement Kioku theme definitions and StyleX-compatible CSS**

```ts
export const washiTheme = createTheme({
  id: 'washi',
  label: 'Washi',
  tokens: washiTokens,
});
```

Port the visible identity of the current Console themes into separate token dictionaries, including light/dark values and density-compatible roles. Do not copy storage policy or appearance-provider state. Theme CSS selects only the theme ID supplied by the host's `ThemeProvider`; it does not alter global host selectors outside the documented theme root.

- [ ] **Step 4: Verify all theme variants and the consumer package build**

Run: `pnpm -F @misoto22/kioku-ui-theme-kioku test -- src/themes.test.ts && pnpm -F @misoto22/kioku-ui-theme-kioku build && pnpm -F @misoto22/kioku-ui build`

Expected: every theme fulfills the contract and the packages emit compatible theme and core artifacts. Storybook validates the theme matrix in Task 9.

- [ ] **Step 5: Commit the first external theme pack**

```bash
git add packages/themes/kioku apps/storybook
git commit -m "feat: add Kioku theme pack"
```

### Task 8: Implement the aligned StyleX build package and distribution matrix

**Files:**
- Create: `packages/build/src/index.ts`
- Create: `packages/build/src/vite.ts`
- Create: `packages/build/src/postcss.ts`
- Create: `packages/build/src/babel.ts`
- Create: `packages/build/src/build.test.ts`
- Create: `packages/build/README.md`
- Modify: `packages/build/package.json`
- Create: `apps/example-vite/package.json`
- Create: `apps/example-vite/src/main.tsx`
- Create: `apps/example-vite/src/App.tsx`
- Create: `apps/example-vite/vite.config.ts`
- Create: `apps/example-nextjs/package.json`
- Create: `apps/example-nextjs/src/app/layout.tsx`
- Create: `apps/example-nextjs/src/app/page.tsx`
- Create: `apps/example-nextjs/next.config.ts`
- Create: `apps/example-vite-source/`
- Create: `apps/example-nextjs-source/`
- Test: `packages/build/src/build.test.ts`

**Interfaces:**
- Consumes: compiled core/theme packages and StyleX source from Tasks 3–7.
- Produces: documented Babel, PostCSS, and Vite build integrations and four standalone consumer examples covering compiled and source distribution.

- [ ] **Step 1: Write failing integration-config tests**

```ts
it('adds the Kioku UI source package to the Vite StyleX include list', () => {
  expect(kiokuUiVitePlugin().include).toContain('@misoto22/kioku-ui');
});

it('does not require a source build plugin for the compiled Vite example', async () => {
  expect(await packageUsesBuildPlugin('apps/example-vite')).toBe(false);
});
```

- [ ] **Step 2: Run the test to verify build-package exports are missing**

Run: `pnpm -F @misoto22/kioku-ui-build test -- src/build.test.ts`

Expected: test fails because the Vite integration and example inspector do not exist.

- [ ] **Step 3: Implement source integrations and reference applications**

```ts
export function kiokuUiVitePlugin(options: KiokuUiBuildOptions = {}) {
  return {include: ['@misoto22/kioku-ui', ...(options.include ?? [])]};
}
```

Implement the equivalent documented Babel and PostCSS configurations. The compiled Vite/Next examples import `@misoto22/kioku-ui/reset.css`, `@misoto22/kioku-ui/styles.css`, and the Kioku theme CSS without configuring StyleX. The source examples compile the same core source through the build package. Every example renders `ThemeProvider`, `Button`, `Field`, and `Card`, so package CSS, peer dependencies, and theme registration are exercised together.

- [ ] **Step 4: Verify focused tests and all four consumer builds**

Run: `pnpm -F @misoto22/kioku-ui-build test -- src/build.test.ts && pnpm --dir apps/example-vite build && pnpm --dir apps/example-vite-source build && pnpm --dir apps/example-nextjs build && pnpm --dir apps/example-nextjs-source build`

Expected: all distribution paths build from a clean install without importing unpublished workspace paths.

- [ ] **Step 5: Commit source and compiled distribution support**

```bash
git add packages/build apps/example-vite apps/example-vite-source apps/example-nextjs apps/example-nextjs-source
git commit -m "feat: add StyleX distribution integrations"
```

### Task 9: Add Storybook, sandbox, and repository-level quality gates

**Files:**
- Create: `apps/storybook/package.json`
- Create: `apps/storybook/.storybook/main.ts`
- Create: `apps/storybook/.storybook/preview.ts`
- Create: `apps/sandbox/package.json`
- Create: `apps/sandbox/src/App.tsx`
- Create: `apps/sandbox/src/main.tsx`
- Create: `internal/stylex-capabilities/package.json`
- Create: `internal/stylex-capabilities/src/capabilities.test.ts`
- Create: `internal/vibe-tests/package.json`
- Create: `internal/vibe-tests/src/component-index.test.ts`
- Create: `.github/scripts/accessibility-audit.js`
- Create: `.github/a11y-baseline.json`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Test: `internal/stylex-capabilities/src/capabilities.test.ts`
- Test: `internal/vibe-tests/src/component-index.test.ts`

**Interfaces:**
- Consumes: public core/theme exports and reference applications from Tasks 3–8.
- Produces: Storybook visual fixtures, sandbox source-distribution exercise, a11y baseline audit, StyleX capability policy, component-catalog discoverability test, and CI quality gates.

- [ ] **Step 1: Write failing quality-policy tests**

```ts
it('fails when a public component has no documentation metadata or story', async () => {
  await expect(componentCatalogProblems(['Button'])).resolves.toEqual([
    'Button is missing a Storybook story',
    'Button is missing component documentation metadata',
  ]);
});

it('rejects an unsupported StyleX capability rather than silently compiling it', () => {
  expect(isSupportedStylexCapability('arbitrary-global-selector')).toBe(false);
});
```

- [ ] **Step 2: Run the tests to verify quality gate helpers are absent**

Run: `pnpm -F @misoto22/kioku-ui-vibe-tests test -- src/component-index.test.ts && pnpm -F @misoto22/kioku-ui-stylex-capabilities test -- src/capabilities.test.ts`

Expected: missing-module failures for both policy helpers.

- [ ] **Step 3: Implement quality gates and visual development applications**

```yaml
- run: pnpm check:repo
- run: pnpm test
- run: pnpm a11y:audit
- run: pnpm storybook:build
- run: pnpm verify-exports
- run: pnpm --dir apps/example-vite build
- run: pnpm --dir apps/example-nextjs build
```

Configure Storybook to render each stable component under every Kioku theme and mode. Configure the sandbox as a local source-distribution consumer. The component-index check must derive its expected entries from core exports and require a corresponding typed doc module plus story. The capability policy documents exactly which StyleX syntax the build supports. The accessibility script uses Playwright and axe, compares results with the checked-in baseline, and fails only on newly introduced violations.

- [ ] **Step 4: Run all repository quality gates green**

Run: `pnpm check:repo && pnpm test && pnpm a11y:audit && pnpm storybook:build && pnpm verify-exports && pnpm --dir apps/example-vite build && pnpm --dir apps/example-nextjs build`

Expected: every command completes with exit code 0 from a clean checkout.

- [ ] **Step 5: Commit the quality baseline**

```bash
git add apps/storybook apps/sandbox internal/stylex-capabilities internal/vibe-tests .github package.json pnpm-lock.yaml
git commit -m "chore: add design-system quality gates"
```

### Task 10: Prove package release readiness without publishing

**Files:**
- Create: `internal/scripts/pack-smoke.test.mjs`
- Create: `internal/scripts/pack-smoke.mjs`
- Create: `.github/workflows/release.yml`
- Create: `docs/operations/release.md`
- Modify: `package.json`
- Modify: `README.md`
- Test: `internal/scripts/pack-smoke.test.mjs`

**Interfaces:**
- Consumes: all package manifests, exports, examples, and quality gates from Tasks 1–9.
- Produces: `pnpm pack:smoke`, a release workflow configured for npm trusted publishing, and an operator runbook that prevents token-based release configuration.

- [ ] **Step 1: Write a failing packed-artifact test**

```js
test('packed core contains declared CSS and JavaScript exports but no source test files', async () => {
  const contents = await packedFiles('@misoto22/kioku-ui');
  assert(contents.has('dist/index.js'));
  assert(contents.has('dist/styles.css'));
  assert(![...contents].some((path) => path.endsWith('.test.tsx')));
});
```

- [ ] **Step 2: Run the test to verify it fails because the pack inspector is missing**

Run: `node --test internal/scripts/pack-smoke.test.mjs`

Expected: module-resolution failure for `pack-smoke.mjs`.

- [ ] **Step 3: Implement tarball inspection and trusted-publishing workflow**

```js
export async function packedFiles(packageName) {
  const result = await execa('pnpm', ['--filter', packageName, 'pack', '--json']);
  return listTarEntries(JSON.parse(result.stdout)[0].filename);
}
```

The pack smoke test runs against each publishable package, validates declared exports and license/readme inclusion, rejects tests and private fixtures, and installs the tarball into a temporary standalone Vite application. The release workflow requires a Changeset, protected `main`, npm provenance/trusted publishing, and no stored npm token. The release runbook documents first-time npm scope setup, dry-run, canary, stable release, rollback through deprecation, and the rule that published versions are never overwritten.

- [ ] **Step 4: Run the release-readiness matrix green**

Run: `pnpm pack:smoke && pnpm check:repo && pnpm test && pnpm a11y:audit && git diff --check`

Expected: packed artifacts have valid public exports, the temporary Vite consumer builds, and all repository quality gates remain green.

- [ ] **Step 5: Commit the release-readiness contract**

```bash
git add internal/scripts .github/workflows/release.yml docs/operations/release.md package.json README.md pnpm-lock.yaml
git commit -m "chore: verify package release readiness"
```

## Plan self-review

### Spec coverage

- Public repository, pnpm workspace, MIT, Changesets, CI, package boundaries, and release verification are Task 1, Task 2, and Task 10.
- Astryx-aligned packages, apps, internal tools, StyleX source/build distribution, themes, and quality gates are covered by Tasks 2–10.
- Core component, accessibility, theme token, link-adapter, no-domain-code, and compiled CSS constraints are covered by Tasks 3–7.
- Reference applications, Storybook, sandbox, visual/a11y policy, and agent discoverability are covered by Tasks 8–9.
- The deliberately deferred CLI, docsite, full template catalog, chart/Vega family, and Kioku host migration are explicitly outside this plan and remain individually scoped phases in the approved design spec.

### Placeholder scan

The task list names every created or modified file, command, interface, and acceptance check for the Phase 0–1 deliverable. Later phases are exclusions rather than unspecified work items.

### Type consistency

`ThemeDefinition` and `validateThemeDefinition` originate in Task 3 and are consumed by Task 4 and Task 7. `ThemeProvider`, `LinkProvider`, and `Link` originate in Task 4 and are used by Task 5 and the consumer examples in Task 8. Public export checking originates in Task 2 and is required by Tasks 4, 9, and 10.
