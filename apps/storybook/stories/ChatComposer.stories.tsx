import type {Meta, StoryObj} from '@storybook/react-vite';

import {ChatComposer, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-chat-composer',
  title: 'Core/ChatComposer',
  component: ChatComposer,
  args: {label: '', onSend: () => {}},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ChatComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ChatComposer
        {...args}
        label="Message"
        placeholder="Ask about a release"
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <ChatComposer
          label="Message"
          onSend={() => {}}
          placeholder="Ask about a release"
        />
        <ChatComposer
          disabled
          label="Message"
          onSend={() => {}}
          placeholder="Waiting for a reply"
        />
        <Text size="sm" tone="muted">
          Enter sends and Shift+Enter starts a new line, which is what a reader
          expects from every other chat field.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
