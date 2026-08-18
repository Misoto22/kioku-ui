# Contributing to Kioku UI

Kioku UI is a product-neutral design system: it ships components, tokens,
themes, and build integrations, and it ships no application routes, APIs,
data, or business logic. That boundary decides most review outcomes, so it is
worth reading [CONTEXT.md](CONTEXT.md) before opening a pull request.

## Getting set up

Node 24 and pnpm 11.10.0 — both are pinned, and `.nvmrc` matches CI.

```bash
pnpm install --frozen-lockfile
```

```bash
pnpm build:packages
```

Build the packages once before anything else: the theme pack and the Storybook
app both typecheck against `packages/core`'s emitted declarations, so a clean
checkout fails `pnpm typecheck` until `dist` exists.

Then run Storybook, which is where components are developed:

```bash
pnpm storybook
```

## The one command that matters

```bash
pnpm check
```

That runs, in order: `check:repo`, `check:package-boundaries`, `lint`,
`build:packages`, `typecheck`, and `test`. CI runs the same steps plus
`pnpm format`, `pnpm a11y:audit`, `pnpm verify-exports`, and a build of every
example application. If `pnpm check` and `pnpm format` are green locally, CI
usually is too.

```bash
pnpm format
```

Prettier also formats `pnpm-lock.yaml`. After any `pnpm install` that changes
the lockfile, run `pnpm format` before committing, or CI will fail on a file
you did not mean to touch.

## Adding a component

A component is not finished when it renders. Each one lands as a directory
under `packages/core/src/<Name>/` with four files:

| File              | Holds                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| `<Name>.tsx`      | The component, styled with StyleX against `semanticTokens`            |
| `<Name>.doc.ts`   | Metadata: description, props, inherited attributes, example, story id |
| `<Name>.test.tsx` | Behaviour, queried by role and accessible name                        |
| `index.ts`        | The public re-export                                                  |

Then register it in four more places, or the suite will tell you which one you
missed:

1. `packages/core/src/index.ts` — the public export
2. `packages/core/src/docs/index.ts` — the imports, re-exports, and the
   `componentDocs` catalogue order
3. `packages/core/src/docs/index.test.ts` and
   `packages/core/src/package-build.test.ts` — the expected catalogue
4. `internal/vibe-tests/src/component-index.ts` — the required story names,
   or `structuralComponents` if the component is a slot of another one
   (`ListItem`, `CardHeader`, `SideNavSection`)

Finally add `apps/storybook/stories/<Name>.stories.tsx`. Its `title` must be
`Core/<Name>`, its `Default` story must apply its own args, and it must export
every story name listed for it in `component-index.ts`.

## What review looks for

**Product neutrality.** No routes, no data fetching, no domain language, no
hard-coded theme. A component that needs navigation takes it from
`LinkProvider`; one that needs strings takes them from
`InternationalizationProvider`.

**Accessibility, not the appearance of it.** State is announced, not implied
by colour or position: `aria-current` rather than a different shade,
`aria-pressed` rather than a pressed-looking border, a named author rather
than which side a chat bubble sits on. Collections that hold many controls —
menus, toolbars, trees, tab strips, calendars — occupy one tab stop and move
with the arrow keys.

**Tokens, never raw values.** Colour, spacing, radius, elevation, and motion
come from `semanticTokens`. Literal CSS values are for things the contract
does not model, such as `50%` or an aspect ratio.

**The StyleX capability policy.** `internal/stylex-capabilities` allows a
fixed set of selectors. `:has()` is not among them; drive that state from
React instead. Adding a selector to the allowlist is a deliberate change with
its own reasoning, not a side effect of landing a component.

**Tests that would fail if the behaviour broke.** Query by role and accessible
name. A test that only asserts an element exists rarely catches anything.

## Changesets

Any change to a published package needs a changeset, and CI enforces it:

```bash
pnpm changeset
```

Changes confined to `apps/`, `internal/`, or documentation do not need one.

## Commits and pull requests

Commit messages are in English and in the imperative mood. Keep one logical
change per commit. Describe in the pull request what the change does and what
you verified; if you changed a component's public API, say what a consumer has
to do about it.
