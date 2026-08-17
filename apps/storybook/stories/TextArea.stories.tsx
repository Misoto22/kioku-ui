import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Card, Field, Stack, TextArea} from '@misoto22/kioku-ui';

import {ConstrainedFrame, DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-text-area',
  title: 'Core/TextArea',
  component: TextArea,
  args: {
    'aria-label': 'Release note',
    placeholder: 'Summarize the update',
  },
  argTypes: {
    'aria-invalid': {control: 'boolean'},
    disabled: {control: 'boolean'},
    readOnly: {control: 'boolean'},
    required: {control: 'boolean'},
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ConstrainedFrame>
      <TextArea {...args} />
    </ConstrainedFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'Rest',
            content: (
              <TextArea
                aria-label="Activity note"
                defaultValue="Delivery schedule confirmed."
              />
            ),
          },
          {
            label: 'Keyboard focus',
            content: <TextArea aria-label="Focused activity note" autoFocus />,
          },
          {
            label: 'Read only',
            content: (
              <TextArea
                aria-label="Published note"
                readOnly
                defaultValue="Workspace access was reviewed."
              />
            ),
          },
          {
            label: 'Invalid',
            content: (
              <TextArea
                aria-label="Invalid note"
                aria-invalid="true"
                readOnly
                defaultValue="A clear summary is required."
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
    <ConstrainedFrame>
      <TextArea
        aria-label="Archived note"
        defaultValue="Editing is unavailable for archived updates."
        disabled
      />
    </ConstrainedFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <ConstrainedFrame>
          <Stack gap="lg">
            <Field
              description="Keep the summary concise and useful to workspace members."
              label="Change summary"
              necessity="required"
            >
              <TextArea defaultValue="Updated delivery filters and clarified workspace access." />
            </Field>
            <Button>Publish summary</Button>
          </Stack>
        </ConstrainedFrame>
      </Card>
    </DemoFrame>
  ),
};
