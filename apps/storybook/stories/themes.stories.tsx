import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card, Text} from '@misoto22/kioku-ui';
import {
  ThemeProvider as ThemeProviderComponent,
  type ThemeDefinition,
} from '@misoto22/kioku-ui/theme';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

const hostDefaultThemeId = 'host-theme-1';
const hostThemes = kiokuThemes.map((theme, index): ThemeDefinition => ({
  ...theme,
  id: `host-theme-${index + 1}`,
  label: `Host theme ${index + 1}`,
}));

const meta = {
  title: 'Themes',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThemeProvider: Story = {
  render: () => (
    <ThemeProviderComponent
      defaultThemeId={hostDefaultThemeId}
      themes={hostThemes}
    >
      <Card>
        <div style={{padding: 'var(--kioku-ui-spacing-lg)'}}>
          <Text>
            The provider applies a registry and default supplied by its host.
          </Text>
        </div>
      </Card>
    </ThemeProviderComponent>
  ),
};
