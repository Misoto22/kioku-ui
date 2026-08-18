import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Field, Selector} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Selector',
  component: Selector,
  args: {options: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Selector>;

export default meta;
type Story = StoryObj<typeof meta>;

const owners = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Grace Hopper', value: 'grace'},
  {label: 'Alan Turing', value: 'alan', disabled: true},
];

function SelectorDemo(
  props: Omit<
    Partial<Parameters<typeof Selector>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState('ada');

  return (
    <Selector
      aria-label="Owner"
      {...props}
      onValueChange={setValue}
      options={owners}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <SelectorDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'chosen', content: <SelectorDemo />},
          {
            label: 'with a prompt',
            content: (
              <Selector
                aria-label="Owner"
                options={owners}
                placeholder="Choose an owner"
              />
            ),
          },
          {
            label: 'disabled',
            content: <Selector aria-label="Owner" disabled options={owners} />,
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field label="Owner" description="Who signs off this release.">
        <SelectorDemo />
      </Field>
    </DemoFrame>
  ),
};
