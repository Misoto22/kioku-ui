# Kioku UI

Kioku UI is a public, product-neutral React design system. It provides accessible
foundations, core components, patterns, templates, themes, and tooling without
including Kioku Console routes, APIs, data, or business logic.

Published packages use the `@misoto22/kioku-ui*` namespace:

- `@misoto22/kioku-ui` — compiled React components, CSS, and opt-in source
  authoring entries
- `@misoto22/kioku-ui-theme-kioku` — Washi, Muji, and Sumi theme definitions
  and CSS
- `@misoto22/kioku-ui-build` — optional Vite, Babel, and PostCSS integrations
  for source consumers

Install the compiled core and Kioku theme pack with:

```sh
pnpm add @misoto22/kioku-ui @misoto22/kioku-ui-theme-kioku
```

```tsx
import {Button} from '@misoto22/kioku-ui';
import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
import {kiokuThemes, washiTheme} from '@misoto22/kioku-ui-theme-kioku';
import '@misoto22/kioku-ui-theme-kioku/theme.css';
```

Compiled consumers do not configure StyleX. Source consumers install
`@misoto22/kioku-ui-build`, import the public `/source` and
`/authoring.stylex` entries, and omit the compiled `styles.css` bundle; see the
[build package guide](packages/build/README.md).

The repository requires Node.js 24 or newer and pnpm 11.10.0.

## Development

```sh
pnpm install
pnpm check
pnpm pack:smoke
```

Every public-package change requires a Changeset. The protected required check
`Changeset Policy / changeset-policy` runs from the default branch with
read-only permissions and inspects PR file metadata without executing PR code;
ordinary CI repeats the base-branch Changesets comparison as defense in depth.
`pnpm pack:smoke` builds and packs every public package from a fresh temporary
workspace, inspects the tarballs, and builds separately installed compiled and
source-authoring Vite consumers. The source consumer runs strict TypeScript
resolution before its Vite build.

Publishing is restricted to the protected-main Changesets workflow using npm
trusted publishing and OIDC provenance. No repository `NPM_TOKEN` is used. The
[release runbook](docs/operations/release.md) distinguishes repository policy
from the GitHub and npm settings a release authority must configure externally.
