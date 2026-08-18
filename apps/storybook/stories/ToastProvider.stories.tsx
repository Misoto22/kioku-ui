import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Stack, Text, ToastProvider, useToast} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-toast-provider',
  title: 'Core/ToastProvider',
  component: ToastProvider,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function ToastControls() {
  const {show} = useToast();

  return (
    <Stack align="start" gap="sm">
      <Button
        onClick={() =>
          show({
            description: 'Twelve edits kept.',
            title: 'Draft saved',
            tone: 'success',
          })
        }
      >
        Save draft
      </Button>
      <Button
        onClick={() => show({title: 'Upload failed', tone: 'danger'})}
        variant="secondary"
      >
        Fail an upload
      </Button>
    </Stack>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ToastProvider {...args}>
        <ToastControls />
      </ToastProvider>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <ToastProvider label="Release notifications">
        <Stack gap="md">
          <Text tone="secondary">
            Every notification lands in one polite live region, so a screen
            reader announces them in the order they arrived.
          </Text>
          <ToastControls />
        </Stack>
      </ToastProvider>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <ToastProvider>
        <Stack gap="md">
          <Text tone="secondary">
            Place one provider near the root of a host application and request
            notifications through useToast.
          </Text>
          <ToastControls />
        </Stack>
      </ToastProvider>
    </DemoFrame>
  ),
};
