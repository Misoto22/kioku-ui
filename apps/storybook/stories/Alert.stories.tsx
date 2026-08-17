import type {Meta, StoryObj} from '@storybook/react-vite';

import {Alert, Card, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Alert',
  component: Alert,
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
    },
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {children: 'Your workspace settings were updated.'},
};

export const Tones: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Information',
          content: <Alert>Maintenance is scheduled for this evening.</Alert>,
        },
        {
          label: 'Success',
          content: <Alert tone="success">The delivery view was saved.</Alert>,
        },
        {
          label: 'Warning',
          content: (
            <Alert tone="warning">
              Two filters need review before publishing.
            </Alert>
          ),
        },
        {
          label: 'Danger',
          content: (
            <Alert tone="danger">Workspace access could not be updated.</Alert>
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
        <Stack gap="md">
          <Text>Workspace access</Text>
          <Alert icon={<span>!</span>} tone="warning">
            <Stack gap="xs">
              <Text>Review pending invitations</Text>
              <Text size="sm">
                Invitations that remain unused for seven days will expire.
              </Text>
            </Stack>
          </Alert>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
