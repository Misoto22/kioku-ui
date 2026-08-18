import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Button,
  Field,
  FormLayout,
  Selector,
  TextArea,
  TextInput,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-form-layout',
  title: 'Core/FormLayout',
  component: FormLayout,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof FormLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const owners = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Grace Hopper', value: 'grace'},
];

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <FormLayout {...args} actions={<Button>Save</Button>}>
        <Field label="Title">
          <TextInput defaultValue="Release 12" />
        </Field>
      </FormLayout>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <FormLayout actions={<Button>Save</Button>} columns={2}>
        <Field label="Title">
          <TextInput defaultValue="Release 12" />
        </Field>
        <Field label="Owner">
          <Selector options={owners} placeholder="Choose an owner" />
        </Field>
      </FormLayout>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <FormLayout
        actions={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button>Publish</Button>
          </>
        }
        columns={2}
      >
        <Field label="Title">
          <TextInput defaultValue="Release 12" />
        </Field>
        <Field label="Owner">
          <Selector options={owners} placeholder="Choose an owner" />
        </Field>
        <Field label="Notes" description="Shown to every subscriber.">
          <TextArea defaultValue="" />
        </Field>
      </FormLayout>
    </DemoFrame>
  ),
};
