import type {Meta, StoryObj} from '@storybook/react-vite';

import {MobileNav, NavItem, NavMenu, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-mobile-nav',
  title: 'Core/MobileNav',
  component: MobileNav,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof MobileNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const destinations = (
  <NavMenu label="Primary">
    <NavItem current href="/releases">
      Releases
    </NavItem>
    <NavItem href="/reviews">Reviews</NavItem>
    <NavItem href="/archive">Archive</NavItem>
  </NavMenu>
);

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <MobileNav {...args} label="Open navigation">
        {destinations}
      </MobileNav>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          The drawer traps focus and freezes the page behind it, so a keyboard
          reader cannot wander into hidden content.
        </Text>
        <MobileNav label="Open navigation" title="Kioku">
          {destinations}
        </MobileNav>
      </Stack>
    </DemoFrame>
  ),
};
