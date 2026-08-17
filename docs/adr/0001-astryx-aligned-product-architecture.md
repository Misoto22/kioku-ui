# Align Kioku UI with the Astryx product architecture

Kioku UI will be a public pnpm monorepo whose published core, CLI, build, theme, experimental, chart, and Vega packages; documentation, examples, Storybook, sandbox, and internal quality tools follow Astryx's product shape. This is an independently implemented system under the `@misoto22/kioku-ui*` namespace, not a fork or an API-compatibility promise; matching the architecture gives consumers the same complete workflow without importing Kioku Console domain logic.

The repository and its public packages use the MIT License. Public package names
remain within the `@misoto22` namespace so consumers can identify this project
without implying an affiliation with Astryx.
