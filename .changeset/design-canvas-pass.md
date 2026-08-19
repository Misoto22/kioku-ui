---
'@misoto22/kioku-ui': minor
---

Implement the design canvas.

Twelve artboards were drawn for this library in Claude Design — app shell,
settings form, data table, command palette, calendar, menus, dialog and
drawer, tabs and segmented, toast and banner, tree, chat transcript, empty and
skeleton — and every component named by one now renders the way it is drawn.

The canvas overruled six things this library had been doing:

- **The primary button is ink, not brand.** Its annotation calls the emphatic
  button a 落款, a seal: ink ground, paper letters. It had been filled with the
  accent, which is also why its hover did nothing — a translucent accent wash
  over an accent fill is invisible. `Switch`, `Toggle` and `ProgressBar` move
  with it, and the compiled-CSS test now forbids an accent fill on primary.
- **The chat has no rain of bubbles.** The assistant's turn is set bare on the
  paper; only the reader's own words sit on a slip closed with a hairline.
- **The calendar is not a grid.** Days are mono figures on bare paper with no
  rules between them, today is an accent dot, and the chosen day is ink.
- **Skeletons do not pulse.** The artboard annotates them 静止，不闪不游.
- **The masthead and the rail are the same sheet as the page**, separated by a
  rule rather than raised as panels.
- **Form labels are eyebrows** — 11px opened to 0.1em above the value, not
  12.5px medium ink beside it.

Also from the canvas: menu rows rest in the second ink rank and rise to the
first under the pointer, carrying a two-pixel bookmark at the leading edge;
table headers sit one spacing step tighter than their rows; the current page
in a pagination is a one-pixel underline, a rank below a selected tab's two.

One limit is now written into the law with the numbers behind it: **an
interactive row has two ink ranks, not three.** A row that answers the pointer
is read against the hover wash, where `colorTextMuted` measures 3.81:1 in every
dark theme, and the value that would clear 4.5:1 there sits level with
`colorTextSecondary`. Rows separate their secondary line by size instead.
