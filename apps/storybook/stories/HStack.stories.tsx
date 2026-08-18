import type {Meta, StoryObj} from '@storybook/react-vite';

import {Badge, Button, Card, HStack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-h-stack',
  title: 'Core/HStack',
  component: HStack,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof HStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <HStack {...args}>
        <Badge>One</Badge>
        <Badge tone="info">Two</Badge>
        <Badge tone="success">Three</Badge>
      </HStack>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['start', 'center', 'end', 'between'] as const).map(
          (justify) => ({
            label: justify,
            content: (
              <HStack justify={justify}>
                <Badge>One</Badge>
                <Badge tone="info">Two</Badge>
              </HStack>
            ),
          }),
        )}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <HStack justify="between">
          <Text>Release 12</Text>
          <HStack gap="sm">
            <Button variant="secondary">Archive</Button>
            <Button>Publish</Button>
          </HStack>
        </HStack>
      </Card>
    </DemoFrame>
  ),
};
