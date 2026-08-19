import type {Meta, StoryObj} from '@storybook/react-vite';

import {ClickableCard, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-clickable-card',
  title: 'Core/ClickableCard',
  component: ClickableCard,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ClickableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ClickableCard {...args}>Release 12</ClickableCard>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'rest', content: <ClickableCard>Release 12</ClickableCard>},
          {
            label: 'disabled',
            content: <ClickableCard disabled>Release 12</ClickableCard>,
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
        <ClickableCard>
          <Stack gap="xs">
            <Text>Release 12</Text>
            <Text size="sm" tone="secondary">
              Twelve changes, ready to review
            </Text>
          </Stack>
        </ClickableCard>
        <Text size="sm" tone="muted">
          The whole surface is one tab stop, so never nest another control
          inside it.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
