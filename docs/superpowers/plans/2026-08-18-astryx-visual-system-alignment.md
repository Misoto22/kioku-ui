# Astryx Visual System Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scaffold-level Kioku UI appearance with a coherent, themeable visual system whose proportions, hierarchy, interaction states, compositions, and Storybook coverage meet the approved Astryx-aligned design specification.

**Architecture:** Expand the public semantic token contract first, then normalize component families against those roles, and only then rebuild Storybook around one accurately typed component owner per story module. Core owns semantic structure and behavior; `@misoto22/kioku-ui-theme-kioku` owns all raw visual values; Storybook owns realistic, bounded fixtures; internal policy tests enforce documentation and story architecture. Visual evidence, accessibility scope, package consumers, and release metadata are updated only after the component implementation is stable.

**Tech Stack:** React 19, TypeScript 6, StyleX, Vitest 4, React Testing Library, Storybook 10, Playwright, axe-core, pnpm 11, Changesets.

**Spec:** `docs/superpowers/specs/2026-08-18-astryx-visual-system-alignment-design.md`

## Global Constraints

- Use English for identifiers, code comments, commit messages, public API text, and Storybook fixture copy.
- Follow the approved 4px spacing grid, 28/32/36px control scale, and 4/8/12/full radius roles. Do not add component-local arbitrary spacing or radius values.
- Keep raw colors, font stacks, shadow values, and concrete geometry values in `packages/themes/kioku`; core may consume only semantic StyleX variables.
- Core must never branch on or otherwise name `washi`, `muji`, or `sumi`.
- Do not retain the pre-release `radiusSm`, `radiusMd`, `radiusLg`, `radiusRound`, or single-control-size aliases. This work corrects the unpublished contract rather than layering compatibility aliases on it.
- Preserve native HTML semantics, controlled/uncontrolled behavior, keyboard behavior, and host-styleable prop forwarding while adding visual states.
- Do not add charts, Kioku routes, API types, translations, persistence, domain pages, or Console migration code.
- Do not add an icon/illustration dependency. Story fixtures may use existing slots and text-safe inline shapes.
- Use strict RED/GREEN development. Capture the focused failing command before production edits, rerun the same command green, then run the task's package gates.
- Commit each task independently with the exact conventional commit shown. Do not push or publish.

---

### Task 1: Replace the semantic token contract and implement it in every Kioku theme

**Files:**
- Modify: `packages/core/src/tokens/contracts.ts`
- Modify: `packages/core/src/tokens/contracts.test.ts`
- Modify: `packages/core/src/authoring.stylex.ts`
- Modify: `packages/core/src/package-build.test.ts`
- Modify: `packages/core/src/components/Alert.tsx`
- Modify: `packages/core/src/components/Badge.tsx`
- Modify: `packages/core/src/components/Button.tsx`
- Modify: `packages/core/src/components/Card.tsx`
- Modify: `packages/core/src/components/IconButton.tsx`
- Modify: `packages/core/src/components/MetricGrid.tsx`
- Modify: `packages/core/src/components/SegmentedControl.tsx`
- Modify: `packages/core/src/components/Skeleton.tsx`
- Modify: `packages/core/src/components/Spinner.tsx`
- Modify: `packages/core/src/components/StatusDot.tsx`
- Modify: `packages/core/src/components/TextArea.tsx`
- Modify: `packages/core/src/components/TextInput.tsx`
- Modify: `packages/core/src/components/Toggle.tsx`
- Modify: `packages/themes/kioku/src/themes.ts`
- Modify: `packages/themes/kioku/src/themes.test.ts`
- Modify: `packages/themes/kioku/src/theme.css`
- Modify: `packages/themes/kioku/src/package-build.test.ts`

**Interfaces:**
- Consumes: the existing `ThemeDefinition`, `validateThemeDefinition`, `tokenNames`, `tokenCustomProperties`, and StyleX source-distribution bridge.
- Produces: the final pre-release `TokenContract`, a one-to-one `semanticTokens` StyleX bridge, and complete Washi/Muji/Sumi light-dark implementations.
- Keeps: `status.*`, `focus.*`, `elevation.*`, `motion.*`, spacing key names, and public theme IDs.
- Removes: `radius.sm`, `radius.md`, `radius.lg`, `radius.round`, and the full pre-release `density` group.

- [ ] **Step 1: Write failing contract-shape and legacy-role tests**

Add exact shape assertions to `contracts.test.ts`:

```ts
expect(tokenContract.color).toEqual({
  canvas: 'color.canvas',
  surface: 'color.surface',
  surfaceRaised: 'color.surfaceRaised',
  surfaceMuted: 'color.surfaceMuted',
  text: 'color.text',
  textSecondary: 'color.textSecondary',
  textMuted: 'color.textMuted',
  textOnAccent: 'color.textOnAccent',
  accent: 'color.accent',
  accentHover: 'color.accentHover',
  accentActive: 'color.accentActive',
  overlayHover: 'color.overlayHover',
  overlayActive: 'color.overlayActive',
  disabledSurface: 'color.disabledSurface',
  disabledText: 'color.disabledText',
  focus: 'color.focus',
});

expect(tokenContract.radius).toEqual({
  inner: 'radius.inner',
  element: 'radius.element',
  container: 'radius.container',
  page: 'radius.page',
  full: 'radius.full',
});

expect(tokenContract.size).toEqual({
  controlSm: 'size.controlSm',
  controlMd: 'size.controlMd',
  controlLg: 'size.controlLg',
  hitTarget: 'size.hitTarget',
});

expect(tokenNames).not.toEqual(
  expect.arrayContaining(['radius.sm', 'radius.round', 'density.controlBlock']),
);
```

Also assert the exact border roles and the added `fontFamilyDisplay`, `fontSizeXs`, and `fontSize2xl` typography roles.

- [ ] **Step 2: Write failing theme completeness, geometry, palette, and typography tests**

In `themes.test.ts`, replace the old density-control assertions with tests that resolve every new private token reference and assert:

```ts
expect(resolveThemeValue('washi', 'spacing.xs')).toBe('4px');
expect(resolveThemeValue('washi', 'spacing.2xl')).toBe('32px');
expect(resolveThemeValue('washi', 'size.controlSm')).toBe('28px');
expect(resolveThemeValue('washi', 'size.controlMd')).toBe('32px');
expect(resolveThemeValue('washi', 'size.controlLg')).toBe('36px');
expect(resolveThemeValue('washi', 'size.hitTarget')).toBe('44px');
expect(resolveThemeValue('washi', 'radius.inner')).toBe('4px');
expect(resolveThemeValue('washi', 'radius.element')).toBe('8px');
expect(resolveThemeValue('washi', 'radius.container')).toBe('12px');
```

Assert Washi's required light values (`#F5F4EF`, `#FFFFFF`, `#ECEAE2`, `#24251F`, `#62645B`, `#4F6751`, `#315F77`), `light-dark()` coverage for every color/border/status/elevation role, and sans-serif component heading stacks for all themes. Keep Chinese fallbacks theme-scoped and assert that only `fontFamilyDisplay` may resolve to a serif stack.

- [ ] **Step 3: Run RED for both packages**

Run:

```bash
pnpm -F @misoto22/kioku-ui test -- src/tokens/contracts.test.ts src/package-build.test.ts
pnpm -F @misoto22/kioku-ui-theme-kioku test -- src/themes.test.ts src/package-build.test.ts
```

Expected: failures for missing semantic roles, retained legacy roles, missing theme values, and old font/geometry values.

- [ ] **Step 4: Implement the exact public contract and StyleX bridge**

Define these groups in `contracts.ts`:

```ts
type ColorRole =
  | 'canvas' | 'surface' | 'surfaceRaised' | 'surfaceMuted'
  | 'text' | 'textSecondary' | 'textMuted' | 'textOnAccent'
  | 'accent' | 'accentHover' | 'accentActive'
  | 'overlayHover' | 'overlayActive'
  | 'disabledSurface' | 'disabledText' | 'focus';
type BorderRole =
  | 'default' | 'strong' | 'interactive' | 'disabled' | 'width' | 'style';
type RadiusRole = 'inner' | 'element' | 'container' | 'page' | 'full';
type SizeRole = 'controlSm' | 'controlMd' | 'controlLg' | 'hitTarget';
```

Add `readonly size: Roles<'size', SizeRole>` to `TokenContract`. Retain spacing keys `xs/sm/md/lg/xl/2xl`, mapped by themes to `4/8/12/16/24/32px`. Remove the full `density` group: fixed control height now belongs to `size`, while component padding and gaps consume the shared spacing scale.

Mirror every role once in `authoring.stylex.ts` using the generated public custom-property name. Do not define fallbacks or raw values in the bridge.

- [ ] **Step 5: Migrate existing component references off the removed token names**

Make the mechanical semantic substitutions required to keep this commit independently buildable:

- `densityControlBlock` → `sizeControlMd`;
- `densityControlInline` → `spacingMd`;
- `densityItemGap` → `spacingSm`;
- control/input/alert/skeleton `radiusSm` → `radiusElement`;
- Card `radiusMd` → `radiusContainer`;
- Badge/StatusDot/Spinner/Toggle track `radiusRound` → `radiusFull`;
- SegmentedControl root → `radiusElement`, selected item → `radiusInner`;
- MetricGrid item → `radiusContainer`.

Do not add new variants or state behavior in this mechanical step; Tasks 2–5 own those changes.

- [ ] **Step 6: Implement and verify the Washi dictionary and CSS values**

Update `themeTokenReferences()` so each theme owns a separately frozen dictionary for every new role. Implement the approved Washi palette exactly. Use alpha values for `overlayHover` and `overlayActive`; do not fake them with opaque surface replacements.

Set the default interface type scale to 12/14/16/20/28px, body copy to 14px, and make `fontFamilyHeading` sans-serif for all three themes. Preserve Mincho/serif faces only in `fontFamilyDisplay`.

- [ ] **Step 7: Implement and verify Muji and Sumi against the same contract**

Give Muji and Sumi distinct concrete palettes while preserving Washi's geometry, type scale, and state-role semantics. Run the focused theme contract test after each theme is complete so a missing role is localized to one dictionary.

- [ ] **Step 8: Strengthen public-build coverage**

Extend `packages/core/src/package-build.test.ts` to assert emitted CSS contains each new `--kioku-ui-*` bridge and none of the removed legacy properties. Extend the theme package consumer to typecheck representative new `TokenName` values and verify `dist/theme.css` resolves them through the public package.

- [ ] **Step 9: Run GREEN and package gates**

Run:

```bash
pnpm -F @misoto22/kioku-ui test -- src/tokens/contracts.test.ts src/package-build.test.ts
pnpm -F @misoto22/kioku-ui-theme-kioku test -- src/themes.test.ts src/package-build.test.ts
pnpm -F @misoto22/kioku-ui typecheck
pnpm -F @misoto22/kioku-ui-theme-kioku typecheck
pnpm -F @misoto22/kioku-ui build
pnpm -F @misoto22/kioku-ui-theme-kioku build
```

Expected: all commands exit 0 and both packages emit only the new contract.

- [ ] **Step 10: Commit the token and theme correction**

```bash
git add packages/core/src/tokens packages/core/src/authoring.stylex.ts \
  packages/core/src/package-build.test.ts packages/core/src/components/Alert.tsx \
  packages/core/src/components/Badge.tsx packages/core/src/components/Button.tsx \
  packages/core/src/components/Card.tsx packages/core/src/components/IconButton.tsx \
  packages/core/src/components/MetricGrid.tsx \
  packages/core/src/components/SegmentedControl.tsx \
  packages/core/src/components/Skeleton.tsx packages/core/src/components/Spinner.tsx \
  packages/core/src/components/StatusDot.tsx packages/core/src/components/TextArea.tsx \
  packages/core/src/components/TextInput.tsx packages/core/src/components/Toggle.tsx \
  packages/themes/kioku/src
git commit -m "feat: establish Astryx visual token contract"
```

### Task 2: Normalize Button, IconButton, Badge, and StatusDot

**Files:**
- Modify: `packages/core/src/components/Button.tsx`
- Modify: `packages/core/src/components/IconButton.tsx`
- Modify: `packages/core/src/components/Badge.tsx`
- Modify: `packages/core/src/components/StatusDot.tsx`
- Modify: `packages/core/src/components/controls.test.tsx`
- Modify: `packages/core/src/components/Button.doc.ts`
- Modify: `packages/core/src/components/IconButton.doc.ts`
- Modify: `packages/core/src/components/Badge.doc.ts`
- Modify: `packages/core/src/components/StatusDot.doc.ts`
- Modify: `packages/core/src/components/index.ts`
- Modify: `packages/core/src/package-build.test.ts`

**Interfaces:**
- Produces: `ControlSize`, `ButtonVariant`, `ButtonProps.loading`, `IconButtonProps.loading`, and `BadgeTone`.
- Defaults: `size="md"`, `variant="primary"`, `loading={false}`, `Badge tone="neutral"`.
- Loading contract: retain the accessible name, set `aria-busy="true"`, prevent activation through native disabled behavior, and render an aria-hidden progress visual.

- [ ] **Step 1: Add failing public API and style-contract tests**

Change the StyleX mock in `controls.test.tsx` to expose a serialized `data-stylex-contract`, then add tests for:

```tsx
renderUi(
  <>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
    <Button variant="destructive">Delete</Button>
    <Button loading onClick={action}>Save changes</Button>
  </>,
);

expect(screen.getByRole('button', {name: 'Small'})).toHaveStyle({height: 'var(--kioku-ui-size-control-sm)'});
expect(screen.getByRole('button', {name: 'Medium'})).toHaveStyle({height: 'var(--kioku-ui-size-control-md)'});
expect(screen.getByRole('button', {name: 'Large'})).toHaveStyle({height: 'var(--kioku-ui-size-control-lg)'});
expect(screen.getByRole('button', {name: 'Save changes'})).toBeDisabled();
expect(screen.getByRole('button', {name: 'Save changes'})).toHaveAttribute('aria-busy', 'true');
```

Add equivalent size/variant/loading coverage for `IconButton`, all five Badge tones, and an assertion that StatusDot remains non-color-only through its required accessible label.

- [ ] **Step 2: Run RED**

Run: `pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/package-build.test.ts`

Expected: type/runtime failures for the new props and missing semantic state styles.

- [ ] **Step 3: Implement Button types, sizing, variants, and loading behavior**

Export:

```ts
export type ControlSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  readonly loading?: boolean;
  readonly size?: ControlSize;
  readonly variant?: ButtonVariant;
}
```

Button uses semantic recipes for rest, `:hover`, `:active`, `:focus-visible`, `:disabled`, and loading. Primary uses `accent/accentHover/accentActive` with `textOnAccent`; secondary uses surface/border roles; ghost uses transparent overlays; destructive uses danger surface/text roles. Fixed visual heights must resolve to 28/32/36px.

- [ ] **Step 4: Apply the same action contract to IconButton**

`IconButtonProps` consumes the same `ControlSize` and `ButtonVariant`. Reuse the state-role mapping rather than maintaining an unrelated circular treatment. Use a pseudo-element hit area so the pointer target reaches 44px without changing the visible 28/32/36px control or adding a semantic wrapper around the native button.

- [ ] **Step 5: Separate neutral Badge tone from semantic status tone**

Keep `StatusTone = 'info' | 'success' | 'warning' | 'danger'` for feedback components and add:

```ts
export type BadgeTone = 'neutral' | StatusTone;
```

Neutral Badge uses muted-surface and secondary-text roles. Do not broaden Alert/Field/StatusDot to a meaningless neutral status.

- [ ] **Step 6: Update exports, docs metadata, and public runtime tests**

Export the new types from `components/index.ts`. Document `size`, `variant`, `loading`, and `tone` in the matching `.doc.ts` records. Extend `package-build.test.ts` with an external TypeScript consumer that imports and assigns every new public union.

- [ ] **Step 7: Run GREEN and package gates**

Run:

```bash
pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/docs/index.test.ts src/package-build.test.ts
pnpm -F @misoto22/kioku-ui typecheck
pnpm -F @misoto22/kioku-ui build
```

- [ ] **Step 8: Commit the action family**

```bash
git add packages/core/src/components packages/core/src/package-build.test.ts
git commit -m "feat: normalize action controls"
```

### Task 3: Normalize fields, text controls, Toggle, and SegmentedControl

**Files:**
- Modify: `packages/core/src/components/Field.tsx`
- Modify: `packages/core/src/components/TextInput.tsx`
- Modify: `packages/core/src/components/TextArea.tsx`
- Modify: `packages/core/src/components/Toggle.tsx`
- Modify: `packages/core/src/components/SegmentedControl.tsx`
- Modify: `packages/core/src/components/controls.test.tsx`
- Modify: `packages/core/src/components/Field.doc.ts`
- Modify: `packages/core/src/components/TextInput.doc.ts`
- Modify: `packages/core/src/components/TextArea.doc.ts`
- Modify: `packages/core/src/components/Toggle.doc.ts`
- Modify: `packages/core/src/components/SegmentedControl.doc.ts`
- Modify: `packages/core/src/components/index.ts`

**Interfaces:**
- Preserves: current controlled/uncontrolled input, textarea, Toggle, and SegmentedControl contracts and keyboard semantics.
- Produces: `FieldNecessity = 'required' | 'optional'` and `FieldProps.necessity?: FieldNecessity`.
- Visual contract: default TextInput is 32px high; TextArea shares borders, typography, padding, and states but uses a content-appropriate minimum height.

- [ ] **Step 1: Add failing field hierarchy and native-state tests**

Add tests proving a required/optional annotation is connected to the visible label, a required Field supplies native `required` to TextInput/TextArea unless the control explicitly provides its own value, description uses `color.textSecondary`, status uses the selected status text role, and `disabled`, `readOnly`, `aria-invalid`, placeholder, and focus-visible recipes use the shared semantic roles.

Add Toggle structure assertions for a track and aria-hidden thumb plus a 44px hit target. Add SegmentedControl style-contract assertions for one muted group surface, one raised selected segment, and no independent border around every option.

- [ ] **Step 2: Run RED**

Run: `pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/docs/index.test.ts`

Expected: failures for missing necessity metadata, missing state recipes, and the old dot/outlined-segment rendering.

- [ ] **Step 3: Implement Field hierarchy and necessity annotation**

Add `FieldNecessity`, render the required/optional annotation inside the label row, and keep its description/status IDs in the existing accessible description chain. Extend `FieldContextValue` with `required: boolean`; TextInput/TextArea consume it as their native required default while an explicit control prop wins. Use primary label, secondary description, muted annotation, and semantic status roles. Do not infer required state from child elements by inspecting React children.

- [ ] **Step 4: Implement the shared TextInput/TextArea visual contract**

Use one internal StyleX recipe shape in `TextInput.tsx` and mirror it in `TextArea.tsx` without exporting a new styling utility:

```ts
const controlStyles = stylex.create({
  base: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusElement,
    color: semanticTokens.colorText,
    fontSize: semanticTokens.fontSizeMd,
    ':focus-visible': {borderColor: semanticTokens.borderInteractive},
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
    },
  },
});
```

Use the focus width/offset and color roles for the visible ring. Read-only remains legible and distinct from disabled. Invalid state uses danger roles without replacing the focus ring. Do not set `width: 100%` in the components; parent composition controls width.

Set TextInput to `boxSizing: 'border-box'` and `height: sizeControlMd`. Set TextArea to the same border/padding/type recipe with an off-grid-free minimum height of 96px.

- [ ] **Step 5: Implement the Toggle track, thumb, and hit target**

Toggle remains a native button with `role="switch"` and existing controlled/uncontrolled behavior. Render a track and thumb, move the thumb from logical start to end when checked, expose a 44px hit area, and apply focus/disabled styles to the root.

- [ ] **Step 6: Implement the SegmentedControl container and selected state**

SegmentedControl keeps the radiogroup/roving-tabindex behavior. The root owns the muted surface, padding, and container radius; the selected option owns the raised surface and low elevation; unselected hover/active options use overlay roles. Preserve vertical arrow-key behavior and disabled-option skipping.

- [ ] **Step 7: Update docs and public types**

Document `necessity`, controlled/uncontrolled value props, native disabled/read-only/invalid states, and selection behavior. Export `FieldNecessity` from the component barrel.

- [ ] **Step 8: Run GREEN and package gates**

Run:

```bash
pnpm -F @misoto22/kioku-ui test -- src/components/controls.test.tsx src/docs/index.test.ts
pnpm -F @misoto22/kioku-ui typecheck
pnpm -F @misoto22/kioku-ui build
```

- [ ] **Step 9: Commit the form and selection family**

```bash
git add packages/core/src/components
git commit -m "feat: normalize form and selection controls"
```

### Task 4: Normalize typography, layout primitives, and Card composition

**Files:**
- Modify: `packages/core/src/components/Text.tsx`
- Modify: `packages/core/src/components/Heading.tsx`
- Modify: `packages/core/src/components/Stack.tsx`
- Modify: `packages/core/src/components/Grid.tsx`
- Modify: `packages/core/src/components/Section.tsx`
- Modify: `packages/core/src/components/Card.tsx`
- Modify: `packages/core/src/components/CardHeader.tsx`
- Modify: `packages/core/src/components/CardFooter.tsx`
- Modify: `packages/core/src/components/Divider.tsx`
- Modify: `packages/core/src/components/Center.tsx`
- Modify: `packages/core/src/components/foundations.test.tsx`
- Modify: `packages/core/src/components/Text.doc.ts`
- Modify: `packages/core/src/components/Heading.doc.ts`
- Modify: `packages/core/src/components/Card.doc.ts`
- Modify: `packages/core/src/components/CardHeader.doc.ts`
- Modify: `packages/core/src/components/CardFooter.doc.ts`
- Modify: `packages/core/src/components/index.ts`

**Interfaces:**
- Produces: `TextTone`, `HeadingFamily`, `CardElevation`.
- Defaults: `Text tone="primary"`, `Heading family="interface"`, `Card elevation="none"`.
- Preserves: semantic element selection, native article/section/header/footer structure, and existing spacing enums.

- [ ] **Step 1: Add failing typography and single-boundary tests**

Test the new APIs and exact semantic roles:

```tsx
renderUi(
  <>
    <Text tone="secondary">Supporting copy</Text>
    <Text tone="muted">Updated recently</Text>
    <Heading level={2}>Interface heading</Heading>
    <Heading family="display" level={1}>Editorial title</Heading>
  </>,
);
```

Assert the default heading uses `fontFamilyHeading`, only the explicit display heading uses `fontFamilyDisplay`, and Text tones use primary/secondary/muted roles.

Render `Card` with `none`, `low`, and `medium` elevation. Assert each computed StyleX contract has exactly one visible boundary: `none` has the standard border and no shadow; `low`/`medium` have the matching elevation and no visible border.

- [ ] **Step 2: Run RED**

Run: `pnpm -F @misoto22/kioku-ui test -- src/components/foundations.test.tsx src/docs/index.test.ts`

- [ ] **Step 3: Implement Text tone and Heading family/size hierarchy**

Export:

```ts
export type TextTone = 'primary' | 'secondary' | 'muted';
export type HeadingFamily = 'interface' | 'display';
export type CardElevation = 'none' | 'low' | 'medium';
```

Map page/section/subsection sizes to 28/20/16px semantic roles. Keep component headings on the interface family.

- [ ] **Step 4: Implement Card elevation with exactly one boundary**

Card uses `surface`, `radius.container`, and padding on the 4px scale. `elevation="none"` uses the standard border with no shadow. `low` and `medium` use the matching shadow with no visible border. CardHeader/CardFooter use 16px/24px grouping rhythm and standard dividers without compounding Card's outer boundary.

- [ ] **Step 5: Normalize layout primitives without adding presentation policy**

Replace any layout primitive default or test fixture that relies on off-grid values. Keep layout primitives router-neutral and do not add component-local backgrounds merely to make a story visible; visibility belongs to the Storybook fixtures in Task 6.

- [ ] **Step 6: Update docs and public types**

Document tone/family/elevation and the rule that structural Card parts must be composed inside Card. Export the new unions.

- [ ] **Step 7: Run GREEN and package gates**

Run:

```bash
pnpm -F @misoto22/kioku-ui test -- src/components/foundations.test.tsx src/docs/index.test.ts
pnpm -F @misoto22/kioku-ui typecheck
pnpm -F @misoto22/kioku-ui build
```

- [ ] **Step 8: Commit foundations and containers**

```bash
git add packages/core/src/components
git commit -m "feat: normalize foundations and card composition"
```

### Task 5: Normalize feedback, loading, Table, and MetricGrid

**Files:**
- Modify: `packages/core/src/components/Alert.tsx`
- Modify: `packages/core/src/components/EmptyState.tsx`
- Modify: `packages/core/src/components/AsyncState.tsx`
- Modify: `packages/core/src/components/Spinner.tsx`
- Modify: `packages/core/src/components/Skeleton.tsx`
- Modify: `packages/core/src/components/Table.tsx`
- Modify: `packages/core/src/components/MetricGrid.tsx`
- Modify: `packages/core/src/components/data-display.test.tsx`
- Modify: `packages/core/src/components/Alert.doc.ts`
- Modify: `packages/core/src/components/EmptyState.doc.ts`
- Modify: `packages/core/src/components/Spinner.doc.ts`
- Modify: `packages/core/src/components/Skeleton.doc.ts`
- Modify: `packages/core/src/components/Table.doc.ts`
- Modify: `packages/core/src/components/MetricGrid.doc.ts`
- Modify: `packages/core/src/components/index.ts`

**Interfaces:**
- Produces: `EmptyStateSize`, `TableDensity`, and `TableDividers`.
- Preserves: current live-region behavior, AsyncState discriminated union, native table semantics, and native definition-list semantics.

- [ ] **Step 1: Add failing feedback and data-density tests**

Add coverage for:

```tsx
<EmptyState
  action={<Button>Review filters</Button>}
  detail="No saved records match the current view."
  size="compact"
  title="No matching records"
  visual={<span aria-hidden="true">◇</span>}
/>

<Table density="compact" dividers="grid">
  <TableBody>
    <TableRow>
      <TableCell>Queued</TableCell>
    </TableRow>
  </TableBody>
</Table>
<Table density="spacious" dividers="none">
  <TableBody>
    <TableRow>
      <TableCell>Completed</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

Assert EmptyState renders the visual before its title, constrains copy through semantic layout styles, and does not duplicate live regions when consumed by AsyncState. Assert Table density maps to 8/12/16px cell block padding, divider modes reach rows/cells through a private React context, and native caption/head/body/row/cell roles remain unchanged.

Add reduced-motion style-contract tests for Spinner and Skeleton. Keep the MetricGrid `dl > div > dt/dd` structure and assert label, value, and detail use three distinct typography/tone roles.

- [ ] **Step 2: Run RED**

Run: `pnpm -F @misoto22/kioku-ui test -- src/components/data-display.test.tsx src/docs/index.test.ts`

- [ ] **Step 3: Implement Alert and EmptyState hierarchy**

Alert uses a quiet 1px status boundary, status surface/text pairs, 12px content spacing, and `radius.element`. EmptyState exports:

```ts
export type EmptyStateSize = 'compact' | 'default';
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  readonly action?: ReactNode;
  readonly detail?: ReactNode;
  readonly size?: EmptyStateSize;
  readonly title: ReactNode;
  readonly visual?: ReactNode;
}
```

Default copy width is bounded; compact changes padding and gap, not font legibility.

- [ ] **Step 4: Normalize AsyncState, Spinner, and Skeleton motion behavior**

Keep AsyncState's single persistent polite status region and separate assertive error Alert. Spinner uses accent/muted roles. Skeleton uses `surfaceMuted`, element radius, and a motion token with a `prefers-reduced-motion: reduce` static fallback.

- [ ] **Step 5: Implement Table density/divider context**

Export:

```ts
export type TableDensity = 'compact' | 'default' | 'spacious';
export type TableDividers = 'rows' | 'columns' | 'grid' | 'none';
export interface TableProps extends Omit<TableHTMLAttributes<HTMLTableElement>, 'className'> {
  readonly density?: TableDensity;
  readonly dividers?: TableDividers;
}
```

Use a private `TableStyleContext` so TableRow/TableHeaderCell/TableCell apply the parent's density/divider policy without adding invalid DOM attributes. Default to `density="default"` and `dividers="rows"`. Header cells use muted surface and secondary text; body rows use hover overlay; card-contained composition must not double Card's outer boundary.

- [ ] **Step 6: Implement MetricGrid hierarchy and responsive columns**

MetricGrid uses responsive `auto-fit` columns with a useful minimum, secondary labels, strong interface-family values, muted detail, and standard container spacing.

- [ ] **Step 7: Prove the removed density contract has no remaining consumers**

Run `rg -n 'densityControl|tokenContract\.density|data-density|density\.' packages/core packages/themes/kioku` and require no matches. The component APIs `TableDensity` and Storybook density fixtures are component behavior, not semantic token names, and remain valid.

- [ ] **Step 8: Update docs, exports, and run GREEN**

Document the new props and composition rules, export the new unions, then run:

```bash
pnpm -F @misoto22/kioku-ui test -- src/components/data-display.test.tsx src/docs/index.test.ts src/tokens/contracts.test.ts
pnpm -F @misoto22/kioku-ui-theme-kioku test -- src/themes.test.ts
pnpm -F @misoto22/kioku-ui typecheck
pnpm -F @misoto22/kioku-ui-theme-kioku typecheck
pnpm -F @misoto22/kioku-ui build
```

- [ ] **Step 9: Commit feedback and data display**

```bash
git add packages/core/src packages/themes/kioku/src
git commit -m "feat: normalize feedback and data display"
```

### Task 6: Rebuild Storybook around accurate per-component metadata and realistic compositions

**Files:**
- Delete: `apps/storybook/stories/controls.stories.tsx`
- Delete: `apps/storybook/stories/data-display.stories.tsx`
- Delete: `apps/storybook/stories/foundations.stories.tsx`
- Delete: `apps/storybook/stories/navigation.stories.tsx`
- Delete: `apps/storybook/stories/themes.stories.tsx`
- Create: `apps/storybook/stories/Button.stories.tsx`
- Create: `apps/storybook/stories/IconButton.stories.tsx`
- Create: `apps/storybook/stories/Badge.stories.tsx`
- Create: `apps/storybook/stories/StatusDot.stories.tsx`
- Create: `apps/storybook/stories/Field.stories.tsx`
- Create: `apps/storybook/stories/TextInput.stories.tsx`
- Create: `apps/storybook/stories/TextArea.stories.tsx`
- Create: `apps/storybook/stories/Toggle.stories.tsx`
- Create: `apps/storybook/stories/SegmentedControl.stories.tsx`
- Create: `apps/storybook/stories/Alert.stories.tsx`
- Create: `apps/storybook/stories/AsyncState.stories.tsx`
- Create: `apps/storybook/stories/EmptyState.stories.tsx`
- Create: `apps/storybook/stories/Spinner.stories.tsx`
- Create: `apps/storybook/stories/Skeleton.stories.tsx`
- Create: `apps/storybook/stories/Table.stories.tsx`
- Create: `apps/storybook/stories/MetricGrid.stories.tsx`
- Create: `apps/storybook/stories/Text.stories.tsx`
- Create: `apps/storybook/stories/Heading.stories.tsx`
- Create: `apps/storybook/stories/Stack.stories.tsx`
- Create: `apps/storybook/stories/Grid.stories.tsx`
- Create: `apps/storybook/stories/Section.stories.tsx`
- Create: `apps/storybook/stories/Card.stories.tsx`
- Create: `apps/storybook/stories/Divider.stories.tsx`
- Create: `apps/storybook/stories/Center.stories.tsx`
- Create: `apps/storybook/stories/VisuallyHidden.stories.tsx`
- Create: `apps/storybook/stories/Link.stories.tsx`
- Create: `apps/storybook/stories/LinkProvider.stories.tsx`
- Create: `apps/storybook/stories/ThemeProvider.stories.tsx`
- Create: `apps/storybook/stories/support/StoryFrame.tsx`
- Modify: `apps/storybook/stories/kioku-themes.stories.tsx`
- Modify: `apps/storybook/.storybook/preview.ts`
- Modify: `packages/core/src/components/Alert.doc.ts`
- Modify: `packages/core/src/components/AsyncState.doc.ts`
- Modify: `packages/core/src/components/Badge.doc.ts`
- Modify: `packages/core/src/components/Button.doc.ts`
- Modify: `packages/core/src/components/Card.doc.ts`
- Modify: `packages/core/src/components/CardFooter.doc.ts`
- Modify: `packages/core/src/components/CardHeader.doc.ts`
- Modify: `packages/core/src/components/Center.doc.ts`
- Modify: `packages/core/src/components/Divider.doc.ts`
- Modify: `packages/core/src/components/EmptyState.doc.ts`
- Modify: `packages/core/src/components/Field.doc.ts`
- Modify: `packages/core/src/components/Grid.doc.ts`
- Modify: `packages/core/src/components/Heading.doc.ts`
- Modify: `packages/core/src/components/IconButton.doc.ts`
- Modify: `packages/core/src/components/MetricGrid.doc.ts`
- Modify: `packages/core/src/components/Section.doc.ts`
- Modify: `packages/core/src/components/SegmentedControl.doc.ts`
- Modify: `packages/core/src/components/Skeleton.doc.ts`
- Modify: `packages/core/src/components/Spinner.doc.ts`
- Modify: `packages/core/src/components/Stack.doc.ts`
- Modify: `packages/core/src/components/StatusDot.doc.ts`
- Modify: `packages/core/src/components/Table.doc.ts`
- Modify: `packages/core/src/components/Text.doc.ts`
- Modify: `packages/core/src/components/TextArea.doc.ts`
- Modify: `packages/core/src/components/TextInput.doc.ts`
- Modify: `packages/core/src/components/Toggle.doc.ts`
- Modify: `packages/core/src/components/VisuallyHidden.doc.ts`
- Modify: `packages/core/src/navigation/LinkProvider.doc.ts`
- Modify: `packages/core/src/theme/Theme.doc.ts`
- Modify: `internal/vibe-tests/src/component-index.ts`
- Modify: `internal/vibe-tests/src/component-index.test.ts`
- Modify: `internal/scripts/storybook-preview.test.mjs`

**Interfaces:**
- Produces: one correct `Meta<typeof Component>` owner for every non-structural public component, canonical `Core/<Component>` titles, and bounded fixture helpers.
- Structural exceptions: CardHeader/CardFooter are owned by `Core/Card`; TableCaption/TableHead/TableBody/TableRow/TableHeaderCell/TableCell are owned by `Core/Table` and always rendered in valid parent composition.
- Preserves: the external Kioku theme matrix as a non-component story and the existing theme/mode toolbar.

- [ ] **Step 1: Extend the catalog policy under RED**

Replace the title/export-only story scan with a TypeScript AST contract:

```ts
export interface StoryModuleContract {
  readonly componentName?: string;
  readonly file: string;
  readonly storyNames: readonly string[];
  readonly title?: string;
}

export function storyArchitectureProblems(
  components: readonly string[],
  stories: readonly StoryModuleContract[],
): string[];
```

Resolve the `component:` identifier back to its named import. Add fixture tests that fail when:

- `Core/Badge` declares `component: Button`;
- one component has two metadata owners;
- a core component title is not `Core/<Component>`;
- Button lacks `Variants`, `Sizes`, `States`, `Disabled`, `Loading`, or `Composition`;
- a structural Card/Table story renders its part outside the parent;
- placeholder copy contains `First item`, `Alpha`, or `Example values`.

Run: `pnpm -F @misoto22/kioku-ui-vibe-tests test -- src/component-index.test.ts`

Expected: failures against the current grouped story files.

- [ ] **Step 2: Create fixture frames and correct the global preview layout**

Every primary story file uses this shape:

```tsx
const meta = {
  title: 'Core/Button',
  component: Button,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;
```

`StoryFrame.tsx` supplies only documentation layout: `ConstrainedFrame` (320px forms), `DemoFrame` (bounded surface), and `StateGrid` (labelled state matrix). It must not redefine component styling.

Set Storybook's default layout to `padded`. Keep the theme root responsible for canvas/background and color scheme, but remove the always-fullscreen 24px decorator padding. Form stories render inside `ConstrainedFrame`; Card/Table/layout stories use `DemoFrame`; only the Kioku theme matrix may opt into a larger matrix frame.

- [ ] **Step 3: Create action, status, field, and selection story modules**

Create Button, IconButton, Badge, StatusDot, Field, TextInput, TextArea, Toggle, and SegmentedControl modules with correct `Meta<typeof Component>` owners and the required exports below.

- [ ] **Step 4: Create feedback and data-display story modules**

Create Alert, AsyncState, EmptyState, Spinner, Skeleton, Table, and MetricGrid modules. Table structural exports must render a complete valid table around the documented part.

- [ ] **Step 5: Create typography, layout, and Card story modules**

Create Text, Heading, Stack, Grid, Section, Card, Divider, Center, and VisuallyHidden modules. Render visible Card/Text children inside layout fixtures so spacing can be judged without adding presentation policy to the runtime primitives.

- [ ] **Step 6: Create navigation/provider modules and preserve the external theme matrix**

Create Link, LinkProvider, and ThemeProvider modules under `Core/*`. Keep `kioku-themes.stories.tsx` as a non-component matrix and update only its title/layout needed to coexist with the component catalog.

- [ ] **Step 7: Verify every module has the required state breadth**

Create the following exact applicable story sets:

| Component | Required exports |
| --- | --- |
| Button, IconButton | `Default`, `Variants`, `Sizes`, `States`, `Disabled`, `Loading`, `Composition` |
| Badge | `Default`, `Tones`, `Composition` |
| StatusDot | `Default`, `Tones`, `Composition` |
| Field, TextInput, TextArea | `Default`, `States`, `Disabled`, `Composition` |
| Toggle, SegmentedControl | `Default`, `States`, `Disabled`, `Composition` |
| Alert | `Default`, `Tones`, `Composition` |
| AsyncState | `Default`, `States`, `Composition` |
| EmptyState | `Default`, `Sizes`, `States`, `Composition` |
| Spinner, Skeleton | `Default`, `States`, `Composition` |
| Table | `Default`, `Densities`, `Dividers`, `States`, `TableCaption`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`, `Composition` |
| MetricGrid | `Default`, `States`, `Composition` |
| Text | `Default`, `Tones`, `Sizes`, `Composition` |
| Heading | `Default`, `Sizes`, `Families`, `Composition` |
| Stack, Grid, Section, Divider, Center | `Default`, `Variants`, `Composition` where meaningful |
| Card | `Default`, `Elevations`, `CardHeader`, `CardFooter`, `Composition` |
| VisuallyHidden | `Default`, `Composition` |
| Link, LinkProvider, ThemeProvider | `Default`, `States`, `Composition` where meaningful |

Use realistic, privacy-safe product content such as delivery status, saved views, workspace access, activity summaries, and account settings. Do not use Kioku-specific entities or personal records.

- [ ] **Step 8: Verify structural Card/Table compositions**

CardHeader/CardFooter and all Table parts must have dedicated discoverable story exports that render the full Card/Table fixture, with the relevant structural part visually highlighted by content rather than an extra debug outline.

- [ ] **Step 9: Update every documentation story ID atomically**

Set primary IDs to `core-<component>--default`, for example `core-button--default`, `core-text-input--default`, and `core-card--default`. Set structural IDs to their named parent exports, for example `core-card--card-header` and `core-table--table-header-cell`. Update Link/LinkProvider/ThemeProvider to `core-link--default`, `core-link-provider--default`, and `core-theme-provider--default`.

- [ ] **Step 10: Remove the brittle grouped-story regex policy**

Keep the public stylesheet assertion in `storybook-preview.test.mjs`, but move Card/Table composition checks into the AST catalog policy. Do not retain regex assertions tied to a function name or exact JSX formatting.

- [ ] **Step 11: Run GREEN, typecheck, and build Storybook**

Run:

```bash
node --test internal/scripts/storybook-preview.test.mjs
pnpm -F @misoto22/kioku-ui-vibe-tests test -- src/component-index.test.ts
pnpm -F @misoto22/kioku-ui test -- src/docs/index.test.ts
pnpm --dir apps/storybook typecheck
pnpm storybook:build
```

Expected: the AST policy finds exactly one correct owner for each public component, all docs IDs exist in the built catalog, and Storybook builds without control-type errors.

- [ ] **Step 12: Commit the Storybook architecture**

```bash
git add apps/storybook packages/core/src internal/vibe-tests internal/scripts/storybook-preview.test.mjs
git commit -m "feat: rebuild component Storybook catalog"
```

### Task 7: Capture visual evidence and lock the accessibility scope

**Files:**
- Create: `internal/scripts/capture-storybook-visuals.mjs`
- Create: `internal/scripts/capture-storybook-visuals.test.mjs`
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `.github/a11y-baseline.json`
- Create: `.superpowers/sdd/2026-08-18-astryx-visual-system-alignment/visual-qa.md` (ignored evidence file; do not force-add)

**Interfaces:**
- Produces: `pnpm visual:capture`, deterministic Storybook iframe URLs, desktop/narrow screenshots under `.artifacts/astryx-visual-alignment/`, and a written visual QA ledger.
- Consumes: built Storybook `index.json`, the live theme/mode toolbar contract, and the canonical story IDs from Task 6.

- [ ] **Step 1: Write a failing capture-matrix test**

Export a pure helper:

```js
const visualStoryIds = [
  'core-button--states',
  'core-badge--tones',
  'core-text-input--states',
  'core-toggle--states',
  'core-segmented-control--states',
  'core-empty-state--composition',
  'core-alert--tones',
  'core-table--composition',
  'core-metric-grid--composition',
  'core-card--composition',
  'core-grid--composition',
];
const fullThemeStoryIds = new Set([
  'core-button--states',
  'core-card--composition',
  'core-table--composition',
]);

export function visualCaptureCases({storyIds, themes, modes, viewports}) {
  const available = new Set(storyIds);
  const cases = [];

  for (const storyId of visualStoryIds) {
    if (!available.has(storyId)) {
      throw new Error(`Missing visual story: ${storyId}`);
    }
    const storyThemes = fullThemeStoryIds.has(storyId)
      ? themes
      : themes.filter((theme) => theme === 'washi');
    for (const theme of storyThemes) {
      for (const mode of modes) {
        for (const viewport of viewports) {
          cases.push({
            filename: `${storyId}-${theme}-${mode}-${viewport.name}.png`,
            globals: `theme:${theme};mode:${mode}`,
            storyId,
            theme,
            mode,
            viewport,
          });
        }
      }
    }
  }

  return cases.sort((left, right) =>
    left.filename.localeCompare(right.filename),
  );
}
```

Test that the matrix includes desktop `1440x900` and narrow `390x844` captures for Button, Badge, TextInput, Toggle, SegmentedControl, EmptyState, Alert, Table, MetricGrid, Card, and the layout composition. Require Washi in both modes for every target, plus Muji/Sumi in both modes for Button, Card, and Table. Assert filenames are stable and collision-free.

Run: `node --test internal/scripts/capture-storybook-visuals.test.mjs`

Expected: failure because the capture helper does not exist.

- [ ] **Step 2: Implement the static Storybook capture command**

Reuse the safe static-directory server pattern from `.github/scripts/accessibility-audit.js`. Launch Playwright Chromium with reduced motion, navigate directly to `/iframe.html?id=<story>&globals=theme:<theme>;mode:<mode>`, wait for a non-empty Storybook root and document fonts, then save screenshots to `.artifacts/astryx-visual-alignment/`. Add:

```json
"visual:capture": "pnpm storybook:build && node internal/scripts/capture-storybook-visuals.mjs"
```

Ignore `.artifacts/` in Git. The command must fail if a required story ID is absent or a screenshot is blank.

- [ ] **Step 3: Run the capture test and generate evidence**

Run:

```bash
node --test internal/scripts/capture-storybook-visuals.test.mjs
pnpm visual:capture
```

Expected: all required screenshots exist and are non-empty.

- [ ] **Step 4: Perform the visual review before accepting baselines**

Use the browser and local screenshots to compare against Astryx's Storybook and design conventions. Record Pass/Fail plus a concrete observation for every target at both widths. Reject and fix the owning component/story before continuing if any of these are observed:

- default-looking browser controls or unstyled text-only output;
- off-grid spacing or uncontrolled full-viewport width;
- double borders/outline shadows;
- serif component headings;
- invisible hover/active/focus/disabled distinctions;
- weak primary/supporting/muted hierarchy;
- broken narrow-width wrapping or overflow.

The QA ledger must name the compared local story ID, theme, mode, viewport, Astryx reference component, and final disposition. Do not mark the task complete from DOM assertions alone.

- [ ] **Step 5: Regenerate and verify the exact accessibility scope**

Only after visual review passes, run:

```bash
pnpm a11y:baseline
pnpm a11y:audit
```

Expected: the baseline's exact canonical story IDs match the rebuilt Storybook index, all three themes and both modes are present, and the normal audit reports zero new violations. Fix violations instead of accepting component defects into the baseline.

- [ ] **Step 6: Commit automated visual/a11y infrastructure and baseline**

```bash
git add package.json .gitignore internal/scripts/capture-storybook-visuals.mjs \
  internal/scripts/capture-storybook-visuals.test.mjs .github/a11y-baseline.json
git commit -m "test: add Storybook visual acceptance gate"
```

### Task 8: Prove public distribution and record the initial visual-system release

**Files:**
- Modify: `.changeset/initial-public-foundations.md`
- Modify: `packages/core/src/package-build.test.ts`
- Modify: `packages/themes/kioku/src/package-build.test.ts`
- Create: `.superpowers/sdd/2026-08-18-astryx-visual-system-alignment/final-report.md` (ignored evidence file; do not force-add)

**Interfaces:**
- Consumes: the final token/API surface, Storybook catalog, accessibility baseline, package export maps, compiled/source reference apps, and existing Changesets release policy.
- Produces: release-review evidence for the unpublished `0.1.0` package family. Does not publish.

- [ ] **Step 1: Add final packed-consumer regressions for the complete public surface**

The external consumer tests must import the new unions and render at least Button `size/loading/destructive`, Text tone, Heading family, Card elevation, EmptyState visual/size, and Table density/dividers through `@misoto22/kioku-ui`. The built CSS assertion must prove the new semantic custom properties are present and the removed legacy names are absent.

Run the focused package tests first and capture RED for any missing declaration, runtime export, or CSS atom.

- [ ] **Step 2: Update the existing initial-public-foundations Changeset**

Keep all three public packages at `minor` and expand the body to state that the initial release includes the Astryx-aligned semantic token contract, normalized components, three Kioku themes, Storybook catalog, and compiled/source build integrations. Do not add a second overlapping pre-release Changeset.

- [ ] **Step 3: Run the complete release matrix from a clean tracked worktree**

Run:

```bash
pnpm check
pnpm -r test
pnpm -r test
pnpm format
pnpm storybook:build
pnpm a11y:audit
pnpm build
pnpm verify-exports
pnpm sandbox:build
pnpm examples:build
pnpm pack:smoke
pnpm changeset status --since=main
git diff --check
```

Expected:

- repository, boundary, lint, type, unit, and catalog gates exit 0;
- two consecutive recursive test runs exit 0 without dist races;
- Storybook builds and the exact three-theme/two-mode audit has zero new violations;
- compiled Vite/Next and source-authoring Vite/Next standalone builds pass with `--ignore-workspace` installs;
- every package export resolves, packed tarballs contain no tests/fixtures, and the standalone packed consumer builds;
- Changesets reports the three public packages as the intended initial minor release;
- no pack-smoke temporary directories or untracked generated artifacts remain.

- [ ] **Step 4: Re-open representative Storybook stories after the release build**

Inspect the production Storybook build—not only the dev server—for Button, TextInput, Toggle, EmptyState, Table, MetricGrid, Card, and layout composition. Confirm CSS extraction, theme switching, mode switching, controls, and narrow layout still match the Task 7 evidence.

- [ ] **Step 5: Write the final evidence report**

Record each command, exit code, test/scenario count, Storybook story count, visual QA disposition, known warnings, and the statement `No push or publish was performed.` Keep external GitHub/npm prerequisites clearly separated from locally verified results.

- [ ] **Step 6: Commit release readiness**

```bash
git add .changeset/initial-public-foundations.md packages/core/src/package-build.test.ts \
  packages/themes/kioku/src/package-build.test.ts
git commit -m "chore: verify Astryx visual system release"
```

End with `git status --short` empty for tracked files; ignored SDD reports may remain ignored.
