import type {Meta, StoryObj} from '@storybook/react-vite';

import {FieldStatus, Stack, TextInput} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-field-status',
  title: 'Core/FieldStatus',
  component: FieldStatus,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof FieldStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <FieldStatus {...args}>Saved moments ago</FieldStatus>
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
              <FieldStatus tone={tone}>Release number {tone}</FieldStatus>
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
      <Stack gap="xs">
        <TextInput aria-invalid aria-label="Release number" defaultValue="" />
        <FieldStatus tone="danger">Enter a release number.</FieldStatus>
      </Stack>
    </DemoFrame>
  ),
};
