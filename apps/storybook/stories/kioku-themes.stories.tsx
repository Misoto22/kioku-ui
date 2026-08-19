import type {Meta, StoryObj} from '@storybook/react-vite';
import {Badge, Button, Card, Heading, Stack, Text} from '@misoto22/kioku-ui';
import {
  ThemeProvider as ThemeProviderComponent,
  type ThemeDefinition,
} from '@misoto22/kioku-ui/theme';
import {kasumiTheme, kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

const meta = {
  title: 'Themes/Kioku',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ThemeSpecimen({
  mode,
  theme,
}: {
  mode: 'light' | 'dark';
  theme: ThemeDefinition;
}) {
  return (
    <div style={{colorScheme: mode}}>
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
                  <Text size="sm">{mode} mode</Text>
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
                    gap: 'var(--kioku-ui-spacing-sm)',
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
                    gap: 'var(--kioku-ui-spacing-sm)',
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
        gap: 'var(--kioku-ui-spacing-xl)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      }}
    >
      {kiokuThemes.flatMap((theme) =>
        (['light', 'dark'] as const).map((mode) => (
          <ThemeSpecimen
            key={`${theme.id}-${mode}`}
            mode={mode}
            theme={theme}
          />
        )),
      )}
    </div>
  ),
};

/*
 * Kasumi is the one skin that expects something behind it, so it is the one
 * skin a flat specimen cannot show. This story gives it a backdrop and runs the
 * lever across three settings.
 *
 * The host's job is only to put something back there — SHARP. The theme does
 * the blurring, on its own `::before`, so this layer stays unfiltered and a
 * detailed image is exactly what makes the frost visible.
 */
const backdrop = {
  dark: [
    'repeating-linear-gradient(58deg, rgb(255 255 255 / 18%) 0 3px, transparent 3px 9px)',
    'radial-gradient(52% 60% at 18% 18%, #2f6ad0 0%, transparent 64%)',
    'radial-gradient(50% 58% at 86% 26%, #8f3fa8 0%, transparent 62%)',
    'radial-gradient(64% 70% at 46% 96%, #157f68 0%, transparent 66%)',
    'radial-gradient(40% 44% at 70% 62%, #b8791b 0%, transparent 60%)',
    '#10141c',
  ].join(', '),
  light: [
    'repeating-linear-gradient(58deg, rgb(255 255 255 / 34%) 0 3px, transparent 3px 9px)',
    'radial-gradient(52% 60% at 18% 18%, #2f6ad0 0%, transparent 64%)',
    'radial-gradient(50% 58% at 86% 26%, #c93fb4 0%, transparent 62%)',
    'radial-gradient(64% 70% at 46% 96%, #17b088 0%, transparent 66%)',
    'radial-gradient(40% 44% at 70% 62%, #f0a72b 0%, transparent 60%)',
    '#6f93c8',
  ].join(', '),
} as const;

/*
 * The pack declares the lever ON the theme root, so a value inherited from an
 * ancestor loses to it and an inline style on a wrapper would do nothing.
 * Overriding it takes a rule that outranks the pack's — an ancestor class here,
 * or in an application the same `[data-theme='kasumi']` selector loaded after
 * the pack's stylesheet.
 */
const frostSteps = [100, 64, 40] as const;

const frostLevers = frostSteps
  .map(
    (keep) =>
      `.frost-${keep} [data-theme='kasumi'] { --kioku-theme-kasumi-frost-keep: ${keep}%; }`,
  )
  .join('\n');

function FrostSpecimen({keep, mode}: {keep: number; mode: 'light' | 'dark'}) {
  return (
    <div
      className={`frost-${keep}`}
      style={{
        colorScheme: mode,
        isolation: 'isolate',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        data-specimen-backdrop
        style={{
          background: backdrop[mode],
          inset: 0,
          position: 'absolute',
          zIndex: -1,
        }}
      />
      <ThemeProviderComponent
        defaultThemeId={kasumiTheme.id}
        themes={[kasumiTheme]}
      >
        <div
          style={{
            background: 'var(--kioku-ui-color-canvas)',
            padding: 'var(--kioku-ui-spacing-2xl)',
          }}
        >
          <Stack gap="lg">
            <Stack gap="xs">
              <Text size="sm">
                {mode} mode · keep {keep}%
              </Text>
              <Heading level={2} size="page">
                Kasumi
              </Heading>
            </Stack>
            <Card elevation="low">
              <div style={{padding: 'var(--kioku-ui-spacing-lg)'}}>
                <Stack gap="md">
                  <Text>
                    A card is raised content: it clamps to max(84%, keep) and is
                    never thinner than the field beneath it.
                  </Text>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 'var(--kioku-ui-spacing-sm)',
                    }}
                  >
                    <Badge tone="info">Recorded</Badge>
                    <Badge tone="success">Available</Badge>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 'var(--kioku-ui-spacing-sm)',
                    }}
                  >
                    <Button>Open record</Button>
                    <Button variant="secondary">View details</Button>
                  </div>
                </Stack>
              </div>
            </Card>
          </Stack>
        </div>
      </ThemeProviderComponent>
    </div>
  );
}

export const KasumiFrost: Story = {
  render: () => (
    <>
      <style>{frostLevers}</style>
      <div
        style={{
          display: 'grid',
          gap: 'var(--kioku-ui-spacing-xl)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        {(['light', 'dark'] as const).flatMap((mode) =>
          frostSteps.map((keep) => (
            <FrostSpecimen key={`${mode}-${keep}`} keep={keep} mode={mode} />
          )),
        )}
      </div>
    </>
  ),
};
