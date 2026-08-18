---
'@misoto22/kioku-ui': minor
'@misoto22/kioku-ui-theme-kioku': patch
---

Grow the component library to 126 components and fix three accessibility defects

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
