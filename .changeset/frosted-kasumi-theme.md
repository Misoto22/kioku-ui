---
'@misoto22/kioku-ui-theme-kioku': minor
---

Add the Kasumi skin, a frosted theme that blurs whatever the host drew behind
the application while type keeps its contrast.

The tint goes to an extreme — near-white in light, near-black in dark — because
a mid-tone film greys out the backdrop instead of reading as glass; solving
Radix Themes' alpha equation and copying Apple's navigation glass give the same
answer. The blur lives on `[data-theme='kasumi']::before` rather than the root,
since `backdrop-filter` on the root would make it the containing block for every
`position: fixed` descendant, and a pseudo-element has no descendants to
capture. Saturation is lifted to 180%, as macOS vibrancy does.

`color.canvas` and `color.surfaceMuted` follow a single lever,
`--kioku-theme-kasumi-frost-keep` (100% opaque, 0% bare backdrop, shipping at
64%). Raised surfaces clamp to `max(84%, keep)`, which is where muted text still
holds AA over a backdrop of pure black or pure white. Borders are drawn with
alpha so a thinned card reads as a pane rather than a flat box, and never thin
with the lever. See the README for the backdrop layer, the stacking-context
consequence, and the reduced-transparency override.
