# Astryx Visual System Alignment

**Status:** Approved direction, pending document review

**Goal:** Replace the scaffold-level visual implementation in `kioku-ui` with
an intentional, themeable component system that follows Astryx's design
conventions for proportion, hierarchy, state coverage, composition, and
Storybook quality.

**Supersedes:** The visual implementation details of
`2026-08-17-kioku-ui-astryx-alignment-design.md`. The repository, package,
distribution, host-boundary, and chart-deferral decisions in that document
remain unchanged.

**Primary references:**

- [Astryx Design Conventions](https://github.com/facebook/astryx/wiki/Design-Conventions)
- [Astryx Storybook](https://facebook.github.io/astryx/storybook/)
- [Astryx API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions)

## Problem statement

The current components are technically renderable and accessible in their
default states, but they do not yet form a designed system. The implementation
uses a narrow semantic token vocabulary, off-grid spacing, nearly identical
surface roles, inconsistent typography, and incomplete interaction states.
Storybook groups unrelated components under one metadata object and presents
many components as isolated placeholder text. This produces misleading
controls, weak visual hierarchy, and examples that cannot be used to judge the
component library.

Passing type checks and axe scans does not satisfy the visual quality bar. A
component is complete only when its proportions, hierarchy, interaction states,
theme behavior, documentation, and composition are all reviewable.

## Design principles

1. **Core controls structure; themes control appearance.** Core components
   choose semantic roles and interaction behavior. Theme packages own concrete
   color, font, shadow, radius, and density values. Core never branches on
   `washi`, `muji`, or `sumi`.
2. **Use Astryx's relationship grammar.** Spacing follows a 4px grid and grows
   with grouping depth. Fixed controls use 28px, 32px, and 36px heights. Radius
   roles are 4px inner, 8px element, 12px container, and full-round.
3. **One visual treatment per state.** Hover, active, focus-visible, disabled,
   selected, loading, and semantic status states use shared roles across the
   system rather than component-specific inventions.
4. **Typography communicates hierarchy.** Interface text and component
   headings use a modern sans-serif stack. A theme may provide a display face,
   but display typography is limited to page-level or editorial headings and
   is not used for card titles, field labels, buttons, or empty states.
5. **Composition is part of correctness.** Structural parts such as card
   headers, table sections, and layout primitives are demonstrated inside their
   valid parent composition. Stories use realistic content and expose the
   component's meaningful variants and states.
6. **Minimal does not mean unfinished.** Quiet surfaces still need deliberate
   width, rhythm, contrast, focus, and affordance. Empty whitespace is used to
   frame a component, not left over because no composition was designed.

## Semantic token contract

The public token contract expands before the first stable release. This is an
intentional pre-release correction; no compatibility alias is required for an
unpublished contract. Every registered theme must implement every role.

### Color roles

| Group | Exact roles | Purpose |
| --- | --- | --- |
| Background | `canvas`, `surface`, `surfaceRaised`, `surfaceMuted` | Page, standard container, elevated container, and subdued grouping surfaces. |
| Text | `text`, `textSecondary`, `textMuted`, `textOnAccent` | Primary content, supporting content, metadata/placeholder, and content on strong fills. |
| Interactive | `accent`, `accentHover`, `accentActive`, `overlayHover`, `overlayActive`, `focus` | Primary action and alpha interaction layers. |
| Disabled | `disabledSurface`, `disabledText` | Shared unavailable-state treatment. |
| Status | surface and text pairs for `info`, `success`, `warning`, and `danger` | Non-color-only semantic feedback when paired with text or iconography. |

The border group contains the exact roles `default`, `strong`, `interactive`,
`disabled`, `width`, and `style`. The radius group becomes `inner`, `element`,
`container`, `page`, and `full`. The size group contains `controlSm`,
`controlMd`, `controlLg`, and `hitTarget`. Existing pre-release `radiusSm`,
`radiusMd`, `radiusLg`, `radiusRound`, and single-control-size roles are removed
rather than retained as misleading aliases.

Color pairs must meet WCAG AA in both light and dark modes. Hover and active
overlays use alpha colors rather than opaque replacement fills.

### Geometry and rhythm

| Role | Default scale |
| --- | --- |
| Spacing | 4, 8, 12, 16, 24, 32px |
| Control size | 28px `sm`, 32px `md`, 36px `lg` |
| Radius | 4px inner, 8px element, 12px container, full-round |
| Focus | 2px ring with 2px offset |
| Border | 1px |

Container children preserve concentric corners. Components must not combine a
border with an outline-like shadow that duplicates the same boundary. Elevation
shadows indicate stacking only; they are not substitutes for borders.

### Typography

The contract adds `fontFamilyDisplay`, `fontSizeXs`, and `fontSize2xl` while
retaining body, heading, mono, and the existing size roles. The default
interface scale is 12, 14, 16, 20, and 28px with line-height
roles appropriate to compact labels, body copy, section headings, and page
headings. Body copy uses 14px by default. Card titles and control labels use the
heading or body sans-serif role; only page-level headings may opt into display
typography.

## Kioku theme direction

The three themes share geometry and state semantics, while their palettes remain
distinct implementations of the same contract.

### Washi

Washi becomes a restrained paper-and-moss interface rather than a sepia
editorial surface:

- Canvas: `#F5F4EF`
- Surface: `#FFFFFF`
- Muted surface: `#ECEAE2`
- Primary text: `#24251F`
- Secondary text: `#62645B`
- Moss accent: `#4F6751`
- Focus: `#315F77`

The body and component heading stack is `Noto Sans JP`, `Hiragino Sans`,
system-ui, sans-serif. The Mincho stack remains available as the display role
but is not the default for component headings.

### Muji

Muji uses cooler neutral walls, white surfaces, charcoal text, and a muted
green-grey accent. It shares the same geometry and typography scale as Washi.

### Sumi

Sumi is high-contrast and near-monochrome with a restrained indigo accent. It
does not substitute serif typography for hierarchy; hierarchy comes from size,
weight, spacing, and tone.

Dark values for every role are defined alongside light values through the
existing `light-dark()` mechanism. Locale-specific font fallbacks remain scoped
to each theme and never become global policy.

## Component normalization

The existing public component set is normalized family by family. Behavioral
contracts remain intact unless a missing visual state requires a documented
prop.

### Actions and controls

- `Button` gains `size="sm | md | lg"`, `loading?: boolean`, and a
  `destructive` variant. All
  variants implement rest, hover, active, focus-visible, disabled, and loading
  visuals. Primary uses the accent pair; secondary uses the standard surface;
  ghost uses transparent overlays.
- `IconButton` gains the same `size`, `variant`, and `loading` props and shares
  Button interaction states rather than maintaining an unrelated circular
  control treatment.
- `Badge` gains a neutral tone in addition to semantic tones. Badge padding and
  type remain compact without falling below legible size.
- `Toggle` renders a recognizable switch track and thumb with a minimum 44px
  hit target while preserving the existing switch semantics.
- `SegmentedControl` uses one muted container surface and one raised selected
  segment. It does not outline every segment independently.

### Forms

- `Field` establishes a constrained content width in stories, label hierarchy,
  secondary description text, required/optional annotation, and status copy.
- `TextInput` and `TextArea` share heights, border roles, placeholder color,
  focus ring, disabled/read-only treatment, and invalid status treatment.
- Inputs do not default to the full Storybook viewport width; their width is
  controlled by the parent layout and demonstrated at a realistic 320px width.

### Feedback and data display

- `Alert` uses status surface/text pairs with a quiet boundary and consistent
  icon/content spacing.
- `EmptyState` adds `visual?: ReactNode` and
  `size?: "compact" | "default"`,
  constrains copy width, and supports a primary/secondary action group through
  its existing `action` ReactNode slot.
- `Spinner` and `Skeleton` use the shared muted/accent roles and reduced-motion
  behavior.
- `Table` gains `density?: "compact" | "default" | "spacious"` and
  `dividers?: "rows" | "columns" | "grid" | "none"`. Header cells, body cells,
  captions, hover states, and card-contained composition use distinct roles and
  consistent row heights.
- `MetricGrid` uses clear label/value/supporting-text hierarchy and responsive
  columns rather than equal-weight text blocks.

### Foundations and containers

- `Text` adds `tone?: "primary" | "secondary" | "muted"`.
- `Heading` separates page, section, and subsection hierarchy and adds
  `family?: "interface" | "display"`; display type is opt-in rather than implied
  by every heading.
- `Card` adds `elevation?: "none" | "low" | "medium"`, uses the container radius,
  and applies exactly one boundary treatment. `CardHeader` and `CardFooter`
  provide structure and must be shown within a Card.
- `Stack`, `Grid`, `Section`, and `Center` stories use visible child components
  so spacing and alignment can be judged. Their runtime remains presentational
  and router/domain neutral.

## Storybook information architecture

Storybook is reorganized to match Astryx's component development model.

```text
apps/storybook/stories/
├── Alert.stories.tsx
├── Badge.stories.tsx
├── Button.stories.tsx
├── Card.stories.tsx
├── EmptyState.stories.tsx
├── Table.stories.tsx
└── ...one file per public component
```

Each file owns the correct `Meta<typeof Component>` and no story inherits
another component's controls. The title convention is `Core/<Component>`.
Structural subcomponents may share the parent component's story file and docs,
but their story IDs remain discoverable from the typed component catalog.

Every visual component provides the applicable subset of:

1. `Default`
2. `Variants` or `Tones`
3. `Sizes` or `Densities`
4. `States` including hover/focus fixtures where deterministic
5. `Disabled`
6. `Loading` or async states
7. `Composition` using realistic content

Story canvases default to padded layout. Form controls use constrained fixture
widths; layout components use bounded demo frames; only true page templates use
fullscreen layout. Placeholder copy such as “First item”, “Alpha”, and “Example
values” is replaced with realistic, privacy-safe product content.

The existing component catalog, documentation metadata, canonical story IDs,
and accessibility baseline are updated atomically with the story split.

## Implementation boundaries

- Core contains no Kioku routes, API types, translations, persistence keys, or
  domain copy.
- Themes contain raw visual values; core contains semantic token references.
- No chart primitive is added in this work.
- No Console page is migrated in this work. Console adoption remains a later
  packed-package consumer task.
- No new design dependency is added merely to reproduce an icon or illustration.
  Story fixtures may use text-safe placeholders or existing public icon slots.

## Verification

Implementation follows strict red-green-refactor development. Required evidence
includes:

1. Token contract tests proving every theme implements every role and contains
   no theme-name policy in core.
2. Component unit tests for size, variant, disabled, status, keyboard, and
   accessibility behavior.
3. Story catalog tests proving one correct component metadata owner, required
   story categories, valid canonical IDs, and no cross-component controls.
4. Compiled and source-distribution consumer builds after token/API changes.
5. Storybook production build and axe audit across all three themes and both
   color modes.
6. Browser visual review at desktop and narrow widths for Button, Badge,
   TextInput, Toggle, SegmentedControl, EmptyState, Alert, Table, MetricGrid,
   Card, and the layout primitives.
7. Screenshot comparison against the Astryx reference for proportion, rhythm,
   hierarchy, state coverage, and composition. Kioku themes need not copy
   Astryx Neutral colors, but must meet the same design rules.

## Acceptance criteria

- A reviewer can identify primary, supporting, muted, interactive, disabled,
  and status roles without inspecting source code.
- A default Button and TextInput align at 32px visual height, with documented
  28px and 36px alternatives.
- Card, Table, EmptyState, and form stories read as intentional compositions at
  first glance rather than isolated scaffold output.
- No component uses off-grid spacing or arbitrary radius values.
- No default component heading uses the Washi or Sumi display serif.
- Every interactive component has visible hover, active, focus-visible, and
  disabled states in both light and dark modes.
- Storybook exposes accurate component controls and state matrices comparable in
  breadth and clarity to the corresponding Astryx stories.
- All repository, package-boundary, type, test, build, export, formatting,
  accessibility, and standalone consumer gates remain green.

## Rollout

This work lands as one pre-release visual-system correction with reviewable
commits by layer:

1. semantic token contract and theme implementations;
2. foundations and controls;
3. feedback, data display, and containers;
4. Storybook story architecture and visual fixtures;
5. final visual/a11y/distribution hardening.

The package is not published during implementation. Release authority reviews
the resulting Changeset and visual evidence before any canary or stable release.
