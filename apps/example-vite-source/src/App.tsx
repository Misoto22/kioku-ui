import {
  Button,
  Card,
  Field,
  TextInput,
  ThemeProvider,
} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

export function App() {
  return (
    <ThemeProvider defaultThemeId="muji" themes={kiokuThemes}>
      <main style={{margin: '0 auto', maxWidth: 640, padding: 32}}>
        <Card style={{display: 'grid', gap: 16, padding: 24}}>
          <h1>Source Vite distribution</h1>
          <Field
            description="StyleX authoring is compiled by the public Vite integration."
            label="Display name"
          >
            <TextInput defaultValue="Kioku UI" />
          </Field>
          <Button variant="secondary">Save example</Button>
        </Card>
      </main>
    </ThemeProvider>
  );
}
