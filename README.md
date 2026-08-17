# Kioku UI

Kioku UI is a public, product-neutral React design system. It provides accessible
foundations, core components, patterns, templates, themes, and tooling without
including Kioku Console routes, APIs, data, or business logic.

Published packages use the `@misoto22/kioku-ui*` namespace. Once the initial
packages are released, install the core and Kioku theme pack with:

```sh
pnpm add @misoto22/kioku-ui @misoto22/kioku-ui-theme-kioku
```

The repository requires Node.js 24 or newer and pnpm 11.10.0.

## Development

```sh
pnpm install
pnpm check
```

This repository uses Changesets for versioning. Publishing is intentionally not
part of the initial workspace baseline.
