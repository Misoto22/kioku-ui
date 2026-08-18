import type {Meta, StoryObj} from '@storybook/react-vite';

import {Icon, NavIcon, NavItem, NavMenu} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-nav-icon',
  title: 'Core/NavIcon',
  component: NavIcon,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof NavIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

function HomeGlyph() {
  return (
    <Icon>
      <path
        d="m4 11 8-7 8 7v9H4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Icon>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <NavIcon {...args}>
        <HomeGlyph />
      </NavIcon>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <NavMenu label="Primary">
        <NavItem
          current
          href="/"
          leading={
            <NavIcon>
              <HomeGlyph />
            </NavIcon>
          }
        >
          Home
        </NavItem>
        <NavItem href="/releases">Releases</NavItem>
      </NavMenu>
    </DemoFrame>
  ),
};
