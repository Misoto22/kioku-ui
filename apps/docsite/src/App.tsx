import {AppShell, ThemeProvider} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {LocaleProvider} from './i18n/index.js';
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
 *
 * Language sits outside the theme rather than inside it, and the order is load
 * bearing. The theme's Chinese rules are written as `[data-theme]:lang(zh)`, so
 * the element carrying the tokens has to already be in a Chinese document for
 * the SC families and the wider leading to reach it. `LocaleProvider` puts the
 * language on `<html>`, which every theme root inherits — a locale declared
 * below the theme would arrive too late to change a single glyph.
 */
export function App() {
  return (
    <LocaleProvider>
      <ThemeProvider
        defaultMode="light"
        defaultThemeId="washi"
        themes={kiokuThemes}
      >
        <Site />
      </ThemeProvider>
    </LocaleProvider>
  );
}

function Site() {
  const [location, navigate] = useRoute();

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
