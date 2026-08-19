import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Card,
  Heading,
  Layout,
  NavItem,
  NavMenu,
  Outline,
  SideNav,
  SideNavSection,
  Text,
  TopNav,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Layout',
  component: Layout,
  args: {children: null},
  parameters: {layout: 'fullscreen'},
} satisfies Meta<typeof Layout>;

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
      <Layout
        {...args}
        header={<TopNav brand="Kioku" />}
        pageHead={
          <>
            <Heading level={1} size="section">
              Releases
            </Heading>
            <Text tone="secondary">Everything shipped in the last quarter</Text>
          </>
        }
        pageIndex="01"
        sidebar={sidebar}
      >
        <Card>
          <Text>Twelve releases are ready to review.</Text>
        </Card>
      </Layout>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Layout
        aside={
          <Outline
            currentHref="#summary"
            entries={[
              {href: '#summary', label: 'Summary'},
              {href: '#changes', label: 'Changes'},
            ]}
          />
        }
        footer={
          <Text size="sm" tone="muted">
            Kioku UI — MIT licensed
          </Text>
        }
        header={<TopNav brand="Kioku" />}
        pageHead={
          <Heading level={1} size="section">
            Release 12
          </Heading>
        }
        pageIndex="12"
        sidebar={sidebar}
      >
        <Card>
          <Text>
            Layout emits children as main, so a skip link has a landmark to
            reach and the page has exactly one main region.
          </Text>
        </Card>
      </Layout>
    </DemoFrame>
  ),
};
