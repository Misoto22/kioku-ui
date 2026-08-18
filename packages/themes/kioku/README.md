# Kioku theme pack

`@misoto22/kioku-ui-theme-kioku` provides the Washi, Muji, and Sumi visual
identities as an external theme collection for `@misoto22/kioku-ui`.

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

The three skins carry Kioku Console's own palettes, geometry, and type scale:
warm paper rather than white, one 3px corner for every element including
controls, a hairline rule instead of a drop shadow, and the console's compact
spacing. Where a role that this package holds to WCAG AA missed the threshold on
one of its backgrounds, it keeps the console's hue and loses only lightness.

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

## Fonts

These themes name font families in their typography tokens but ship no
`@font-face` of their own — delivering font files is a host application's
decision, not a theme pack's. **A host that does not load them silently gets
its system UI font instead**, which is not what any of these themes describe.

| Role                                     | Family                          | Used by          |
| ---------------------------------------- | ------------------------------- | ---------------- |
| Body, heading                            | `Zen Kaku Gothic New`           | all three themes |
| Display                                  | `Shippori Mincho`               | Washi, Sumi      |
| Display                                  | `Zen Kaku Gothic New`           | Muji             |
| Mono                                     | `IBM Plex Mono`                 | all three themes |
| Body, heading, display under `:lang(zh)` | `Noto Sans SC`, `Noto Serif SC` | all three themes |

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
