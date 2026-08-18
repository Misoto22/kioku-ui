import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Button,
  MoreMenu,
  DropdownMenuItem,
  NavItem,
  NavMenu,
  TopNav,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-top-nav',
  title: 'Core/TopNav',
  component: TopNav,
  parameters: {layout: 'fullscreen'},
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <TopNav {...args} brand="Kioku">
        <NavMenu label="Primary" orientation="horizontal">
          <NavItem current href="/releases">
            Releases
          </NavItem>
          <NavItem href="/reviews">Reviews</NavItem>
        </NavMenu>
      </TopNav>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <TopNav
        actions={
          <>
            <Button variant="secondary">Sign in</Button>
            <MoreMenu label="Account actions">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </MoreMenu>
          </>
        }
        brand="Kioku"
      >
        <NavMenu label="Primary" orientation="horizontal">
          <NavItem current href="/releases">
            Releases
          </NavItem>
          <NavItem href="/reviews">Reviews</NavItem>
          <NavItem href="/archive">Archive</NavItem>
        </NavMenu>
      </TopNav>
    </DemoFrame>
  ),
};
