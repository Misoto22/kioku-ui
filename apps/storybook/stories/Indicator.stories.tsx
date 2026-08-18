import type {Meta, StoryObj} from '@storybook/react-vite';

import {Icon, IconButton, Indicator, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Indicator',
  component: Indicator,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Indicator>;

export default meta;
type Story = StoryObj<typeof meta>;

function InboxButton() {
  return (
    <IconButton aria-label="Inbox" variant="secondary">
      <Icon>
        <path
          d="M4 6h16v12H4Zm0 0 8 6 8-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </Icon>
    </IconButton>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Indicator {...args} count={3} label="3 unread messages">
        <InboxButton />
      </Indicator>
    </DemoFrame>
  ),
};

export const Tones: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['info', 'success', 'warning', 'danger'] as const).map(
          (tone) => ({
            label: tone,
            content: (
              <Indicator count={3} label={`3 ${tone} items`} tone={tone}>
                <InboxButton />
              </Indicator>
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
        <Indicator count={140} label="140 unread messages">
          <InboxButton />
        </Indicator>
        <Indicator label="Unread messages">
          <InboxButton />
        </Indicator>
        <Text size="sm" tone="muted">
          The label is what a screen reader hears; a bare number beside an icon
          means nothing on its own.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
