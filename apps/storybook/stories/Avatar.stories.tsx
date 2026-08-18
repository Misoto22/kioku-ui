import type {Meta, StoryObj} from '@storybook/react-vite';

import {Avatar, Card, Item, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Avatar',
  component: Avatar,
  args: {name: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Avatar {...args} name="Ada Lovelace" />
    </DemoFrame>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['sm', 'md', 'lg'] as const).map((size) => ({
          label: size,
          content: <Avatar name="Ada Lovelace" size={size} />,
        }))}
      />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'initials', content: <Avatar name="Ada Lovelace" />},
          {label: 'one word', content: <Avatar name="Ada" />},
          {
            label: 'broken image',
            content: <Avatar name="Ada Lovelace" src="/missing.png" />,
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="sm">
          <Item
            description="Owns this release"
            leading={<Avatar name="Ada Lovelace" />}
          >
            Ada Lovelace
          </Item>
          <Text size="sm" tone="muted">
            The name stays the accessible label whether the image loads or not.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
