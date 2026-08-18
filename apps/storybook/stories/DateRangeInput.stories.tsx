import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {DateRangeInput, Stack, Text, type DateRange} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-date-range-input',
  title: 'Core/DateRangeInput',
  component: DateRangeInput,
  args: {legend: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof DateRangeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function DateRangeInputDemo(
  props: Omit<
    Partial<Parameters<typeof DateRangeInput>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState<DateRange>({
    end: '2026-08-31',
    start: '2026-08-01',
  });

  return (
    <DateRangeInput
      {...props}
      legend="Reporting period"
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <DateRangeInputDemo {...args} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <DateRangeInputDemo />
        <Text size="sm" tone="muted">
          The end control refuses dates before the start, so an impossible range
          cannot be entered in the first place.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
