import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Grid, Stack, StatusDot, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-status-dot',
  title: 'Core/StatusDot',
  component: StatusDot,
  args: {'aria-label': 'Workspace status'},
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
    },
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {'aria-label': 'Workspace is available'},
};

export const Tones: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Information',
          content: <StatusDot aria-label="Update scheduled" tone="info" />,
        },
        {
          label: 'Success',
          content: <StatusDot aria-label="Service available" tone="success" />,
        },
        {
          label: 'Warning',
          content: <StatusDot aria-label="Service degraded" tone="warning" />,
        },
        {
          label: 'Danger',
          content: <StatusDot aria-label="Service unavailable" tone="danger" />,
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Grid columns={2} gap="md">
          <Stack gap="xs">
            <Text>Workspace sync</Text>
            <Text size="sm" tone="secondary">
              Updated moments ago
            </Text>
          </Stack>
          <div>
            <StatusDot aria-label="Workspace sync available" tone="success" />
          </div>
        </Grid>
      </Card>
    </DemoFrame>
  ),
};
