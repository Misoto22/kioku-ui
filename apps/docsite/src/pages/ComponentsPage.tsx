import {useMemo, useState} from 'react';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  HStack,
  Heading,
  NavItem,
  NavMenu,
  Stack,
  Text,
  TextInput,
  useMediaQuery,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';

import {
  allEntries,
  componentCatalog,
  type CatalogEntry,
} from '../data/componentCatalog.js';

function slug(name: string) {
  return name.replace(/([a-z])([A-Z])/gu, '$1-$2').toLowerCase();
}

function EntryCard({entry}: {readonly entry: CatalogEntry}) {
  return (
    <Card elevation="low" id={slug(entry.name)}>
      <Stack gap="sm">
        <HStack gap="sm" justify="between">
          <Heading level={3} size="subsection">
            {entry.name}
          </Heading>
          {entry.status === 'planned' ? (
            <Badge tone="warning">Planned</Badge>
          ) : null}
        </HStack>
        <Text size="sm" tone="secondary">
          {entry.description}
        </Text>
      </Stack>
    </Card>
  );
}

/**
 * The component library. Search filters across every group at once and the
 * result count is announced, because a filter that silently empties the page
 * leaves a screen-reader user with no idea what happened.
 */
export function ComponentsPage() {
  const [query, setQuery] = useState('');
  const wide = useMediaQuery('(min-width: 60rem)');

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') {
      return componentCatalog;
    }

    return componentCatalog
      .map((group) => ({
        ...group,
        entries: group.entries.filter(
          (entry) =>
            entry.name.toLowerCase().includes(needle) ||
            entry.description.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }, [query]);

  const matches = groups.reduce(
    (total, group) => total + group.entries.length,
    0,
  );
  const readyCount = allEntries.filter(
    (entry) => entry.status === 'ready',
  ).length;

  return (
    <PageContainer>
      <div
        style={{
          display: 'grid',
          gap: 'var(--kioku-ui-spacing-2xl)',
          gridTemplateColumns: wide ? '14rem minmax(0, 1fr)' : 'minmax(0, 1fr)',
        }}
      >
        {wide ? (
          <Stack
            gap="lg"
            style={{
              alignSelf: 'start',
              insetBlockStart: 'var(--kioku-ui-spacing-2xl)',
              maxHeight: 'calc(100vh - 8rem)',
              overflowY: 'auto',
              position: 'sticky',
            }}
          >
            <NavMenu label="Component groups">
              {componentCatalog.map((group) => (
                <NavItem href={`#${slug(group.title)}`} key={group.title}>
                  {group.title}
                </NavItem>
              ))}
            </NavMenu>
          </Stack>
        ) : null}

        <Stack gap="xl">
          <Stack gap="md">
            <Heading level={1} size="page">
              Browse the library
            </Heading>
            <Text size="lg" tone="secondary">
              {readyCount} components available and{' '}
              {allEntries.length - readyCount} planned, grouped by what you are
              trying to do. Every built one carries its own documentation,
              tests, and Storybook story.
            </Text>
            <div style={{maxWidth: '26rem'}}>
              <TextInput
                aria-label="Search components"
                onValueChange={setQuery}
                placeholder="Search components"
                type="search"
                value={query}
              />
            </div>
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

          {groups.length === 0 ? (
            <Card>
              <EmptyState
                action={
                  <Button onClick={() => setQuery('')} variant="secondary">
                    Clear search
                  </Button>
                }
                detail="Try a shorter word, or clear the search to see everything."
                title="Nothing matches that"
              />
            </Card>
          ) : (
            groups.map((group) => (
              <Stack gap="md" key={group.title}>
                <Heading id={slug(group.title)} level={2} size="section">
                  {group.title}
                </Heading>
                <div
                  style={{
                    display: 'grid',
                    gap: 'var(--kioku-ui-spacing-md)',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(16rem, 1fr))',
                  }}
                >
                  {group.entries.map((entry) => (
                    <EntryCard entry={entry} key={entry.name} />
                  ))}
                </div>
              </Stack>
            ))
          )}
        </Stack>
      </div>
    </PageContainer>
  );
}
