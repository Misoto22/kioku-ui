import {useState} from 'react';

import {
  Avatar,
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageList,
  Heading,
  Item,
  List,
  ListItem,
  Resizable,
  Stack,
  Timestamp,
} from '@misoto22/kioku-ui';

interface Message {
  readonly author: 'assistant' | 'reader';
  readonly body: string;
  readonly id: string;
}

interface Conversation {
  readonly id: string;
  readonly messages: readonly Message[];
  readonly title: string;
  readonly updated: string;
  readonly who: string;
}

const seed: readonly Conversation[] = [
  {
    id: 'release-12',
    messages: [
      {author: 'reader', body: 'Which releases are still open?', id: '1'},
      {author: 'assistant', body: 'Three are open: 12, 13, and 14.', id: '2'},
    ],
    title: 'Release 12',
    updated: '2026-08-18T09:30:00Z',
    who: 'Ada Lovelace',
  },
  {
    id: 'audit',
    messages: [
      {author: 'assistant', body: 'The audit finished clean.', id: '1'},
    ],
    title: 'Accessibility audit',
    updated: '2026-08-17T16:05:00Z',
    who: 'Grace Hopper',
  },
];

/**
 * A two-pane messaging shell. The divider is a real separator control, so the
 * list can be resized by keyboard as well as by pointer — replace the seed
 * data and the send handler with your own transport.
 */
export function MessagingShell() {
  const [conversations, setConversations] = useState(seed);
  const [selectedId, setSelectedId] = useState(seed[0]?.id ?? '');

  const selected = conversations.find((entry) => entry.id === selectedId);

  function send(body: string) {
    setConversations((current) =>
      current.map((entry) =>
        entry.id === selectedId
          ? {
              ...entry,
              messages: [
                ...entry.messages,
                {
                  author: 'reader' as const,
                  body,
                  id: String(entry.messages.length + 1),
                },
              ],
            }
          : entry,
      ),
    );
  }

  return (
    <div style={{height: '100vh'}}>
      <Resizable
        max={420}
        min={220}
        panel={
          <Stack gap="sm">
            <Heading level={2} size="subsection">
              Conversations
            </Heading>
            <List gap="xs" variant="plain">
              {conversations.map((conversation) => (
                <ListItem key={conversation.id}>
                  <button
                    aria-current={
                      conversation.id === selectedId ? 'true' : undefined
                    }
                    onClick={() => setSelectedId(conversation.id)}
                    style={{
                      background: 'none',
                      border: 0,
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'start',
                      width: '100%',
                    }}
                    type="button"
                  >
                    <Item
                      description={<Timestamp value={conversation.updated} />}
                      leading={<Avatar name={conversation.who} size="sm" />}
                    >
                      {conversation.title}
                    </Item>
                  </button>
                </ListItem>
              ))}
            </List>
          </Stack>
        }
      >
        {selected === undefined ? null : (
          <ChatLayout
            composer={
              <ChatComposer
                label={`Message about ${selected.title}`}
                onSend={send}
                placeholder="Write a message"
              />
            }
          >
            <ChatMessageList label={selected.title}>
              {selected.messages.map((message) => (
                <ChatMessage
                  author={message.author}
                  authorName={
                    message.author === 'reader' ? 'You' : selected.who
                  }
                  key={message.id}
                >
                  {message.body}
                </ChatMessage>
              ))}
            </ChatMessageList>
          </ChatLayout>
        )}
      </Resizable>
    </div>
  );
}
