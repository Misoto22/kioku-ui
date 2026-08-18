import type {Meta, StoryObj} from '@storybook/react-vite';

import {ProgressBar, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

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
        <Text size="sm" tone="muted">
          Omitting the value reports work of unknown length.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
