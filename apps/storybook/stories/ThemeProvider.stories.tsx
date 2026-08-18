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

import {DemoFrame, StateGrid} from './support/StoryFrame';

interface HostPalette {
  readonly accent: string;
  readonly accentActive: string;
  readonly accentHover: string;
  readonly border: string;
  readonly canvas: string;
  readonly focus: string;
  readonly muted: string;
  readonly surface: string;
  readonly text: string;
  readonly textMuted: string;
  readonly textOnAccent: string;
  readonly textSecondary: string;
}

function hostThemeTokens(palette: HostPalette): ThemeDefinition['tokens'] {
  return Object.freeze({
    'color.canvas': palette.canvas,
    'color.surface': palette.surface,
    'color.surfaceRaised': palette.surface,
    'color.surfaceMuted': palette.muted,
    'color.text': palette.text,
    'color.textSecondary': palette.textSecondary,
    'color.textMuted': palette.textMuted,
    'color.textOnAccent': palette.textOnAccent,
    'color.accent': palette.accent,
    'color.accentHover': palette.accentHover,
    'color.accentActive': palette.accentActive,
    'color.overlayHover': 'rgb(31 41 55 / 7%)',
    'color.overlayActive': 'rgb(31 41 55 / 13%)',
    'color.disabledSurface': 'light-dark(#e4e7e7, #343a3a)',
    'color.disabledText': 'light-dark(#7a8583, #929c9a)',
    'color.focus': palette.focus,
    'border.default': palette.border,
    'border.strong': 'light-dark(#aab6b4, #64706e)',
    'border.interactive': palette.accent,
    'border.disabled': 'light-dark(#d8dedd, #3f4746)',
    'border.width': '1px',
    'border.style': 'solid',
    'status.infoSurface': 'light-dark(#e3eff4, #203943)',
    'status.infoText': 'light-dark(#285f78, #a8d4e8)',
    'status.successSurface': 'light-dark(#e3f0e8, #213b2b)',
    'status.successText': 'light-dark(#356346, #a9d7b9)',
    'status.warningSurface': 'light-dark(#f6edd8, #41351d)',
    'status.warningText': 'light-dark(#795a13, #e7c877)',
    'status.dangerSurface': 'light-dark(#f5e3e2, #432726)',
    'status.dangerText': 'light-dark(#8b3836, #eca5a2)',
    'focus.width': '2px',
    'focus.offset': '2px',
    'typography.fontFamilyBody': 'Inter, system-ui, sans-serif',
    'typography.fontFamilyHeading': 'Inter, system-ui, sans-serif',
    'typography.fontFamilyDisplay': 'Georgia, serif',
    'typography.fontFamilyMono': 'ui-monospace, SFMono-Regular, monospace',
    'typography.fontFeatureSettings': 'normal',
    'typography.fontSizeXs': '12px',
    'typography.fontSizeSm': '12px',
    'typography.fontSizeMd': '14px',
    'typography.fontSizeLg': '16px',
    'typography.fontSizeXl': '20px',
    'typography.fontSize2xl': '28px',
    'typography.fontWeightRegular': '400',
    'typography.fontWeightMedium': '500',
    'typography.fontWeightStrong': '600',
    'typography.lineHeightBody': '1.5',
    'typography.lineHeightHeading': '1.25',
    'spacing.xs': '4px',
    'spacing.sm': '8px',
    'spacing.md': '12px',
    'spacing.lg': '16px',
    'spacing.xl': '24px',
    'spacing.2xl': '32px',
    'radius.inner': '4px',
    'radius.element': '8px',
    'radius.container': '12px',
    'radius.page': '16px',
    'radius.full': '999px',
    'size.controlSm': '28px',
    'size.controlMd': '32px',
    'size.controlLg': '36px',
    'size.hitTarget': '44px',
    'elevation.low': '0 1px 2px rgb(15 23 42 / 12%)',
    'elevation.medium': '0 4px 12px rgb(15 23 42 / 16%)',
    'elevation.high': '0 10px 28px rgb(15 23 42 / 20%)',
    'texture.grain': 'transparent',
    'motion.durationFast': '120ms',
    'motion.durationModerate': '220ms',
    'motion.durationSlow': '760ms',
    'motion.easingStandard': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    'motion.easingEmphasized': 'cubic-bezier(0.16, 0.84, 0.28, 1)',
  });
}

const hostThemes = Object.freeze([
  {
    id: 'host-theme-1',
    label: 'Lagoon host theme',
    tokens: hostThemeTokens({
      accent: 'light-dark(#236b63, #77c5bc)',
      accentActive: 'light-dark(#164c46, #a1ddd6)',
      accentHover: 'light-dark(#1c5b54, #8dd1ca)',
      border: 'light-dark(#c4d8d5, #425b58)',
      canvas: 'light-dark(#edf7f6, #12201f)',
      focus: 'light-dark(#185e75, #83cbe6)',
      muted: 'light-dark(#dceeed, #283c39)',
      surface: 'light-dark(#ffffff, #1b2d2b)',
      text: 'light-dark(#16312f, #edf8f7)',
      textMuted: 'light-dark(#586f6c, #9fb8b5)',
      textOnAccent: 'light-dark(#ffffff, #0c1f1d)',
      textSecondary: 'light-dark(#3f5f5b, #bed2cf)',
    }),
  },
  {
    id: 'host-theme-2',
    label: 'Plum host theme',
    tokens: hostThemeTokens({
      accent: 'light-dark(#7a426f, #d3a4c9)',
      accentActive: 'light-dark(#5d2e54, #ebc3e2)',
      accentHover: 'light-dark(#6c3962, #ddb2d4)',
      border: 'light-dark(#decbd8, #674c60)',
      canvas: 'light-dark(#f7f1f5, #251a22)',
      focus: 'light-dark(#6853a1, #b9a6ee)',
      muted: 'light-dark(#eee2ea, #3a2935)',
      surface: 'light-dark(#fffafd, #30212c)',
      text: 'light-dark(#382337, #faeff7)',
      textMuted: 'light-dark(#765f72, #baa4b5)',
      textOnAccent: 'light-dark(#ffffff, #281122)',
      textSecondary: 'light-dark(#654c61, #dbc7d6)',
    }),
  },
] satisfies readonly ThemeDefinition[]);

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
  render: (args) => (
    <ThemeProvider {...args}>
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
