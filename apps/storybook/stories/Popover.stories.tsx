import type {Meta, StoryObj} from '@storybook/react-vite';
import {useRef, useState} from 'react';

import {Button, Popover, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Popover',
  component: Popover,
  args: {anchorRef: {current: null}, children: null, open: false},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

function PopoverDemo({
  label = 'Details',
  startOpen = false,
  ...popoverProps
}: {readonly label?: string; readonly startOpen?: boolean} & Partial<
  Parameters<typeof Popover>[0]
>) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(startOpen);

  return (
    <>
      <span ref={anchorRef} style={{display: 'inline-flex'}}>
        <Button onClick={() => setOpen((value) => !value)}>{label}</Button>
      </span>
      <Popover
        {...popoverProps}
        anchorRef={anchorRef}
        onDismiss={() => setOpen(false)}
        open={open}
      >
        <Stack gap="sm">
          <Text size="sm">Twelve updates are ready to review.</Text>
        </Stack>
      </Popover>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <PopoverDemo {...args} />
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['top', 'bottom', 'left', 'right'] as const).map(
          (placement) => ({
            label: placement,
            content: <PopoverDemo label={placement} placement={placement} />,
          }),
        )}
      />
    </DemoFrame>
  ),
};

// The surface starts out, so the plate is on the page rather than behind a
// button nobody in an audit ever presses.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          A popover is non-modal: the page behind stays scrollable and
          reachable.
        </Text>
        <PopoverDemo
          alignment="start"
          aria-label="Release detail"
          placement="bottom"
          startOpen
        />
      </Stack>
    </DemoFrame>
  ),
};
