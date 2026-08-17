import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Text',
  component: Text,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {children: 'Workspace activity is ready to review.'},
};

export const Tones: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'Primary', content: <Text>Delivery schedule confirmed.</Text>},
        {
          label: 'Secondary',
          content: <Text tone="secondary">Updated moments ago</Text>,
        },
        {
          label: 'Muted',
          content: <Text tone="muted">No additional details</Text>,
        },
      ]}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <Text size="sm">Small metadata for supporting context.</Text>
      <Text>Default body copy for product interfaces.</Text>
      <Text size="lg">Large copy for a concise introductory statement.</Text>
    </Stack>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="sm">
          <Text size="lg">Delivery activity</Text>
          <Text tone="secondary">Twelve updates are ready for review.</Text>
          <Text size="sm" tone="muted">
            Updated moments ago
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
