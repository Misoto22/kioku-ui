import type {Meta, StoryObj} from '@storybook/react-vite';

import {Badge, Item, List, ListItem} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Item',
  component: Item,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Item description="Updated moments ago" {...args}>
        Release notes
      </Item>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <List variant="plain">
        <ListItem>
          <Item
            description="Ready to publish"
            trailing={<Badge tone="success">Done</Badge>}
          >
            Release notes
          </Item>
        </ListItem>
        <ListItem>
          <Item
            description="Waiting on review"
            trailing={<Badge tone="warning">Open</Badge>}
          >
            Accessibility baseline
          </Item>
        </ListItem>
      </List>
    </DemoFrame>
  ),
};
