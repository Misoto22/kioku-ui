import {useMemo, useState} from 'react';

import {
  Button,
  Card,
  Code,
  Divider,
  EmptyState,
  Eyebrow,
  Heading,
  HStack,
  Kbd,
  NavItem,
  NavMenu,
  Numeral,
  Stack,
  Text,
  TextInput,
  useHotkeys,
  useMediaQuery,
} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {components} from '../i18n/components.js';
import {useCopy, useLocale} from '../i18n/index.js';
import {PageContainer} from '../layout/PageContainer.js';
import {railOffset, railScroll} from '../layout/sticky.js';
import {componentHref, routeHref, sectionSlug, useLocation} from '../router.js';

import {
  allEntries,
  componentCatalog,
  type CatalogEntry,
} from '../data/componentCatalog.js';

// Where the story index is served from in development. The site does not ship
// Storybook, so this is a destination rather than a dependency.
const storybookOrigin = 'http://localhost:6006';

const searchId = 'component-search';

// Four to start with, named rather than ranked: one control, one primitive,
// one data surface, one provider. The descriptions come from the catalog, so
// the cards cannot drift from the index below them.
const startHere = ['Button', 'Stack', 'Table', 'ThemeProvider'];

// Every dimension the token contract has no role for is built from the spacing
// scale rather than written as a length, so the pages grow with the density the
// reader chose. Breakpoints are the exception: a media query cannot read a
// custom property, so those stay literal.
const measure = 'var(--kioku-ui-spacing-2xl)';

/**
 * How far a paragraph may run. A measure used to be written here in `ch`, and
 * `ch` is the width of the Latin zero — it has nothing to do with the CJK em,
 * so the same number reads as a comfortable English line and as a Chinese line
 * twice too long. A measure is therefore a length like every other dimension
 * on these pages: built out of the spacing scale, and picked per script.
 */
const proseMeasure = {
  // Roughly 75 Latin characters at body size.
  latin: `calc(24 * ${measure})`,
  // Roughly 45 hanzi, which is where a CJK line stops being walkable.
  han: `calc(22 * ${measure})`,
} as const;

function findEntry(name: string): CatalogEntry | undefined {
  return allEntries.find((entry) => entry.name === name);
}

function groupOf(name: string): string {
  return (
    componentCatalog.find((group) =>
      group.entries.some((entry) => entry.name === name),
    )?.title ?? ''
  );
}

/**
 * The component library. Search filters across every group at once and the
 * result count is announced, because a filter that silently empties the page
 * leaves a screen-reader user with no idea what happened.
 *
 * A group is a destination as well as a heading: arriving at one narrows the
 * index to it and marks it in the rail, which is what makes the group crumb on
 * a component's page a link rather than a word.
 */
export function ComponentsPage() {
  const [query, setQuery] = useState('');
  const wide = useMediaQuery('(min-width: 60rem)');
  const location = useLocation();
  const copy = useCopy(components);
  const {locale} = useLocale();
  // The measure follows the script, not the page: Chinese sets no word space
  // and its glyphs are square, so the line that is comfortable in one is half
  // as many characters in the other.
  const prose = locale === 'zh' ? proseMeasure.han : proseMeasure.latin;

  /** A group's own name in the language the page is being read in. */
  function groupName(title: string): string {
    return copy.groups[title] ?? title;
  }

  // The `/` hint above the field is only honest if `/` does something.
  useHotkeys({
    '/': (event) => {
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
      ) {
        return;
      }
      event.preventDefault();
      document.getElementById(searchId)?.focus();
    },
  });

  // Two filters over one list, in the order the reader applied them: the route
  // chooses which groups are on the page, the search box chooses what is left
  // inside them.
  // One group on screen is a chosen group, whether it was chosen from the rail
  // or narrowed to by the search field.
  const groups = useMemo(() => {
    const chosen =
      location.group === null
        ? componentCatalog
        : componentCatalog.filter(
            (group) => sectionSlug(group.title) === location.group,
          );

    const needle = query.trim().toLowerCase();
    if (needle === '') {
      return chosen;
    }

    return chosen
      .map((group) => ({
        ...group,
        entries: group.entries.filter(
          (entry) =>
            entry.name.toLowerCase().includes(needle) ||
            entry.description.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }, [location.group, query]);

  const roster = groups.length === 1;
  const matches = groups.reduce(
    (total, group) => total + group.entries.length,
    0,
  );

  return (
    <PageContainer>
      <div
        style={{
          alignItems: 'start',
          display: 'grid',
          gap: 'var(--kioku-ui-spacing-2xl)',
          gridTemplateColumns: wide
            ? `calc(8 * ${measure}) minmax(0, 1fr)`
            : 'minmax(0, 1fr)',
        }}
      >
        {wide ? (
          <Stack
            gap="lg"
            style={{
              alignSelf: 'start',
              insetBlockStart: railOffset,
              maxHeight: `calc(100vh - 5 * ${measure})`,
              ...railScroll,
              position: 'sticky',
            }}
          >
            <Stack gap="xs">
              <Eyebrow>{copy.groupsLabel}</Eyebrow>
              <NavMenu label={copy.groupsLabel}>
                {/* The way back out, and the state the index starts in. */}
                <NavItem
                  current={location.group === null}
                  href={routeHref('components')}
                >
                  <span style={{flex: '1 1 auto'}}>{copy.everything}</span>
                  <Numeral>{allEntries.length}</Numeral>
                </NavItem>
                {componentCatalog.map((group) => (
                  <NavItem
                    current={sectionSlug(group.title) === location.group}
                    href={routeHref('components', {group: group.title})}
                    key={group.title}
                  >
                    <span style={{flex: '1 1 auto'}}>
                      {groupName(group.title)}
                    </span>
                    <Numeral>{group.entries.length}</Numeral>
                  </NavItem>
                ))}
              </NavMenu>
            </Stack>

            <Divider />

            <Stack gap="xs">
              <Eyebrow>{copy.inLibrary.label}</Eyebrow>
              <Heading family="display" level={2} size="section">
                <Numeral>{allEntries.length}</Numeral>
              </Heading>
              <Text size="sm" tone="muted">
                {copy.inLibrary.note}
              </Text>
            </Stack>

            <Divider />

            <Stack gap="xs">
              <Eyebrow>{copy.accessibility.label}</Eyebrow>
              {/*
                The skin count is read off the pack rather than written into the
                sentence, so a theme added or dropped cannot leave this page
                claiming a number the audit no longer runs.
              */}
              <Text size="sm" tone="muted">
                {copy.accessibility.audit(kiokuThemes.length)}
              </Text>
              <span style={{alignSelf: 'start'}}>
                <Code>pnpm a11y:audit</Code>
              </span>
            </Stack>
          </Stack>
        ) : null}

        <Stack gap="xl">
          <Stack gap="md">
            <HStack align="end" gap="lg" justify="between" wrap>
              <Heading family="display" level={1} size="page">
                {copy.title}
              </Heading>
              {/* The one seal on this page. */}
              <Button
                onClick={() => {
                  window.open(storybookOrigin, '_blank', 'noopener');
                }}
              >
                {copy.openStorybook}
              </Button>
            </HStack>

            <Text size="lg" style={{maxWidth: prose}} tone="secondary">
              {copy.intro}
            </Text>

            <HStack align="center" gap="lg" wrap>
              <HStack align="center" gap="sm">
                <div style={{width: `calc(11 * ${measure})`}}>
                  <TextInput
                    aria-label={copy.search}
                    id={searchId}
                    onValueChange={setQuery}
                    placeholder={copy.search}
                    type="search"
                    value={query}
                  />
                </div>
                <Kbd>/</Kbd>
              </HStack>
              {/*
                The catalogue holds the particles, the page sets the figures:
                only the digits take the mono face, which is what rule 44 asks
                for and what a sentence in either language wants.
              */}
              <Eyebrow>
                {copy.shown.lead}
                <Numeral>{matches}</Numeral>
                {copy.shown.ofTotal}
                <Numeral>{allEntries.length}</Numeral>
                {copy.shown.thenGroups}
                <Numeral>{groups.length}</Numeral>
                {copy.shown.tail(groups.length)}
              </Eyebrow>
            </HStack>

            {/*
              Announced, not merely shown: a filter that silently empties the
              page leaves a screen-reader user with no idea what happened. It
              stays quiet when idle, because a second, different count beside
              the heading only invites the reader to reconcile two numbers.
            */}
            <Text aria-live="polite" size="sm" tone="muted">
              {query === '' ? '' : copy.matches(matches, query)}
            </Text>
          </Stack>

          {query === '' && location.group === null ? (
            <Stack gap="sm">
              <Eyebrow>{copy.startHere}</Eyebrow>
              <div
                style={{
                  display: 'grid',
                  gap: 'var(--kioku-ui-spacing-xl)',
                  gridTemplateColumns: `repeat(auto-fit, minmax(calc(7 * ${measure}), 1fr))`,
                }}
              >
                {startHere.map((name) => {
                  const entry = findEntry(name);
                  return entry === undefined ? null : (
                    <Card elevation="low" key={name}>
                      <Stack gap="xs">
                        <Eyebrow>{groupName(groupOf(name))}</Eyebrow>
                        <a
                          href={componentHref(name)}
                          style={{
                            color: 'var(--kioku-ui-color-text)',
                            fontWeight:
                              'var(--kioku-ui-typography-font-weight-medium)',
                            letterSpacing:
                              'var(--kioku-ui-typography-letter-spacing-label)',
                            textDecorationLine: 'none',
                          }}
                        >
                          {entry.name}
                        </a>
                        <Text size="sm" tone="secondary">
                          {entry.description}
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </div>
            </Stack>
          ) : null}

          {groups.length === 0 ? (
            <Card>
              <EmptyState
                action={
                  location.group === null ? (
                    <Button onClick={() => setQuery('')} variant="secondary">
                      {copy.empty.clearSearch}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setQuery('');
                        window.location.hash = routeHref('components').slice(1);
                      }}
                      variant="secondary"
                    >
                      {copy.empty.showEveryGroup}
                    </Button>
                  )
                }
                detail={
                  location.group === null
                    ? copy.empty.detailOverall
                    : copy.empty.detailInGroup
                }
                title={copy.empty.title}
              />
            </Card>
          ) : (
            /*
              Two jobs, two layouts. Browsing every group is a four-column
              index: the groups flow, so adding a component cannot leave a
              column short, and each group is kept whole so a heading never
              ends a column with its list starting in the next one.

              Reading ONE group is not that job. A single group fills one of
              the four columns and leaves the other three empty — about 700px
              of the content region — so it gets a roster instead: rows across
              the full measure, each carrying what the component is, which is
              the question a reader who has already chosen a group is asking.
            */
            <div
              style={
                roster
                  ? undefined
                  : {
                      columnGap: 'var(--kioku-ui-spacing-2xl)',
                      columnWidth: `calc(7 * ${measure})`,
                    }
              }
            >
              {groups.map((group) => (
                <div
                  key={group.title}
                  style={{
                    breakInside: 'avoid',
                    paddingBlockEnd: 'var(--kioku-ui-spacing-xl)',
                  }}
                >
                  <HStack
                    align="baseline"
                    justify="between"
                    style={{
                      borderBlockEnd:
                        'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-strong)',
                      gap: 'var(--kioku-ui-spacing-sm)',
                      paddingBlockEnd: 'var(--kioku-ui-spacing-xs)',
                    }}
                  >
                    <Heading level={2} size="subsection">
                      {groupName(group.title)}
                    </Heading>
                    <Numeral>{group.entries.length}</Numeral>
                  </HStack>
                  <NavMenu label={copy.groupMenu(groupName(group.title))}>
                    {group.entries.map((entry) => (
                      <NavItem
                        href={componentHref(entry.name)}
                        key={entry.name}
                      >
                        <span
                          style={
                            roster
                              ? {flex: 'none', minWidth: `calc(6 * ${measure})`}
                              : undefined
                          }
                        >
                          {entry.name}
                        </span>
                        {roster ? (
                          <span
                            style={{
                              color: 'var(--kioku-ui-color-text-muted)',
                              fontSize:
                                'var(--kioku-ui-typography-font-size-sm)',
                              minWidth: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {entry.description}
                          </span>
                        ) : null}
                      </NavItem>
                    ))}
                  </NavMenu>
                </div>
              ))}
            </div>
          )}
        </Stack>
      </div>
    </PageContainer>
  );
}
