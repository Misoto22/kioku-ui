import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Field, MultiSelector} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-multi-selector',
  title: 'Core/MultiSelector',
  component: MultiSelector,
  args: {label: '', onValueChange: () => {}, options: [], value: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof MultiSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const people = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Alan Turing', value: 'alan'},
  {label: 'Grace Hopper', value: 'grace'},
];

function MultiSelectorDemo(
  props: Partial<Parameters<typeof MultiSelector>[0]>,
) {
  const [value, setValue] = useState<readonly string[]>(['ada']);

  return (
    <MultiSelector
      {...props}
      label="Owners"
      onValueChange={setValue}
      options={people}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <StateGrid
        items={[{label: 'Owners', content: <MultiSelectorDemo {...args} />}]}
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
                label="Owners"
                description="Everyone who signs off this release."
              >
                <MultiSelectorDemo />
              </Field>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};
