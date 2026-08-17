import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Button,
  Card,
  Stack,
  Text,
  ThemeProvider,
  useTheme,
  type ThemeDefinition,
} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const hostThemes = kiokuThemes.map((theme, index): ThemeDefinition => ({
  ...theme,
  id: `host-theme-${index + 1}`,
  label: `Host theme ${index + 1}`,
}));

const meta = {
  id: 'core-theme-provider',
  title: 'Core/ThemeProvider',
  component: ThemeProvider,
  args: {
    children: null,
    defaultThemeId: hostThemes[0]!.id,
    themes: hostThemes,
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemeControls() {
  const {setThemeId, theme} = useTheme();
  return (
    <Card>
      <Stack gap="md">
        <Text>Active registry entry: {theme.label}</Text>
        <Button
          onClick={() => setThemeId(hostThemes[1]!.id)}
          variant="secondary"
        >
          Apply alternate host theme
        </Button>
      </Stack>
    </Card>
  );
}

export const Default: Story = {
  render: () => (
    <ThemeProvider defaultThemeId={hostThemes[0]!.id} themes={hostThemes}>
      <Card>
        <Text>
          The provider applies a registry and default supplied by its host.
        </Text>
      </Card>
    </ThemeProvider>
  ),
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={hostThemes.slice(0, 2).map((theme) => ({
        label: theme.label,
        content: (
          <ThemeProvider defaultThemeId={theme.id} themes={hostThemes}>
            <Card>
              <Text>Host-selected theme state</Text>
            </Card>
          </ThemeProvider>
        ),
      }))}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <ThemeProvider defaultThemeId={hostThemes[0]!.id} themes={hostThemes}>
        <ThemeControls />
      </ThemeProvider>
    </DemoFrame>
  ),
};
