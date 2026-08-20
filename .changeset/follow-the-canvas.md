---
'@misoto22/kioku-ui': minor
'@misoto22/kioku-ui-theme-kioku': patch
---

Make the components match the design they were drawn from, and add the three
pages that design actually shows.

The library was checked against the console canvas component by component, not
by name. Four places where the canvas was right and the code was not:

**`SegmentedControl` goes back to the design the canvas drew** — the groove is
cut into the paper and the option in force is the block that has floated back
up to the surface. It had been changed to an ink rail because the raised rank
measured **1.03:1** against its own groove in every dark skin. That was the
palette inverting, not the design failing: `surfaceRaised` had been set _below_
`surfaceMuted` in washi, muji and sumi, so the rank that floats was darker than
the well it floats out of. The dark values are lifted to 1.21–1.23 against the
well — a little above the 1.17 the light skins carry, because the same ratio
reads weaker at the dark end of the curve. Nine floating surfaces get the
correction with it.

**`MetricGrid`'s headline figure takes the display face**, not mono, at 1.15
leading and no added weight. One number on its own card has nothing beneath it
to line up with, so mono buys nothing and costs the page its voice; `600` does
not appear anywhere in the canvas.

**Chinese gets its own tracking** — body `0.03em`, eyebrow `0.14em`. A han
character is a square that already fills its em; set solid, a run of them
closes into a grey block with no spaces and no ascenders for the eye to catch.

**`StatusDot` gains `neutral`**, the only hollow tone: the four status tones
each say a thing has happened, and the canvas needed one that says nothing has
happened yet — queued, idle, not run.

Two places where the canvas was worse and the code stands: its warning ink
(`#96700f`) measures **4.09:1** on paper and fails AA, where the shipped
`#87650e` measures 4.85; and its 10px key caps sit below the type scale.

Three new page templates, drawn from the same canvas: **`console-home`** (a
grouped rail, a hanging chapter head, three figures, a feed, and a queue),
**`records-table`** (a query that shows the filters already applied, a period
switch, paging) and **`appearance-settings`** (two blocks that behave
differently — one applies as it changes and says so, the other is a form).
