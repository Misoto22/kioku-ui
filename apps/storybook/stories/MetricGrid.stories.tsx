import type {Meta, StoryObj} from '@storybook/react-vite';

import {MetricGrid, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const overviewItems = [
  {label: 'Ready deliveries', value: '24', detail: 'Six added this week'},
  {label: 'Pending review', value: '3', detail: 'Two require an owner'},
  {label: 'Workspace members', value: '18', detail: 'All access reviewed'},
] as const;

const meta = {
  id: 'core-metric-grid',
  title: 'Core/MetricGrid',
  component: MetricGrid,
  args: {items: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof MetricGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {args: {items: overviewItems}};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Single metric',
          content: <MetricGrid items={[overviewItems[0]]} />,
        },
        {
          label: 'Without detail',
          content: <MetricGrid items={[{label: 'Saved views', value: '12'}]} />,
        },
        {
          label: 'Responsive group',
          content: <MetricGrid items={overviewItems} />,
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="lg">
        <Stack gap="xs">
          <Text>Workspace overview</Text>
          <Text size="sm" tone="secondary">
            Activity captured over the last seven days.
          </Text>
        </Stack>
        <MetricGrid items={overviewItems} />
      </Stack>
    </DemoFrame>
  ),
};
