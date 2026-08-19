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
import {routeHref, type Route} from '../router.js';

const destinations: readonly {label: string; route: Route}[] = [
  {label: 'Docs', route: 'docs'},
  {label: 'Components', route: 'components'},
  {label: 'Templates', route: 'templates'},
  {label: 'Themes', route: 'themes'},
];

const repository = 'https://github.com/Misoto22/kioku-ui';

// Three appearances, not two. `system` is a state of its own — it omits
// `color-scheme` so the reader's own setting decides — and a control with two
// positions cannot say it, which is why this is a menu rather than a switch.
const appearances: readonly {id: ColorMode; label: string}[] = [
  {id: 'light', label: 'Light'},
  {id: 'dark', label: 'Dark'},
  {id: 'system', label: 'System'},
];

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
 * marked. Both settings up there are the same instrument, so they are the
 * same component rather than two spellings of it.
 *
 * The trigger names the setting as well as its value — "Skin: Washi", not
 * "Washi" — because a word alone in a banner is a value with no question
 * attached to it. The visible word stays inside that name rather than being
 * replaced by it.
 */
function ClusterMenu<Id extends string>({
  items,
  label,
  onSelect,
  selected,
  trigger,
  triggerLabel,
}: {
  readonly items: readonly {readonly id: Id; readonly label: string}[];
  readonly label: string;
  readonly onSelect: (id: Id) => void;
  readonly selected: Id;
  readonly trigger: ReactNode;
  readonly triggerLabel: string;
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
            setOpen((value) => !value);
          }}
          variant="ghost"
        >
          {trigger}
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
 * appearance and source are all `sizeControlMd` tall, all centred on the same
 * line, all ghost weight in the second rank of ink, and they are parted by
 * `spacingXs` — the same gap the destinations on the other side are parted by
 * — instead of by whatever each one happened to bring with it. Appearance and
 * skin are also the same control twice, because they are the same kind of
 * choice: one setting in use, a short list of alternatives, no emphasis.
 */
export function SiteHeader({current, onNavigate}: SiteHeaderProps) {
  const wide = useMediaQuery('(min-width: 56rem)');
  const {mode, setMode, setThemeId, theme} = useTheme();
  const appearance = appearances.find(({id}) => id === mode)?.label ?? mode;

  const links: ReactNode[] = destinations.map((destination) => (
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
            <NavMenu label="Primary" orientation="horizontal">
              {links}
            </NavMenu>
          ) : null}
        </HStack>

        <HStack gap="xs">
          {wide ? (
            <ClusterMenu
              items={kiokuThemes.map(({id, label}) => ({id, label}))}
              label="Skin"
              onSelect={setThemeId}
              selected={theme.id}
              trigger={
                <>
                  {theme.label}
                  <ChevronGlyph />
                </>
              }
              triggerLabel={`Skin: ${theme.label}`}
            />
          ) : null}
          <ClusterMenu
            items={appearances}
            label="Appearance"
            onSelect={setMode}
            selected={mode}
            trigger={<AppearanceGlyph mode={mode} />}
            triggerLabel={`Appearance: ${appearance}`}
          />
          {wide ? (
            <NavItem
              href={repository}
              rel="noreferrer"
              style={{
                // The banner's own label size and weight, so the link reads as
                // a member of the cluster rather than as a sentence that
                // wandered in. Everything else — height, ink ranks, the mark
                // under the pointer — is what `NavItem` already draws for the
                // destinations on the other side of the bar.
                fontSize: 'var(--kioku-ui-typography-font-size-sm)',
                fontWeight: 'var(--kioku-ui-typography-font-weight-medium)',
              }}
              target="_blank"
            >
              GitHub
              <ExternalGlyph />
            </NavItem>
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
