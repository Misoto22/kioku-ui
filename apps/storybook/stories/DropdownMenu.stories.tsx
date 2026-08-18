import type {Meta, StoryObj} from '@storybook/react-vite';
import {useRef, useState} from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  Stack,
  Text,
} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-dropdown-menu',
  title: 'Core/DropdownMenu',
  component: DropdownMenu,
  args: {anchorRef: {current: null}, children: null, label: '', open: false},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function MenuDemo({
  triggerLabel = 'Release actions',
  ...menuProps
}: {readonly triggerLabel?: string} & Partial<
  Parameters<typeof DropdownMenu>[0]
>) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <span ref={anchorRef} style={{display: 'inline-flex'}}>
        <Button onClick={() => setOpen((value) => !value)} variant="secondary">
          {triggerLabel}
        </Button>
      </span>
      <DropdownMenu
        {...menuProps}
        anchorRef={anchorRef}
        label={triggerLabel}
        onDismiss={() => setOpen(false)}
        open={open}
      >
        <DropdownMenuItem onClick={() => setOpen(false)}>
          Publish
        </DropdownMenuItem>
        <DropdownMenuItem
          description="Keeps the release out of search"
          onClick={() => setOpen(false)}
        >
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DropdownMenu>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <MenuDemo {...args} />
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['bottom', 'top'] as const).map((placement) => ({
          label: placement,
          content: <MenuDemo placement={placement} triggerLabel={placement} />,
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
          The menu is one tab stop. Arrow keys, Home, and End move between
          items; Escape closes it.
        </Text>
        <MenuDemo />
      </Stack>
    </DemoFrame>
  ),
};
