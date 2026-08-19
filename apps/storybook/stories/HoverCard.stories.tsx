import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Card, HoverCard, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-hover-card',
  title: 'Core/HoverCard',
  component: HoverCard,
  args: {children: <span />, content: null, label: 'Author detail'},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const preview = (
  <Stack gap="sm">
    <Text>Ada Lovelace</Text>
    <Text size="sm" tone="secondary">
      Twelve releases published this quarter.
    </Text>
    <Button variant="secondary">Follow</Button>
  </Stack>
);

export const Default: Story = {
  args: {label: 'Author detail'},
  render: (args) => (
    <DemoFrame>
      <HoverCard {...args} content={preview}>
        <Button variant="ghost">Ada</Button>
      </HoverCard>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['bottom', 'top'] as const).map((placement) => ({
          label: placement,
          content: (
            <HoverCard
              label="Author detail"
              content={preview}
              placement={placement}
            >
              <Button variant="ghost">{placement}</Button>
            </HoverCard>
          ),
        }))}
      />
    </DemoFrame>
  ),
};

// The only surface in this group whose story cannot open it. HoverCard puts
// its content in a Popover, which names itself `dialog`, and HoverCard takes
// no label to give it — so a story that hovered the trigger would stand an
// unnamed dialog in front of the accessibility baseline. It needs a `label`
// prop before it can be shown open.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          Unlike a tooltip, the preview is interactive and stays open while the
          pointer is inside it.
        </Text>
        <Card>
          <HoverCard label="Author detail" closeDelay={200} content={preview}>
            <Button variant="ghost">Ada Lovelace</Button>
          </HoverCard>
        </Card>
      </Stack>
    </DemoFrame>
  ),
};
