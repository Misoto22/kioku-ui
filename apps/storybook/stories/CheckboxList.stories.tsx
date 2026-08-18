import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {CheckboxList, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-checkbox-list',
  title: 'Core/CheckboxList',
  component: CheckboxList,
  args: {legend: '', options: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof CheckboxList>;

export default meta;
type Story = StoryObj<typeof meta>;

const channels = [
  {label: 'Email', value: 'email'},
  {label: 'Chat', value: 'chat', description: 'Posts to the release channel'},
  {label: 'Post', value: 'post', disabled: true},
];

function CheckboxListDemo(
  props: Omit<
    Partial<Parameters<typeof CheckboxList>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState<readonly string[]>(['email']);

  return (
    <CheckboxList
      {...props}
      legend="Notify by"
      onValueChange={setValue}
      options={channels}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <CheckboxListDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'nothing chosen',
            content: <CheckboxList legend="Notify by" options={channels} />,
          },
          {label: 'some chosen', content: <CheckboxListDemo />},
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <CheckboxListDemo />
        <Text size="sm" tone="muted">
          Any number of options can hold at once; use RadioList when they
          exclude each other.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
