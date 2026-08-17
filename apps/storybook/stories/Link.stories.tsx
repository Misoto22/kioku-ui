import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Link, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Link',
  component: Link,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {children: 'Open delivery activity', href: '/activity'},
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Internal destination',
          content: <Link href="/workspace">Workspace overview</Link>,
        },
        {
          label: 'Keyboard focus',
          content: (
            <Link autoFocus href="/settings">
              Account settings
            </Link>
          ),
        },
        {
          label: 'External destination',
          content: <Link href="https://example.com/help">Help center</Link>,
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="sm">
          <Text>Workspace shortcuts</Text>
          <Link href="/activity">Review recent activity</Link>
          <Link href="/settings">Manage account settings</Link>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
