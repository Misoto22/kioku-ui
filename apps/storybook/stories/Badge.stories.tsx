import type {Meta, StoryObj} from '@storybook/react-vite';

import {Badge, Card, Grid, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Badge',
  component: Badge,
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
    },
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {args: {children: 'Draft'}};

export const Tones: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'Neutral', content: <Badge>Draft</Badge>},
        {label: 'Information', content: <Badge tone="info">Scheduled</Badge>},
        {label: 'Success', content: <Badge tone="success">Delivered</Badge>},
        {label: 'Warning', content: <Badge tone="warning">Needs review</Badge>},
        {label: 'Danger', content: <Badge tone="danger">Action needed</Badge>},
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Grid columns={2} gap="lg">
          <Stack gap="xs">
            <Text tone="secondary">Delivery status</Text>
            <Text>North region update</Text>
          </Stack>
          <div>
            <Badge tone="success">Delivered</Badge>
          </div>
        </Grid>
      </Card>
    </DemoFrame>
  ),
};
