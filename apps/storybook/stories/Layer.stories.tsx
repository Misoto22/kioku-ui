import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Layer, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Layer',
  component: Layer,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Layer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          The card below is portalled to the document body, so it escapes this
          container entirely.
        </Text>
        <Layer {...args}>
          <Card>
            <Text>Portalled content</Text>
          </Card>
        </Layer>
      </Stack>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <div style={{overflow: 'hidden', height: '4rem'}}>
        <Text tone="muted">This box clips its children.</Text>
        <Layer>
          <Card>
            <Text>A layered surface is not clipped by the box above.</Text>
          </Card>
        </Layer>
      </div>
    </DemoFrame>
  ),
};
