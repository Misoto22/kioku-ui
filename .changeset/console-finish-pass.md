---
'@misoto22/kioku-ui': minor
---

Finish every component to the console's own execution.

The previous pass applied the design language; this one applies the details
that separate a component following those rules from one that looks finished.
They are written down as Part 4 of `docs/design-language.md` and were read off
the console's own screens.

- **Figures are set in the mono face with tabular numerals** — table cells
  (through a new `numeric` prop on `TableCell`/`TableHeaderCell`), metric
  values, page numbers, counts, timestamps, calendar days, shortcut hints. A
  count no longer changes width between 9 and 10.
- **Tiled sets draw their rules with the gap** — `MetricGrid`, the calendar
  grid, nav runs and toolbars put a hairline behind opaque tiles instead of
  bordering every cell and doubling every interior line.
- **Micro-controls are solid blocks** — `Switch`, `Toggle` and `Kbd` dropped
  the hairline that made a 14px control read as a field that failed to grow.
  Their proportions are now `calc()` relationships over tokens, so a knob
  stays centred and its travel stays exact when density moves them.
- **Three ranks of ink replace fills** — `Button` ghost, `SegmentedControl`,
  nav rows, list rows, menu items and `TabList` separate by rank rather than
  by adding a background.
- **Small labels are eyebrows** — table headers, field annotations, affixes,
  sidebar headings, calendar weekdays, metric labels.
- **`TableRow` gains `selected`**, drawn as a rule down the row's leading edge
  with `aria-selected` alongside it.
- **`HoverCard` gains a required `label`.** Its content is interactive, so it
  is announced as a dialog, and a dialog with no name is one assistive
  technology can enter but not describe.

Four defects fixed along the way: a modal scrim that **lightened** the page in
dark mode rather than dimming it (the contract gains `color.scrim`); a hover
wash that discarded a card's own background and showed the canvas through it;
`Item` pinning the first ink rank so a disabled menu row painted at full
strength; and three contrast failures in the sumi theme.
