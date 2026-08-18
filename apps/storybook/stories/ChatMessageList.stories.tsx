import type {Meta, StoryObj} from '@storybook/react-vite';

import {ChatMessage, ChatMessageList, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-chat-message-list',
  title: 'Core/ChatMessageList',
  component: ChatMessageList,
  args: {label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ChatMessageList>;

export default meta;
type Story = StoryObj<typeof meta>;

const transcript = [
  {author: 'reader' as const, id: '1', text: 'Which releases are still open?'},
  {
    author: 'assistant' as const,
    id: '2',
    text: 'Three are open: 12, 13, and 14.',
  },
];

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ChatMessageList {...args} label="Conversation">
        {transcript.map((message) => (
          <ChatMessage
            author={message.author}
            authorName={message.author === 'reader' ? 'You' : 'Kioku'}
            key={message.id}
          >
            {message.text}
          </ChatMessage>
        ))}
      </ChatMessageList>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <ChatMessageList label="Conversation">
          <ChatMessage author="system">Conversation started</ChatMessage>
          {transcript.map((message) => (
            <ChatMessage
              author={message.author}
              authorName={message.author === 'reader' ? 'You' : 'Kioku'}
              key={message.id}
            >
              {message.text}
            </ChatMessage>
          ))}
        </ChatMessageList>
        <Text size="sm" tone="muted">
          New messages are announced politely, so a reply arrives without losing
          the reader's place.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
