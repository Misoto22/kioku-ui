import {useState, type CSSProperties} from 'react';

import {
  Avatar,
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageList,
  ChatSystemMessage,
  Eyebrow,
  HStack,
  Icon,
  IconButton,
  Item,
  Kbd,
  List,
  ListItem,
  Numeral,
  Resizable,
  Stack,
  Text,
  TextInput,
  Timestamp,
  Toolbar,
} from '@misoto22/kioku-ui';

// Every value below is a custom property the library itself spends. A template
// is copied into somebody else's repository, so it has no access to the
// authoring tokens — but it must still follow a theme when one is swapped,
// which rules out writing a colour or a length by hand.

const frame: CSSProperties = {
  // A single auto row in a grid of definite height is stretched to fill it,
  // which is what gives the split panes a height to divide.
  blockSize: '100vh',
  display: 'grid',
};

const pane: CSSProperties = {
  blockSize: '100%',
  display: 'flex',
  flexDirection: 'column',
  minBlockSize: 0,
};

const transcriptPane: CSSProperties = {
  ...pane,
  backgroundColor: 'var(--kioku-ui-color-surface)',
};

// The seams between regions are hairlines drawn as inset shadows: a one-sided
// rule needs a border longhand CSS types will not accept a custom property in.
const paneHead: CSSProperties = {
  alignItems: 'center',
  boxShadow:
    'inset 0 calc(-1 * var(--kioku-ui-border-width)) 0 var(--kioku-ui-border-default)',
  display: 'flex',
  flex: 'none',
  gap: 'var(--kioku-ui-spacing-lg)',
  justifyContent: 'space-between',
  paddingBlock: 'var(--kioku-ui-spacing-md)',
  paddingInline: 'var(--kioku-ui-spacing-lg)',
};

const paneFoot: CSSProperties = {
  alignItems: 'center',
  boxShadow:
    'inset 0 var(--kioku-ui-border-width) 0 var(--kioku-ui-border-default)',
  display: 'flex',
  flex: 'none',
  gap: 'var(--kioku-ui-spacing-md)',
  justifyContent: 'space-between',
  marginBlockStart: 'auto',
  paddingBlock: 'var(--kioku-ui-spacing-md)',
  paddingInline: 'var(--kioku-ui-spacing-lg)',
};

const paneBody: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  gap: 'var(--kioku-ui-spacing-lg)',
  minBlockSize: 0,
  overflowY: 'auto',
  paddingBlock: 'var(--kioku-ui-spacing-md)',
  paddingInline: 'var(--kioku-ui-spacing-lg)',
};

const transcriptBody: CSSProperties = {
  // A grid rather than a column of flex items: `ChatLayout` divides the height
  // it is given between transcript and composer, and only a stretched grid row
  // hands it one it can divide.
  display: 'grid',
  flexGrow: 1,
  minBlockSize: 0,
  paddingBlock: 'var(--kioku-ui-spacing-lg)',
  paddingInline: 'var(--kioku-ui-spacing-xl)',
};

const paneTitle: CSSProperties = {
  color: 'var(--kioku-ui-color-text)',
  fontFamily: 'var(--kioku-ui-typography-font-family-heading)',
  fontSize: 'var(--kioku-ui-typography-font-size-lg)',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-heading)',
  lineHeight: 'var(--kioku-ui-typography-line-height-heading)',
  margin: 0,
};

const row: CSSProperties = {
  background: 'none',
  border: 0,
  borderRadius: 'var(--kioku-ui-radius-element)',
  color: 'var(--kioku-ui-color-text-secondary)',
  cursor: 'pointer',
  display: 'block',
  inlineSize: '100%',
  padding: 'var(--kioku-ui-spacing-md)',
  textAlign: 'start',
};

// The mark earns its bar here. A rail is a short column of short words and
// takes ink alone, but each of these rows is two lines of content — a stroke
// beside one of them reads as a mark rather than as another divider.
const currentRow: CSSProperties = {
  ...row,
  boxShadow:
    'inset var(--kioku-ui-focus-width) 0 0 var(--kioku-ui-color-accent)',
  color: 'var(--kioku-ui-color-text)',
};

interface Message {
  readonly at: string;
  readonly author: 'assistant' | 'reader';
  readonly body: string;
  readonly id: string;
}

interface Conversation {
  readonly id: string;
  readonly messages: readonly Message[];
  readonly opened: string;
  readonly title: string;
  readonly updated: string;
  readonly who: string;
}

const seed: readonly Conversation[] = [
  {
    id: 'release-12',
    messages: [
      {
        at: '2026-08-18T09:28:00Z',
        author: 'reader',
        body: 'Which releases are still open?',
        id: '1',
      },
      {
        at: '2026-08-18T09:30:00Z',
        author: 'assistant',
        body: 'Three are open: 12, 13, and 14.',
        id: '2',
      },
      {
        at: '2026-08-18T09:31:00Z',
        author: 'reader',
        body: 'Can you flag 13 for review before Friday?',
        id: '3',
      },
      {
        at: '2026-08-18T09:34:00Z',
        author: 'assistant',
        body: 'Flagged. Grace Hopper picks it up after the accessibility audit finishes today.',
        id: '4',
      },
      {
        at: '2026-08-18T09:38:00Z',
        author: 'reader',
        body: 'Does the audit block 12?',
        id: '5',
      },
      {
        at: '2026-08-18T09:41:00Z',
        author: 'assistant',
        body: 'No. It only touches the console shell, and 12 is content only.',
        id: '6',
      },
    ],
    opened: '2026-08-18T00:00:00Z',
    title: 'Release 12',
    updated: '2026-08-18T09:41:00Z',
    who: 'Ada Lovelace',
  },
  {
    id: 'audit',
    messages: [
      {
        at: '2026-08-17T16:05:00Z',
        author: 'assistant',
        body: 'The audit finished clean.',
        id: '1',
      },
    ],
    opened: '2026-08-17T00:00:00Z',
    title: 'Accessibility audit',
    updated: '2026-08-17T16:05:00Z',
    who: 'Grace Hopper',
  },
  {
    id: 'release-10',
    messages: [
      {
        at: '2026-08-16T11:20:00Z',
        author: 'assistant',
        body: 'Published, nothing left to do.',
        id: '1',
      },
    ],
    opened: '2026-08-16T00:00:00Z',
    title: 'Release 10',
    updated: '2026-08-16T11:20:00Z',
    who: 'Alan Turing',
  },
];

const clock = (value: Date) =>
  value.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});

const day = (value: Date) =>
  value.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/**
 * A two-pane messaging shell. The divider is a real separator control, so the
 * list can be resized by keyboard as well as by pointer — replace the seed
 * data and the send handler with your own transport.
 *
 * The transcript is not a rain of bubbles: `ChatMessage` sets an incoming turn
 * bare on the paper and puts only the reader's own words on a sunken slip
 * closed with a hairline, because a page of record has one voice on the page
 * and one interjecting into it.
 */
export function MessagingShell() {
  const [conversations, setConversations] = useState(seed);
  const [selectedId, setSelectedId] = useState(seed[0]?.id ?? '');
  const [listWidth, setListWidth] = useState(320);

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
                  at: new Date().toISOString(),
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
    <div style={frame}>
      <Resizable
        max={420}
        min={220}
        onSizeChange={setListWidth}
        size={listWidth}
        panel={
          <div style={pane}>
            <div style={paneHead}>
              <h2 style={paneTitle}>Conversations</h2>
              <IconButton aria-label="New conversation" variant="secondary">
                <Icon>
                  <path
                    d="M12 5v14M5 12h14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </Icon>
              </IconButton>
            </div>

            <div style={paneBody}>
              <TextInput
                aria-label="Search conversations"
                placeholder="Search conversations"
                type="search"
              />
              <List gap="xs" variant="plain">
                {conversations.map((conversation) => (
                  <ListItem key={conversation.id}>
                    <button
                      aria-current={
                        conversation.id === selectedId ? 'true' : undefined
                      }
                      onClick={() => setSelectedId(conversation.id)}
                      style={conversation.id === selectedId ? currentRow : row}
                      type="button"
                    >
                      <Item
                        description={`${conversation.who} · ${
                          conversation.messages[
                            conversation.messages.length - 1
                          ]?.body ?? ''
                        }`}
                        leading={<Avatar name={conversation.who} size="sm" />}
                        trailing={
                          <Timestamp
                            format={clock}
                            value={conversation.updated}
                          />
                        }
                      >
                        {conversation.title}
                      </Item>
                    </button>
                  </ListItem>
                ))}
              </List>
            </div>

            <div style={paneFoot}>
              <Eyebrow>ARCHIVED</Eyebrow>
              <Text size="sm" tone="muted">
                <Numeral>18</Numeral>
              </Text>
            </div>
          </div>
        }
      >
        {selected === undefined ? null : (
          <div style={transcriptPane}>
            <div style={paneHead}>
              <Stack gap="xs">
                <h2 style={paneTitle}>{selected.title}</h2>
                <Text size="sm" tone="muted">
                  {`${selected.who} · You`}
                </Text>
              </Stack>
              <Toolbar label={`Actions for ${selected.title}`}>
                <IconButton
                  aria-label="Search this conversation"
                  variant="secondary"
                >
                  <Icon>
                    <circle
                      cx="10.5"
                      cy="10.5"
                      fill="none"
                      r="6.4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="m15.3 15.3 4.7 4.7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </Icon>
                </IconButton>
                <IconButton
                  aria-label="Conversation settings"
                  variant="secondary"
                >
                  <Icon>
                    <circle cx="12" cy="5.4" r="1.2" />
                    <circle cx="12" cy="12" r="1.2" />
                    <circle cx="12" cy="18.6" r="1.2" />
                  </Icon>
                </IconButton>
              </Toolbar>
            </div>

            <div style={transcriptBody}>
              <ChatLayout
                composer={
                  <Stack gap="sm">
                    <ChatComposer
                      label={`Message about ${selected.title}`}
                      onSend={send}
                      placeholder={`Write a message about ${selected.title}`}
                    />
                    <HStack align="center" gap="md" justify="between">
                      <Toolbar label="Message attachments">
                        <IconButton
                          aria-label="Attach a file"
                          variant="secondary"
                        >
                          <Icon>
                            <path
                              d="M18.6 11.4 12 18a4.2 4.2 0 0 1-6-6l6.9-6.9a2.9 2.9 0 0 1 4 4l-6.9 6.9a1.5 1.5 0 0 1-2.1-2.1l6.3-6.3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </Icon>
                        </IconButton>
                        <IconButton
                          aria-label="Record a voice message"
                          variant="secondary"
                        >
                          <Icon>
                            <path
                              d="M12 3.6a2.4 2.4 0 0 1 2.4 2.4v6a2.4 2.4 0 0 1-4.8 0V6A2.4 2.4 0 0 1 12 3.6ZM6 11.4a6 6 0 0 0 12 0M12 17.4v3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </Icon>
                        </IconButton>
                      </Toolbar>
                      <HStack align="center" gap="sm">
                        <Kbd>Enter</Kbd>
                        <Text size="sm" tone="muted">
                          to send
                        </Text>
                      </HStack>
                    </HStack>
                  </Stack>
                }
              >
                <ChatMessageList label={selected.title}>
                  <ChatSystemMessage>
                    <Timestamp format={day} value={selected.opened} />
                  </ChatSystemMessage>
                  {selected.messages.map((message) => (
                    <ChatMessage
                      author={message.author}
                      authorName={
                        <>
                          {message.author === 'reader' ? 'You' : selected.who}{' '}
                          <Timestamp format={clock} value={message.at} />
                        </>
                      }
                      key={message.id}
                    >
                      {message.body}
                    </ChatMessage>
                  ))}
                </ChatMessageList>
              </ChatLayout>
            </div>
          </div>
        )}
      </Resizable>
    </div>
  );
}
