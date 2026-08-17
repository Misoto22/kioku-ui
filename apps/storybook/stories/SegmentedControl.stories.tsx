import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, SegmentedControl, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const rangeOptions = [
  {label: 'Week', value: 'week'},
  {label: 'Month', value: 'month'},
  {label: 'Quarter', value: 'quarter'},
] as const;

const meta = {
  id: 'core-segmented-control',
  title: 'Core/SegmentedControl',
  component: SegmentedControl,
  args: {'aria-label': 'Activity range', options: rangeOptions},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Activity range"
      defaultValue="month"
      options={rangeOptions}
    />
  ),
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Horizontal',
          content: (
            <SegmentedControl
              aria-label="Delivery range"
              options={rangeOptions}
            />
          ),
        },
        {
          label: 'Vertical',
          content: (
            <SegmentedControl
              aria-label="Workspace range"
              defaultValue="quarter"
              options={rangeOptions}
              orientation="vertical"
            />
          ),
        },
        {
          label: 'Option unavailable',
          content: (
            <SegmentedControl
              aria-label="Report range"
              options={[
                {label: 'Week', value: 'week'},
                {label: 'Month', value: 'month'},
                {disabled: true, label: 'Year', value: 'year'},
              ]}
            />
          ),
        },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Disabled activity range"
      defaultValue="month"
      disabled
      options={rangeOptions}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Stack gap="xs">
            <Text>Activity summary</Text>
            <Text size="sm" tone="secondary">
              Compare completed deliveries over a selected period.
            </Text>
          </Stack>
          <SegmentedControl
            aria-label="Activity summary range"
            defaultValue="month"
            options={rangeOptions}
          />
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
