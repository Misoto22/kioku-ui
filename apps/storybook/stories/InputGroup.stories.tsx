import type {Meta, StoryObj} from '@storybook/react-vite';

import {Field, InputGroup, NumberInput, TextInput} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-input-group',
  title: 'Core/InputGroup',
  component: InputGroup,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <InputGroup {...args} prefix="AUD" suffix="/month">
        <NumberInput aria-label="Price" defaultValue={120} />
      </InputGroup>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field
        label="Repository"
        description="Affixes are decorative; the label carries the meaning."
      >
        <InputGroup prefix="github.com/">
          <TextInput defaultValue="Misoto22/kioku-ui" />
        </InputGroup>
      </Field>
    </DemoFrame>
  ),
};
