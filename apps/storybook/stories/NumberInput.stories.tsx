import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Field, InputGroup, NumberInput} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-number-input',
  title: 'Core/NumberInput',
  component: NumberInput,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function NumberInputDemo(
  props: Omit<
    Partial<Parameters<typeof NumberInput>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState<number | undefined>(12);

  return (
    <NumberInput
      aria-label="Count"
      {...props}
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <NumberInputDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'with a value', content: <NumberInputDemo />},
          {label: 'empty', content: <NumberInput aria-label="Count" />},
          {
            label: 'disabled',
            content: (
              <NumberInput aria-label="Count" defaultValue={12} disabled />
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
      <Field label="Budget" description="An empty field reads as unanswered.">
        <InputGroup prefix="AUD">
          <NumberInputDemo />
        </InputGroup>
      </Field>
    </DemoFrame>
  ),
};
