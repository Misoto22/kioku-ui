import type {Meta, StoryObj} from '@storybook/react-vite';

import {NavItem, Stack, Text, TopNav, TopNavMenu} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-top-nav-menu',
  title: 'Core/TopNavMenu',
  component: TopNavMenu,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof TopNavMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const destinations = (
  <>
    <NavItem href="/components">Components</NavItem>
    <NavItem href="/templates">Templates</NavItem>
    <NavItem href="/themes">Themes</NavItem>
  </>
);

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <TopNavMenu {...args} label="Product">
        {destinations}
      </TopNavMenu>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <TopNav brand="Kioku">
          <TopNavMenu label="Product">{destinations}</TopNavMenu>
        </TopNav>
        <Text size="sm" tone="muted">
          The panel holds links to elsewhere, so it is a disclosure rather than
          a menu — calling these menu items would promise a command that runs
          here.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
