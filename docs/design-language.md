# The design language

This document is the law a component is judged against. It exists because the
library grew from 27 components to 111 in a few weeks, and the newer ones were
written to work rather than to look like they belong. "Looks like it belongs"
turns out to be a small number of decisions repeated without exception, so they
are written down here rather than re-derived per component.

Two sources feed it. The **Kioku Console** is the product this system was cut
from; its stylesheet is 4,300 lines of deliberate choices, and where this
document gives a number, that is where the number is from. The **27 components
on `origin/main`** are the reference implementations; where this document
describes a pattern, one of them already does it.

---

## Part 1 — The look

### 1. Every corner is 3px

`radiusInner`, `radiusElement`, `radiusContainer` and `radiusPage` all resolve
to 3px in the kioku pack. They are four names for one value because the _role_
matters for a future theme, not because they differ today. Pick by role:
`radiusInner` for a child nested inside a padded parent, `radiusElement` for a
control, `radiusContainer` for a card, `radiusPage` for a full-page surface.

`radiusFull` is only for shapes that are genuinely circular or capsule by
nature: avatars, status dots, a toggle's knob, a progress track. A tab, a chip,
a filter, a segmented option and a menu item are **not** capsules. If a
component reads as a pill and is not a dot or a knob, it is wrong.

### 2. Depth is a hairline, not a shadow

`elevationLow|Medium|High` are ring shadows — `0 0 0 1px <border>`, plus a
**hard** offset line that grows by one step per rank: none, `0 1px 0`,
`0 2px 0`. Every one of them has a zero blur radius. Nothing in this system
blurs. (霞, the glass skin, is the single documented exception and says so in
its own block: glass needs the lift, and it spends a real drop shadow on
`high` only.)

- A card is `colorSurface` + `elevationLow` and **no border**. Elevation and
  border are mutually exclusive; stacking them draws the line twice.
- A floating surface (popover, menu, dialog, toast, tooltip) gets
  `elevationMedium` or `elevationHigh` and, again, no border.
- A control's own edge is a real `border`, not a shadow.

### 3. Cards rise, inputs sink

The surface ladder is `colorCanvas` (the page) → `colorSurface` (a card) →
`colorSurfaceMuted` (an input fill, a track, a well). It is a
ladder of **relationships**, not of values: paper is always a step brighter
than the page it lies on and a well is always a step deeper than the paper —
in dark skins as much as in light ones. Reach for `canvas` because it happens
to be darker than `surface` today and the dark skins will hand back a slab:
there, `canvas` is the deepest step of all. A component that paints an input
the same colour as the card it sits on has flattened the ladder.

A table header is **not** on this list, though it reads like it belongs there.
`Table` sets its header row as an eyebrow — smallest size, opened right up, one
rank of ink below the rows it names — and lets the rule beneath it do the
separating, drawn in the strong border while the row rules stay in the default
one. A filled strip would say the header is a surface the data sits on. It is a
legend beside the data, and the rule is what parts them.

### 4. The primary action is ink, not brand

`Button variant="primary"` is `colorAccent`/`colorTextOnAccent` in the contract,
and the kioku pack resolves accent to ink for exactly this reason: the emphatic
button is a seal pressed on paper. Never fill a large area with the accent to
create emphasis. The accent's other jobs are the focus ring, the selected mark,
and a link on hover — all of them thin.

### 5. Selection is a mark, never a fill

This is the rule most often broken. A selected tab, nav item, segmented option,
filter or list row is indicated by:

- a 2px accent bar at the edge (`inset 2px 0` / `inset 0 -2px`), or
- a 2px underline in `colorText` for the primary rank, 1px for a subordinate
  rank, or
- `colorText` instead of `colorTextSecondary`, plus `fontWeightMedium`.

Not by a filled rectangle, not by a coloured pill, not by a grey background.

Pick the lightest of the three that still reads, and in a **navigation rail
pick the last one without the weight** — ink alone. A rail is a short column of
short words: a stroke beside one of them reads as a second divider, and bolding
the row the reader is already on makes it the heaviest thing on the page. That
is why `NavItem` draws no bar and adds no weight; `aria-current` carries the
fact for anyone who cannot see the ink. Keep the bar for a mark that has to
survive beside longer content — a menu row, a selected table row.

`SegmentedControl` is the one documented exception to the no-fill rule: its
selected option gets `colorSurfaceRaised` + `elevationLow`, because the
control's whole metaphor is a groove cut in the paper and the option in force
is the block that has floated back up to the surface.

The exception is only sound while the ladder holds. It was briefly removed
after the selected option measured **1.03:1** against its own groove in every
dark skin — but the fault was the palette, not the design: `surfaceRaised` had
been set BELOW `surfaceMuted` in all three dark skins, so the rank that floats
was darker than the well it floats out of. Read §3 again: the ladder is a
ladder of relationships. Fixing the values restored the exception.

### 6. Tracking runs inverse to size

Six tokens, chosen by the role the type plays:

| token                  | value   | used for                                                  |
| ---------------------- | ------- | --------------------------------------------------------- |
| `letterSpacingTitle`   | 0.01em  | page titles, large figures (`fontSizeXl`, `fontSize2xl`)  |
| `letterSpacingHeading` | 0.02em  | section and card titles (`fontSizeLg`)                    |
| `letterSpacingBody`    | 0       | running copy — set solid                                  |
| `letterSpacingLabel`   | 0.04em  | control labels, button text, display names (`fontSizeSm`) |
| `letterSpacingEyebrow` | 0.1em   | table headers, eyebrows, captions, badges (`fontSizeXs`)  |
| `letterSpacingMono`    | -0.01em | monospaced figures — the one role that tightens           |

**Any element that sets `fontSize` must set the matching `letterSpacing`.**
`fontSizeXs` without `letterSpacingEyebrow` is the single fastest way to look
foreign here, because the display face closes up at 11px.

### 7. There is no pressed state, and hover is a wash

Hover swaps the background to `colorOverlayHover` (or darkens a border to
`borderInteractive`). It never grows, blurs, lifts, or translates. Over a
coloured fill, hover and active are applied as a
`linear-gradient(overlay, overlay)` `backgroundImage` layer so the underlying
hue survives.

`:active` exists only where a control genuinely depresses — buttons and toggles.
Do not invent one for rows, cards, tabs or links.

### 8. Focus is declared once per focusable element, identically

```ts
':focus-visible': {
  outlineColor: semanticTokens.colorFocus,
  outlineOffset: semanticTokens.focusOffset,
  outlineStyle: semanticTokens.borderStyle,
  outlineWidth: semanticTokens.focusWidth,
},
```

All four properties, `outlineStyle` included as a token. Never a custom ring,
never a `boxShadow` focus, never an offset picked by hand.

### 9. Motion names its properties and has two speeds

`durationFast` (120ms) for colour, background and box-shadow. `durationModerate`
(220ms) for transform and size. `easingStandard` for interaction,
`easingEmphasized` for entrances. Written as three longhands:

```ts
transitionDuration: semanticTokens.durationFast,
transitionProperty: 'background-color, border-color',
transitionTimingFunction: semanticTokens.easingStandard,
```

`transition: all` appears zero times in the console and must appear zero times
here. Any keyframe animation carries
`'@media (prefers-reduced-motion: reduce)': 'none'` inside `animationName`.

### 10. Rhythm comes from the spacing scale, never from a number

Card padding is `spacingLg`. Row padding is `spacingMd` block / `spacingLg`
inline. Fields sit `spacingMd` apart, label to control is `spacingXs`. Sections
are `spacingXl` apart. A dimension the scale cannot express is a named module
constant built with `calc()` over spacing tokens — never a literal.

---

## Part 2 — The checklist

Each item is yes/no and each has a reference implementation. A component is done
when every applicable item is yes.

### Tokens

1. Exactly one style import: `{semanticTokens} from '../authoring.stylex.js'`.
   No palette, no sibling `styles`, no CSS import.
2. Zero hex, `rgb()`, `hsl()` or named colours. Only `'transparent'` is allowed.
3. Zero bare `px`/`rem`/`em`. A missing dimension is a named `calc()` over
   spacing tokens. (`EmptyState.tsx:6`, `MetricGrid.tsx:6`)
4. Borders as three token longhands — `borderColor`, `borderStyle:
semanticTokens.borderStyle`, `borderWidth: semanticTokens.borderWidth`. No
   shorthand, no `'solid'` literal. (`Card.tsx:14-17`)
5. Radius picked by nesting role; `radiusFull` only for circles and knobs.
6. Colour picked by role in the stack, not by contrast hunting.
7. Status colours used only as matched `status*Surface` + `status*Text` pairs; a
   status component never reaches for `colorAccent`. (`Alert.tsx:20-39`)
8. Elevation and border are mutually exclusive. (`Card.tsx:19-26`)
9. Hover/press over a coloured background is a `linear-gradient(overlay,
overlay)` `backgroundImage`, not a `backgroundColor` swap.
   (`Button.tsx:89-94`)
10. Every `fontSize` is accompanied by its `letterSpacing` and, for body copy,
    `lineHeightBody`.

### States

11. Every focusable element renders the four-property `:focus-visible` block.
12. `:hover` is guarded: minimum `:not(:disabled)`; add `:not(:active)` when an
    active style exists; add `:not(:read-only):not(:focus-visible)` for inputs.
13. `:active` is guarded with `:not(:disabled)` and exists only where the
    control depresses.
14. `:disabled` paints surface + border + text, and is enforced in behaviour,
    not just painted. (`Button.tsx:21-25` and `:158`)
15. Selected/checked is a **ternary between two exclusive style objects**, with
    hover and active living only on the unselected one — never
    `isSelected && styles.selected` stacked on a hoverable base.
    (`SegmentedControl.tsx:226-229`)
16. Invalid is a separate object that re-declares every state it must beat
    (focus-visible, hover, active) and applies only when not disabled.
    (`TextInput.tsx:46-55`)
17. Read-only is styled distinctly from disabled.
18. Transitions are three longhands with token duration and easing.
19. Keyframes carry the reduced-motion guard inside `animationName`.

### Structure

20. `stylex.create` is called once at module scope, assigned to `styles`. Never
    inside the component.
21. Style keys are named after public prop values so `styles[variant]` works;
    where the value is not an identifier, a module-const lookup map with
    `satisfies` bridges it. (`Grid.tsx:29-43`)
22. Props type is `extends Omit<XHTMLAttributes<E>, 'className' | …>` and also
    omits every attribute the component owns (`role`, `aria-label`, `title`,
    `onChange`, `value`, `defaultValue`).
23. Every own prop is `readonly`.
24. No `forwardRef`, no `className` prop, no `style` prop, no merge helper.
25. JSX order: `{...props}` first, then attributes alphabetically with
    `{...stylex.props(…)}` sorted as the word "stylex", any hard-coded `type`
    last. Caller props must never be able to overwrite library styling.
26. `stylex.props` arguments run base → size → variant/tone → conditionals.
27. Defaults live in the destructuring signature.
28. Controlled/uncontrolled is a discriminated union of two prop types.
29. Requirements TypeScript cannot express throw at runtime with a plain-English
    message. (`SegmentedControl.tsx:111-113`)
30. Exported types carry a one-sentence doc comment; internals are
    `/** @internal */`.

### Semantics

31. The real element for the job — `<article>`, `<caption>`, `<dl>`, `<hr>`,
    `<header>`, `<nav>`, `h${level}` — not a div with a role.
32. Decorative sub-elements carry `aria-hidden="true"`.
33. Live regions pair `role` and `aria-live` by tone: danger →
    `alert`/`assertive`, otherwise `status`/`polite`.
34. A compact or icon-only control reaches the 44px target through a `::before`
    pseudo-element, not by growing the visual box. (`Button.tsx:101-111`)
35. Composite widgets implement roving tabindex plus Arrow/Home/End,
    orientation-aware.
36. Sibling components are wired by React context, not prop drilling.
37. Caller `aria-describedby`/`aria-invalid` are merged with context values, not
    overwritten.
38. `aria-controls` is emitted only when the referenced element is in the DOM.

### Composition

39. It does not re-implement Stack / Grid / Center / Section. A bespoke grid must
    do something the primitives cannot.
40. Padding is owned by the container; a child that bleeds to the edge negates
    the container's padding token exactly with `calc(-1 * token)`.
    (`CardHeader.tsx:11-15`)
41. Never an outer margin for sibling separation — gap only. Margin appears as a
    `0` reset or a bleed calc.
42. Shared vocabulary (`Space`, `StatusTone`, `ControlSize`) is imported as a
    type, not redeclared.
43. Every text-bearing element declares `fontFamily` explicitly. Nothing relies
    on inheritance except `fontFeatureSettings`, which the theme root sets once.

---

## Part 3 — House constraints

These are enforced by `pnpm check` and will fail the build:

- **StyleX selectors are allowlisted.** `internal/stylex-capabilities` rejects
  anything outside the set — notably `:has()` is not available. Drive state from
  React, not from a parent selector.
- **Stories follow a policy.** `internal/vibe-tests` requires the title to be
  `Core/<Name>`, requires the `Default` story to apply its own args, and
  requires a fixed set of story names per component.
- **Every component has four files**: `X.tsx`, `X.doc.ts`, `X.test.tsx`,
  `index.ts`. The doc is `satisfies ComponentDoc` with all six fields.
- **Accessibility is baselined.** `pnpm a11y:audit` scans every story across
  every theme the pack ships and both modes against `.github/a11y-baseline.json`, which
  currently records **zero** violations. A change that introduces one fails CI;
  fix the component rather than re-recording.

---

## Part 4 — Finish

Part 1 says what the system looks like. This part says what separates a
component that follows those rules from one that looks finished. Every item was
read off the console's own screens, and each is a thing a fast implementation
gets wrong while still passing every rule above.

44. **Figures are set in the mono face with `tabular-nums`.** Counts, metrics,
    dates, durations, page numbers, keyboard hints, percentages. A column of
    numbers that does not line up is the fastest way to look unfinished.
45. **A tiled set draws its rules with the gap, not with a border per cell.**
    `gap: 1px` over a `borderDefault` background, cells opaque, `overflow:
hidden` on the container. Bordering every cell doubles every interior line.
46. **A micro-control is a solid block, not a tiny outlined box.** A 14px switch
    track with a border reads as a field that failed to grow. Below about 20px,
    drop the border and carry the state in the fill.
47. **Proportions are relationships, not literals.** A knob is the track height
    less its inset on both sides; travel is the track width less its height.
    Write them as `calc()` over tokens so the control survives a density change.
48. **Three ranks of ink do the work colour would.** `colorText` for what is
    current, `colorTextSecondary` for what is available, `colorTextMuted` for
    what is context. Reaching for a fill usually means the ranks were not used.

    The third rank is for static copy only. A row that responds to the pointer
    is read against the hover wash rather than the bare surface, and on that
    composite `colorTextMuted` measures 3.81:1 in every dark theme. The value
    that would clear 4.5:1 there sits at 97-105% of `colorTextSecondary` — not
    a third rank at all. So an interactive row has two ink ranks, and its
    secondary line separates from the first by size.

49. **A specimen has a plate.** Anything that presents a set — states in a
    story, tokens in a table, options in a picker — sits on a surface with an
    edge. Content floating on the canvas reads as unplaced, not as spacious.
50. **The eyebrow is the label of last resort.** `fontSizeXs`,
    `letterSpacingEyebrow`, `colorTextSecondary`, heading face. It names a thing
    without competing with it, and it is how every small label in the console is
    set.
