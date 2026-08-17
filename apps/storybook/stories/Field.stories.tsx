import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Card, Field, Stack, TextInput} from '@misoto22/kioku-ui';

import {ConstrainedFrame, DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Field',
  component: Field,
  args: {label: 'View name'},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ConstrainedFrame>
      <Field
        description="Used to identify this view in the workspace."
        label="View name"
        necessity="required"
      >
        <TextInput placeholder="Quarterly deliveries" />
      </Field>
    </ConstrainedFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'Optional',
            content: (
              <Field label="Reference" necessity="optional">
                <TextInput placeholder="Internal reference" />
              </Field>
            ),
          },
          {
            label: 'Helpful status',
            content: (
              <Field
                label="Workspace URL"
                status="This address is available."
                statusTone="success"
              >
                <TextInput defaultValue="operations-hub" />
              </Field>
            ),
          },
          {
            label: 'Validation error',
            content: (
              <Field
                label="Workspace URL"
                status="Use letters, numbers, or hyphens."
              >
                <TextInput defaultValue="operations hub" />
              </Field>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ConstrainedFrame>
      <Field
        description="Managed by your workspace administrator."
        label="Organization"
      >
        <TextInput defaultValue="Northwind Operations" disabled />
      </Field>
    </ConstrainedFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card elevation="low">
        <ConstrainedFrame>
          <Stack gap="lg">
            <Field label="Saved view name" necessity="required">
              <TextInput defaultValue="Weekly delivery review" />
            </Field>
            <Field label="Owner" necessity="optional">
              <TextInput placeholder="Team or role" />
            </Field>
            <Button>Save view</Button>
          </Stack>
        </ConstrainedFrame>
      </Card>
    </DemoFrame>
  ),
};
