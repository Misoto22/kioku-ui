import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Center, Spinner, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Center',
  component: Center,
  args: {children: <Card>Centered workspace summary</Card>},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Center {...args} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Center>
          <Stack align="center" gap="md">
            <Spinner label="Loading workspace summary" />
            <Text tone="secondary">Loading workspace summary…</Text>
          </Stack>
        </Center>
      </Card>
    </DemoFrame>
  ),
};
