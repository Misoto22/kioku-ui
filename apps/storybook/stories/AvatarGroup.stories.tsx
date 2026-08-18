import type {Meta, StoryObj} from '@storybook/react-vite';

import {AvatarGroup, Card, Item, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-avatar-group',
  title: 'Core/AvatarGroup',
  component: AvatarGroup,
  args: {label: '', members: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const members = [
  {name: 'Ada Lovelace'},
  {name: 'Alan Turing'},
  {name: 'Grace Hopper'},
  {name: 'Katherine Johnson'},
  {name: 'Margaret Hamilton'},
];

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <AvatarGroup {...args} label="Reviewers" members={members} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'everyone fits',
            content: (
              <AvatarGroup label="Reviewers" members={members.slice(0, 3)} />
            ),
          },
          {
            label: 'capped',
            content: (
              <AvatarGroup label="Reviewers" max={3} members={members} />
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
      <Card>
        <Stack gap="sm">
          <Item
            trailing={
              <AvatarGroup label="Reviewers" max={3} members={members} />
            }
          >
            Release 12
          </Item>
          <Text size="sm" tone="muted">
            One label covers the whole group, so a screen reader hears the count
            rather than five separate images.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
