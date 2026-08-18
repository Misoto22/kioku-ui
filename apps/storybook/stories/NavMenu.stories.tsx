import type {Meta, StoryObj} from '@storybook/react-vite';

import {NavItem, NavMenu, TopNav} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-nav-menu',
  title: 'Core/NavMenu',
  component: NavMenu,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof NavMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const destinations = (
  <>
    <NavItem current href="/releases">
      Releases
    </NavItem>
    <NavItem href="/reviews">Reviews</NavItem>
    <NavItem href="/archive">Archive</NavItem>
  </>
);

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <NavMenu {...args} label="Primary">
        {destinations}
      </NavMenu>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['vertical', 'horizontal'] as const).map((orientation) => ({
          label: orientation,
          content: (
            <NavMenu label={orientation} orientation={orientation}>
              {destinations}
            </NavMenu>
          ),
        }))}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <TopNav brand="Kioku">
        <NavMenu label="Primary" orientation="horizontal">
          {destinations}
        </NavMenu>
      </TopNav>
    </DemoFrame>
  ),
};
