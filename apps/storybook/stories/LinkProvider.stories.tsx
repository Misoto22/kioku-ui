import type {Meta, StoryObj} from '@storybook/react-vite';
import type {ComponentProps} from 'react';

import {Card, Link, LinkProvider, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-link-provider',
  title: 'Core/LinkProvider',
  component: LinkProvider,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof LinkProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const hostRenderer = ({children, ...props}: ComponentProps<'a'>) => (
  <a {...props} data-host-router-link="true">
    {children}
  </a>
);

export const Default: Story = {
  render: () => (
    <LinkProvider renderLink={hostRenderer}>
      <Link href="/activity">Open activity with host routing</Link>
    </LinkProvider>
  ),
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Native fallback',
          content: (
            <LinkProvider>
              <Link href="/workspace">Workspace overview</Link>
            </LinkProvider>
          ),
        },
        {
          label: 'Host renderer',
          content: (
            <LinkProvider renderLink={hostRenderer}>
              <Link href="/settings">Account settings</Link>
            </LinkProvider>
          ),
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <LinkProvider renderLink={hostRenderer}>
        <Card>
          <Stack gap="sm">
            <Text>Host-routed workspace links</Text>
            <Link href="/deliveries">Upcoming deliveries</Link>
            <Link href="/members">Member access</Link>
          </Stack>
        </Card>
      </LinkProvider>
    </DemoFrame>
  ),
};
