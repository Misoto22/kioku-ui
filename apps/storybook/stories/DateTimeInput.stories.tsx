import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {DateTimeInput, Field} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-date-time-input',
  title: 'Core/DateTimeInput',
  component: DateTimeInput,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof DateTimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function DateTimeInputDemo(
  props: Omit<
    Partial<Parameters<typeof DateTimeInput>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState('2026-08-18T09:30');

  return (
    <DateTimeInput
      aria-label="Publish at"
      {...props}
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'Publish at', content: <DateTimeInputDemo {...args} />},
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'In a field',
            content: (
              <Field
                label="Publish at"
                description="Local time, exchanged as ISO."
              >
                <DateTimeInputDemo />
              </Field>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};
