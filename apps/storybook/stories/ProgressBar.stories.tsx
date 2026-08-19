import type {Meta, StoryObj} from '@storybook/react-vite';

import {ProgressBar, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

// A percentage is a figure: mono and tabular, so 5, 62 and 100 all sit on the
// same right edge instead of shuffling as the task runs.
const figureStyle = {
  color: 'var(--kioku-ui-color-text-secondary)',
  fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
} as const;

const meta = {
  id: 'core-progress-bar',
  title: 'Core/ProgressBar',
  component: ProgressBar,
  args: {label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ProgressBar {...args} label="Uploading" value={40} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'starting',
            content: <ProgressBar label="Uploading" value={5} />,
          },
          {
            label: 'halfway',
            content: <ProgressBar label="Uploading" value={50} />,
          },
          {
            label: 'complete',
            content: <ProgressBar label="Uploading" value={100} />,
          },
          {label: 'unknown length', content: <ProgressBar label="Uploading" />},
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="xs">
        <Text size="sm">Uploading release notes</Text>
        <ProgressBar label="Uploading release notes" value={62} />
        <span style={figureStyle}>62%</span>
        <Text size="sm" tone="muted">
          Omitting the value reports work of unknown length.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
