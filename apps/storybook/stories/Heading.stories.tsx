import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Heading, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Heading',
  component: Heading,
  args: {level: 2},
  argTypes: {
    family: {control: 'select', options: ['interface', 'display']},
    level: {control: 'select', options: [1, 2, 3, 4, 5, 6]},
    size: {control: 'select', options: ['page', 'section', 'subsection']},
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {children: 'Workspace overview', level: 2},
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="lg">
      <Heading level={1} size="page">
        Workspace overview
      </Heading>
      <Heading level={2} size="section">
        Delivery activity
      </Heading>
      <Heading level={3} size="subsection">
        Pending review
      </Heading>
    </Stack>
  ),
};

export const Families: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Interface',
          content: <Heading level={2}>Workspace access</Heading>,
        },
        {
          label: 'Display · page use only',
          content: (
            <Heading family="display" level={1} size="page">
              A calmer workspace
            </Heading>
          ),
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Heading level={2}>Upcoming deliveries</Heading>
          <Text tone="secondary">
            Review schedule changes and confirm ownership.
          </Text>
          <Heading level={3} size="subsection">
            Needs attention
          </Heading>
          <Text>Two delivery groups are waiting for review.</Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
