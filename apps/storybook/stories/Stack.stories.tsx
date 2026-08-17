import type {Meta, StoryObj} from '@storybook/react-vite';

import {Badge, Card, Heading, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Stack',
  component: Stack,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

function VisibleItems() {
  return (
    <>
      <Card>
        <Text>Delivery schedule</Text>
      </Card>
      <Card>
        <Text>Workspace access</Text>
      </Card>
      <Card>
        <Text>Saved views</Text>
      </Card>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <DemoFrame>
      <Stack>
        <VisibleItems />
      </Stack>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Small gap',
          content: (
            <Stack gap="sm">
              <VisibleItems />
            </Stack>
          ),
        },
        {
          label: 'Large gap',
          content: (
            <Stack gap="xl">
              <VisibleItems />
            </Stack>
          ),
        },
        {
          label: 'Centered items',
          content: (
            <Stack align="center">
              <Badge tone="success">Ready</Badge>
              <Badge>Draft</Badge>
            </Stack>
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
            <Heading level={2}>Activity summary</Heading>
            <Text tone="secondary">
              A clear hierarchy built from nested spacing relationships.
            </Text>
          </Stack>
          <Stack gap="sm">
            <Text>Delivery view updated</Text>
            <Text>Access review completed</Text>
          </Stack>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
