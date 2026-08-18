import type {Meta, StoryObj} from '@storybook/react-vite';

import {Citation, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Citation',
  component: Citation,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Citation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Citation {...args} href="https://example.com/rfc9457">
        RFC 9457
      </Citation>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <Text>
          Errors follow the problem-details format{' '}
          <Citation href="https://example.com/rfc9457" marker="1">
            RFC 9457
          </Citation>
          .
        </Text>
        <Text size="sm" tone="muted">
          The marker is decorative; the source name stays in the accessible
          name.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
