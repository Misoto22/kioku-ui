import type {Meta, StoryObj} from '@storybook/react-vite';

import {Field, InputGroup, NumberInput, TextInput} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

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
      <StateGrid
        items={[
          {
            label: 'Both affixes',
            content: (
              <InputGroup {...args} prefix="AUD" suffix="/month">
                <NumberInput aria-label="Price" defaultValue={120} />
              </InputGroup>
            ),
          },
          {
            label: 'Prefix only',
            content: (
              <InputGroup prefix="AUD">
                <NumberInput aria-label="Deposit" defaultValue={40} />
              </InputGroup>
            ),
          },
          {
            label: 'Suffix only',
            content: (
              <InputGroup suffix="/month">
                <NumberInput aria-label="Allowance" defaultValue={12} />
              </InputGroup>
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
      <StateGrid
        items={[
          {
            label: 'In a field',
            content: (
              <Field
                label="Repository"
                description="Affixes are decorative; the label carries the meaning."
              >
                <InputGroup prefix="github.com/">
                  <TextInput defaultValue="Misoto22/kioku-ui" />
                </InputGroup>
              </Field>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};
