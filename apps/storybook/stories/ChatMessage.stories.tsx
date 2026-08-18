import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  ChatMessage,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
  Stack,
  Text,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-chat-message',
  title: 'Core/ChatMessage',
  component: ChatMessage,
  args: {author: 'assistant'},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ChatMessageList label="Conversation">
        <ChatMessage {...args} authorName="Kioku">
          Three releases are still open.
        </ChatMessage>
      </ChatMessageList>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <ChatMessageList label="Conversation">
        <ChatSystemMessage>Conversation started</ChatSystemMessage>
        <ChatMessage author="reader" authorName="You">
          Which releases are still open?
        </ChatMessage>
        <ChatMessage author="assistant" authorName="Kioku">
          Three are open: 12, 13, and 14.
        </ChatMessage>
        <ChatMessage author="assistant" authorName="Kioku" pending>
          waiting
        </ChatMessage>
      </ChatMessageList>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <ChatMessageList label="Conversation">
          <ChatSystemMessage>Conversation started</ChatSystemMessage>
          <ChatMessage author="reader" authorName="You">
            Publish release 12.
          </ChatMessage>
          <ChatMessage author="assistant" authorName="Kioku">
            <Stack gap="sm">
              <Text>Published.</Text>
              <ChatMessageMetadata
                entries={[
                  {label: 'Model', value: 'kioku-1'},
                  {label: 'Latency', value: '1.2s'},
                ]}
              />
            </Stack>
          </ChatMessage>
        </ChatMessageList>
        <Text size="sm" tone="muted">
          The author is named in text rather than implied by which side the
          bubble sits on, because alignment is invisible to a screen reader.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
