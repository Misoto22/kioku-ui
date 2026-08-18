import type {Meta, StoryObj} from '@storybook/react-vite';

import {Banner, Button, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Banner',
  component: Banner,
  args: {children: null},
  parameters: {layout: 'fullscreen'},
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Banner {...args}>Billing details expire in three days.</Banner>
    </DemoFrame>
  ),
};

export const Tones: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['info', 'success', 'warning', 'danger'] as const).map(
          (tone) => ({
            label: tone,
            content: <Banner tone={tone}>Account status: {tone}</Banner>,
          }),
        )}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Banner
          actions={<Button size="sm">Update billing</Button>}
          tone="warning"
        >
          Billing details expire in three days.
        </Banner>
        <Text size="sm" tone="muted">
          Use Alert for a message about one region and Toast for one that passes
          on its own.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
