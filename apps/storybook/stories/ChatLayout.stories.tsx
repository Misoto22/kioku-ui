import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {
  Card,
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageList,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-chat-layout',
  title: 'Core/ChatLayout',
  component: ChatLayout,
  args: {composer: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ChatLayout>;

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

function ChatDemo() {
  const [messages, setMessages] = useState(transcript);

  return (
    <div style={{height: '20rem'}}>
      <ChatLayout
        composer={
          <ChatComposer
            label="Message"
            onSend={(text) =>
              setMessages((current) => [
                ...current,
                {
                  author: 'reader' as const,
                  id: String(current.length + 1),
                  text,
                },
              ])
            }
            placeholder="Ask about a release"
          />
        }
      >
        <ChatMessageList label="Conversation">
          {messages.map((message) => (
            <ChatMessage
              author={message.author}
              authorName={message.author === 'reader' ? 'You' : 'Kioku'}
              key={message.id}
            >
              {message.text}
            </ChatMessage>
          ))}
        </ChatMessageList>
      </ChatLayout>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ChatLayout {...args} composer={null}>
        <ChatMessageList label="Conversation">
          <ChatMessage author="assistant" authorName="Kioku">
            Ready when you are.
          </ChatMessage>
        </ChatMessageList>
      </ChatLayout>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <ChatDemo />
      </Card>
    </DemoFrame>
  ),
};
