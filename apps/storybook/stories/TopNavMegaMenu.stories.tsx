import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  NavItem,
  Stack,
  Text,
  TopNav,
  TopNavMegaMenu,
  TopNavMegaMenuFeaturedCard,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-top-nav-mega-menu',
  title: 'Core/TopNavMegaMenu',
  component: TopNavMegaMenu,
  args: {columns: [], label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof TopNavMegaMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const columns = [
  {
    title: 'Build',
    items: (
      <>
        <NavItem href="/components">Components</NavItem>
        <NavItem href="/templates">Templates</NavItem>
        <NavItem href="/themes">Themes</NavItem>
      </>
    ),
  },
  {
    title: 'Learn',
    items: (
      <>
        <NavItem href="/docs">Getting started</NavItem>
        <NavItem href="/runbook">Release runbook</NavItem>
      </>
    ),
  },
];

const featured = (
  <TopNavMegaMenuFeaturedCard
    description="Everything that landed in the last release."
    href="/changelog"
    title="What’s new"
  />
);

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <TopNavMegaMenu {...args} columns={columns} label="Product" />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <TopNav brand="Kioku">
          <TopNavMegaMenu
            columns={columns}
            featured={featured}
            label="Product"
          />
        </TopNav>
        <Text size="sm" tone="muted">
          The featured card is a single link, so the whole card is one tab stop.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
