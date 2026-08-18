import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Calendar, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Calendar',
  component: Calendar,
  args: {label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

function CalendarDemo(
  props: Omit<
    Partial<Parameters<typeof Calendar>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState('2026-08-18');

  return (
    <Calendar
      {...props}
      label="Release date"
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <CalendarDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'with a date', content: <CalendarDemo />},
          {
            label: 'bounded range',
            content: <CalendarDemo max="2026-08-25" min="2026-08-10" />,
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <CalendarDemo />
        <Text size="sm" tone="muted">
          Arrow keys move by day and week, Home and End reach the ends of the
          week, Page Up and Page Down move by month, so the whole grid costs one
          Tab press.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
