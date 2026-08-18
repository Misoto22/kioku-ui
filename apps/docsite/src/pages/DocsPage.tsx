import {
  Alert,
  Button,
  Card,
  CodeBlock,
  Divider,
  HStack,
  Heading,
  List,
  ListItem,
  Stack,
  Text,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';
import type {Route} from '../router.js';

const install = `pnpm add @misoto22/kioku-ui @misoto22/kioku-ui-theme-kioku`;

const wire = `import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

import {ThemeProvider} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

export function App({children}) {
  return (
    <ThemeProvider defaultThemeId="washi" themes={kiokuThemes}>
      {children}
    </ThemeProvider>
  );
}`;

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
/>`;

interface DocsPageProps {
  readonly onNavigate: (route: Route) => void;
}

/** Getting started: the four steps between an empty app and a themed one. */
export function DocsPage({onNavigate}: DocsPageProps) {
  return (
    <PageContainer width="narrow">
      <Stack gap="xl" style={{marginInline: 'auto', maxWidth: '52rem'}}>
        <Stack gap="md">
          <Heading level={1} size="page">
            Get started
          </Heading>
          <Text size="lg" tone="secondary">
            Four steps. The library supplies components, tokens, and themes;
            your application keeps its routes, data, and language.
          </Text>
        </Stack>

        <Alert tone="info">
          No version is published to npm yet. Until the first release, consume
          the packages through the workspace.
        </Alert>

        <Stack gap="md">
          <Heading level={2} size="section">
            1. Install
          </Heading>
          <CodeBlock code={install} language="bash" />
        </Stack>

        <Stack gap="md">
          <Heading level={2} size="section">
            2. Wrap the application
          </Heading>
          <Text tone="secondary">
            The host supplies the theme list and the default id. The library
            owns no storage and hard-codes no theme.
          </Text>
          <CodeBlock code={wire} language="tsx" />
        </Stack>

        <Stack gap="md">
          <Heading level={2} size="section">
            3. Load the fonts
          </Heading>
          <Text tone="secondary">
            The themes name font families but ship no font files — that is a
            host’s decision. Without this step everything falls back to the
            system UI font.
          </Text>
          <CodeBlock code={fonts} language="html" />
        </Stack>

        <Stack gap="md">
          <Heading level={2} size="section">
            4. Build a page
          </Heading>
          <Text tone="secondary">
            Start from a template rather than an empty file. The CLI copies the
            source into your repository, where you own it.
          </Text>
          <HStack gap="sm" wrap>
            <Button onClick={() => onNavigate('templates')}>
              Browse templates
            </Button>
            <Button
              onClick={() => onNavigate('components')}
              variant="secondary"
            >
              Browse components
            </Button>
          </HStack>
        </Stack>

        <Divider />

        <Card>
          <Stack gap="sm">
            <Heading level={2} size="subsection">
              What this library will not do
            </Heading>
            <List>
              <ListItem>Route, fetch, or persist anything.</ListItem>
              <ListItem>Name a product, a domain concept, or a page.</ListItem>
              <ListItem>Ship font files, or decide your copy.</ListItem>
              <ListItem>
                Hard-code a theme, or store which one you chose.
              </ListItem>
            </List>
          </Stack>
        </Card>
      </Stack>
    </PageContainer>
  );
}
