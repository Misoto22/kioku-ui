import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Resizable, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Resizable',
  component: Resizable,
  args: {children: null, panel: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Resizable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <div style={{height: '12rem'}}>
        <Resizable {...args} panel={<Text>Rail</Text>}>
          <Text>Page content</Text>
        </Resizable>
      </div>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <div style={{height: '12rem'}}>
          <Resizable panel={<Card>Files</Card>}>
            <Card>Editor</Card>
          </Resizable>
        </div>
        <Text size="sm" tone="muted">
          The divider is a real separator control, so arrow keys move it — a
          drag handle alone would be unusable by keyboard.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
