import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Stack, Text, Tooltip} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Tooltip',
  component: Tooltip,
  args: {children: <span />, content: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Tooltip {...args} content="Saves the current draft">
        <Button>Save</Button>
      </Tooltip>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['top', 'bottom', 'left', 'right'] as const).map(
          (placement) => ({
            label: placement,
            content: (
              <Tooltip content={`Anchored ${placement}`} placement={placement}>
                <Button variant="secondary">{placement}</Button>
              </Tooltip>
            ),
          }),
        )}
      />
    </DemoFrame>
  ),
};

// A tooltip only exists while it is pointed at, so the story points at it.
// Without this the surface is never once visible in the whole catalogue.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          A tooltip supplements the trigger name through aria-describedby. Never
          put essential information here alone.
        </Text>
        <Tooltip content="Publishes to every subscriber" delay={0}>
          <Button data-story-target="trigger">Publish</Button>
        </Tooltip>
      </Stack>
    </DemoFrame>
  ),
  play: async ({canvasElement, userEvent}) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-story-target="trigger"]',
    );
    if (!trigger) {
      throw new Error('Tooltip trigger is missing');
    }
    await userEvent.hover(trigger);
  },
};
