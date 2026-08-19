import {AppShell, ThemeProvider, useTheme} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {SiteFooter} from './layout/SiteFooter.js';
import {SiteHeader} from './layout/SiteHeader.js';
import {ComponentDetailPage} from './pages/ComponentDetailPage.js';
import {ComponentsPage} from './pages/ComponentsPage.js';
import {DocsPage} from './pages/DocsPage.js';
import {HomePage} from './pages/HomePage.js';
import {TemplateDetailPage} from './pages/TemplateDetailPage.js';
import {TemplatesPage} from './pages/TemplatesPage.js';
import {ThemesPage} from './pages/ThemesPage.js';
import {useRoute} from './router.js';

/**
 * The site shell. Colour mode is the provider's now: it stamps `color-scheme`
 * on the same element that carries the tokens, which is the only element where
 * `light-dark()` can resolve. A wrapper div inside the provider — what this
 * used to be — sat below that element and changed nothing.
 */
export function App() {
  return (
    <ThemeProvider
      defaultMode="light"
      defaultThemeId="washi"
      themes={kiokuThemes}
    >
      <Site />
    </ThemeProvider>
  );
}

function Site() {
  const [location, navigate] = useRoute();
  const {mode, setMode} = useTheme();

  return (
    <>
      <AppShell
        contentPadding={false}
        footer={<SiteFooter onNavigate={navigate} />}
        header={<SiteHeader current={location.route} onNavigate={navigate} />}
      >
        {location.route === 'home' ? <HomePage onNavigate={navigate} /> : null}
        {location.route === 'components' && location.component === null ? (
          <ComponentsPage />
        ) : null}
        {location.route === 'components' && location.component !== null ? (
          <ComponentDetailPage slug={location.component} />
        ) : null}
        {location.route === 'templates' && location.template === null ? (
          <TemplatesPage />
        ) : null}
        {location.route === 'templates' && location.template !== null ? (
          <TemplateDetailPage id={location.template} />
        ) : null}
        {location.route === 'themes' ? <ThemesPage /> : null}
        {location.route === 'docs' ? <DocsPage onNavigate={navigate} /> : null}
      </AppShell>
    </>
  );
}
