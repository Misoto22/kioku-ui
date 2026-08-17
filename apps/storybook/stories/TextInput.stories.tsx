import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Card, Field, Stack, TextInput} from '@misoto22/kioku-ui';

import {ConstrainedFrame, DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-text-input',
  title: 'Core/TextInput',
  component: TextInput,
  args: {
    'aria-label': 'Saved view name',
    placeholder: 'Weekly activity',
  },
  argTypes: {
    'aria-invalid': {control: 'boolean'},
    disabled: {control: 'boolean'},
    readOnly: {control: 'boolean'},
    required: {control: 'boolean'},
    type: {
      control: 'select',
      options: ['text', 'email', 'search', 'tel', 'url'],
    },
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ConstrainedFrame>
      <TextInput {...args} />
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
              <TextInput
                aria-label="Workspace name"
                data-story-state="rest"
                defaultValue="Operations"
              />
            ),
          },
          {
            label: 'Pointer hover',
            content: (
              <TextInput
                aria-label="Hovered workspace name"
                data-story-state="hover"
                defaultValue="Delivery overview"
              />
            ),
          },
          {
            label: 'Keyboard focus',
            content: (
              <TextInput
                aria-label="Focused workspace name"
                data-story-state="focus"
                defaultValue="Operations"
              />
            ),
          },
          {
            label: 'Pointer active',
            content: (
              <TextInput
                aria-label="Active workspace name"
                data-story-state="active"
                defaultValue="Delivery operations"
                onMouseDown={(event) => event.preventDefault()}
              />
            ),
          },
          {
            label: 'Read only',
            content: (
              <TextInput
                aria-label="Account ID"
                defaultValue="ACCT-2048"
                readOnly
              />
            ),
          },
          {
            label: 'Invalid',
            content: (
              <TextInput
                aria-label="Workspace URL"
                aria-invalid="true"
                defaultValue="operations hub"
                readOnly
              />
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
  play: async ({canvasElement, userEvent}) => {
    const focusTarget = canvasElement.querySelector<HTMLElement>(
      '[data-story-state="focus"]',
    );
    const activeTarget = canvasElement.querySelector<HTMLElement>(
      '[data-story-state="active"]',
    );
    const hoverTarget = canvasElement.querySelector<HTMLElement>(
      '[data-story-state="hover"]',
    );
    if (!focusTarget || !activeTarget || !hoverTarget) {
      throw new Error('TextInput state targets are missing');
    }

    focusTarget.focus();
    await userEvent.pointer({keys: '[MouseLeft>]', target: activeTarget});
    await userEvent.hover(hoverTarget);
  },
};

export const Disabled: Story = {
  render: () => (
    <ConstrainedFrame>
      <TextInput
        aria-label="Managed organization"
        defaultValue="Northwind Operations"
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
              description="Shown to members in workspace navigation."
              label="Workspace name"
              necessity="required"
            >
              <TextInput defaultValue="Delivery operations" />
            </Field>
            <Button>Save settings</Button>
          </Stack>
        </ConstrainedFrame>
      </Card>
    </DemoFrame>
  ),
};
