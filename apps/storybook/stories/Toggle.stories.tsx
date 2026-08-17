import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Stack, Text, Toggle} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Toggle',
  component: Toggle,
  argTypes: {
    defaultPressed: {control: 'boolean'},
    disabled: {control: 'boolean'},
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {'aria-label': 'Enable weekly summary', children: 'Weekly summary'},
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Off',
          content: (
            <Toggle aria-label="Delivery alerts off">Delivery alerts</Toggle>
          ),
        },
        {
          label: 'On',
          content: (
            <Toggle aria-label="Delivery alerts on" defaultPressed>
              Delivery alerts
            </Toggle>
          ),
        },
        {
          label: 'Keyboard focus',
          content: (
            <Toggle aria-label="Focused activity digest" autoFocus>
              Activity digest
            </Toggle>
          ),
        },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Disabled off',
          content: (
            <Toggle aria-label="Disabled reminder" disabled>
              Reminder
            </Toggle>
          ),
        },
        {
          label: 'Disabled on',
          content: (
            <Toggle
              aria-label="Managed security alerts"
              defaultPressed
              disabled
            >
              Security alerts
            </Toggle>
          ),
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="lg">
          <Stack gap="xs">
            <Text>Notification preferences</Text>
            <Text size="sm" tone="secondary">
              Choose which workspace updates appear in your digest.
            </Text>
          </Stack>
          <Toggle aria-label="Include delivery changes" defaultPressed>
            Delivery changes
          </Toggle>
          <Toggle aria-label="Include access updates">Access updates</Toggle>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
