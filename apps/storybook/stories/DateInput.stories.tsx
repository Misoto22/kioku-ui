import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {DateInput, Field} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-date-input',
  title: 'Core/DateInput',
  component: DateInput,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function DateInputDemo(
  props: Omit<
    Partial<Parameters<typeof DateInput>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState('2026-08-18');

  return (
    <DateInput
      aria-label="Release date"
      {...props}
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <DateInputDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'with a date', content: <DateInputDemo />},
          {label: 'empty', content: <DateInput aria-label="Release date" />},
          {
            label: 'disabled',
            content: (
              <DateInput
                aria-label="Release date"
                defaultValue="2026-08-18"
                disabled
              />
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field label="Release date" description="Exchanged as an ISO string.">
        <DateInputDemo />
      </Field>
    </DemoFrame>
  ),
};
