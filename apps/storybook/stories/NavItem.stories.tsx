import type {Meta, StoryObj} from '@storybook/react-vite';

import {NavItem, NavMenu, SideNav, SideNavSection} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-nav-item',
  title: 'Core/NavItem',
  component: NavItem,
  args: {href: '#'},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <NavItem {...args} href="/releases">
        Releases
      </NavItem>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'default',
            content: <NavItem href="/releases">Releases</NavItem>,
          },
          {
            label: 'current',
            content: (
              <NavItem current href="/releases">
                Releases
              </NavItem>
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
      <SideNav>
        <SideNavSection title="Work">
          <NavMenu label="Work">
            <NavItem current href="/releases">
              Releases
            </NavItem>
            <NavItem href="/reviews">Reviews</NavItem>
            <NavItem href="/archive">Archive</NavItem>
          </NavMenu>
        </SideNavSection>
      </SideNav>
    </DemoFrame>
  ),
};
