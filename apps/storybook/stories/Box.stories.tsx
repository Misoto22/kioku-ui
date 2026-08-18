import type {Meta, StoryObj} from '@storybook/react-vite';

import {Box, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Box',
  component: Box,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Box {...args} bordered padding="lg" radius="container">
        <Text>A box spends only token values.</Text>
      </Box>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['canvas', 'surface', 'raised', 'muted'] as const).map(
          (surface) => ({
            label: surface,
            content: (
              <Box bordered padding="md" radius="element" surface={surface}>
                <Text size="sm">{surface}</Text>
              </Box>
            ),
          }),
        )}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Box padding="lg" radius="page" surface="muted">
          <Stack gap="sm">
            <Text>Release 12</Text>
            <Text size="sm" tone="secondary">
              Twelve changes are ready to review.
            </Text>
          </Stack>
        </Box>
        <Text size="sm" tone="muted">
          Reach for Box only when Card or Section would misdescribe the thing.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
