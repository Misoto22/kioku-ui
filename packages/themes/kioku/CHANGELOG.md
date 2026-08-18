# @misoto22/kioku-ui-theme-kioku

## 0.1.0

### Minor Changes

- 15b0882: Establish the initial public Kioku UI release with an Astryx-aligned semantic
  token contract, normalized components, the Washi, Muji, and Sumi themes, a
  comprehensive Storybook catalog, and supported compiled and source-authoring
  build integrations for Vite and Next.js.
- 8a9e636: Give the Washi, Muji, and Sumi skins Kioku Console's own palette, geometry,
  and type scale in place of a generic design-system default: warm paper rather
  than white, one 3px corner for every element including controls, a hairline
  rule where there had been a drop shadow, and the console's compact spacing.

  Two token roles arrive with them. `texture.grain` is the paper speckle's own
  colour, so a theme tints it or declines it by going transparent. Density is a
  root attribute a theme pack fulfills twice, letting a reader widen the rhythm
  without changing visual identity; `ThemeProvider` takes `defaultDensity` and
  `useTheme` reports it.

  A badge now cuts at `radius.element` rather than `radius.full`, which the
  contract reserves for circles, and a display heading declines font synthesis
  so a mincho is never faux-bolded.

- 5ecf3c5: Add `typography.fontFeatureSettings`, so a theme asks for the OpenType features
  the type it selects is cut for rather than leaving them to a rule in the reset.
  The Kioku skins ask for `'palt' 1`, the proportional spacing their Japanese
  faces expect; a theme set in Latin type says `normal`.

  It applies at the theme root and on `globalStyles.document`, so a host putting
  that on `<body>` gets the same result.
