import {useMemo, useState} from 'react';

import {
  Badge,
  Card,
  Code,
  HStack,
  Heading,
  Stack,
  Text,
  ToggleButton,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';

import {
  templateCatalog,
  templateCategories,
  type TemplateCategory,
} from '../data/templateCatalog.js';

/**
 * The template gallery. Categories are toggle buttons rather than links: they
 * filter what is already on the page instead of navigating somewhere, and
 * `aria-pressed` says which one is active.
 */
export function TemplatesPage() {
  const [category, setCategory] = useState<TemplateCategory>('All');

  const shown = useMemo(
    () =>
      category === 'All'
        ? templateCatalog
        : templateCatalog.filter((entry) => entry.category === category),
    [category],
  );

  const ready = shown.filter((entry) => entry.status === 'ready');
  const planned = shown.filter((entry) => entry.status === 'planned');

  return (
    <PageContainer>
      <Stack gap="xl">
        <Stack align="center" gap="md">
          <Heading level={1} size="page">
            Templates
          </Heading>
          <Text
            size="lg"
            style={{maxWidth: '48ch', textAlign: 'center'}}
            tone="secondary"
          >
            Whole pages, copied into your repository as source you own. Nothing
            here is a black box you import.
          </Text>
          <Card elevation="low">
            <Text size="sm">
              <Code>pnpm dlx @misoto22/kioku-ui-cli add pages dashboard</Code>
            </Text>
          </Card>
        </Stack>

        <HStack gap="xs" justify="center" wrap>
          {templateCategories.map((entry) => (
            <ToggleButton
              key={entry}
              onPressedChange={() => setCategory(entry)}
              pressed={entry === category}
              size="sm"
            >
              {entry}
            </ToggleButton>
          ))}
        </HStack>

        <Stack gap="lg">
          <Text aria-live="polite" size="sm" tone="muted">
            {ready.length} available
            {planned.length > 0 ? `, ${planned.length} planned` : ''}
          </Text>

          <div
            style={{
              display: 'grid',
              gap: 'var(--kioku-ui-spacing-lg)',
              gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
            }}
          >
            {[...ready, ...planned].map((entry) => (
              <Card key={entry.id}>
                <Stack gap="sm">
                  <HStack gap="sm" justify="between">
                    <Heading level={2} size="subsection">
                      {entry.title}
                    </Heading>
                    <Badge
                      tone={entry.status === 'ready' ? 'success' : 'warning'}
                    >
                      {entry.status === 'ready' ? 'Available' : 'Planned'}
                    </Badge>
                  </HStack>
                  <Text size="sm" tone="secondary">
                    {entry.description}
                  </Text>
                  <Text size="sm" tone="muted">
                    <Code>{entry.id}</Code>
                  </Text>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
