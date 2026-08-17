import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Divider, Heading, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Divider',
  component: Divider,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Divider {...args} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Heading level={2} size="subsection">
            Delivery summary
          </Heading>
          <Text tone="secondary">Twelve updates are ready to review.</Text>
          <Divider />
          <Text>Last updated moments ago</Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
