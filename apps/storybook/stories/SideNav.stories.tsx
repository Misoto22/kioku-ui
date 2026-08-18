import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Button,
  NavItem,
  NavMenu,
  SideNav,
  SideNavSection,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-side-nav',
  title: 'Core/SideNav',
  component: SideNav,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <SideNav {...args}>
        <SideNavSection title="Work">
          <NavMenu label="Work">
            <NavItem current href="/releases">
              Releases
            </NavItem>
            <NavItem href="/reviews">Reviews</NavItem>
          </NavMenu>
        </SideNavSection>
      </SideNav>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <SideNav footer={<Button variant="ghost">Sign out</Button>}>
        <SideNavSection title="Work">
          <NavMenu label="Work">
            <NavItem current href="/releases">
              Releases
            </NavItem>
            <NavItem href="/reviews">Reviews</NavItem>
          </NavMenu>
        </SideNavSection>
        <SideNavSection title="Archive">
          <NavMenu label="Archive">
            <NavItem href="/archive">Older releases</NavItem>
          </NavMenu>
        </SideNavSection>
      </SideNav>
    </DemoFrame>
  ),
};
