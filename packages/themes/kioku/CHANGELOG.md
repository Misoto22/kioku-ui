# @misoto22/kioku-ui-theme-kioku

## 1.0.0

### Minor Changes

- 1299b35: Add the Kasumi skin, a frosted theme that blurs whatever the host drew behind
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

### Patch Changes

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

- 4cf990d: Contain the frosted skin's blur inside its own root, and give Chinese its own
  leading.

  `[data-theme='kasumi']::before` carries the frost as `position: absolute;
inset: 0`, and the root it belongs to set `isolation: isolate` but no
  containing block. Isolation governs paint order, not geometry — so the frost
  resolved its inset against whatever positioned ancestor happened to be above
  it, escaped the skin, and blurred everything up to that ancestor. A page
  showing several skins at once stacked one `saturate(180%)` per swatch until the
  whole document went yellow. The root is `position: relative` now, which is safe
  where `transform` and `filter` are not: it does not become the containing block
  for a fixed descendant.

  The `:lang(zh)` block also sets `--kioku-theme-line-height-body: 1.8`. Leading
  is a property of the writing system, like the font stack that already lives
  there: CJK glyphs are dense and square and need more room between lines than
  Latin does.

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

- Updated dependencies [c05a2dc]
- Updated dependencies [3c0b10e]
- Updated dependencies [c9b4452]
- Updated dependencies [da4338b]
- Updated dependencies [da4338b]
- Updated dependencies [3c0b10e]
- Updated dependencies [103ff86]
- Updated dependencies [da4338b]
- Updated dependencies [4cf990d]
- Updated dependencies [bbd225e]
- Updated dependencies [da4338b]
- Updated dependencies [08a54fa]
- Updated dependencies [da4338b]
- Updated dependencies [8c91832]
  - @misoto22/kioku-ui@0.2.0

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
