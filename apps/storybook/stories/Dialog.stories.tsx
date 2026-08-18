import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Button, Dialog, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Dialog',
  component: Dialog,
  args: {open: false, title: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function DialogDemo({
  label = 'Open dialog',
  ...dialogProps
}: {readonly label?: string} & Partial<Parameters<typeof Dialog>[0]>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Dialog
        {...dialogProps}
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Publish</Button>
          </>
        }
        onDismiss={() => setOpen(false)}
        open={open}
        title="Publish release"
      >
        <Text>Twelve updates will become visible to every subscriber.</Text>
      </Dialog>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <DialogDemo {...args} />
    </DemoFrame>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['sm', 'md', 'lg'] as const).map((size) => ({
          label: size,
          content: <DialogDemo label={size} size={size} />,
        }))}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          Focus is trapped inside the surface and the page behind stops
          scrolling until the dialog closes.
        </Text>
        <DialogDemo description="This cannot be undone." label="Open" />
      </Stack>
    </DemoFrame>
  ),
};
