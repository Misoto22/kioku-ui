import {
  Button,
  HStack,
  Icon,
  IconButton,
  MobileNav,
  NavItem,
  NavMenu,
  useMediaQuery,
} from '@misoto22/kioku-ui';

import {routeHref, type Route} from '../router.js';

const destinations: readonly {label: string; route: Route}[] = [
  {label: 'Docs', route: 'docs'},
  {label: 'Components', route: 'components'},
  {label: 'Templates', route: 'templates'},
  {label: 'Themes', route: 'themes'},
];

/** Light and dark are chosen here and applied through CSS `color-scheme`. */
export type ColorMode = 'dark' | 'light';

function MoonGlyph() {
  return (
    <Icon>
      <path
        d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Icon>
  );
}

function GitHubGlyph() {
  return (
    <Icon>
      <path
        d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7C6.7 19.7 6.2 18 6.2 18c-.4-1-.9-1.3-.9-1.3-.8-.5 0-.5 0-.5.9.1 1.3.9 1.3.9.8 1.3 2 .9 2.5.7.1-.6.3-1 .6-1.2-2-.2-4.2-1-4.2-4.5 0-1 .4-1.8.9-2.4 0-.3-.4-1.2.1-2.5 0 0 .8-.2 2.5.9a8.6 8.6 0 0 1 4.5 0c1.7-1.1 2.5-.9 2.5-.9.5 1.3.2 2.2.1 2.5.6.6.9 1.4.9 2.4 0 3.5-2.1 4.3-4.2 4.5.4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"
        fill="currentColor"
      />
    </Icon>
  );
}

interface SiteHeaderProps {
  readonly current: Route;
  readonly mode: ColorMode;
  readonly onModeChange: (mode: ColorMode) => void;
  readonly onNavigate: (route: Route) => void;
}

/**
 * The site banner. Destinations are real links so they can be opened in a new
 * tab and read as links; `onNavigate` only saves the hash round-trip.
 *
 * The surface is full-bleed while its contents are held to the same measure
 * as the pages, so the banner spans the viewport but its edges line up with
 * the content below it.
 */
export function SiteHeader({
  current,
  mode,
  onModeChange,
  onNavigate,
}: SiteHeaderProps) {
  const wide = useMediaQuery('(min-width: 56rem)');

  const links = destinations.map((destination) => (
    <NavItem
      current={destination.route === current}
      href={routeHref(destination.route)}
      key={destination.route}
      onClick={() => onNavigate(destination.route)}
    >
      {destination.label}
    </NavItem>
  ));

  return (
    <header
      style={{
        backgroundColor: 'var(--kioku-ui-color-surface)',
        borderBlockEnd:
          'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-default)',
        boxShadow: 'var(--kioku-ui-elevation-low)',
        insetBlockStart: 0,
        position: 'sticky',
        zIndex: 10,
      }}
    >
      <HStack
        justify="between"
        style={{
          gap: 'var(--kioku-ui-spacing-lg)',
          marginInline: 'auto',
          maxWidth: '76rem',
          paddingBlock: 'var(--kioku-ui-spacing-md)',
          paddingInline: 'var(--kioku-ui-spacing-lg)',
        }}
      >
        <HStack gap="lg">
          <a
            href={routeHref('home')}
            onClick={() => onNavigate('home')}
            style={{
              color: 'var(--kioku-ui-color-text)',
              fontFamily: 'var(--kioku-ui-typography-font-family-display)',
              fontSize: 'var(--kioku-ui-typography-font-size-xl)',
              fontWeight: 'var(--kioku-ui-typography-font-weight-strong)',
              letterSpacing: '0.04em',
              textDecoration: 'none',
            }}
          >
            記憶
          </a>
          {wide ? (
            <NavMenu label="Primary" orientation="horizontal">
              {links}
            </NavMenu>
          ) : null}
        </HStack>

        <HStack gap="sm">
          <IconButton
            aria-label={
              mode === 'dark' ? 'Use light appearance' : 'Use dark appearance'
            }
            aria-pressed={mode === 'dark'}
            onClick={() => onModeChange(mode === 'dark' ? 'light' : 'dark')}
            variant="ghost"
          >
            <MoonGlyph />
          </IconButton>
          <IconButton
            aria-label="Kioku UI on GitHub"
            onClick={() => {
              window.open(
                'https://github.com/Misoto22/kioku-ui',
                '_blank',
                'noopener',
              );
            }}
            variant="ghost"
          >
            <GitHubGlyph />
          </IconButton>
          {wide ? (
            <Button onClick={() => onNavigate('docs')}>Get started</Button>
          ) : (
            <MobileNav label="Open navigation" title="Kioku UI">
              <NavMenu label="Primary">{links}</NavMenu>
            </MobileNav>
          )}
        </HStack>
      </HStack>
    </header>
  );
}
