'use client';

import {
  Button,
  Card,
  Field,
  TextInput,
  ThemeProvider,
} from '@misoto22/kioku-ui/source';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

export default function Page() {
  return (
    <ThemeProvider defaultThemeId="washi" themes={kiokuThemes}>
      <main style={{margin: '0 auto', maxWidth: 640, padding: 32}}>
        <Card style={{display: 'grid', gap: 16, padding: 24}}>
          <h1>Source Next.js distribution</h1>
          <Field
            description="Babel and PostCSS compile the public source distribution."
            label="Display name"
          >
            <TextInput defaultValue="Kioku UI" />
          </Field>
          <Button variant="ghost">Save example</Button>
        </Card>
      </main>
    </ThemeProvider>
  );
}
