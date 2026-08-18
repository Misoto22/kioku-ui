import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Stack, Text, Toast} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Toast',
  component: Toast,
  args: {title: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Toast {...args} description="Twelve edits kept." title="Draft saved" />
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
            content: <Toast title={`Release ${tone}`} tone={tone} />,
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
        <Text tone="secondary">
          Place notifications through ToastProvider rather than rendering these
          by hand; the provider owns the live region and the queue.
        </Text>
        <Toast
          action={<Button variant="secondary">Undo</Button>}
          description="Twelve edits kept."
          title="Draft saved"
          tone="success"
        />
      </Stack>
    </DemoFrame>
  ),
};
