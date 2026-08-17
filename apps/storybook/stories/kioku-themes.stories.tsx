import type {Meta, StoryObj} from '@storybook/react-vite';
import {Badge, Button, Card, Heading, Stack, Text} from '@misoto22/kioku-ui';
import {
  ThemeProvider as ThemeProviderComponent,
  type ThemeDefinition,
} from '@misoto22/kioku-ui/theme';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

const meta = {
  title: 'Themes/Kioku',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemeSpecimen({
  density,
  mode,
  theme,
}: {
  density: 'compact' | 'standard';
  mode: 'light' | 'dark';
  theme: ThemeDefinition;
}) {
  return (
    <div data-density={density} style={{colorScheme: mode}}>
      <ThemeProviderComponent defaultThemeId={theme.id} themes={[theme]}>
        <div
          style={{
            background: 'var(--kioku-ui-color-canvas)',
            padding: 'var(--kioku-ui-spacing-lg)',
          }}
        >
          <Card>
            <div style={{padding: 'var(--kioku-ui-spacing-lg)'}}>
              <Stack gap="lg">
                <Stack gap="xs">
                  <Text size="sm">
                    {mode} · {density}
                  </Text>
                  <Heading level={2} size="page">
                    {theme.label}
                  </Heading>
                  <Text>
                    A quiet surface for reading personal history and recent
                    signals.
                  </Text>
                </Stack>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--kioku-ui-density-item-gap)',
                  }}
                >
                  <Badge tone="info">Recorded</Badge>
                  <Badge tone="success">Available</Badge>
                  <Badge tone="warning">Review</Badge>
                  <Badge tone="danger">Attention</Badge>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--kioku-ui-density-item-gap)',
                  }}
                >
                  <Button>Open record</Button>
                  <Button variant="secondary">View details</Button>
                </div>
              </Stack>
            </div>
          </Card>
        </div>
      </ThemeProviderComponent>
    </div>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 24,
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      }}
    >
      {kiokuThemes.flatMap((theme) =>
        (['light', 'dark'] as const).map((mode) => (
          <ThemeSpecimen
            density={mode === 'light' ? 'compact' : 'standard'}
            key={`${theme.id}-${mode}`}
            mode={mode}
            theme={theme}
          />
        )),
      )}
    </div>
  ),
};

export const ThemeProvider: Story = {
  render: () => (
    <ThemeProviderComponent defaultThemeId="washi" themes={kiokuThemes}>
      <Card>
        <div style={{padding: 'var(--kioku-ui-spacing-lg)'}}>
          <Text>The provider applies the selected theme token contract.</Text>
        </div>
      </Card>
    </ThemeProviderComponent>
  ),
};
