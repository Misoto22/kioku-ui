import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Card,
  DropdownMenuItem,
  Item,
  MoreMenu,
  Stack,
  Text,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-more-menu',
  title: 'Core/MoreMenu',
  component: MoreMenu,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof MoreMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <MoreMenu {...args} label="More actions">
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
      </MoreMenu>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="sm">
          <Item
            description="Updated moments ago"
            trailing={
              <MoreMenu label="Release actions">
                <DropdownMenuItem>Publish</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </MoreMenu>
            }
          >
            Release notes
          </Item>
          <Text size="sm" tone="muted">
            MoreMenu owns its open state, so a row that has no other reason to
            hold state does not grow one.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
