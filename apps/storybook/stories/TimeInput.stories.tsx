import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Field, TimeInput} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-time-input',
  title: 'Core/TimeInput',
  component: TimeInput,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof TimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function TimeInputDemo(
  props: Omit<
    Partial<Parameters<typeof TimeInput>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState('09:30');

  return (
    <TimeInput
      aria-label="Start time"
      {...props}
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <TimeInputDemo {...args} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field label="Start time" description="Exchanged as an ISO string.">
        <TimeInputDemo />
      </Field>
    </DemoFrame>
  ),
};
