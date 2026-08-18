import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Field, Tokenizer} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Tokenizer',
  component: Tokenizer,
  args: {label: '', onValueChange: () => {}, value: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Tokenizer>;

export default meta;
type Story = StoryObj<typeof meta>;

function TokenizerDemo(
  props: Omit<
    Partial<Parameters<typeof Tokenizer>[0]>,
    'onValueChange' | 'value'
  >,
) {
  const [tags, setTags] = useState<readonly string[]>(['release']);

  return (
    <Tokenizer
      {...props}
      label="Tags"
      onValueChange={setTags}
      placeholder="Add a tag"
      value={tags}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <TokenizerDemo {...args} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field
        label="Tags"
        description="Enter or comma commits a tag; Backspace removes the last."
      >
        <TokenizerDemo />
      </Field>
    </DemoFrame>
  ),
};
