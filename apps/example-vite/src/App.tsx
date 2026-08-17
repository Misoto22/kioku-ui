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
    <ThemeProvider defaultThemeId="washi" themes={kiokuThemes}>
      <main style={{margin: '0 auto', maxWidth: 640, padding: 32}}>
        <Card style={{display: 'grid', gap: 16, padding: 24}}>
          <h1>Compiled Vite distribution</h1>
          <Field
            description="This field is labelled by the public Field component."
            label="Display name"
          >
            <TextInput defaultValue="Kioku UI" />
          </Field>
          <Button>Save example</Button>
        </Card>
      </main>
    </ThemeProvider>
  );
}
