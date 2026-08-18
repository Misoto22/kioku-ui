import type {Meta, StoryObj} from '@storybook/react-vite';

import {CheckboxInput, Field, Stack} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-checkbox-input',
  title: 'Core/CheckboxInput',
  component: CheckboxInput,
  args: {label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof CheckboxInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <CheckboxInput {...args} label="Notify subscribers" />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'unchecked',
            content: <CheckboxInput label="Notify subscribers" />,
          },
          {
            label: 'checked',
            content: (
              <CheckboxInput defaultChecked label="Notify subscribers" />
            ),
          },
          {
            label: 'indeterminate',
            content: <CheckboxInput indeterminate label="Notify subscribers" />,
          },
          {
            label: 'with description',
            content: (
              <CheckboxInput
                description="Sends one message per release"
                label="Notify subscribers"
              />
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Disabled: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'disabled',
            content: <CheckboxInput disabled label="Notify subscribers" />,
          },
          {
            label: 'disabled and checked',
            content: (
              <CheckboxInput
                defaultChecked
                disabled
                label="Notify subscribers"
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
      <Field
        label="Delivery"
        description="Choose how the release is announced."
      >
        <Stack gap="sm">
          <CheckboxInput defaultChecked label="Notify subscribers" />
          <CheckboxInput label="Post to the changelog" />
        </Stack>
      </Field>
    </DemoFrame>
  ),
};
