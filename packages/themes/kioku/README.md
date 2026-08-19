# Kioku theme pack

`@misoto22/kioku-ui-theme-kioku` provides the Washi, Muji, Sumi, and Kasumi
visual identities as an external theme collection for `@misoto22/kioku-ui`.

```tsx
import {ThemeProvider} from '@misoto22/kioku-ui/theme';
import {kiokuThemes, washiTheme} from '@misoto22/kioku-ui-theme-kioku';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

export function App({children}: {children: React.ReactNode}) {
  return (
    <ThemeProvider defaultThemeId={washiTheme.id} themes={kiokuThemes}>
      {children}
    </ThemeProvider>
  );
}
```

The host owns the selected theme and any persistence adapter. Palette values use
CSS `light-dark()`, so they follow the host's inherited `color-scheme`. The
themes share the package's semantic spacing, radius, and control-size scales.
The stylesheet never targets `:root`, `html`, or `body`.

Washi, Muji, and Sumi carry Kioku Console's own palettes, geometry, and type
scale:
warm paper rather than white, one 3px corner for every element including
controls, a hairline rule instead of a drop shadow, and the console's compact
spacing. Where a role that this package holds to WCAG AA missed the threshold on
one of its backgrounds, it keeps the console's hue and loses only lightness.

Kasumi is the fourth skin and the one exception — see **Kasumi and the frost
lever** below. It shares the same geometry and type scale, and differs only in
that its field surfaces are translucent.

Each skin fulfills the spacing roles at both densities, so a reader selecting
`standard` widens the same rhythm rather than switching visual identity:

```tsx
<ThemeProvider
  defaultDensity="standard"
  defaultThemeId={washiTheme.id}
  themes={kiokuThemes}
>
```

`typography.fontFeatureSettings` asks for `'palt' 1`, the proportional spacing
the Japanese faces these skins are set in are cut for; a theme whose type is
Latin says `normal` instead.

`texture.grain` is the paper speckle's own colour. Washi and Muji tint it; Sumi
sets it transparent, which is how a skin declines the texture.

The initial theme release supports core `>=0.0.0 <0.2.0`. A later pre-1 core
minor must be compatibility-reviewed before this peer range is widened.

## Kasumi and the frost lever

霞 is mist, and the only skin here that expects something behind it. Its field
surfaces are translucent and it blurs whatever the host drew, so a backdrop
reads through the interface while type keeps its contrast.

The model is ported from [Hermes Desktop][hermes]'s glass mode. Worth knowing
before you reach for it: in Hermes the blur is **native macOS vibrancy
composited below the web contents**, not CSS — in a transparent window
`backdrop-filter` reaches nothing, because the backdrop root is the document and
the desktop was never in it. On the web the blur is ours to draw, and three
things separate glass from a coloured film.

### 1. The tint goes to an extreme

Near-white in light, near-black in dark — never the mid-tone a skin would
otherwise use. A mid-tone film greys out whatever is behind it. Solving [Radix
Themes][radix]' alpha equation for a panel that must composite to `#f1f4f8` over
this canvas returns `#fefeff` at 50%, and Apple's navigation glass is
`rgba(0,0,0,0.8)` rather than a dark grey — the same answer from two directions.
So the field and the surfaces carry a near-neutral tint, and the skin spends its
whole chromatic budget on the accent.

### 2. The blur lives on a pseudo-element

`backdrop-filter` on the theme root would make it the containing block for every
`position: fixed` descendant — Tooltip, Toast, ContextMenu, AppShell, Popover,
Overlay and MobileNav all position against the viewport. A pseudo-element has no
descendants, so it can never be a containing block for anything. The root gets
`isolation: isolate`, which opens a stacking context rather than a containing
block, and `[data-theme='kasumi']::before` carries the filter at `z-index: -1`.

One consequence to know about: that stacking context contains the app. If a host
renders its own UI as a **sibling** of the ThemeProvider, a Dialog or Toast
inside the provider can no longer paint above it whatever its z-index. Wrapping
the whole application, which is the normal arrangement, is unaffected.

### 3. Saturation comes back

Glass amplifies the colour behind it; macOS vibrancy and Apple's navigation bar
both lift saturation to 180%, and `--kioku-theme-kasumi-frost-saturate` does the
same here. Mixing a tint toward `transparent` does the opposite.

### The host draws the backdrop — sharp

Put something behind the provider and leave it unfiltered. The theme blurs it:

```tsx
<div className="frost">
  <div className="frost__backdrop" aria-hidden />
  <ThemeProvider defaultThemeId={kasumiTheme.id} themes={kiokuThemes}>
    {children}
  </ThemeProvider>
</div>
```

```css
.frost {
  /* So the backdrop's negative z-index stays inside it. */
  isolation: isolate;
}

.frost__backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: url('/wallpaper.avif') center / cover no-repeat;
}
```

With nothing back there the filter is a no-op and Kasumi is simply a clean
near-white — or near-black — theme.

### One lever

`--kioku-theme-kasumi-frost-keep` is the percent of its own tint the skin keeps:
`100%` is an ordinary opaque skin, `0%` is bare backdrop. It ships at `64%`. Set
it at the same specificity as the theme's own default and later in the cascade,
and yours wins:

```css
[data-theme='kasumi'] {
  --kioku-theme-kasumi-frost-keep: 52%;
  --kioku-theme-kasumi-frost-blur: 26px;
  --kioku-theme-kasumi-frost-saturate: 180%;
}

/* Reduced transparency is a host policy, not a theme default. This package's
   stylesheet may only ever write a theme root, so it ships no media query —
   a host that honours the preference pins the lever back itself. */
@media (prefers-reduced-transparency: reduce) {
  [data-theme='kasumi'] {
    --kioku-theme-kasumi-frost-keep: 100%;
  }
}
```

### What thins and what does not

**Only the field thins.** `color.canvas` and `color.surfaceMuted` follow the
lever. Everything wearing `color.surface` or `color.surfaceRaised` — 47
components, every card, input, badge, tooltip and menu — clamps to
`max(84%, keep)` and is never thinner than the field beneath it. This is the
rule Hermes paid for: thinning nested surfaces stacks the tint once per layer,
so a deeply nested pane lands near-opaque while a shallow route reads clear, on
the same lever setting.

**Borders never thin.** The rim is drawn with alpha — dark in light mode, light
in dark mode — because an opaque line makes a thinned card read as a flat box
rather than a pane. But it does not follow the lever: whatever the host drew,
two regions still have to separate. `border.interactive` is the exception and
stays an exact colour, being the accent that carries focus and selected state.

**The grain stays.** It is what keeps a thinned fill reading as matte rather
than as a polished sheet, and it is the reason the mode is called matte
transparency rather than glass.

One thing to pass yourself: `Card` defaults to `elevation="none"`, which draws
the border and no shadow. Kasumi puts its specular edge — the bright inset
hairline that reads as a pane rather than a panel — in the elevation tokens, so
`<Card elevation="low">` is what shows it.

### Contrast, honestly

Under frost the real background is whatever the host drew, which no theme can
know. So the guarantee is stated against the extremes — a backdrop of pure black
and one of pure white bracket anything you can put back there — and the two
load-bearing numbers are asserted by the test suite rather than claimed.

**On a raised surface, muted text is AA against any backdrop at all, at every
setting of the lever.** That is what the `max(84%, keep)` clamp buys: no more
than 16% of the backdrop ever reaches a card, and the worst case across both
modes and both extremes is 5.02:1. Lower the clamp, or lighten muted text, and
the test notices.

**On the bare field the guarantee has an edge**, the field being the one thing
that is not clamped. Measured against those same extremes:

| Text sitting on the bare field | AA against any backdrop down to |
| ------------------------------ | ------------------------------- |
| `color.text`                   | keep 52% light, 60% dark        |
| `color.textSecondary`          | keep 64% light, 70% dark        |
| `color.textMuted`              | keep 74% light, 79% dark        |

At the shipping 64% body text is covered and muted text is not. Two things
follow, and they are the whole of the guidance:

1. **Under frost, muted text belongs on a raised surface.** A caption or a
   timestamp sitting directly on the canvas is the one combination the lever can
   take below AA.
2. **Match the backdrop's luminance to the mode.** The binding case in that
   table is always the mismatched one — a light skin over a near-black backdrop.
   Pair light with a light image and dark with a dark one and the real ratios
   sit well above the floor.

[hermes]: https://github.com/NousResearch/hermes-agent
[radix]: https://www.radix-ui.com/themes/docs/theme/color

## Fonts

These themes name font families in their typography tokens but ship no
`@font-face` of their own — delivering font files is a host application's
decision, not a theme pack's. **A host that does not load them silently gets
its system UI font instead**, which is not what any of these themes describe.

| Role                                     | Family                          | Used by             |
| ---------------------------------------- | ------------------------------- | ------------------- |
| Body, heading                            | `Zen Kaku Gothic New`           | all four themes     |
| Display                                  | `Shippori Mincho`               | Washi, Sumi, Kasumi |
| Display                                  | `Zen Kaku Gothic New`           | Muji                |
| Mono                                     | `IBM Plex Mono`                 | all four themes     |
| Body, heading, display under `:lang(zh)` | `Noto Sans SC`, `Noto Serif SC` | all four themes     |

Every stack falls back to a system family, so nothing breaks without them —
it simply stops looking like the theme. Load them however your application
already loads fonts; self-hosting is preferable to a third-party CDN if you
care about the request leaving your origin.

Request the weights `400`, `500`, and `700`. The themes ask for `600` as their
strong weight, but `Zen Kaku Gothic New` ships no 600 face, so the browser
resolves it to 700 — request 700 and it uses a real bold, omit it and it
synthesises one, which is visibly heavier and looser.

Chinese content resolves through `:lang(zh)`, so set the language on the
document or the subtree (`<html lang="zh">`) or the Latin families will be
asked to render glyphs they do not have.
