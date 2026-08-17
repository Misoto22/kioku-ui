import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Card, Stack, Text, VisuallyHidden} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-visually-hidden',
  title: 'Core/VisuallyHidden',
  component: VisuallyHidden,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button>
      <span aria-hidden="true">•••</span>
      <VisuallyHidden>Open workspace actions</VisuallyHidden>
    </Button>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Text>Delivery schedule</Text>
          <Button variant="secondary">
            <span aria-hidden="true">↗</span>
            <VisuallyHidden>
              Open delivery schedule in a new window
            </VisuallyHidden>
          </Button>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
