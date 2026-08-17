import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Skeleton, Stack, Text} from '@misoto22/kioku-ui';

import {ConstrainedFrame, DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Skeleton',
  component: Skeleton,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ConstrainedFrame>
      <Skeleton label="Loading activity summary" />
    </ConstrainedFrame>
  ),
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Announced',
          content: <Skeleton label="Loading delivery summary" />,
        },
        {label: 'Decorative', content: <Skeleton />},
        {
          label: 'Grouped',
          content: (
            <Stack gap="sm">
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </Stack>
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
          <Text tone="secondary">Loading workspace overview</Text>
          <Skeleton label="Loading workspace overview" />
          <Skeleton />
          <Skeleton />
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
