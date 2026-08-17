import {
  Badge,
  Button,
  Card,
  Field,
  Heading,
  Stack,
  Text,
  TextInput,
  ThemeProvider,
} from '@misoto22/kioku-ui/source';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

export function App() {
  return (
    <ThemeProvider defaultThemeId="muji" themes={kiokuThemes}>
      <main style={{margin: '0 auto', maxWidth: 720, padding: 32}}>
        <Card style={{padding: 24}}>
          <Stack gap="lg">
            <Stack gap="xs">
              <Badge tone="info">Source distribution</Badge>
              <Heading level={1} size="page">
                Kioku UI sandbox
              </Heading>
              <Text>
                This application compiles the public source entrypoint through
                the supported Vite integration.
              </Text>
            </Stack>
            <Field
              description="Change the value to exercise a source-built control."
              label="Display name"
            >
              <TextInput defaultValue="Kioku UI" />
            </Field>
            <Button variant="secondary">Save sandbox value</Button>
          </Stack>
        </Card>
      </main>
    </ThemeProvider>
  );
}
