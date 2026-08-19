import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {BottomSheet, Button, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-bottom-sheet',
  title: 'Core/BottomSheet',
  component: BottomSheet,
  args: {open: false, title: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function BottomSheetDemo({
  label = 'Open filters',
  startOpen = false,
  ...sheetProps
}: {readonly label?: string; readonly startOpen?: boolean} & Partial<
  Parameters<typeof BottomSheet>[0]
>) {
  const [open, setOpen] = useState(startOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <BottomSheet
        {...sheetProps}
        onDismiss={() => setOpen(false)}
        open={open}
        title="Filters"
      >
        <Stack gap="md">
          <Text>Narrow the release list by status and owner.</Text>
          <Button onClick={() => setOpen(false)} variant="secondary">
            Apply
          </Button>
        </Stack>
      </BottomSheet>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <BottomSheetDemo {...args} />
    </DemoFrame>
  ),
};

// The panel starts out, pinned to the bottom edge where it actually sits.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          A bottom sheet carries the same focus trap and scroll lock as Dialog,
          placed where a thumb can reach it.
        </Text>
        <BottomSheetDemo label="Open" startOpen />
      </Stack>
    </DemoFrame>
  ),
};
