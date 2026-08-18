import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {RadioList, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-radio-list',
  title: 'Core/RadioList',
  component: RadioList,
  args: {legend: '', options: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof RadioList>;

export default meta;
type Story = StoryObj<typeof meta>;

const scopes = [
  {label: 'Public', value: 'public', description: 'Anyone with the link'},
  {label: 'Unlisted', value: 'unlisted'},
  {label: 'Private', value: 'private', disabled: true},
];

function RadioListDemo(
  props: Omit<
    Partial<Parameters<typeof RadioList>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState('public');

  return (
    <RadioList
      {...props}
      legend="Visibility"
      onValueChange={setValue}
      options={scopes}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <RadioListDemo {...args} />
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
            content: <RadioList legend="Visibility" options={scopes} />,
          },
          {label: 'one chosen', content: <RadioListDemo />},
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <RadioListDemo />
        <Text size="sm" tone="muted">
          The legend states the question, so a screen reader announces it before
          reading the answers.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
