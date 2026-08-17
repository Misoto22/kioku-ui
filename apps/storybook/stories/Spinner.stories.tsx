import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Card, Spinner, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Spinner',
  component: Spinner,
  args: {label: 'Loading activity'},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {args: {label: 'Loading activity'}};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Loading view',
          content: <Spinner label="Loading saved view" />,
        },
        {
          label: 'Refreshing',
          content: <Spinner label="Refreshing delivery status" />,
        },
        {
          label: 'Synchronizing',
          content: <Spinner label="Synchronizing workspace" />,
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack align="center" gap="md">
          <Spinner label="Publishing workspace changes" />
          <Text tone="secondary">Publishing workspace changes…</Text>
          <Button disabled variant="secondary">
            Please wait
          </Button>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
