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
