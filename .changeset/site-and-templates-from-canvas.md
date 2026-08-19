---
'@misoto22/kioku-ui': minor
'@misoto22/kioku-ui-theme-kioku': patch
---

Build the documentation site and the page templates from the design canvas,
and close the last gaps in the component set.

Eleven more artboards were drawn — the site's five pages and the page
templates — and everything they name is now implemented. Along the way four
components were added and three defects were fixed that no test could have
caught, because each of them only appeared in a built page or a live one.

**Components.** `ResizeHandle` is the separator primitive `Resizable` used to
keep to itself; `Resizable` now composes it and its API is unchanged.
`BottomSheetSwitcher` is one sheet whose content swaps between named views
without closing. `Eyebrow` and `Numeral` close a gap two independent
implementers hit on the same day: fifteen files were spelling out the eyebrow
recipe by hand and eleven the mono figure. `Numeral` deliberately sets no font
size — a figure inside a metric is the metric's size and inside a table row is
the row's — so it changes the face, not the scale.

**`ThemeProvider` owns the colour mode.** It stamps `color-scheme` on the
element that carries the tokens, which is the only element where the themes'
`light-dark()` pairs can resolve. A host that set the scheme on a wrapper
_inside_ the provider — which is what the site did — changed nothing at all,
so the dark toggle was inert site-wide. `mode`, `setMode` and `defaultMode`
mirror the density axis, and `system` is a real third state that omits the
property and lets the reader's own setting decide.

**The theme declares its own `color-scheme`.** Without it a bundler that
lowers `light-dark()` for older targets emits no toggle definitions, because
an inline style on the host's root is invisible to it. The built site resolved
104 colour declarations to nothing while the dev server, which does not
minify, rendered correctly. A test now pins the declaration.

**`CodeBlock` gained a gutter and a `wrap` prop.** Its copy control floats over
the source, and with a symmetric padding a single long line — an install
command is always one long line — ran underneath it and read as truncated.
`wrap` is for the lines no column can hold: source that leaves the viewport is
source a reader copies wrongly.
