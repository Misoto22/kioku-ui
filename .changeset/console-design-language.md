---
'@misoto22/kioku-ui': minor
---

Bring every component back to one design language.

The library grew from 27 components to 111 in a few weeks, and the newer ones
were written to work rather than to look like they belong. The rules that make
something look like it belongs are now written down in `docs/design-language.md`
and applied across the set.

What changes visually:

- **Selection is a mark, not a fill.** A current nav item, selected tab, pressed
  toggle button, chosen page, active tree row or checked option no longer paints
  a filled rectangle. It carries a 2px edge mark, `colorText` and
  `fontWeightMedium`. `SegmentedControl` keeps its raised option, because that
  control's metaphor is a physical switch.
- **Depth is a hairline.** Surfaces that stacked a border on an elevation now
  pick one. Toast, Dialog, Popover, Tooltip, the menus, `CodeBlock` and the
  cards were all drawing the same line twice.
- **Inputs sink and cards rise.** Text inputs, temporal inputs, file inputs,
  tokenizers and search frames sit on `colorSurfaceMuted` with a `borderStrong`
  edge; read-only is the state that reads as a plain sheet.
- **Type is tracked.** Every element that sets a size now sets the matching
  letter-spacing, and figures — timestamps, counts, keyboard hints, code — are
  set in the mono face with tabular numerals.
- **Card padding drops a step** to the 14px the console uses, and `CardHeader`
  and `CardFooter` bleed calculations follow it.
- **`Toggle`'s track is squared** to `radiusElement`; the knob stays round.
- **`Slider` paints its own track and thumb** rather than relying on
  `accent-color`, with the filled portion driven by an inline custom property so
  both engines agree.

One fix is not cosmetic: **portalled surfaces were rendering unthemed.** A theme
writes its custom properties onto its own element, and `Layer` portalled to
`document.body`, so every dialog, popover, tooltip, menu, sheet and toast
resolved every `var()` to nothing. `ThemeProvider` now publishes its root and
`Layer` portals into it, falling back to the body when there is no provider.
