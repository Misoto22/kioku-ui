import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, OverflowList, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-overflow-list',
  title: 'Core/OverflowList',
  component: OverflowList,
  args: {entries: [], visibleCount: 0},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof OverflowList>;

export default meta;
type Story = StoryObj<typeof meta>;

const entries = [
  {label: 'Publish', node: <Button size="sm">Publish</Button>},
  {
    label: 'Archive',
    node: (
      <Button size="sm" variant="secondary">
        Archive
      </Button>
    ),
  },
  {
    label: 'Duplicate',
    node: (
      <Button size="sm" variant="secondary">
        Duplicate
      </Button>
    ),
  },
  {
    label: 'Delete',
    node: (
      <Button size="sm" variant="secondary">
        Delete
      </Button>
    ),
  },
];

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <OverflowList {...args} entries={entries} visibleCount={2} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <OverflowList entries={entries} visibleCount={3} />
        <Text size="sm" tone="muted">
          The visible count is supplied by the caller rather than measured, so
          the row stays predictable and does not thrash on resize.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
