# Kioku UI

<div align="center">

**A product-neutral React design system**

React 19 components, semantic tokens, and StyleX build tooling.

<br />

[Report Issue](https://github.com/Misoto22/kioku-ui/issues) · [Release Runbook](docs/operations/release.md) · [Architecture Decision](docs/adr/0001-astryx-aligned-product-architecture.md)

<br />

![React](https://img.shields.io/badge/React-19-087EA4)
![StyleX](https://img.shields.io/badge/StyleX-0.19.0-5A5A5A)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)
![Node](https://img.shields.io/badge/Node.js-24+-5FA04E)
![License](https://img.shields.io/badge/License-MIT-750014)

</div>

---

Kioku UI ships components, tokens, themes, and build integrations. It ships no
application routes, APIs, data, or business logic — see [Boundaries](#boundaries).

> [!NOTE]
> No version has been published to npm yet. The `pnpm add` commands below describe
> the intended install once the first Changesets release runs; until then, consume
> the packages through the workspace.

---

### Features

- **33 components** — layout (`Stack`, `Grid`, `Section`, `Card`), controls (`Button`, `TextInput`, `Toggle`, `SegmentedControl`), data (`Table`, `MetricGrid`), and state (`Alert`, `AsyncState`, `EmptyState`, `Skeleton`, `Spinner`)
- **71 semantic tokens** across eleven groups — color, border, status, focus, typography, spacing, radius, size, elevation, texture, motion — validated by `validateThemeDefinition` at runtime
- **Runtime theming** (`ThemeProvider`) — the host supplies the theme list, the default id, and an optional `ThemePersistence` adapter; the library owns no storage and hard-codes no theme
- **Density** (`compact` by default, `standard` opt-in) — a theme pack fulfills the spacing roles twice and the reader picks, without any component changing what it means
- **Two consumption modes** — compiled consumers import prebuilt CSS and configure nothing; source consumers import `/source` and run StyleX themselves through `@misoto22/kioku-ui-build`
- **Routing-agnostic links** (`LinkProvider`) — the host injects its own router; the package depends on no routing library
- **Accessibility baseline** — every Storybook story is audited with axe across all themes and color modes, with violations fingerprinted against a committed baseline (`pnpm a11y:audit`)

---

### Packages

| Package                          | Contents                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `@misoto22/kioku-ui`             | Components, token contracts, `ThemeProvider`, `LinkProvider`, compiled CSS, and opt-in source entries |
| `@misoto22/kioku-ui-theme-kioku` | Washi, Muji, and Sumi theme definitions plus their CSS                                                |
| `@misoto22/kioku-ui-build`       | Vite, Babel, and PostCSS integrations for source consumers                                            |

`charts`, `cli`, `lab`, and `vega` are reserved workspace placeholders and are not published.

---

### Tech Stack

<table>
<tr><td><b>Runtime</b></td><td>React 19 · <code>@stylexjs/stylex</code> 0.19.0</td></tr>
<tr><td><b>Language</b></td><td>TypeScript 6 · <code>NodeNext</code> module resolution · strict</td></tr>
<tr><td><b>Workspace</b></td><td>pnpm 11.10.0 workspaces · Node.js 24+</td></tr>
<tr><td><b>Testing</b></td><td>Vitest 4 · Testing Library · Playwright + axe-core (accessibility)</td></tr>
<tr><td><b>Documentation</b></td><td>Storybook 10.4.6 · Vite 8</td></tr>
<tr><td><b>Release</b></td><td>Changesets · npm trusted publishing with OIDC provenance</td></tr>
</table>

---

### Project Structure

```
packages/
├── core/                   @misoto22/kioku-ui — components, tokens, theme, navigation
├── themes/kioku/           @misoto22/kioku-ui-theme-kioku — Washi, Muji, Sumi
├── build/                  @misoto22/kioku-ui-build — Vite, Babel, PostCSS integrations
└── charts, cli, lab, vega  Reserved placeholders, unpublished

apps/
├── storybook/              Component catalogue and the accessibility audit target
├── sandbox/                Workspace playground, built in CI
└── example-*/              Standalone consumers, installed outside the workspace

internal/
├── scripts/                Repository gates: workspace, boundaries, exports, pack smoke
├── stylex-capabilities/    StyleX behaviour probes
├── test-utils/             Shared test helpers
└── vibe-tests/             Visual and interaction assertions

docs/
├── adr/                    Architecture decisions
├── operations/             Release runbook
└── superpowers/            Design specs and delivery plans
```

The four `example-*` apps are excluded from the workspace on purpose: each installs
its own dependency tree so CI proves the packages work as published rather than as
linked.

---

### Getting Started

```sh
git clone https://github.com/Misoto22/kioku-ui.git
cd kioku-ui
pnpm install
pnpm check
```

**Prerequisites** — Node.js 24 or newer, pnpm 11.10.0.

```
pnpm check              Repository gates, lint, build, typecheck, and tests
pnpm storybook          Component catalogue on port 6006
pnpm build:packages     Build the published packages only
pnpm a11y:audit         Audit every story against the committed baseline
pnpm pack:smoke         Pack and install the tarballs in a fresh workspace
pnpm release:verify     Everything the release workflow runs
```

`pnpm typecheck` and `pnpm test` resolve packages through their published `types`
entry, and everything that renders components — `pnpm storybook`,
`pnpm storybook:build`, `pnpm sandbox:build`, `pnpm a11y:audit` — loads them
through their published `dist` entry, so `pnpm build:packages` has to run first.
`pnpm check` already orders that correctly.

**Consuming the compiled packages:**

```sh
pnpm add @misoto22/kioku-ui @misoto22/kioku-ui-theme-kioku
```

```tsx
import {Button, ThemeProvider} from '@misoto22/kioku-ui';
import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

<ThemeProvider defaultThemeId="washi" themes={kiokuThemes}>
  <Button>Save</Button>
</ThemeProvider>;
```

Compiled consumers configure no StyleX. Source consumers add
`@misoto22/kioku-ui-build`, import `@misoto22/kioku-ui/source` and
`@misoto22/kioku-ui/authoring.stylex`, and omit `styles.css` — see the
[build package guide](packages/build/README.md).

---

### Documentation

| Document                                                                | Covers                                                 |
| ----------------------------------------------------------------------- | ------------------------------------------------------ |
| [`packages/core/README.md`](packages/core/README.md)                    | Component API, theme contracts, both consumption modes |
| [`packages/build/README.md`](packages/build/README.md)                  | StyleX setup for Vite, Babel, and PostCSS              |
| [`docs/adr/0001`](docs/adr/0001-astryx-aligned-product-architecture.md) | Why the repository is shaped the way it is             |
| [`docs/operations/release.md`](docs/operations/release.md)              | Release authority, npm trusted publishing, recovery    |

---

### Release

Every change to a published package requires a Changeset. Two independent gates
enforce it: the protected `Changeset Policy / changeset-policy` check runs from the
default branch with read-only permissions and never executes pull-request code, and
ordinary CI repeats the base-branch comparison.

Merging to `main` runs `pnpm release:verify` and then Changesets, which either opens
a version pull request or publishes the approved versions. Publishing uses npm
trusted publishing with OIDC provenance from the protected `npm` environment — the
repository holds no `NPM_TOKEN`. The [release runbook](docs/operations/release.md)
separates repository policy from the GitHub and npm settings a release authority
must configure externally.

---

### Boundaries

This repository owns components, tokens, themes, and build integrations. It owns no
application concern, and that is enforced rather than documented: `pnpm
check:package-boundaries` fails the build if core source imports a host application
path, names a specific theme skin, hard-codes a default theme id, or reaches for
`localStorage`.

The host application supplies the theme list, the default theme, persistence, and
the router. Kioku Console is one consumer of these packages, and nothing about it
ships here.

---

<div align="center">
<sub>Built by <a href="https://github.com/Misoto22">Misoto22</a> · MIT</sub>
</div>
