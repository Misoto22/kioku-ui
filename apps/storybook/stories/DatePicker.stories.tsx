import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {DatePicker, Field} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-date-picker',
  title: 'Core/DatePicker',
  component: DatePicker,
  args: {label: ''},
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
      <DatePickerDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {content: <DatePickerDemo />, label: 'Rest'},
          {content: <DatePickerDemo readOnly />, label: 'Read-only'},
          {content: <DatePickerDemo disabled />, label: 'Disabled'},
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field
        description="The grid is this system's own, so a bound can be shown inside it."
        label="Release date"
      >
        <DatePickerDemo />
      </Field>
    </DemoFrame>
  ),
};
