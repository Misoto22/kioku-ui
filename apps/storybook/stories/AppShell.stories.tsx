import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  AppShell,
  Card,
  Heading,
  NavItem,
  NavMenu,
  SideNav,
  SideNavSection,
  Text,
  TopNav,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-app-shell',
  title: 'Core/AppShell',
  component: AppShell,
  args: {children: null},
  parameters: {layout: 'fullscreen'},
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const sidebar = (
  <SideNav>
    <SideNavSection title="Work">
      <NavMenu label="Work">
        <NavItem current href="/releases">
          Releases
        </NavItem>
        <NavItem href="/reviews">Reviews</NavItem>
      </NavMenu>
    </SideNavSection>
  </SideNav>
);

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <AppShell {...args} header={<TopNav brand="Kioku" />} sidebar={sidebar}>
        <Heading level={1} size="section">
          Releases
        </Heading>
        <Card>
          <Text>Press Tab to reveal the skip link above the banner.</Text>
        </Card>
      </AppShell>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <AppShell
        footer={
          <Text size="sm" tone="muted">
            Kioku UI — MIT licensed
          </Text>
        }
        header={<TopNav brand="Kioku" />}
        sidebar={sidebar}
        skipLinkLabel="Jump to content"
      >
        <Heading level={1} size="section">
          Release 12
        </Heading>
        <Card>
          <Text>
            AppShell adds the one thing most applications forget: a skip link
            that jumps past the banner and rails into the main region.
          </Text>
        </Card>
      </AppShell>
    </DemoFrame>
  ),
};
