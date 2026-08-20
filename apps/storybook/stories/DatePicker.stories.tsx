import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {DatePicker, Field} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-date-picker',
  title: 'Core/DatePicker',
  component: DatePicker,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function DatePickerDemo(
  props: Omit<
    Partial<Parameters<typeof DatePicker>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState('2026-08-20');

  return (
    <DatePicker
      label="Release date"
      {...props}
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <DatePickerDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'Rest', node: <DatePickerDemo />},
          {label: 'Read-only', node: <DatePickerDemo readOnly />},
          {label: 'Disabled', node: <DatePickerDemo disabled />},
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field
        hint="The grid is this system's own, so a bound can be shown inside it."
        label="Release date"
      >
        <DatePickerDemo />
      </Field>
    </DemoFrame>
  ),
};
