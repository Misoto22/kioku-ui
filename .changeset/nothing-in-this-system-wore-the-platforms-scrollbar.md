---
'@misoto22/kioku-ui': minor
---

Draw the scrollbar, and take back the last two native controls.

The audit named one scrolling region — `Carousel`, which had budgeted 3px of
clearance against a 15–17px platform bar — but the finding's own evidence said
the real scope: _"no `scrollbarWidth`/`scrollbarColor` anywhere in the
package."_ A census found **eleven** scrolling regions across ten components,
every one of them wearing the platform's bar: a width, a colour and a radius
that belong to no skin here, running alongside hairlines drawn to the token.

`scrolling.region` is one shared internal style — `thin`, with the strong
border rank for the thumb and a transparent track — applied in `Typeahead`,
`Chat`, `CodeBlock`, `Lightbox`, `Carousel`, `Dialog`, `BottomSheet`,
`Resizable` (twice), `CommandPalette` and `MobileNav`. A region whose content
fits still shows nothing, because they are all `auto` rather than `scroll`.

`SelectableCard` held the third copy of the `accent-color` defect — the one
`CheckboxInput` and `RadioList` have already shed — and drew its box a step
smaller than `CheckboxInput` does, so two controls asking the same question in
one form came out two different sizes. `ComplexSelector`, a near-copy of
`Selector`, still wore the platform's dropdown arrow. Both draw their own now:
a round well with a filled centre for one-of-several, a square well with an ink
tick for any-of-several, and the same chevron `Selector` draws.
