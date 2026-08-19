import {
  Badge,
  Button,
  Card,
  HStack,
  Heading,
  Link,
  Stack,
  Text,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';
import type {Route} from '../router.js';

// Split so the figure carries the visual weight and the label stays quiet.
// One line at one size makes a reader hunt for the number.
const facts = [
  {
    detail: 'Layout, controls, data, state, chat, and overlays.',
    figure: '126',
    label: 'components',
  },
  {
    detail: 'Eleven groups, validated at runtime.',
    figure: '72',
    label: 'semantic tokens',
  },
  {
    detail: 'Washi, Muji, Sumi, and frosted Kasumi, in light and dark.',
    figure: '4',
    label: 'themes',
  },
  {
    detail: 'Copied into your repository as source you own.',
    figure: '16',
    label: 'page templates',
  },
];

interface HomePageProps {
  readonly onNavigate: (route: Route) => void;
}

/** The landing page: what this is, and the two things to do next. */
export function HomePage({onNavigate}: HomePageProps) {
  return (
    <PageContainer>
      <Stack gap="2xl">
        <Stack
          align="center"
          gap="lg"
          style={{
            paddingBlockEnd: 'var(--kioku-ui-spacing-2xl)',
            paddingBlockStart: 'calc(var(--kioku-ui-spacing-2xl) * 2)',
          }}
        >
          <Badge tone="info">Currently unreleased</Badge>

          <Heading
            family="display"
            level={1}
            size="page"
            style={{maxWidth: '20ch', textAlign: 'center'}}
          >
            A product-neutral React design system
          </Heading>

          <Text
            size="lg"
            style={{maxWidth: '52ch', textAlign: 'center'}}
            tone="secondary"
          >
            Components, semantic tokens, themes, and build tooling. It ships no
            routes, no APIs, no data, and no business logic — those stay yours.
          </Text>

          <HStack gap="sm" justify="center" wrap>
            <Button onClick={() => onNavigate('docs')}>Get started</Button>
            <Button
              onClick={() => onNavigate('components')}
              variant="secondary"
            >
              Browse components
            </Button>
          </HStack>

          <Text size="sm" tone="muted">
            Built on React 19 and{' '}
            <Link href="https://stylexjs.com">StyleX</Link>
          </Text>
        </Stack>

        <div
          style={{
            display: 'grid',
            gap: 'var(--kioku-ui-spacing-lg)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
          }}
        >
          {facts.map((fact) => (
            <Card elevation="low" key={fact.label}>
              <Stack gap="xs">
                <Heading family="display" level={2} size="section">
                  {fact.figure}
                </Heading>
                <Text size="sm">{fact.label}</Text>
                <Text size="sm" tone="muted">
                  {fact.detail}
                </Text>
              </Stack>
            </Card>
          ))}
        </div>
      </Stack>
    </PageContainer>
  );
}
