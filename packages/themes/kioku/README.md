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

The initial theme release supports core `>=0.0.0 <0.2.0`. A later pre-1 core
minor must be compatibility-reviewed before this peer range is widened.
