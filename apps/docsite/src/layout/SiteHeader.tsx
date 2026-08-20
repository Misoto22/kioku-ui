import {useRef, useState, type ReactNode} from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  HStack,
  Icon,
  MobileNav,
  NavItem,
  NavMenu,
  useMediaQuery,
  useTheme,
  type ColorMode,
} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {pageMeasure} from './PageContainer.js';
import {chrome} from '../i18n/chrome.js';
import {localeNames, locales, useCopy, useLocale} from '../i18n/index.js';
import {routeHref, type Route} from '../router.js';

const destinations = [
  'docs',
  'components',
  'templates',
  'themes',
] as const satisfies readonly Exclude<Route, 'home'>[];

const repository = 'https://github.com/Misoto22/kioku-ui';

// Three appearances, not two. `system` is a state of its own — it omits
// `color-scheme` so the reader's own setting decides — and a control with two
// positions cannot say it, which is why this is a menu rather than a switch.
const appearances = [
  'light',
  'dark',
  'system',
] as const satisfies readonly ColorMode[];

/**
 * How much of a trigger survives at this width.
 *
 * The value goes first, because it is the part the glyph already stands for.
 * The chevron goes second, and only where the control has folded to a single
 * square — at that size the glyph alone is the whole affordance and a chevron
 * beside it would take a third of the button to say what the tap already says.
 */
type Density = 'compact' | 'full' | 'glyph';

function ExternalGlyph() {
  return (
    <Icon viewBox="0 0 16 16">
      <path
        d="M9.5 3H13v3.5M13 3 7.6 8.4M11.4 9.6V13H3V4.6h3.4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

function ChevronGlyph() {
  return (
    <Icon viewBox="0 0 16 16">
      <path
        d="m4.5 6.5 3.5 3.5 3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

function CheckGlyph() {
  return (
    <Icon viewBox="0 0 16 16">
      <path
        d="m3.5 8.5 3 3 6-6.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

/** Two sheets, one laid over the other: a skin is a sheet swapped for another. */
function SkinGlyph() {
  return (
    <Icon viewBox="0 0 16 16">
      <rect
        fill="none"
        height="7.4"
        rx="1.2"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        width="7.4"
        x="2.2"
        y="4.4"
      />
      <path
        d="M6.4 4.4V3.2a1 1 0 0 1 1-1h5.4a1 1 0 0 1 1 1v5.4a1 1 0 0 1-1 1h-1.2"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

/**
 * A globe with a meridian: the one glyph in the cluster that has to be read by
 * someone who cannot read the page it sits on, so it says nothing in words.
 */
function LanguageGlyph() {
  return (
    <Icon viewBox="0 0 16 16">
      <circle
        cx="8"
        cy="8"
        fill="none"
        r="5.9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.1 8h11.8M8 2.1c1.7 1.6 2.6 3.7 2.6 5.9S9.7 12.3 8 13.9M8 2.1C6.3 3.7 5.4 5.8 5.4 8s.9 4.3 2.6 5.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

/** The appearance in use, drawn once per state so the trigger reads at rest. */
function AppearanceGlyph({mode}: {readonly mode: ColorMode}) {
  if (mode === 'dark') {
    return (
      <Icon viewBox="0 0 16 16">
        <path
          d="M13.4 9.7A5.7 5.7 0 1 1 6.3 2.6a4.6 4.6 0 0 0 7.1 7.1Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </Icon>
    );
  }

  if (mode === 'light') {
    return (
      <Icon viewBox="0 0 16 16">
        <circle
          cx="8"
          cy="8"
          fill="none"
          r="3.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 1.4v1.6M8 13v1.6M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M1.4 8h1.6M13 8h1.6M3.3 12.7l1.1-1.1M11.6 4.4l1.1-1.1"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </Icon>
    );
  }

  return (
    <Icon viewBox="0 0 16 16">
      <path
        d="M2.4 3.2h11.2v7.2H2.4zM6 13.4h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

/**
 * One control in the banner's trailing cluster: a ghost trigger that shows
 * what is in use, and the list of what else there is with the one in use
 * marked. All three settings up there are the same instrument, so they are the
 * same component rather than three spellings of it — and the trigger is
 * composed here rather than by each caller, which is what keeps them identical
 * as the bar narrows.
 *
 * The accessible name always carries the setting as well as its value — "Skin:
 * Washi", not "Washi" — at every density. A word alone in a banner is a value
 * with no question attached to it, and at the narrowest width there is no
 * visible word at all.
 */
function ClusterMenu<Id extends string>({
  density,
  glyph,
  items,
  label,
  onSelect,
  selected,
  triggerLabel,
  value,
}: {
  readonly density: Density;
  readonly glyph: ReactNode;
  readonly items: readonly {readonly id: Id; readonly label: string}[];
  readonly label: string;
  readonly onSelect: (id: Id) => void;
  readonly selected: Id;
  readonly triggerLabel: string;
  readonly value: string;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <span ref={anchorRef} style={{display: 'inline-flex'}}>
        <Button
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={triggerLabel}
          onClick={() => {
            setOpen((current) => !current);
          }}
          variant="ghost"
        >
          {glyph}
          {density === 'full' ? value : null}
          {density === 'glyph' ? null : <ChevronGlyph />}
        </Button>
      </span>
      <DropdownMenu
        alignment="end"
        anchorRef={anchorRef}
        label={label}
        onDismiss={() => {
          setOpen(false);
        }}
        open={open}
      >
        {items.map((item) => {
          const current = item.id === selected;

          return (
            <DropdownMenuItem
              {...(current ? {'aria-current': true as const} : {})}
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                setOpen(false);
              }}
              {...(current ? {trailing: <CheckGlyph />} : {})}
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenu>
    </>
  );
}

/**
 * The link out to the source, drawn in two places: in the bar while there is
 * room for it, and inside the sheet once there is not. In the sheet it always
 * keeps its word — a sheet is a column of names, and a lone glyph among them
 * reads as a row that failed to load.
 */
function RepositoryLink({
  label,
  labelled,
}: {
  readonly label: string;
  readonly labelled: boolean;
}) {
  return (
    <NavItem
      {...(labelled ? {} : {'aria-label': label})}
      href={repository}
      rel="noreferrer"
      style={{
        // The banner's own label size and weight, so the link reads as a
        // member of the cluster rather than as a sentence that wandered in.
        // Everything else — height, ink ranks, the mark under the pointer — is
        // what `NavItem` already draws for the destinations on the other side
        // of the bar.
        fontSize: 'var(--kioku-ui-typography-font-size-sm)',
        fontWeight: 'var(--kioku-ui-typography-font-weight-medium)',
      }}
      target="_blank"
    >
      {labelled ? label : null}
      <ExternalGlyph />
    </NavItem>
  );
}

interface SiteHeaderProps {
  readonly current: Route;
  readonly onNavigate: (route: Route) => void;
}

/**
 * The site banner: one hairline separates it from the page, and nothing else.
 * Destinations are real links so they can be opened in a new tab and read as
 * links; `onNavigate` only saves the hash round-trip.
 *
 * The surface is full-bleed while its contents are held to the same measure
 * as the pages, so the banner spans the viewport but its edges line up with
 * the content below it.
 *
 * There is no call to action here. The emphatic button is one per scope, and
 * on every page of this site that one belongs to the page, not the banner.
 *
 * The trailing cluster is one instrument rather than three souvenirs. Skin,
 * appearance and language are all `sizeControlMd` tall, all centred on the same
 * line, all ghost weight in the second rank of ink, and they are parted by
 * `spacingXs` — the same gap the destinations on the other side are parted by.
 * They are also literally the same control three times, because they are the
 * same kind of choice: one setting in use, a short list of alternatives, no
 * emphasis.
 *
 * It gives way in a fixed order as the bar narrows. First the values go, since
 * a glyph and a chevron still say there is a choice here. Then skin and the
 * repository link fold into the sheet. Language never folds: a reader who
 * cannot read this page has to be able to leave it from the bar, and a setting
 * buried behind a hamburger labelled in a language they do not read is not a
 * way out.
 */
export function SiteHeader({current, onNavigate}: SiteHeaderProps) {
  // Two thresholds, not one. Between them the bar keeps its destinations and
  // its whole cluster and spends nothing on the values.
  const spacious = useMediaQuery('(min-width: 64rem)');
  const wide = useMediaQuery('(min-width: 55rem)');
  const {mode, setMode, setThemeId, theme} = useTheme();
  const {locale, setLocale} = useLocale();
  const copy = useCopy(chrome);

  const density: Density = spacious ? 'full' : wide ? 'compact' : 'glyph';
  const appearance = copy.appearance.options[mode];

  const links: ReactNode[] = destinations.map((route) => (
    <NavItem
      current={route === current}
      href={routeHref(route)}
      key={route}
      onClick={() => onNavigate(route)}
    >
      {copy.destinations[route]}
    </NavItem>
  ));

  const skinMenu = (
    <ClusterMenu
      density={wide ? density : 'full'}
      glyph={<SkinGlyph />}
      items={kiokuThemes.map(({id, label}) => ({id, label}))}
      label={copy.skin.label}
      onSelect={setThemeId}
      selected={theme.id}
      triggerLabel={copy.skin.trigger(theme.label)}
      value={theme.label}
    />
  );

  return (
    <header
      style={{
        backgroundColor: 'var(--kioku-ui-color-surface)',
        borderBlockEnd:
          'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-default)',
        insetBlockStart: 0,
        position: 'sticky',
        zIndex: 10,
      }}
    >
      <HStack
        justify="between"
        style={{
          gap: 'var(--kioku-ui-spacing-xl)',
          marginInline: 'auto',
          maxWidth: pageMeasure,
          paddingBlock: 'var(--kioku-ui-spacing-sm)',
          paddingInline: 'var(--kioku-ui-spacing-2xl)',
          width: '100%',
        }}
      >
        <HStack gap="xl">
          {/*
            記憶 does not localise. It is a mark, and it keeps its mincho forms
            whichever language the page is being read in.
          */}
          <a
            href={routeHref('home')}
            onClick={() => onNavigate('home')}
            style={{
              alignItems: 'baseline',
              color: 'var(--kioku-ui-color-text)',
              display: 'inline-flex',
              gap: 'var(--kioku-ui-spacing-sm)',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--kioku-ui-typography-font-family-display)',
                fontSize: 'var(--kioku-ui-typography-font-size-lg)',
                fontWeight: 'var(--kioku-ui-typography-font-weight-medium)',
                letterSpacing:
                  'var(--kioku-ui-typography-letter-spacing-label)',
              }}
            >
              記憶
            </span>
            <span
              style={{
                color: 'var(--kioku-ui-color-text-secondary)',
                fontFamily: 'var(--kioku-ui-typography-font-family-heading)',
                fontSize: 'var(--kioku-ui-typography-font-size-xs)',
                letterSpacing:
                  'var(--kioku-ui-typography-letter-spacing-eyebrow)',
              }}
            >
              KIOKU UI
            </span>
          </a>
          {wide ? (
            <NavMenu label={copy.navigation.primary} orientation="horizontal">
              {links}
            </NavMenu>
          ) : null}
        </HStack>

        <HStack gap="xs">
          {wide ? skinMenu : null}
          <ClusterMenu
            density={density}
            glyph={<AppearanceGlyph mode={mode} />}
            items={appearances.map((id) => ({
              id,
              label: copy.appearance.options[id],
            }))}
            label={copy.appearance.label}
            onSelect={setMode}
            selected={mode}
            triggerLabel={copy.appearance.trigger(appearance)}
            value={appearance}
          />
          <ClusterMenu
            density={density}
            glyph={<LanguageGlyph />}
            items={locales.map((id) => ({id, label: localeNames[id]}))}
            label={copy.language.label}
            onSelect={setLocale}
            selected={locale}
            triggerLabel={copy.language.trigger(localeNames[locale])}
            value={localeNames[locale]}
          />
          {wide ? (
            <RepositoryLink
              label={copy.repository}
              labelled={density === 'full'}
            />
          ) : (
            <MobileNav label={copy.navigation.open} title="Kioku UI">
              <NavMenu label={copy.navigation.primary}>{links}</NavMenu>
              {skinMenu}
              <RepositoryLink label={copy.repository} labelled />
            </MobileNav>
          )}
        </HStack>
      </HStack>
    </header>
  );
}
