import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Button, Card, Overlay, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Overlay',
  component: Overlay,
  args: {children: null, open: false},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Overlay>;

export default meta;
type Story = StoryObj<typeof meta>;

function OverlayDemo({
  label,
  ...overlayProps
}: {readonly label: string} & Partial<Parameters<typeof Overlay>[0]>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Overlay {...overlayProps} onDismiss={() => setOpen(false)} open={open}>
        <Card>
          <Stack gap="md">
            <Text>Press Escape or click the scrim to dismiss.</Text>
            <Button onClick={() => setOpen(false)} variant="secondary">
              Close
            </Button>
          </Stack>
        </Card>
      </Overlay>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <OverlayDemo {...args} label="Open overlay" />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'with scrim', content: <OverlayDemo label="Scrim" />},
          {
            label: 'without scrim',
            content: <OverlayDemo label="No scrim" scrim={false} />,
          },
          {
            label: 'scrim click ignored',
            content: (
              <OverlayDemo dismissOnOutsideClick={false} label="Escape only" />
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          Overlay carries no role of its own. The surface it wraps names itself.
        </Text>
        <OverlayDemo label="Open" />
      </Stack>
    </DemoFrame>
  ),
};
