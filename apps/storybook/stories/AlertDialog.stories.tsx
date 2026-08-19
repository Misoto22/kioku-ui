import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {AlertDialog, Button, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-alert-dialog',
  title: 'Core/AlertDialog',
  component: AlertDialog,
  args: {open: false, title: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function AlertDialogDemo({
  label = 'Discard draft',
  startOpen = false,
  ...alertProps
}: {readonly label?: string; readonly startOpen?: boolean} & Partial<
  Parameters<typeof AlertDialog>[0]
>) {
  const [open, setOpen] = useState(startOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="destructive">
        {label}
      </Button>
      <AlertDialog
        {...alertProps}
        description="The draft and its twelve unsaved edits are removed."
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="secondary">
              Keep editing
            </Button>
            <Button onClick={() => setOpen(false)} variant="destructive">
              Discard
            </Button>
          </>
        }
        onDismiss={() => setOpen(false)}
        open={open}
        size="sm"
        title="Discard draft?"
      />
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <AlertDialogDemo {...args} />
    </DemoFrame>
  ),
};

// The surface starts out: a decision that cannot be deferred is worth seeing.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          A click on the scrim is ignored, so the decision cannot be skipped by
          accident. Escape still closes it.
        </Text>
        <AlertDialogDemo label="Discard" startOpen />
      </Stack>
    </DemoFrame>
  ),
};
