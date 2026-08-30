# @misoto22/kioku-ui

## 0.2.0

### Minor Changes

- 3c0b10e: Grow the component library to 126 components and fix three accessibility defects

  Adds the layout primitives, overlay stack, navigation and shell, form controls,
  content components, and chat surfaces needed to cover the reference system's
  catalogue, plus a public hooks layer (`useFocusTrap`, `useListFocus`,
  `useHotkeys`, `useAnchoredPosition`, and others), an `InternationalizationProvider`
  that every built-in string now resolves through, and a shared `utils` layer.

  Three defects found while building against the library:

  - `AppShell`'s skip link pointed at the layout frame instead of the `main`
    element, so activating it still landed the reader above the banner. `Layout`
    gained `mainId`, which lands on `main` itself.
  - `Overlay`'s focus trap never armed. The trapped surface is portalled, so it
    mounts after the effect runs and the ref still read `null`; `useFocusTrap` now
    takes an element. Every modal surface — `Dialog`, `AlertDialog`, `BottomSheet`,
    `CommandPalette`, `Lightbox` — was affected.
  - `Link` carried no styling at all, so `Breadcrumbs`, `Citation`, and `Markdown`
    fell back to the browser's default anchor colour.

  `Layout` and `AppShell` also gained `contentPadding` for hosts that supply their
  own container.

  The theme pack documents the font families it names but does not ship, including
  the weight its `strong` role resolves to.

- c9b4452: Repair the sixteen shoddy findings in `Chat` and `Table`.

  **The bubble measured the wrong thing.** `calc(20 * spacing2xl)` is 560px at the
  compact density and 760px at the standard one, while the type inside it stays
  at 13.5px either way — so the reader who asked for more air got a _longer line_.
  Where a line stops is a fact about the type, so the measure is now built from
  `fontSizeMd` and holds at both densities.

  **Two of `ChatToolCalls`' three statuses never reached the page.** The type says
  `'done' | 'failed' | 'running'` and the file had one branch, on `running`; a
  failed call looked exactly like a successful one. The dot was inside that branch
  too, so running rows started 12px further in than their neighbours and the
  register had a ragged edge. The mark slot is now always present — alignment
  holds — and only the two statuses that want attention draw into it: a hollow
  ring for running, a filled danger dot for failed. The outcome text no longer
  prints the raw enum value, which put the English words "running" and "failed"
  into a transcript in any language; three messages carry them now.

  **`ChatComposer` held a private copy of `TextArea`** that had drifted a step of
  padding, a min-height of one control rather than four lines, and none of the
  active, read-only or invalid states. It uses the real one.

  **`ChatSystemMessage` and `ChatMessage author="system"` were two renderings of
  one note**, already drifted: the first had no bubble box, so a system note sat
  on a different rhythm from every other row. The first delegates to the second.

  **`ChatMessageMetadata` typed its separator into a text node** — `${label}: ` —
  which no translation can move, and declared its own copies of the `Eyebrow` and
  `Numeral` recipes. It is a `dl`/`dt`/`dd` now, set with those two components.

  Also: `ChatLayout` fills the height it is given rather than needing a sized box
  around it; an empty transcript says so; the reader's author eyebrow stands on
  the same edge as the words beneath it; and the running dot is drawn with a
  border rather than the only raw `box-shadow` string in the package that was
  neither an elevation nor a selection mark.

  **`Table`** takes the system's own leading — nothing above it set a
  `line-height` to inherit, while `List` and `Item` beside it did — and its
  numeric cells stop being a rank smaller than the words they sit with, matching
  `Numeral`, which declares no size of its own. Its `selected` mark, implemented
  and documented but never once demonstrated, now appears in the story.

  Four new message keys — `chatToolCallDone`, `chatToolCallFailed`,
  `chatToolCallRunning`, `chatTranscriptEmpty`. A host that supplies its own
  `Messages` must add them; that is the contract working as designed.

- da4338b: Bring every component back to one design language.

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

- da4338b: Finish every component to the console's own execution.

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

- 3c0b10e: Add six letter-spacing tokens to the type contract.

  Tracking is not decoration in this system: the console it comes from opens
  small type up and closes mono in, and the amount is a function of the role,
  not of the component. A theme had no way to say that, so every component was
  setting type at whatever tracking the font shipped with — which for Mincho at
  11px is a smudge.

  `letterSpacingTitle` (page titles and figures), `letterSpacingHeading`
  (section titles), `letterSpacingBody` (running copy, set solid),
  `letterSpacingLabel` (control labels and display names), `letterSpacingEyebrow`
  (table headers, eyebrows, captions) and `letterSpacingMono` (the one role that
  tightens). Themes now fulfil 78 roles rather than 72; a pack that does not
  supply them is rejected as incomplete, so bump any custom pack alongside this.

- 103ff86: Take back two more controls the browser was drawing, and stop two wells
  clipping their own focus ring.

  `RadioList` still contributed `accent-color` and took the white fill, the grey
  edge and every disabled tone from the engine — the same defect `CheckboxInput`
  carried, left behind when that one was fixed. `Selector` still wore whichever
  arrow the platform draws, a blue chevron on one and a grey triangle on another,
  in the corner of a field drawn to the hairline everywhere else. Both draw their
  own now, and both stay real controls: the click target, the group behaviour,
  the arrow keys, the form value and the accessibility tree are untouched.

  `Tokenizer` and `PowerSearch` drew their focus ring on the field inside the
  well. The ring stands 4px out — 2px of offset plus 2px of stroke — and the well
  spends 3px of padding, so the well clipped a quarter of its own ring. It moves
  to the well, on `:focus-within`, which is where the border already changed.
  `Tokenizer` also stops being 34px tall when empty in a row of 28px controls: it
  was spending a step of block padding inside a well that already spent one.

  `Eyebrow` pins its weight. Left open it took the weight of whatever it was
  dropped into, and every hand-rolled copy of the recipe pinned one — `Field` at
  medium, `Table` and `MetadataList` at regular, disagreeing with each other. It
  is regular: at 11px the tracking is what does the work, and weight on top of it
  makes a second heading out of a quiet label.

  `TextInput` and `TextArea` take the transition trio every other well declares,
  so an edge that changes on hover or focus moves rather than snaps. `TextArea`
  resizes vertically only — the UA default let a reader drag the field wider than
  the column it sits in and take the form's layout with it.

- da4338b: Implement the design canvas.

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

- 4cf990d: Take back the five controls the browser was drawing, and add `DatePicker`.

  `CheckboxInput` contributed one declaration — `accent-color` — and the engine
  supplied the white fill, the `#767676` edge, the radius, the check glyph and
  every disabled grey. `NumberInput` grew Chrome's grey arrows in the corner of a
  well this system had drawn to the hairline. `PowerSearch` carried WebKit's
  cancel cross one line above filters it drew itself. The temporal inputs set
  their separators at the weight of the data, showed an empty control in the same
  ink as an answered one, and opened a blue calendar glyph.

  All five draw their own now. Anything growing inside a well — a stepper, a
  calendar control, a clear — is a cell in that well parted by the same hairline
  that parts everything else here, never a button floating on top of it.

  The fields stay native: `type="date"` hands a page arrow-key editing per field,
  the platform wheel on a phone, the reader's own regional order and the whole
  accessibility tree, and replacing the input means paying for all four in code.
  What no engine gives is a picker that knows where the other end of a range is,
  so **`DatePicker`** puts `Calendar` inside `Popover`, and `DateRangeInput` uses
  two of them with each bound passed to the other as `min` and `max`.

  `elevationHigh` loses its blur in the three flat skins — its five consumers are
  all scrimmed modals, so the blur was doing no work — and `SegmentedControl`
  marks its current option with an ink rail rather than a raised fill that
  measured 1.03:1 against its own groove in every dark skin.

  Also repaired: `Indicator`'s dot was 2px of colour inside a 2px ring; `Token`
  painted itself the colour of the well it sits in; `Table`'s header rule was
  gated on the switch that rules its body; `Layout`'s hanging numeral pushed the
  title 44px right instead of hanging left; `NavIcon` promised a fixed square and
  sized it from the type; `CheckboxInput` kept the UA's margins, so its declared
  6px gap was 9px; four list components inherited a legend a fieldset's `gap`
  never reaches; `AsyncState` had no styles at all; `ResizeHandle` offered a 6px
  grab area and lost its highlight on the first pixel of every drag; `Spinner`
  drove an endless rotation with an ease-out curve; and `FieldStatus` and `Field`
  drew one message two colours.

- bbd225e: Make the components match the design they were drawn from, and add the three
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

- 08a54fa: Draw the scrollbar, and take back the last two native controls.

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

- da4338b: Build the documentation site and the page templates from the design canvas,
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

### Patch Changes

- c05a2dc: Stop the row under a moving cursor from reflowing.

  `Typeahead`, `TypeaheadItem`, `TreeList`, `Outline` and `CommandPalette` all
  added `fontWeightMedium` to the active or selected row. Their labels are
  proportional type, so a heavier row is a **wider** row: every arrow-key press
  reflowed the line the cursor had just landed on. `NavItem` settled the same
  question the same way — ink alone is enough to find, and it leaves the column
  still.

  Weight remains a legal mark elsewhere (design-language §5 lists it as one of
  three). It is this case that it fails: a moving cursor over proportional text.
  Three other sites keep theirs, and the reasons are written down — `Calendar`
  and `Pagination` set their figures in mono with tabular numerals and a fixed
  cell, where weight cannot reflow anything, and `Breadcrumbs` marks a terminal
  crumb nobody arrows through.

  `CommandPalette`'s active row already carried a wash, full-strength ink and a
  2px accent bar; the weight was a fourth mark on top of three.

  `Outline` tiles its entries a hairline apart, the way `SideNav` and `NavMenu`
  do. At a full spacing step the rules beside each entry stopped being a
  continuous edge and became a dashed one.

- da4338b: Fix a data URI that painted every placeholder image black.

  The inline SVG shared by `Avatar`, `Thumbnail` and `Lightbox` escaped its `#`
  before handing the markup to `encodeURIComponent`, so the fill arrived as
  `%2523…`, which is not a colour. The media rendered as a black rectangle in
  every theme.

- 8c91832: Let `Tokenizer` read the whole field contract, not two lines of it.

  It took `controlId` and `describedBy` from the surrounding `Field` and stopped
  there, so a field marked required or invalid printed its message underneath a
  control that showed nothing: no `aria-invalid`, no `required`, and a frame that
  stayed at the resting edge. It also had exactly two style rules to its name,
  `frame` and `input`, which is why there was no invalid edge to show.

  It now reads `invalid` and `required` as every other well does, merges a
  caller's `aria-describedby` with the field's own rather than dropping one, and
  wears the danger edge when it is wrong.

  One behaviour changes with it: an `id` passed to `Tokenizer` now reaches the
  input, where a `<label for>` can find it, instead of landing on the wrapper.
  That is what `TextInput`, `NumberInput` and the temporal inputs already do.

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
