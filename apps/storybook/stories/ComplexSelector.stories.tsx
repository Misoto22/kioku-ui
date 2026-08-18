import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {ComplexSelector, Field} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-complex-selector',
  title: 'Core/ComplexSelector',
  component: ComplexSelector,
  args: {groups: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ComplexSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const teams = [
  {
    label: 'Engineering',
    options: [
      {label: 'Ada Lovelace', value: 'ada'},
      {label: 'Alan Turing', value: 'alan'},
    ],
  },
  {
    label: 'Design',
    options: [{label: 'Grace Hopper', value: 'grace'}],
  },
];

function ComplexSelectorDemo(
  props: Omit<
    Partial<Parameters<typeof ComplexSelector>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState('ada');

  return (
    <ComplexSelector
      aria-label="Owner"
      {...props}
      groups={teams}
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ComplexSelectorDemo {...args} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field label="Owner" description="Grouped by team.">
        <ComplexSelectorDemo />
      </Field>
    </DemoFrame>
  ),
};
