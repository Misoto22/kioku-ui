import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Button, Lightbox, Stack, Text, Thumbnail} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Lightbox',
  component: Lightbox,
  args: {children: null, onDismiss: () => {}, open: false, title: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Lightbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const cover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23b8c4c0"/><circle cx="32" cy="26" r="12" fill="%23f4efe6"/></svg>',
  );

function LightboxDemo({label = 'View cover'}: {readonly label?: string}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        {label}
      </Button>
      <Lightbox
        onDismiss={() => setOpen(false)}
        open={open}
        title="Release cover"
      >
        <Thumbnail alt="Release cover" size="lg" src={cover} />
      </Lightbox>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <LightboxDemo label={`View ${String(args.title) || 'cover'}`} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <LightboxDemo label="Open" />
        <Text size="sm" tone="muted">
          The viewer is modal, so the page behind stops scrolling and focus
          stays on the media until it is dismissed.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
