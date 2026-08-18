---
'@misoto22/kioku-ui': minor
'@misoto22/kioku-ui-theme-kioku': minor
---

Give the Washi, Muji, and Sumi skins Kioku Console's own palette, geometry,
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
