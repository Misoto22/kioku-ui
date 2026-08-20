# Kioku UI — audit backlog

Generated from the 202-finding audit of all 130 components. The 31 marked
`broken` are all fixed and merged. What remains is below.

**Do not trust the done/not-done marks blindly.** Four batches have shipped and
some findings were fixed as a side effect of sweeping for a pattern rather than
by being named. Re-check the current source before fixing anything here.

## shoddy — 120

### S1. SelectableCard

- file: `packages/core/src/SelectableCard/SelectableCard.tsx`
- evidence: SelectableCard.tsx:56 `blockSize: semanticTokens.spacingMd,` and :59 `marginBlockStart: semanticTokens.spacingXs,` versus CheckboxInput.tsx:20-21 `const boxSize = semanticTokens.spacingLg;` / `const boxFirstLineOffset = calc((fontSizeMd * lineHeightBody - boxSize) / 2)` — 10px vs 14px, 3px vs 5.94px

### S2. Collapsible

- file: `packages/core/src/Collapsible/Collapsible.tsx`
- evidence: Collapsible.tsx:36 `paddingInline: semanticTokens.spacingSm,` (6px) + 13.5px icon + :32 `gap: semanticTokens.spacingSm` = label at 25.5px; Collapsible.tsx:68 `paddingInlineStart: semanticTokens.spacingLg,` + 1px border = body at 15px

### S3. Carousel

- file: `packages/core/src/Carousel/Carousel.tsx`
- evidence: Carousel.tsx:102-118 and :119-135 — `<IconButton aria-label={…} onClick={…} size="sm" variant="secondary">` with no `disabled` prop, versus Pagination.tsx:195 `disabled={page <= 1}` / Pagination.tsx:239 `disabled={page >= pageCount}`

### S4. Collapsible

- file: `packages/core/src/Collapsible/Collapsible.tsx`
- evidence: Collapsible.tsx:9-12 `const reveal = stylex.keyframes({from: {gridTemplateRows: '0fr'}, to: {gridTemplateRows: '1fr'}})` opening only; Collapsible.tsx:154 `hidden={!isOpen}` closing instantly

### S5. SelectableCard

- file: `packages/core/src/SelectableCard/SelectableCard.tsx`
- evidence: SelectableCard.tsx:60-65 — the `:focus-visible` block sits inside `control:`, whose box is `spacingMd` (10px); `styles.label` (:17-33) declares no focus state at all, unlike ClickableCard.tsx:38-43

### S6. Carousel

- file: `packages/core/src/Carousel/Carousel.tsx`
- evidence: Carousel.tsx:18-19 `overflowX: 'auto',` / `paddingBlockEnd: semanticTokens.spacingXs,` — 3px against a 15-17px UA scrollbar, with no scrollbarWidth/scrollbarColor anywhere in the package

### S7. ChatMessage / bubble measure

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:17 `const bubbleMaxWidth = \`calc(20 * ${semanticTokens.spacing2xl})\`;` against theme.css:184 `--kioku-theme-spacing-2xl: 28px` / theme.css:196 (standard density) `38px`, with `--kioku-theme-font-size-md: 13.5px` unchanged in both.

### S8. ChatToolCalls (running indicator)

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:22-23 `const progressDotSize = \`calc(2 * ${spacingXs})\`` (6px) and `const progressDotRing = \`inset 0 0 0 ${borderWidth} ${colorTextMuted}\``; applied at Chat.tsx:174-181 with `backgroundColor: 'transparent'`. It is also the only raw `boxShadow` string in the package that is not an elevation or a selection mark (cf. TreeList.tsx:91, SelectableCard.tsx:45, Table.tsx:90).

### S9. ChatToolCalls (failed status)

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:330 `readonly status?: 'done' | 'failed' | 'running';` vs Chat.tsx:352 `{call.status === 'running' ? (…) : null}` — the sole status branch in the file.

### S10. ChatToolCalls (register alignment)

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:351-362 — the dot span is inside `call.status === 'running' ? … : null`, while `<span {...stylex.props(styles.toolCallOutcome)}>{call.detail ?? call.status ?? ''}</span>` is unguarded; `styles.toolCall` gap is `spacingSm` = 6px and `progressDotSize` = 6px.

### S11. ChatToolCalls (outcome text)

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:360 `{call.detail ?? call.status ?? ''}` against Chat.tsx:305/319 `const {messages} = useInternationalization();` … `messages.chatWaitingForReply`.

### S12. ChatMessageMetadata

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:460-469, notably `{`${entry.label}: `}` at :464; compare MetadataList.tsx:78-84, Eyebrow.tsx:11-16, Numeral.tsx:12-16.

### S13. ChatComposer (entry field)

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:107-143 (`paddingBlock: semanticTokens.spacingSm`, `minHeight: semanticTokens.sizeControlMd`) and Chat.tsx:417-428 `<textarea … rows={2} />`; compare TextArea.tsx:26 `paddingBlock: semanticTokens.spacingXs`, :10 `minimumHeight = calc(4 * fontSizeMd * lineHeightBody + 2 * spacingXs)`, :41-46 and :48-62 for the `:active`, read-only and invalid states this copy lacks.

### S14. ChatLayout

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:26-32 (no `height`/`blockSize`, only `minHeight: 0`); ChatLayout.stories.tsx:76 renders it unconstrained, ChatLayout.stories.tsx:38 `<div style={{height: '20rem'}}>` wraps it in the Composition story.

### S15. ChatMessage (reader turn)

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:48 `fromReader: {alignItems: 'flex-end'}`; Chat.tsx:70 `paddingInline: semanticTokens.spacingMd` on `bubbleReader` vs Chat.tsx:81 `paddingInline: 0` on `bubbleAssistant`; the two children at Chat.tsx:316 and :318.

### S16. ChatMessageList

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:265-282 renders `{children}` with no zero-length branch and no `emptyMessage` prop; i18n/messages.ts:10-12 lists the three sibling empty strings.

### S17. ChatSystemMessage

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:83-92 vs Chat.tsx:213-221; both render the string "Conversation started" — ChatMessageList.stories.tsx:50 through `ChatMessage`, ChatMessage.stories.tsx:41 through `ChatSystemMessage`.

### S18. Banner

- file: `packages/core/src/Banner/Banner.tsx`
- evidence: Banner.tsx:26-33 gives info `statusInfoSurface`/`statusInfoText` and success `statusSuccessSurface`/`statusSuccessText` and nothing else; theme.css:280 `--kioku-theme-status-info-surface: light-dark(#e4e9e0, #9cb59720)` and theme.css:282 `--kioku-theme-status-success-surface: light-dark(#e6ebe0, #9cb59720)` — byte-identical in dark, 2/2/0 apart in RGB in light.

### S19. AsyncState

- file: `packages/core/src/AsyncState/AsyncState.tsx`
- evidence: AsyncState.tsx:67-71 `<Alert tone="danger"><div>{state.title}</div>{state.detail ? <div>{state.detail}</div> : null}{state.retry}</Alert>` — no styles anywhere, and Alert.tsx:49-52 `content: {flex: 1, minWidth: 0}` declares no gap for block children.

### S20. ProgressBar

- file: `packages/core/src/ProgressBar/ProgressBar.tsx`
- evidence: ProgressBar.tsx:9-10 `to: {transform: 'translateX(250%)'}` and ProgressBar.tsx:43 `inlineSize: '40%'`; ProgressBar.tsx:36-42 `animationIterationCount: 'infinite'` + `animationTimingFunction: semanticTokens.easingStandard`. Spinner.tsx:12 shows the house answer for a derived dimension: `const ringWidth = \`calc(2 * ${semanticTokens.borderWidth})\``.

### S21. Badge

- file: `packages/core/src/Badge/Badge.tsx`
- evidence: Badge.tsx:13-22 declares `fontSize: semanticTokens.fontSizeXs` and `paddingBlock: semanticTokens.spacingXs` with no `lineHeight` key; compare Kbd.tsx:22 `lineHeight: semanticTokens.lineHeightBody` and Indicator.tsx:26 `lineHeight: 1`.

### S22. Badge

- file: `packages/core/src/Badge/Badge.tsx`
- evidence: Badge.tsx:16-18 `fontFamily: semanticTokens.fontFamilyBody, fontSize: semanticTokens.fontSizeXs, letterSpacing: semanticTokens.letterSpacingEyebrow`. Census across packages/core/src/**/*.tsx: fontFamilyHeading x14, fontFamilyDisplay x5, fontFamilyBody x1 (this line). The storybook's own eyebrow uses the heading face (apps/storybook/stories/support/StoryFrame.tsx:55).

### S23. Indicator

- file: `packages/core/src/Indicator/Indicator.tsx`
- evidence: Indicator.tsx:30 `transform: 'translate(35%, -35%)'`; Indicator.tsx:27-28 `minWidth: semanticTokens.spacingMd` (10px) against a computed floor of 3+3 padding + 2+2 border + ~6.2px glyph = 16.2px. Composition story renders count={140} beside count-less, i.e. both extremes.

### S24. Indicator

- file: `packages/core/src/Indicator/Indicator.tsx`
- evidence: Indicator.tsx:16 `borderWidth: semanticTokens.focusWidth` (2px, theme.css:127). Compare Spinner.tsx:10-12: `// Two hairlines wide.` / `const ringWidth = \`calc(2 * ${semanticTokens.borderWidth})\``.

### S25. Alert

- file: `packages/core/src/Alert/Alert.tsx`
- evidence: Alert.tsx:9 `alignItems: 'flex-start'` with Alert.tsx:45-47 `height: semanticTokens.spacingLg … width: semanticTokens.spacingLg`; fontSizeMd 13.5px x lineHeightBody 1.62 = 21.87px first-line box, (21.87 - 14) / 2 = 3.93px of misalignment.

### S26. Toast

- file: `packages/core/src/Toast/Toast.tsx`
- evidence: Toast.tsx:50 `alignItems: 'center'` on the toast row, with the dot at Toast.tsx:143 as a direct flex child and the title/description column (Toast.tsx:82-88, `gap: spacingXs`) as its sibling; dotSize = `calc(2 * spacingXs)` = 6px against a title line box of 12.5 x 1.62 = 20.25px plus a description of the same.

### S27. Toast

- file: `packages/core/src/Toast/Toast.tsx`
- evidence: Toast.tsx:136-154 renders no close affordance; Toast.tsx:27-30 defines `enter` and there is no matching exit keyframe or unmount delay in ToastProvider (Toast.tsx:205-224 calls `dismiss(id)` straight from setTimeout).

### S28. Skeleton

- file: `packages/core/src/Skeleton/Skeleton.tsx`
- evidence: Skeleton.tsx:11-17 is the entire style object: `backgroundColor`, `borderRadius`, `minHeight: semanticTokens.spacingMd` (10px), `width: '100%'`. apps/storybook/stories/Skeleton.stories.tsx:33-41 renders `<Skeleton /><Skeleton /><Skeleton />` — three equal full-width bars.

### S29. ProgressBar

- file: `packages/core/src/ProgressBar/ProgressBar.tsx`
- evidence: ProgressBar.tsx:76-96 renders only track and fill; `label` (line 58) is consumed at line 79 as `aria-label` only. apps/storybook/stories/ProgressBar.stories.tsx:7-16 defines `figureStyle` with `fontFamily: mono`, `fontVariantNumeric: 'tabular-nums'`, `letterSpacing: letter-spacing-mono` and renders `<span style={figureStyle}>62%</span>` by hand at line 64.

### S30. Layout

- file: `packages/core/src/Layout/Layout.tsx`
- evidence: L64-70 `pageIndex: { … fontFamily: semanticTokens.fontFamilyDisplay, fontSize: semanticTokens.fontSizeLg, fontVariantNumeric: 'tabular-nums', letterSpacing: semanticTokens.letterSpacingHeading, … }`

### S31. Layout

- file: `packages/core/src/Layout/Layout.tsx`
- evidence: L41 `paddingInline: semanticTokens.spacing2xl` (28px, main) vs L86 `paddingInline: semanticTokens.spacingLg` (14px, footer) vs L30 `paddingInline: semanticTokens.spacingMd` (10px, asideRail)

### S32. Resizable

- file: `packages/core/src/Resizable/Resizable.tsx`
- evidence: L45-52 `max = 480,` `min = 160,` `step = 16,` and L56 `useState(size ?? 240)` — literals, against `SideNav.tsx:8` `calc(9 * spacing2xl)`

### S33. Resizable

- file: `packages/core/src/Resizable/Resizable.tsx`
- evidence: L16 `frame: { display: 'flex', … }` — no `flexDirection`; L79 `apply(event.clientX - frame.getBoundingClientRect().left)`; against `ResizeHandle.tsx:80` `readonly orientation?: ResizeHandleOrientation`

### S34. Section

- file: `packages/core/src/Section/Section.tsx`
- evidence: L32 `padding = 'xl'` → L12 `paddingXl: {paddingBlock: semanticTokens.spacingXl}` (20px), stacked on `Layout.tsx:42` `rowGap: semanticTokens.spacingXl` — 60px between sections against the documented 20px

### S35. Section

- file: `packages/core/src/Section/Section.tsx`
- evidence: Section.tsx:7-14 declares six `paddingBlock` rules and no other property; `apps/docsite/src/pages/ThemesPage.tsx:362` and `apps/docsite/src/pages/TemplatesPage.tsx:728` each define `function SectionRule({label, note})` — "An eyebrow, an optional note, and a rule that runs out to the margin"

### S36. Grid

- file: `packages/core/src/Grid/Grid.tsx`
- evidence: L9-12 `columnFour: {gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'}` and siblings — no `auto-fit`, no minimum track, against `FormLayout.tsx:21`

### S37. FormLayout

- file: `packages/core/src/FormLayout/FormLayout.tsx`
- evidence: L19 `single: {gridTemplateColumns: '1fr'},` against L21 `double: {gridTemplateColumns: \`repeat(auto-fit, minmax(min(100%, ${columnMinimumWidth}), 1fr))\`}` and the L47 comment "so a form never forces sideways scrolling"

### S38. Divider

- file: `packages/core/src/Divider/Divider.tsx`
- evidence: L9-11 `borderBlockStartColor/Style/Width` only; L16 `export type DividerProps = Omit<HTMLAttributes<HTMLHRElement>, 'className'>;` — `'style'` is not omitted; exploited at `apps/docsite/src/pages/ThemesPage.tsx:376` `<Divider aria-hidden="true" style={{flex: 1}} />`

### S39. VStack

- file: `packages/core/src/VStack/VStack.tsx`
- evidence: L6-9 "kept so a layout written with `HStack` reads symmetrically"; `HStack.tsx:62-65` declares `align` (5 values), `gap`, `justify`, `wrap`; `Stack.tsx:42-43` declares `gap` and `align` (4 values) only

### S40. AspectRatio

- file: `apps/storybook/stories/AspectRatio.stories.tsx`
- evidence: L20-28 `style={{ … backgroundColor: 'var(--kioku-ui-color-surface-muted)', height: '100%', … width: '100%'}}` against `Box.tsx:17` `muted: {backgroundColor: semanticTokens.colorSurfaceMuted}`

### S41. Outline

- file: `packages/core/src/Outline/Outline.tsx`
- evidence: Outline.tsx:11 `gap: semanticTokens.spacingXs` (3px) on `list`, against Outline.tsx:17-18 `borderInlineStartStyle/Width` on `entry` and `paddingBlock: semanticTokens.spacingXs` (:24). Compare SideNav.tsx:53 and NavMenu.tsx:27, which tile rows `rowGap: semanticTokens.borderWidth` precisely so a run reads as one column.

### S42. Outline

- file: `packages/core/src/Outline/Outline.tsx`
- evidence: Outline.tsx:47-51 `current: {borderInlineStartColor: semanticTokens.colorAccent, color: semanticTokens.colorText, fontWeight: semanticTokens.fontWeightMedium}` vs NavItem.tsx:71 `current: {color: semanticTokens.colorText}`. The weight change also reflows the entry, since the label is proportional body type.

### S43. Pagination

- file: `packages/core/src/Pagination/Pagination.tsx`
- evidence: Pagination.tsx:38/41 `height: semanticTokens.sizeControlSm` / `minWidth: semanticTokens.sizeControlSm` (resolves to 24px, themes.test.ts:291) on the icon-only step at :193-210 and :237-254; hit target token is 44px (themes.test.ts:294). Button.tsx:128-138 `iconHitTarget: {'::before': {height: semanticTokens.sizeHitTarget, … width: semanticTokens.sizeHitTarget}}`.

### S44. Pagination

- file: `packages/core/src/Pagination/Pagination.tsx`
- evidence: Pagination.tsx:79-81 `borderBlockEnd…` plus :98 `minWidth: semanticTokens.sizeControlSm` and :99 `paddingInline: semanticTokens.spacingXs`; TabList.tsx:43-48 — "The underline is the width of the label and nothing else. Inline padding would run the mark out past the word it marks" with `paddingInline: 0`.

### S45. TabList

- file: `packages/core/src/TabList/TabList.tsx`
- evidence: TabList.tsx:46-48 `paddingBlockEnd: semanticTokens.spacingMd, paddingBlockStart: 0, paddingInline: 0`; `fontSize: semanticTokens.fontSizeMd` (13.5px) × lineHeightHeading + 10px + 2px mark ≈ 34px against `sizeHitTarget` 44px. Button.tsx:128-138 is the pattern that solves this without growing the visual box.

### S46. Breadcrumbs

- file: `packages/core/src/Breadcrumbs/Breadcrumbs.tsx`
- evidence: Breadcrumbs.tsx:101-107 `{href === undefined || last ? (<span {...(last ? {'aria-current': 'page'} : {})} {...stylex.props(styles.current)}>` — the ternary branches on two conditions but paints one style. `current` at :36-42 sets `color: colorText` and `fontWeight: fontWeightMedium`.

### S47. TopNav

- file: `packages/core/src/TopNav/TopNav.tsx`
- evidence: TopNav.tsx:43 `navigation: {flexGrow: 1, minWidth: 0},` vs TopNav.tsx:44-49 `actions: {alignItems: 'center', columnGap: semanticTokens.spacingSm, display: 'flex', flexShrink: 0}`. The trigger's own `paddingInline: semanticTokens.spacingSm` (TopNavMenu.tsx:35) is all that separates two adjacent labels.

### S48. TopNav

- file: `packages/core/src/TopNav/TopNav.tsx`
- evidence: TopNav.tsx:14 `borderBlockEndColor: semanticTokens.borderDefault,` against SideNav.tsx:17 `borderInlineEndColor: semanticTokens.borderStrong,`, Layout.tsx:25 (asideRail), :51 (pageHead) and :82 (footer), all `borderStrong`.

### S49. MobileNav

- file: `packages/core/src/MobileNav/MobileNav.tsx`
- evidence: MobileNav.tsx:39 `width: '85%',` against MobileNav.tsx:11-13 `// Wide enough for a two-word destination and its glyph … Built from the scale, not written as a length.` / `const drawerMaxWidth = calc(11 * spacing2xl)`.

### S50. MobileNav

- file: `packages/core/src/MobileNav/MobileNav.tsx`
- evidence: MobileNav.tsx:16-21 `scrim` declares no `animationName`; Overlay.tsx:9-12 `scrimEnter` + :17-22 with the reduced-motion guard, and Dialog.tsx:13-16 `surfaceEnter`. MobileNav.tsx:91-92 and :114-122 duplicate what Overlay already owns.

### S51. TopNavMegaMenuFeaturedCard

- file: `packages/core/src/TopNavMegaMenu/TopNavMegaMenu.tsx`
- evidence: TopNavMegaMenu.tsx:115 `backgroundColor: semanticTokens.colorSurfaceMuted,` inside Popover.tsx:20 `backgroundColor: semanticTokens.colorSurfaceRaised`; apps/docsite/src/data/specimens.tsx:3567 — "it takes the card's surface rather than a fill".

### S52. Tokenizer

- file: `packages/core/src/Tokenizer/Tokenizer.tsx`
- evidence: Tokenizer.tsx:23-24 `minHeight: semanticTokens.sizeControlMd, padding: semanticTokens.spacingXs` plus Tokenizer.tsx:42-43 `paddingBlock/paddingInline: semanticTokens.spacingXs`; theme.css:168 `--kioku-theme-size-control-md: 28px`, theme.css:150 `line-height-body: 1.62`

### S53. Tokenizer

- file: `packages/core/src/Tokenizer/Tokenizer.tsx`
- evidence: Tokenizer.tsx:45-50 `':focus-visible': {outlineOffset: focusOffset, outlineWidth: focusWidth…}` on `styles.input`, inside `styles.frame` whose clearance is Tokenizer.tsx:24 `padding: semanticTokens.spacingXs` (3px); theme.css:130-131 focus-width 2px, focus-offset 2px

### S54. PowerSearch

- file: `packages/core/src/PowerSearch/PowerSearch.tsx`
- evidence: PowerSearch.tsx:61-66 `':focus-visible'` on `styles.input` inside `styles.field`, whose block clearance is PowerSearch.tsx:40 `paddingBlock: semanticTokens.spacingXs`; PowerSearch.tsx:46 `':focus-within': {borderColor: borderInteractive}`

### S55. Switch, Toggle

- file: `packages/core/src/Switch/Switch.tsx`
- evidence: Switch.tsx:34-35 and Toggle.tsx:34-35 `minHeight: semanticTokens.sizeHitTarget, minWidth: semanticTokens.sizeHitTarget`, versus Button.tsx:129-137 `'::before': {height: sizeHitTarget, … position: 'absolute', transform: 'translate(-50%, -50%)'}`

### S56. Toggle

- file: `packages/core/src/Toggle/Toggle.tsx`
- evidence: Toggle.tsx:33 `justifyContent: 'center'` vs Switch.tsx:31 `justifyContent: 'flex-start'`; Toggle.tsx:12-16 and Switch.tsx:11-15 are byte-identical constants; Switch.doc.ts inheritedProps: 'ToggleProps, the same prop contract Toggle accepts'

### S57. Typeahead, TypeaheadItem

- file: `packages/core/src/Typeahead/Typeahead.tsx`
- evidence: Typeahead.tsx:116-119 `active: {backgroundColor: semanticTokens.colorOverlayHover, color: colorText, fontWeight: fontWeightMedium, '::before': {…}}` against Typeahead.tsx:107-112 `idle: {':hover': {backgroundColor: semanticTokens.colorOverlayHover…}}`; duplicated verbatim at TypeaheadItem.tsx:30-53

### S58. Typeahead

- file: `packages/core/src/Typeahead/Typeahead.tsx`
- evidence: Typeahead.tsx:19-23 and TypeaheadItem.tsx:7-11 are the same `markWidth`/`markHeight` block with the same comment; Typeahead.tsx:279-296 renders `<li>{option.label}</li>` where TypeaheadItem.tsx:94-100 renders `<Item description leading trailing>`

### S59. Selector

- file: `packages/core/src/Selector/Selector.tsx`
- evidence: Selector.tsx:12-46 declares no `appearance` and no `::after`; Selector.tsx:27 `paddingInline: semanticTokens.spacingSm`; `grep -rn appearance packages/core/src` returns only Slider.tsx:92,108

### S60. RadioList

- file: `packages/core/src/RadioList/RadioList.tsx`
- evidence: RadioList.tsx:43 `accentColor: semanticTokens.colorAccent` and RadioList.tsx:49 `':disabled': {cursor: 'default'}`, against RadioList.tsx:80-83 `labelDisabled` and RadioList.tsx:91 `descriptionDisabled` which do paint

### S61. TextInput, TextArea

- file: `packages/core/src/TextInput/TextInput.tsx`
- evidence: TextInput.tsx:7-42 and TextArea.tsx:12-47 contain no `transitionDuration`/`transitionProperty`/`transitionTimingFunction`, against NumberInput.tsx:30-32, Selector.tsx:28-30, Typeahead.tsx:45-47 and TemporalInput.tsx:29-31 which all declare the three longhands

### S62. TextArea

- file: `packages/core/src/TextArea/TextArea.tsx`
- evidence: `grep -n resize TextArea.tsx` returns nothing; Chat.tsx:123 `resize: 'vertical'`

### S63. Typeahead

- file: `packages/core/src/Typeahead/Typeahead.tsx`
- evidence: Typeahead.tsx:199 `const expanded = open && inputValue !== '';` against apps/storybook/stories/Typeahead.stories.tsx:79 `{label: 'empty', content: <TypeaheadDemo />}` and :81 `label: 'custom empty message'`

### S64. EmptyState

- file: `packages/core/src/EmptyState/EmptyState.tsx`
- evidence: EmptyState.tsx:16 `boxShadow: semanticTokens.elevationMedium`. Card.tsx:19-26 keeps `medium` as an opt-in variant and defaults to `none` (a borderDefault hairline); elevationMedium resolves to `0 1px 0 rgb(38 34 28 / 4%), 0 0 0 1px #ddd7c5` (theme.css:243-245) — a drop line plus a ring where the card beside it draws one line.

### S65. EmptyState

- file: `packages/core/src/EmptyState/EmptyState.tsx`
- evidence: EmptyState.tsx:21 `gap: semanticTokens.spacingSm` is the sole separation for the four children rendered at :104-107, while :24-26 sets `paddingBlockEnd: spacingXl` (20px) and `paddingBlockStart: spacing2xl` (28px). 6px between a paragraph and a `<Button>` against 20px of nothing below it.

### S66. Markdown

- file: `packages/core/src/Markdown/Markdown.tsx`
- evidence: Markdown.tsx:18 `gap: semanticTokens.spacingMd` (10px) on the prose column, with headings emitted at Markdown.tsx:86-90 as `<Heading size={block.level === 2 ? 'section' : 'subsection'}>` — `section` is fontSizeXl, 27px (Heading.tsx:22-25, theme.css:145). A 27px heading 10px from body copy inside a Card whose own padding is 14px.

### S67. Markdown

- file: `packages/core/src/Markdown/parse.ts`
- evidence: parse.ts:77-132 handles `##`/`###`, `>`, `-`/`1.` and paragraphs only — no fence branch — and :126-131 joins consecutive lines with a space. parse.ts:26 `/(`[^`]+`)|…/` then matches at index 2 of "```ts const a = 1; ```", producing `{kind:'code', text:'ts const a = 1; '}` (verified by running the regex). Markdown.tsx:105-110 has no `case 'code'`.

### S68. Eyebrow

- file: `packages/core/src/Eyebrow/Eyebrow.tsx`
- evidence: Eyebrow.tsx:11-16 declares fontFamily, fontSize, letterSpacing and lineHeight and no `fontWeight`. Every hand-rolled spelling of the same recipe pins it: Field.tsx:35 `fontWeight: fontWeightMedium`, Table.tsx:80 `fontWeight: fontWeightRegular`, MetadataList.tsx:30 `fontWeight: fontWeightRegular`.

### S69. Thumbnail

- file: `packages/core/src/Thumbnail/Thumbnail.tsx`
- evidence: Thumbnail.tsx:78 `<span {...stylex.props(styles.frame, styles[size])}>` receives no `{...props}`; Thumbnail.tsx:82-90 spreads them on the `<img>`, which Thumbnail.tsx:79-81 replaces wholesale with the fallback span once `failed` is true.

### S70. Citation

- file: `packages/core/src/Citation/Citation.tsx`
- evidence: Citation.tsx:48-53: the marker `<span>` closes and `{body}` follows on the next line, which JSX strips to nothing; styles.marker (Citation.tsx:18-24) sets verticalAlign, face, size, tracking and tabular figures but no `marginInlineEnd`. Exercised by Citation.stories.tsx:33 `<Citation href=… marker="1">RFC 9457</Citation>`.

### S71. AvatarGroup

- file: `packages/core/src/AvatarGroup/AvatarGroup.tsx`
- evidence: AvatarGroup.tsx:16 `borderColor: semanticTokens.colorSurface` with the comment at :13-14 "The ring is painted in the surface the stack sits on" — there is no prop or context that supplies it. In washi light, surface #f6f3e9 against canvas #efebe0 and surfaceMuted #e7e2d3 (theme.css:220-223). AvatarGroup.stories.tsx:57-76 places it inside `<Card>` only.

### S72. Kbd

- file: `packages/core/src/Kbd/Kbd.tsx`
- evidence: Kbd.tsx:23 `paddingInline: semanticTokens.spacingXs` with no minWidth or paddingBlock. At fontSizeXs 11px in IBM Plex Mono (0.6em advance) the cap is 6.5px + 6px = ~12.5px wide by lineHeightBody 1.62 × 11 = ~17.8px tall for `K`, against ~32px wide for `Ctrl` — both drawn side by side in Kbd.stories.tsx:28 `<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>`.

### S73. Token

- file: `packages/core/src/Token/Token.tsx`
- evidence: Token.tsx:20 `fontSize: fontSizeSm` (12.5px) × Token.tsx:23 `lineHeight: lineHeightBody` (1.62) = 20.25px, plus Token.tsx:25 `paddingBlock: spacingXs` ×2 = 26.25px. Tokenizer.tsx:23-24 `minHeight: sizeControlMd` (28px) with `padding: spacingXs` leaves 22px, so the frame is pushed to ≥32.25px; TextInput.tsx:19 is a fixed `height: semanticTokens.sizeControlMd` (28px).

### S74. Table

- file: `packages/core/src/Table/Table.tsx`
- evidence: Table.tsx:68-70 `':active': {backgroundColor: semanticTokens.colorOverlayActive},`

### S75. Table

- file: `packages/core/src/Table/Table.tsx`
- evidence: Table.tsx:41 `fontSize: semanticTokens.fontSizeMd` against Table.tsx:96 `fontSize: semanticTokens.fontSizeSm` in `numericCell`; theme.css:142-143 `--kioku-theme-font-size-sm: 12.5px; --kioku-theme-font-size-md: 13.5px`. Numeral.tsx:12-16 declares only fontFamily, fontVariantNumeric and letterSpacing.

### S76. Table

- file: `packages/core/src/Table/Table.tsx`
- evidence: Table.tsx:76-84 `headerCell` declares color, fontFamily, fontSize, fontWeight, letterSpacing, paddingInline, textAlign — no `backgroundColor`. design-language.md §3: "`colorSurfaceMuted` (an input fill, a track, a table header, a well — darker than the canvas)".

### S77. Table

- file: `packages/core/src/Table/Table.tsx`
- evidence: Table.tsx:90 `selectedRow: {boxShadow: selectionRule}`; Table.doc.ts:75 documents `name: 'selected'`; `grep -n selected apps/storybook/stories/Table.stories.tsx` returns nothing, and specimens.tsx:4249-4278 renders four plain `<TableRow>`. (The mark itself does paint — I confirmed box-shadow on a `<tr>` under `border-collapse: collapse` renders in Chromium.)

### S78. Table

- file: `packages/core/src/Table/Table.tsx`
- evidence: Table.tsx:37-44 `table: {borderCollapse, color, fontFamily, fontSize: fontSizeMd, letterSpacing: letterSpacingBody, width}` — no lineHeight. Compare List.tsx:15 and Item.tsx:38, which both set `lineHeight: semanticTokens.lineHeightBody`. theme.css:150 `--kioku-theme-line-height-body: 1.62`; nothing in theme.css or theme/Theme.tsx:34-49 sets a root line-height to inherit.

### S79. Item

- file: `packages/core/src/Item/Item.tsx`
- evidence: Item.tsx:78-80 `{leading === undefined ? null : (<span {...stylex.props(styles.slot)}>{leading}</span>)}`. DropdownMenu.tsx:188-191 and TypeaheadItem.tsx:94-97 both spread `leading` conditionally. Against TreeList.tsx:108 `width: markerColumn`, applied whether or not the node is a branch.

### S80. Item

- file: `packages/core/src/Item/Item.tsx`
- evidence: Item.tsx:16 `slot: {…color: semanticTokens.colorTextSecondary…}` and Item.tsx:47 `color: semanticTokens.colorTextSecondary` in `description`, against TypeaheadItem.tsx:54 `disabled: {color: semanticTokens.colorDisabledText, cursor: 'default'}` set on the `<li>` that wraps the Item.

### S81. TreeList

- file: `packages/core/src/TreeList/TreeList.tsx`
- evidence: TreeList.tsx:101 `color: semanticTokens.colorTextMuted,` in `marker`, inside `node` which declares `':hover:not(:disabled)': {backgroundColor: semanticTokens.colorOverlayHover…}` at :85-88.

### S82. TreeList

- file: `packages/core/src/TreeList/TreeList.tsx`
- evidence: TreeList.tsx:90-94 `selected: {boxShadow: selectionMark, color: semanticTokens.colorText, fontWeight: semanticTokens.fontWeightMedium}` against `node`'s base `fontWeight: semanticTokens.fontWeightRegular` (:62). NavItem.tsx:69 `current: {color: semanticTokens.colorText},` — nothing else.

### S83. MetadataList

- file: `packages/core/src/MetadataList/MetadataList.tsx`
- evidence: MetadataList.tsx:32 `lineHeight: semanticTokens.lineHeightBody,` in `term`, against Eyebrow.tsx:15 `lineHeight: semanticTokens.lineHeightHeading`, MetricGrid.tsx:38 `lineHeight: semanticTokens.lineHeightHeading`, and Table.tsx:76-84 which declares none. theme.css:150-151 `line-height-body: 1.62; line-height-heading: 1.25`.

### S84. MetricGrid

- file: `packages/core/src/MetricGrid/MetricGrid.tsx`
- evidence: MetricGrid.tsx:52-58 `detail: {color, fontFamily, fontSize: fontSizeSm, letterSpacing: letterSpacingLabel, margin: 0}` against `label` (:38 `lineHeight: lineHeightHeading`) and `value` (:49 `lineHeight: lineHeightHeading`) in the same `stylex.create` call.

### S85. MetricGrid

- file: `packages/core/src/MetricGrid/MetricGrid.tsx`
- evidence: MetricGrid.tsx:74-76 `<dl {...props} {...stylex.props(styles.root)}>{items.map(…)}` — no guard on `items.length`. `root` (:13-24) sets `borderWidth: semanticTokens.borderWidth` top and bottom over zero grid rows. MetricGrid.stories.tsx:17 `args: {items: []}`. `EmptyState` exists in the library and is not reached for.

### S86. ListItem

- file: `packages/core/src/List/List.tsx`
- evidence: List.tsx:33 `item: {marginBlock: 0},` — the only style `ListItem` applies (List.tsx:88-93). Compare Item.tsx:34-39, which declares fontFamily, fontSize, letterSpacing and lineHeight for the equivalent text-bearing element.

### S87. IconButton

- file: `packages/core/src/Button/Button.tsx`
- evidence: Button.tsx:125-127 `iconSm: {width: sizeControlSm}` … ; Button.tsx:43,49,55 fontSize is fontSizeSm (12.5px) for sm and md, fontSizeMd (13.5px) for lg; Icon.tsx:13 `sizeInherit: {height: '1em', width: '1em'}` is the default. Compare NavIcon.tsx:13-22, which pins the em basis and a square deliberately and says why.

### S88. MoreMenu

- file: `packages/core/src/MoreMenu/MoreMenu.tsx`
- evidence: MoreMenu.tsx:46-50 `<Icon><circle cx="5" cy="12" r="1.75" />…`; 1.75/24 × 12.5px = 0.91px radius; span (19+1.75)−(5−1.75) = 16.5/24 × 12.5 = 8.6px. Even at a properly chosen 16px icon the dots would still be 2.3px.

### S89. ButtonGroup

- file: `packages/core/src/ButtonGroup/ButtonGroup.tsx`
- evidence: ButtonGroup.tsx:11 `gap: semanticTokens.spacingXs` (3px) against ButtonGroup.doc.ts:5 "Groups related actions so they read as one control"; Toolbar.tsx:11 `const toolGap = calc(2 * borderWidth)` (2px) with "closed up they read as one instrument". radiusElement = 3px (theme.css:163).

### S90. ToggleButton

- file: `packages/core/src/ToggleButton/ToggleButton.tsx`
- evidence: ToggleButton.tsx:52-56 `md: {fontSize: fontSizeMd, height: sizeControlMd, …}` vs Button.tsx:48-53 `md: {fontSize: fontSizeSm, letterSpacing: letterSpacingLabel, height: sizeControlMd, …}` under Button.tsx:38-41 "the console sets its buttons a step below the body copy they sit among".

### S91. DropdownMenuItem

- file: `packages/core/src/DropdownMenu/DropdownMenu.tsx`
- evidence: DropdownMenu.tsx:65-77, esp. 68 `height: {default: 0, ':hover:not(:disabled)': markHeight}` and 73-74 `transitionDuration: durationModerate, transitionProperty: 'height'`. Compare TypeaheadItem.tsx:39-52 and CommandPalette.tsx:115-132, which use the identical markWidth/markHeight constants on `active`, with no transition.

### S92. SegmentedControl

- file: `packages/core/src/SegmentedControl/SegmentedControl.tsx`
- evidence: SegmentedControl.tsx:44 `':disabled': {color: colorDisabledText, cursor: 'default'}` is the whole treatment; root (16-28) has no disabled object and the JSX only adds `aria-disabled` (line 217). Compare Button.tsx:25-30, which paints colorDisabledSurface + borderDisabled + colorDisabledText. The `Disabled` story (SegmentedControl.stories.tsx:108-117) renders exactly this box.

### S93. Dialog

- file: `packages/core/src/Dialog/Dialog.tsx`
- evidence: Dialog.tsx:7-11 `// The scale stops at 38px…` then `const surfaceWidthSm = calc(${semanticTokens.spacing2xl} * 10)`. Contradicted by themes.test.ts:288 `expect(await resolveThemeValue(theme.id, 'spacing.2xl')).toBe('28px')` and themes.test.ts:336-338 (38px only under `{density: 'standard'}`), with Theme.tsx:162 `defaultDensity = 'compact'`. The same false premise is repeated in Tooltip.tsx:24 and DropdownMenu.tsx:17.

### S94. BottomSheet

- file: `packages/core/src/BottomSheet/BottomSheet.tsx`
- evidence: BottomSheet.tsx:28-37 `insetBlockEnd: 0, insetInline: semanticTokens.spacingXl, maxHeight: '85vh', position: 'fixed'` against Overlay.tsx:27 `padding: semanticTokens.spacingLg`. Radii set only at 21-22 (`borderStartEndRadius`/`borderStartStartRadius`). The comment at 29-31 claims the sheet is "lifted off the side edges rather than welded to them" while insetBlockEnd:0 welds the bottom.

### S95. Lightbox

- file: `packages/core/src/Lightbox/Lightbox.tsx`
- evidence: Lightbox.tsx:36-44, line 43 `textTransform: 'uppercase',`. `grep -rn textTransform packages/core/src` returns this line and nothing else. The house eyebrow is Eyebrow.tsx:11-16 (`fontFamilyHeading` / `fontSizeXs` / `letterSpacingEyebrow` / `lineHeightHeading`, no caps), and CommandPalette.tsx:78-81 states the rule out loud: a caption in this system "is not set in capitals as well".

### S96. CommandPalette

- file: `packages/core/src/CommandPalette/CommandPalette.tsx`
- evidence: CommandPalette.tsx:143-153 vs Kbd/Kbd.tsx:7-25. Kbd sets `lineHeight: semanticTokens.lineHeightBody` (Kbd.tsx:22), `fontWeight: semanticTokens.fontWeightMedium` (:20), `color: semanticTokens.colorText` (:15); the palette's copy sets none of the first two and uses `colorTextSecondary` (CommandPalette.tsx:146). lineHeightBody is 1.62 (theme.css:150).

### S97. CommandPalette

- file: `packages/core/src/CommandPalette/CommandPalette.tsx`
- evidence: CommandPalette.tsx:32 `maxHeight: '70vh',` beside CommandPalette.tsx:16 `const surfaceWidth = calc(20 * ${semanticTokens.spacing2xl})`, :21 `const markWidth`, :22 `const markHeight`. Dialog and Lightbox answer the same question a third way, with `maxHeight: '100%'` inside the scrim's padding (Dialog.tsx:33, Lightbox.tsx:19), so the family has three different heights-of-a-modal.

### S98. Overlay / Popover / Tooltip

- file: `packages/core/src/Overlay/Overlay.tsx`
- evidence: Overlay.tsx:15-29 (`position: 'fixed', inset: 0` with no zIndex), Popover.tsx:29, Tooltip.tsx:41 — same. Against theme/Theme.tsx:41-47 `'::after': { … position: 'absolute', zIndex: 1 }` and AppShell/AppShell.tsx:31 `zIndex: 1`. `authoring.stylex.ts` defines no z-index or layer token among its 80 vars.

### S99. Popover / Tooltip / HoverCard / ContextMenu

- file: `packages/core/src/hooks/useAnchoredPosition.ts`
- evidence: useAnchoredPosition.ts:119 `offset = 8,` — the default for Popover, Tooltip, HoverCard and ContextMenu, none of which override it. useAnchoredPosition.ts:100-101 `left: Math.max(0, Math.min(left, window.innerWidth - surface.width))` puts the plate's edge on the viewport's edge; compare Overlay.tsx:27 `padding: semanticTokens.spacingLg`.

### S100. Popover

- file: `packages/core/src/Popover/Popover.tsx`
- evidence: Popover.tsx:62 destructures `style,` out of props; Popover.tsx:116 `style={{...style, left: position?.left, top: position?.top}}`. The props type at :35-38 is `Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>` — it omits className but not style, nor `role` or `id`, both of which the component also owns (:61, :66).

### S101. ContextMenu

- file: `packages/core/src/ContextMenu/ContextMenu.tsx`
- evidence: ContextMenu.tsx:39 `<div onContextMenu={handleContextMenu}>{children}</div>` — no `{...stylex.props(...)}`, while the sibling span at :41-47 gets one. `styles` (ContextMenu.tsx:6-12) contains only `anchor`.

### S102. HoverCard

- file: `apps/storybook/stories/HoverCard.stories.tsx`
- evidence: HoverCard.stories.tsx:60-64 `// The only surface in this group whose story cannot open it… It needs a 'label' prop before it can be shown open.` against HoverCard.tsx:35 `readonly label: string;` (required) and the stories' own `label="Author detail"` at :29, :48, :74. Tooltip.stories.tsx:62-70 and ContextMenu.stories.tsx:62-70 both open theirs with a `play` block; HoverCard has none.

### S103. SpecimenPlate — plate header

- file: `apps/docsite/src/pages/ComponentDetailPage.tsx`
- evidence: HStack `align="center"` (89) + `borderBlockEnd: '… var(--kioku-ui-border-default)'` (92-93) + `paddingBlock: spacingSm` (95), wrapping a TabList whose list carries `borderBlockEndWidth: borderWidth` and whose tabs carry `paddingBlockEnd: spacingMd, paddingBlockStart: 0` (TabList.tsx:16-18, 46-47). Strip height ≈32px, eyebrow 14px → 9px of centring offset; strip rule at y=32, header rule at y=38.

### S104. LibraryPreview — pane header

- file: `apps/docsite/src/pages/HomePage.tsx`
- evidence: `borderBlockEnd: '… var(--kioku-ui-border-default)'` (319-320) with `paddingBlock: 'var(--kioku-ui-spacing-sm)'` (322) on an HStack that takes `align='center'` by default (HStack.tsx:70), wrapping the TabList at 334-342.

### S105. Components index — group count

- file: `apps/docsite/src/pages/ComponentsPage.tsx`
- evidence: `<Numeral>{group.entries.length}</Numeral>` inside `<HStack align="baseline" justify="between">` (381) whose only style is border/gap/padding. Numeral.tsx:12-16 sets face, tabular figures and tracking and deliberately no size. Compare ComponentDetailPage.tsx:245-247 and TemplateDetailPage.tsx:227-229, which wrap the identical figure in `<Eyebrow tone="muted">` — 11px, third rank.

### S106. Components index — group rail

- file: `apps/docsite/src/pages/ComponentsPage.tsx`
- evidence: `<Numeral>{allEntries.length}</Numeral>` (183) and `<Numeral>{group.entries.length}</Numeral>` (194) against NavItem.tsx:23 `fontSize: semanticTokens.fontSizeMd`; ComponentDetailPage.tsx:282-284 and TemplateDetailPage.tsx:264-266 wrap theirs in `<Eyebrow tone="muted">`.

### S107. Components index — 'start here' cards

- file: `apps/docsite/src/pages/ComponentsPage.tsx`
- evidence: `<a href={componentHref(name)} style={{color: …, fontWeight: …, letterSpacing: …, textDecorationLine: 'none'}}>` (308-320). The library ships `Link` (navigation/LinkProvider.tsx:23-39) with underline, hover, active and the four-property focus block, and TemplatesPage.tsx:806-820 already makes the whole card the target for the same job.

### S108. Components index — search box

- file: `apps/docsite/src/pages/ComponentsPage.tsx`
- evidence: `type="search"` at 259 against TextInput.tsx:8-42, which declares fill, border, radius, type, padding and all four states and never touches `appearance` or the search pseudo-elements; `Slider.tsx:92` is the only place in the library that does the equivalent for a native control.

### S109. HomePage — local Eyebrow

- file: `apps/docsite/src/pages/HomePage.tsx`
- evidence: `eyebrowStyle` (93-100) sets `fontFamily: …-display` and `fontWeight: …-medium`, and the component adds `textTransform: 'uppercase'` for Latin (133) — against Eyebrow.tsx:11-16, which sets `fontFamilyHeading`, no weight and no transform. `Figure` (139-158) likewise re-implements `Numeral` with a size baked in.

### S110. HomePage — Facts, Chinese branch

- file: `apps/docsite/src/pages/HomePage.tsx`
- evidence: `<dl>` at 801 with `gap: 'var(--kioku-ui-spacing-xl)'` (804) and `<Card elevation="low">` at 810; `<dd>` at 813 sets `fontSize: …-xl` and `<dt>` at 828 sets `fontSize: …-md` with `colorText`. MetricGrid.tsx:13-39 draws the English one as `backgroundColor: borderDefault` + `gap: borderWidth` with `label` at `fontSizeXs`/`colorTextSecondary`.

### S111. TemplatesPage — LinkSurface

- file: `apps/docsite/src/pages/TemplatesPage.tsx`
- evidence: `onBlur`/`onFocus`/`onMouseEnter`/`onMouseLeave` all driving one `hovered` boolean (781-784) and `...(hovered ? {backgroundImage: wash, ...hoveredStyle} : {})` (793) — with no `outlineColor`/`outlineOffset`/`outlineStyle`/`outlineWidth` anywhere in the file, and no `outline` reset in reset.css, so the UA ring is what renders.

### S112. DocsPage — steps rail

- file: `apps/docsite/src/pages/DocsPage.tsx`
- evidence: `<Outline currentHref={currentHref} …>` (394-398) against Outline.tsx:47-51 `current: {borderInlineStartColor: colorAccent, color: colorText, fontWeight: fontWeightMedium}` — compare NavItem.tsx:65-71, `current: {color: semanticTokens.colorText}` and its comment quoting the same rule.

### S113. InputGroup

- file: `packages/core/src/InputGroup/InputGroup.tsx`
- evidence: InputGroup.tsx:11 `gap: semanticTokens.spacingXs` with :21-24 border longhands on `.addon`; rendered at 6x with `prefix="AUD" suffix="/month"` the three boxes read as three chips with two doubled seams.

### S114. ComplexSelector

- file: `packages/core/src/ComplexSelector/ComplexSelector.tsx`
- evidence: Rendered with ComplexSelector's exact declarations at 240px: `A very long owner name indeed h` — cut through the `h`, hard against the chevron, no ellipsis. ComplexSelector.tsx:28 `paddingInline: semanticTokens.spacingSm`; no `appearance`, no `textOverflow`, no inline-end reservation anywhere in styles.control.

### S115. ComplexSelector

- file: `packages/core/src/ComplexSelector/ComplexSelector.tsx`
- evidence: ComplexSelector.tsx:129-133 placeholder option; ComplexSelector.tsx:20 `color: semanticTokens.colorText` is the only colour in the control, with no empty-state style object in `stylex.create` (lines 8-53).

### S116. FileInput

- file: `packages/core/src/FileInput/FileInput.tsx`
- evidence: Rendered with FileInput's exact declarations including the `::file-selector-button` block: the control shows `Choose File | No file chosen` and the `<p>` below shows `No file selected`. FileInput.tsx:181-183 `{names.length === 0 ? messages.fileInputEmpty : names.join(', ')}`; i18n/messages.ts:36 `fileInputEmpty: 'No file selected'`.

### S117. DateInput / DateTimeInput / FileInput

- file: `packages/core/src/DateInput/TemporalInput.tsx`
- evidence: TemporalInput.tsx:22 `fontSize: semanticTokens.fontSizeSm` and FileInput.tsx:25 the same, against TextInput.tsx:17 / NumberInput.tsx:22 / Selector.tsx:23 / ComplexSelector.tsx:23 `fontSize: semanticTokens.fontSizeMd`. theme.css:142-143: sm 12.5px, md 13.5px.

### S118. DateRangeInput

- file: `packages/core/src/DateRangeInput/DateRangeInput.tsx`
- evidence: DateRangeInput.tsx:25-34 (`fontSizeSm`, `letterSpacingLabel`, `colorText`, display face) vs CheckboxList.tsx:21-29 (`fontSizeXs`, `letterSpacingEyebrow`, `colorTextSecondary`, heading face) — identical role, identical element.

### S119. Field

- file: `packages/core/src/Field/Field.tsx`
- evidence: Field.tsx:13-18 context shape has no `disabled`; Field.tsx:29-40, :44-51 and :61 declare unconditional colours with no disabled style object anywhere in `stylex.create` (lines 22-66).

### S120. MultiSelector

- file: `packages/core/src/MultiSelector/MultiSelector.tsx`
- evidence: MultiSelector.tsx:9-18 — the whole stylesheet is `chips: {display, flexWrap, gap, listStyleType, marginBlock, paddingInlineStart}`. MultiSelector.tsx:21-31 props carry no `disabled`; :57 `<Stack {...props} gap="sm">`; :58 `{chosen.length === 0 ? null : (`.

## polish — 51

### P1. Card

- file: `packages/core/src/Card/Card.tsx`
- evidence: Card.tsx:38 `export function Card({children, elevation = 'none', ...props}: CardProps)` versus design-language.md §2 "A card is `colorSurface` + `elevationLow` and **no border**" and apps/docsite/src/data/specimens.tsx:1191

### P2. SelectableCard

- file: `packages/core/src/SelectableCard/SelectableCard.tsx`
- evidence: SelectableCard.tsx:44-46 `selected: {boxShadow: selectionMark}` (inset 2px accent bar) together with :84 `titleSelected: {fontWeight: semanticTokens.fontWeightMedium}`, on a title already set to `colorText` at :77

### P3. ChatComposer (send control)

- file: `packages/core/src/Chat/Chat.tsx`
- evidence: Chat.tsx:389 `sendLabel = 'Send',` and Chat.tsx:345 `label = 'Tool calls',`, against Chat.tsx:305 `const {messages} = useInternationalization();` and i18n/messages.ts:1 "Every string the system speaks on a host application's behalf."

### P4. Alert

- file: `packages/core/src/Alert/Alert.tsx`
- evidence: Alert.tsx:21-25 `info: {backgroundColor: statusInfoSurface, borderColor: statusInfoText, color: statusInfoText}` against theme.css:228-229 washi dark `#7ba6cf24` fill vs `#a3c4e2` border. Banner.tsx:8-10: 'It carries no outline: an edge in the tone colour draws the announcement twice.'

### P5. Alert

- file: `packages/core/src/Alert/Alert.tsx`
- evidence: Alert.tsx:19 `padding: semanticTokens.spacingMd` vs Banner.tsx:23-24 and Toast.tsx:67-68, both `paddingBlock: spacingMd, paddingInline: spacingLg`.

### P6. Toast

- file: `packages/core/src/Toast/Toast.tsx`
- evidence: Toast.tsx:91-106: `title` and `description` differ in exactly one declaration — `color: colorText` vs `color: colorTextMuted`. Both carry `fontSize: fontSizeSm`, `letterSpacing: letterSpacingBody`, `lineHeight: lineHeightBody`, `fontFamily: fontFamilyBody`.

### P7. StatusDot

- file: `packages/core/src/StatusDot/StatusDot.tsx`
- evidence: StatusDot.tsx:26 `readonly tone?: StatusTone;` and StatusDot.tsx:14-17 covering only info/success/warning/danger, against Badge.tsx:10 `export type BadgeTone = 'neutral' | StatusTone;`.

### P8. Spinner

- file: `packages/core/src/Spinner/Spinner.tsx`
- evidence: Spinner.tsx:32-33 `height: semanticTokens.spacingLg, width: semanticTokens.spacingLg` with no size prop (SpinnerProps, lines 37-42, exposes only `label`); consumed unsized at AsyncState.tsx:44.

### P9. AspectRatio

- file: `packages/core/src/AspectRatio/AspectRatio.tsx`
- evidence: L5-10 `frame: {display: 'block', overflow: 'hidden', position: 'relative', width: '100%'}` — `overflow: hidden` with no radius, against `Box.tsx:18` `radiusInner: {borderRadius: semanticTokens.radiusInner}`

### P10. Divider

- file: `packages/core/src/Divider/Divider.tsx`
- evidence: L8 `border: 0,` sitting above L9-11 `borderBlockStartColor / borderBlockStartStyle / borderBlockStartWidth`; `grep -rn "border: " packages/core/src --include="*.tsx"` returns this line and nothing else

### P11. Layout

- file: `packages/core/src/Layout/Layout.tsx`
- evidence: Layout.tsx:25 `borderInlineStartColor: semanticTokens.borderStrong` (aside), :51 (pageHead), :82 (footer) against `Divider.tsx:9` `borderBlockStartColor: semanticTokens.borderDefault` and `TopNav.tsx:14` `borderBlockEndColor: semanticTokens.borderDefault`

### P12. Divider

- file: `apps/storybook/stories/Divider.stories.tsx`
- evidence: L16-22 `render: (args) => (<DemoFrame><Divider {...args} /></DemoFrame>)` — no plate, against `support/StoryFrame.tsx:30-40` `plateStyle`

### P13. Outline

- file: `packages/core/src/Outline/Outline.tsx`
- evidence: Outline.tsx:18 `borderInlineStartWidth: semanticTokens.focusWidth,` against NavItem.tsx:9 `const markWidth = calc(2 * borderWidth)` and TabList.tsx:9 `const selectedMarkWidth = calc(2 * borderWidth)`. focus-width is 2px at packages/themes/kioku/src/theme.css:130.

### P14. Outline

- file: `packages/core/src/Outline/Outline.tsx`
- evidence: Outline.tsx:52-54 `depth1: {paddingInlineStart: spacingMd}` (10px), `depth2: {… spacingXl}` (20px), `depth3: {… spacing2xl}` (28px).

### P15. Breadcrumbs

- file: `packages/core/src/Breadcrumbs/Breadcrumbs.tsx`
- evidence: Breadcrumbs.tsx:32-33 `fontSize: semanticTokens.fontSizeXs, letterSpacing: semanticTokens.letterSpacingEyebrow` on a default `separator = '/'` (:90), with symmetric `columnGap: semanticTokens.spacingXs` either side (:22). NavIcon.tsx:19-20 — "One glyph, so it is set solid: tracking has nothing to open here."

### P16. Breadcrumbs

- file: `packages/core/src/Breadcrumbs/Breadcrumbs.tsx`
- evidence: Breadcrumbs.tsx:60-63 `':hover': {color: colorText, textDecorationLine: 'underline'}` with no `textDecorationThickness`/`textUnderlineOffset`, against LinkProvider.tsx:29-30 `textDecorationThickness: semanticTokens.borderWidth, textUnderlineOffset: underlineOffset` — and LinkProvider.tsx:73-78, where the caller's class replaces the default rather than merging.

### P17. MobileNav

- file: `packages/core/src/MobileNav/MobileNav.tsx`
- evidence: MobileNav.tsx:58-66 `title: {fontFamily: semanticTokens.fontFamilyHeading, fontSize: fontSizeLg, fontWeight: fontWeightMedium, letterSpacing: letterSpacingHeading, …}` vs Dialog.tsx:51-61 with `fontFamily: semanticTokens.fontFamilyDisplay` (:56) and otherwise identical values. Faces at packages/themes/kioku/src/theme.css:135-137 (heading = sans) and :241 (display = 'Shippori Mincho').

### P18. TopNavMegaMenuFeaturedCard

- file: `packages/core/src/TopNavMegaMenu/TopNavMegaMenu.tsx`
- evidence: TopNavMegaMenu.tsx:240 `{media}` rendered bare inside `card` (:114-134, `padding: semanticTokens.spacingMd`, `borderRadius: semanticTokens.radiusInner`). CardHeader.tsx:11-15 is the reference for a child that bleeds to the container's edge.

### P19. Pagination

- file: `packages/core/src/Pagination/Pagination.tsx`
- evidence: Pagination.tsx:128-134 `ellipsis: {… paddingInline: semanticTokens.spacingXs}` with no `minWidth`/`height`, against `page` at :95-99 `height: sizeControlSm, minWidth: sizeControlSm`. Digit-to-digit centre spacing 34px; digit-to-ellipsis roughly 21px.

### P20. TopNav

- file: `packages/core/src/TopNav/TopNav.tsx`
- evidence: TopNav.tsx:37/40 `fontSize: semanticTokens.fontSizeLg` with `letterSpacing: semanticTokens.letterSpacingLabel`; compare MobileNav.tsx:61/63 and Dialog.tsx:57/58, both `fontSizeLg` + `letterSpacingHeading`.

### P21. Slider

- file: `packages/core/src/Slider/Slider.tsx`
- evidence: Slider.tsx:41 `linear-gradient(to right, ${semanticTokens.colorAccent} 0 var(--kioku-ui-slider-progress)…)` against ProgressBar.tsx:27 `backgroundColor: semanticTokens.colorText`

### P22. Slider

- file: `packages/core/src/Slider/Slider.tsx`
- evidence: Slider.tsx:94 `blockSize: semanticTokens.sizeHitTarget` (44px) with Slider.tsx:49 `trackThickness = semanticTokens.spacingSm` (6px) and the ring declared on the same element at Slider.tsx:134-139

### P23. Slider

- file: `packages/core/src/Slider/Slider.tsx`
- evidence: Slider.tsx:70-79 `readout: {flexShrink: 0, fontVariantNumeric: 'tabular-nums', textAlign: 'end'}` with no `minInlineSize`, against Slider.tsx:96-97 `control: {flexShrink: 1, inlineSize: '100%'}`

### P24. Typeahead

- file: `packages/core/src/Typeahead/Typeahead.tsx`
- evidence: Typeahead.tsx:101 `paddingInline: semanticTokens.spacingMd` on `option` versus Typeahead.tsx:44 `paddingInline: semanticTokens.spacingSm` on `input`, with Typeahead.tsx:83 `insetInline: 0` on the panel; theme.css: spacing-sm 6px, spacing-md 10px, border-width 1px

### P25. TypeaheadItem

- file: `packages/core/src/TypeaheadItem/TypeaheadItem.tsx`
- evidence: apps/storybook/stories/Typeahead.stories.tsx:17-26 `const handRolledList = {backgroundColor: 'var(--kioku-ui-color-surface-raised)', boxShadow: 'var(--kioku-ui-elevation-medium)', …}` reproducing Typeahead.tsx:78-89 `panel`, which is not exported

### P26. EmptyState

- file: `packages/core/src/EmptyState/EmptyState.tsx`
- evidence: EmptyState.tsx:6 `calc(${spacing2xl} + ${spacing2xl} + … )` ×10 = 280px compact, 380px under `[data-theme][data-density='standard']` (theme.css:191-196). Thumbnail.tsx:9 writes the same idea correctly as `calc(2 * ${sizeControlLg})` with a comment saying exactly why a picture box must not bend with density. EmptyState.tsx:32 `gap: semanticTokens.spacingSm` duplicates :21.

### P27. Eyebrow

- file: `packages/core/src/Eyebrow/Eyebrow.tsx`
- evidence: `grep -l letterSpacingEyebrow packages/core/src/*/*.tsx` returns 19 files; `grep -rn '<Eyebrow'` across packages/core/src returns only Eyebrow's own test and doc. Drift: Eyebrow.tsx:15 `lineHeightHeading` vs MetadataList.tsx:32 and Thumbnail.tsx:44 `lineHeightBody` vs Table.tsx:76-84 which sets no lineHeight at all. Case: Eyebrow.doc.ts:14 `<Eyebrow>Recent activity</Eyebrow>` against templates/pages/payment-form/PaymentFormPage.tsx:104 `<Eyebrow>CHECKOUT</Eyebrow>`.

### P28. Thumbnail

- file: `packages/core/src/Thumbnail/Thumbnail.tsx`
- evidence: Thumbnail.tsx:39-47 `fontFamily: fontFamilyHeading, fontSize: fontSizeXs, letterSpacing: letterSpacingEyebrow, lineHeight: semanticTokens.lineHeightBody` against Eyebrow.tsx:15 `lineHeight: semanticTokens.lineHeightHeading`. Rendered at Thumbnail.tsx:80.

### P29. CodeBlock

- file: `packages/core/src/CodeBlock/CodeBlock.tsx`
- evidence: CodeBlock.tsx:70 `readonly language?: string` → CodeBlock.tsx:97 `{'data-language': language}` and no other use; CodeBlock.doc.ts:15 concedes it "Records which language the source is in". CodeBlock.stories.tsx:29 passes `language="tsx"` and the specimen shows nothing.

### P30. Timestamp

- file: `packages/core/src/Timestamp/Timestamp.tsx`
- evidence: Timestamp.tsx:10 `color: semanticTokens.colorTextSecondary` and :12 `fontSize: semanticTokens.fontSizeSm`, against Numeral.tsx:12-16 which sets face, tabular figures and tracking and deliberately nothing else — its comment: "A figure inside a 30px metric is 30px and the same figure in a 12.5px table row is 12.5px".

### P31. Icon

- file: `packages/core/src/Icon/Icon.tsx`
- evidence: Icon.tsx:14-16: `sizeSm` = fontSizeSm = 12.5px, `sizeMd` = fontSizeMd = 13.5px, `sizeLg` = fontSizeLg = 16px (theme.css:142-144), against `sizeControlSm` 24px (theme.css:167). `grep -o 'size="[a-z]*"'` over the core's `<Icon>` call sites returns 3 × sm, 2 × md, 0 × lg.

### P32. TreeList

- file: `packages/core/src/TreeList/TreeList.tsx`
- evidence: TreeList.tsx:16 ``const selectionMark = `inset ${semanticTokens.focusWidth} 0 0 0 ${semanticTokens.colorAccent}`;`` against NavItem.tsx:9 ``const markWidth = `calc(2 * ${semanticTokens.borderWidth})`;`` and Table.tsx:34 ``const selectionRule = `inset calc(2 * ${semanticTokens.borderWidth}) 0 0 ${semanticTokens.colorAccent}`;``

### P33. OverflowList

- file: `packages/core/src/OverflowList/OverflowList.tsx`
- evidence: OverflowList.tsx:19-23 `label: {fontFamily: fontFamilyBody, fontSize: fontSizeSm, letterSpacing: letterSpacingLabel}` against Button.tsx:16 `fontFamily: semanticTokens.fontFamilyBody` and Button.tsx:42-44 `sm: {fontSize: semanticTokens.fontSizeSm, letterSpacing: semanticTokens.letterSpacingLabel, …}`.

### P34. OverflowList

- file: `packages/core/src/OverflowList/OverflowList.tsx`
- evidence: OverflowList.tsx:86-87 `{overflowLabel} (` then `<span {...stylex.props(styles.count)}>{hidden.length}</span>)` — the two parens are bare text nodes outside the mono span.

### P35. Button

- file: `packages/core/src/Button/Button.tsx`
- evidence: Button.tsx:195-196 `{loading ? <SpinnerVisual /> : null}` then `{iconOnly && loading ? null : children}`; Spinner.tsx:32-33 fixes the ring at `height/width: spacingLg` (14px) regardless of button size; Button.tsx:18 `gap: spacingSm` (6px).

### P36. Link

- file: `packages/core/src/navigation/LinkProvider.tsx`
- evidence: LinkProvider.tsx:15 `const underlineOffset = '0.2em';` against Part 2 §3 "Zero bare px/rem/em. A missing dimension is a named calc() over spacing tokens."

### P37. DropdownMenuItem

- file: `packages/core/src/DropdownMenu/DropdownMenu.tsx`
- evidence: DropdownMenu.tsx:163-170 props are description/leading/trailing only; DropdownMenu.stories.tsx:58 `<DropdownMenuItem disabled>Delete</DropdownMenuItem>`. Compare Button.tsx:110-120 `destructive` using statusDangerSurface/statusDangerText as a matched pair.

### P38. IconButton

- file: `apps/storybook/stories/IconButton.stories.tsx`
- evidence: IconButton.stories.tsx:26 `children: '×'`, :35 `+`, :41-42 `←`, :48-50 `×`, :56-58 `−`, :111 `↗`, :131 `✓`. Not one `<Icon>` in the file.

### P39. ButtonGroup

- file: `apps/storybook/stories/ButtonGroup.stories.tsx`
- evidence: ButtonGroup.stories.tsx:47-49 `<ButtonGroup {...args} label="Alignment"><AlignmentGroup /></ButtonGroup>` where AlignmentGroup (lines 28-40) is `<ButtonGroup label="Alignment">…</ButtonGroup>`.

### P40. ToggleButton

- file: `apps/storybook/stories/ToggleButton.stories.tsx`
- evidence: ToggleButton.stories.tsx:25-39 `States` renders only `{label: 'off'}` and `{label: 'on'}`, with no play function, against ToggleButton.tsx:70-83 (`:active:not(:disabled)` and `:hover:not(:disabled):not(:active)` each repainting four border colours) and :40-45 (focus ring). Compare Button.stories.tsx:62-109.

### P41. Tooltip

- file: `packages/core/src/Tooltip/Tooltip.tsx`
- evidence: Tooltip.tsx:23-25 `// … the scale stops at 38px, so the cap is a named multiple of it` / `const surfaceMaxWidth = calc(${semanticTokens.spacing2xl} * 8)`. spacing2xl is 28px in compact (themes.test.ts:288), which Theme.tsx:162 makes the default.

### P42. Tooltip

- file: `packages/core/src/Tooltip/Tooltip.tsx`
- evidence: Tooltip.tsx:34-36 `fontSize: semanticTokens.fontSizeSm, letterSpacing: semanticTokens.letterSpacingLabel, lineHeight: semanticTokens.lineHeightBody`. The story content is "Saves the current draft" (Tooltip.stories.tsx:20). Popover, holding the same kind of copy, correctly pairs `letterSpacingBody` with `lineHeightBody` (Popover.tsx:25-27).

### P43. Popover / Tooltip

- file: `packages/core/src/Popover/Popover.tsx`
- evidence: Popover.tsx:18-32 and Tooltip.tsx:27-44 declare no `animationName` and no `transition*` longhands. Compare Overlay.tsx:9-12 + :17-22 (scrimEnter), Dialog.tsx:13-16 + :20-25 (surfaceEnter), BottomSheet.tsx:7-10 + :14-19 (sheetEnter) — all three with `'@media (prefers-reduced-motion: reduce)': 'none'` inside animationName.

### P44. Layer

- file: `apps/storybook/stories/Layer.stories.tsx`
- evidence: Layer.stories.tsx:22-23 "The card below is portalled to the document body, so it escapes this container entirely." against Layer.tsx:36 `return createPortal(children, container ?? theme?.root ?? document.body);` and the doc comment at Layer.tsx:16-22 explaining that body "is what every floating surface in this library was doing".

### P45. SiteHeader — wordmark

- file: `apps/docsite/src/layout/SiteHeader.tsx`
- evidence: `<a href={routeHref('home')} … style={{alignItems: 'baseline', color: …, display: 'inline-flex', gap: …, textDecoration: 'none'}}>` (415-424) — no `:focus-visible`, no hover, against NavItem.tsx:51-56 and :58-64 used for the links beside it.

### P46. Components index — live region

- file: `apps/docsite/src/pages/ComponentsPage.tsx`
- evidence: `<Text aria-live="polite" …>{query === '' ? '' : copy.matches(matches, query)}</Text>` (287-289) as the last child of `<Stack gap="md">` (232). Text.tsx renders a `<p>` with `margin: 0`; flex `gap` applies between items regardless of item size.

### P47. Components index — search box label

- file: `apps/docsite/src/pages/ComponentsPage.tsx`
- evidence: `<TextInput aria-label={copy.search} … placeholder={copy.search} …>` (254-261), no `Field`, no eyebrow — against ComponentsPage.tsx:175 and ThemesPage.tsx:739/754/766. The comment at line 103 also still says the hint sits 'above the field'; it sits beside it.

### P48. TemplatesPage — planned rows and the provider region

- file: `apps/docsite/src/pages/TemplatesPage.tsx`
- evidence: `borderStyle: 'dashed'` at 864 (PlannedRow) and 405 (the provider-form sketch); `grep -rn dashed packages/core/src` returns nothing. Every other border on these pages is `var(--kioku-ui-border-style)`.

### P49. Calendar

- file: `packages/core/src/Calendar/Calendar.tsx`
- evidence: Calendar.tsx:319 and :344 `size="sm"`; Calendar.tsx:70/:90/:98 `width: semanticTokens.sizeControlMd`; theme.css:167-168 sm 24px, md 28px. 7 × 28 = 196px table width; space-between over 196 with 24px end items → centres at 12 and 184 against column centres 14 and 182.

### P50. Calendar

- file: `packages/core/src/Calendar/Calendar.tsx`
- evidence: Calendar.tsx:19 `const todayDotSize = semanticTokens.spacingXs` (3px) vs StatusDot.tsx:11-12 `height/width: semanticTokens.spacingSm` (6px) and Toast.tsx:24 `const dotSize = \`calc(2 * ${semanticTokens.spacingXs})\`` (6px).

### P51. FileInput

- file: `packages/core/src/FileInput/FileInput.tsx`
- evidence: FileInput.tsx:116-117 `fontSize: semanticTokens.fontSizeSm, letterSpacing: semanticTokens.letterSpacingLabel` vs Field.tsx:56-57 and FieldStatus.tsx:25-29, both `fontSizeSm` + `letterSpacingBody` for the same line in the same position.

