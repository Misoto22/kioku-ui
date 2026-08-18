import {useState} from 'react';

import {AppShell, ThemeProvider} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {SiteFooter} from './layout/SiteFooter.js';
import {SiteHeader, type ColorMode} from './layout/SiteHeader.js';
import {ComponentsPage} from './pages/ComponentsPage.js';
import {DocsPage} from './pages/DocsPage.js';
import {HomePage} from './pages/HomePage.js';
import {TemplatesPage} from './pages/TemplatesPage.js';
import {ThemesPage} from './pages/ThemesPage.js';
import {useRoute} from './router.js';

/**
 * The site shell. Colour mode is held here and applied with CSS
 * `color-scheme`, which is what makes the themes' `light-dark()` values
 * resolve — the theme itself only decides which pair of colours to offer.
 */
export function App() {
  const [route, navigate] = useRoute();
  const [mode, setMode] = useState<ColorMode>('light');

  return (
    <ThemeProvider defaultThemeId="washi" themes={kiokuThemes}>
      <div style={{colorScheme: mode, minHeight: '100vh'}}>
        <AppShell
          contentPadding={false}
          footer={<SiteFooter onNavigate={navigate} />}
          header={
            <SiteHeader
              current={route}
              mode={mode}
              onModeChange={setMode}
              onNavigate={navigate}
            />
          }
        >
          {route === 'home' ? <HomePage onNavigate={navigate} /> : null}
          {route === 'components' ? <ComponentsPage /> : null}
          {route === 'templates' ? <TemplatesPage /> : null}
          {route === 'themes' ? <ThemesPage /> : null}
          {route === 'docs' ? <DocsPage onNavigate={navigate} /> : null}
        </AppShell>
      </div>
    </ThemeProvider>
  );
}
