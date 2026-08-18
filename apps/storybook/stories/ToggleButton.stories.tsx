import type {Meta, StoryObj} from '@storybook/react-vite';

import {Stack, Text, ToggleButton} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-toggle-button',
  title: 'Core/ToggleButton',
  component: ToggleButton,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ToggleButton {...args}>Bold</ToggleButton>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'off', content: <ToggleButton>Bold</ToggleButton>},
          {
            label: 'on',
            content: <ToggleButton defaultPressed>Bold</ToggleButton>,
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Disabled: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'disabled off',
            content: <ToggleButton disabled>Bold</ToggleButton>,
          },
          {
            label: 'disabled on',
            content: (
              <ToggleButton defaultPressed disabled>
                Bold
              </ToggleButton>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <ToggleButton defaultPressed>Wrap lines</ToggleButton>
        <Text size="sm" tone="muted">
          It reports state through aria-pressed: a command that stays on, not a
          setting that applies on its own.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
