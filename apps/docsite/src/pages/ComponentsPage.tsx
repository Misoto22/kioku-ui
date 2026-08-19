import {useMemo, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';

import {
  Button,
  Card,
  Code,
  Divider,
  EmptyState,
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

import {PageContainer} from '../layout/PageContainer.js';
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

const eyebrowStyle: CSSProperties = {
  color: 'var(--kioku-ui-color-text-secondary)',
  fontFamily: 'var(--kioku-ui-typography-font-family-display)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  fontWeight: 'var(--kioku-ui-typography-font-weight-medium)',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-eyebrow)',
  lineHeight: 'var(--kioku-ui-typography-line-height-heading)',
  textTransform: 'uppercase',
};

/** The label of last resort: it names a thing without competing with it. */
function Eyebrow({children}: {readonly children: ReactNode}) {
  return <span style={eyebrowStyle}>{children}</span>;
}

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
              insetBlockStart: 'var(--kioku-ui-spacing-2xl)',
              maxHeight: `calc(100vh - 5 * ${measure})`,
              overflowY: 'auto',
              position: 'sticky',
            }}
          >
            <Stack gap="xs">
              <Eyebrow>Component groups</Eyebrow>
              <NavMenu label="Component groups">
                {/* The way back out, and the state the index starts in. */}
                <NavItem
                  current={location.group === null}
                  href={routeHref('components')}
                >
                  <span style={{flex: '1 1 auto'}}>Everything</span>
                  <Numeral>{allEntries.length}</Numeral>
                </NavItem>
                {componentCatalog.map((group) => (
                  <NavItem
                    current={sectionSlug(group.title) === location.group}
                    href={routeHref('components', {group: group.title})}
                    key={group.title}
                  >
                    <span style={{flex: '1 1 auto'}}>{group.title}</span>
                    <Numeral>{group.entries.length}</Numeral>
                  </NavItem>
                ))}
              </NavMenu>
            </Stack>

            <Divider />

            <Stack gap="xs">
              <Eyebrow>In the library</Eyebrow>
              <Heading family="display" level={2} size="section">
                <span
                  style={{
                    fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing:
                      'var(--kioku-ui-typography-letter-spacing-mono)',
                  }}
                >
                  {allEntries.length}
                </span>
              </Heading>
              <Text size="sm" tone="muted">
                components, none planned and none stubbed. Every one carries its
                own documentation, tests, and a Storybook story.
              </Text>
            </Stack>

            <Divider />

            <Stack gap="xs">
              <Eyebrow>Accessibility</Eyebrow>
              <Text size="sm" tone="muted">
                Every story is audited with axe across all three themes in both
                colour modes, fingerprinted against a committed baseline.
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
                Browse the library
              </Heading>
              {/* The one seal on this page. */}
              <Button
                onClick={() => {
                  window.open(storybookOrigin, '_blank', 'noopener');
                }}
              >
                Open Storybook
              </Button>
            </HStack>

            <Text size="lg" style={{maxWidth: '96ch'}} tone="secondary">
              Grouped the way a reader looks for things rather than the way the
              source is laid out — the group names and their order mirror the
              reference system this library is aligned with, so anyone moving
              between the two finds the same component in the same place.
            </Text>

            <HStack align="center" gap="lg" wrap>
              <HStack align="center" gap="sm">
                <div style={{width: `calc(11 * ${measure})`}}>
                  <TextInput
                    aria-label="Search components"
                    id={searchId}
                    onValueChange={setQuery}
                    placeholder="Search components"
                    type="search"
                    value={query}
                  />
                </div>
                <Kbd>/</Kbd>
              </HStack>
              <Eyebrow>
                <Numeral>
                  {matches} of {allEntries.length}
                </Numeral>{' '}
                shown · <Numeral>{groups.length}</Numeral>{' '}
                {groups.length === 1 ? 'group' : 'groups'}
              </Eyebrow>
            </HStack>

            {/*
              Announced, not merely shown: a filter that silently empties the
              page leaves a screen-reader user with no idea what happened. It
              stays quiet when idle, because a second, different count beside
              the heading only invites the reader to reconcile two numbers.
            */}
            <Text aria-live="polite" size="sm" tone="muted">
              {query === ''
                ? ''
                : `${matches} ${matches === 1 ? 'match' : 'matches'} for “${query}”`}
            </Text>
          </Stack>

          {query === '' && location.group === null ? (
            <Stack gap="sm">
              <Eyebrow>Start here</Eyebrow>
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
                        <Eyebrow>{groupOf(name)}</Eyebrow>
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
                      Clear search
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setQuery('');
                        window.location.hash = routeHref('components').slice(1);
                      }}
                      variant="secondary"
                    >
                      Show every group
                    </Button>
                  )
                }
                detail={
                  location.group === null
                    ? 'Try a shorter word, or clear the search to see everything.'
                    : 'Nothing in this group answers to that. Try a shorter word, or widen the index to every group.'
                }
                title="Nothing matches that"
              />
            </Card>
          ) : (
            /*
              One index in four columns rather than four hand-packed columns:
              the groups flow, so adding a component cannot leave a column
              short. Each group is kept whole so a heading never ends a column
              with its list starting in the next one.
            */
            <div
              style={{
                columnGap: 'var(--kioku-ui-spacing-2xl)',
                columnWidth: `calc(7 * ${measure})`,
              }}
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
                      {group.title}
                    </Heading>
                    <Numeral>{group.entries.length}</Numeral>
                  </HStack>
                  <NavMenu label={`${group.title} components`}>
                    {group.entries.map((entry) => (
                      <NavItem
                        href={componentHref(entry.name)}
                        key={entry.name}
                      >
                        {entry.name}
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
