import type {Meta, StoryObj} from '@storybook/react-vite';

import {Item, Stack, Text, Timestamp} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Timestamp',
  component: Timestamp,
  args: {value: '2026-08-18T09:30:00.000Z'},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Timestamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Timestamp {...args} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <Item
          description={<Timestamp value="2026-08-18T09:30:00.000Z" />}
          trailing={
            <Text size="sm" tone="muted">
              v12
            </Text>
          }
        >
          Release notes published
        </Item>
        <Text size="sm" tone="muted">
          The date a reader sees and the one a parser reads cannot drift apart.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
