import type {Meta, StoryObj} from '@storybook/react-vite';

import {AspectRatio, Card, Carousel, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Carousel',
  component: Carousel,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

function Slide({label}: {readonly label: string}) {
  return (
    <div style={{width: '16rem'}}>
      <AspectRatio ratio={4 / 3}>
        <div
          style={{
            alignItems: 'center',
            backgroundColor: 'var(--kioku-ui-color-surface-muted)',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Text tone="muted">{label}</Text>
        </div>
      </AspectRatio>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Carousel {...args} label="Screenshots">
        <Slide label="Dashboard" />
        <Slide label="Settings" />
        <Slide label="Release notes" />
        <Slide label="Audit log" />
      </Carousel>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Carousel label="Screenshots">
            <Slide label="Dashboard" />
            <Slide label="Settings" />
            <Slide label="Release notes" />
          </Carousel>
          <Text size="sm" tone="muted">
            The viewport itself is focusable and scrollable, so the slides stay
            reachable even if the arrow controls are never used.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
