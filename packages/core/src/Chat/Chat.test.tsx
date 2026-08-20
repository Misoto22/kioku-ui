// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  keyframes: () => 'test-spin',
  props: (...styles: Array<Record<string, unknown> | undefined | false>) => ({
    style: Object.assign({}, ...styles.filter(Boolean)),
  }),
}));

import {renderUi} from '@misoto22/kioku-ui-test-utils';

import {useState} from 'react';

import {
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
  ChatToolCalls,
} from './index.js';

afterEach(() => {
  cleanup();
});

describe('ChatMessageList', () => {
  it('announces new messages politely', () => {
    renderUi(
      <ChatMessageList label="Conversation">
        <ChatMessage author="assistant">Ready when you are.</ChatMessage>
      </ChatMessageList>,
    );

    const list = screen.getByRole('list', {name: 'Conversation'});
    expect(list).toHaveAttribute('aria-live', 'polite');
  });
});

describe('ChatMessage', () => {
  it('names the author in text rather than by alignment alone', () => {
    renderUi(
      <ChatMessageList label="Conversation">
        <ChatMessage author="reader" authorName="You">
          Ship it.
        </ChatMessage>
      </ChatMessageList>,
    );

    expect(screen.getByText('You')).toBeVisible();
    expect(screen.getByText('Ship it.')).toBeVisible();
  });

  it('shows progress while a reply is awaited', () => {
    renderUi(
      <ChatMessageList label="Conversation">
        <ChatMessage author="assistant" pending>
          hidden
        </ChatMessage>
      </ChatMessageList>,
    );

    expect(
      screen.getByRole('status', {name: 'Waiting for a reply'}),
    ).toBeVisible();
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });
});

describe('ChatToolCalls', () => {
  it('lists the work behind a reply', () => {
    renderUi(
      <ChatToolCalls
        calls={[
          {id: '1', name: 'search', status: 'done'},
          {id: '2', name: 'fetch', status: 'running'},
        ]}
      />,
    );

    expect(screen.getByRole('list', {name: 'Tool calls'})).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('ChatComposer', () => {
  it('refuses to send an empty message', () => {
    renderUi(<ChatComposer label="Message" onSend={() => {}} />);

    expect(screen.getByRole('button', {name: 'Send'})).toBeDisabled();
  });

  it('sends on Enter', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderUi(<ChatComposer label="Message" onSend={onSend} />);

    await user.type(
      screen.getByRole('textbox', {name: 'Message'}),
      'Ship it{Enter}',
    );

    expect(onSend).toHaveBeenCalledWith('Ship it');
  });

  it('starts a new line on Shift+Enter instead of sending', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderUi(<ChatComposer label="Message" onSend={onSend} />);

    const field = screen.getByRole('textbox', {name: 'Message'});
    await user.type(field, 'One{Shift>}{Enter}{/Shift}Two');

    expect(onSend).not.toHaveBeenCalled();
    expect(field).toHaveValue('One\nTwo');
  });

  it('blocks sending while a reply is in flight', () => {
    renderUi(<ChatComposer disabled label="Message" onSend={() => {}} />);

    expect(screen.getByRole('textbox', {name: 'Message'})).toBeDisabled();
  });
});

describe('ChatLayout', () => {
  it('frames the transcript above the composer', () => {
    function ChatFixture() {
      const [messages, setMessages] = useState<readonly string[]>([]);

      return (
        <ChatLayout
          composer={
            <ChatComposer
              label="Message"
              onSend={(message) =>
                setMessages((current) => [...current, message])
              }
            />
          }
        >
          <ChatMessageList label="Conversation">
            {messages.map((message) => (
              <ChatMessage author="reader" key={message}>
                {message}
              </ChatMessage>
            ))}
          </ChatMessageList>
        </ChatLayout>
      );
    }

    renderUi(<ChatFixture />);

    expect(screen.getByRole('list', {name: 'Conversation'})).toBeVisible();
    expect(screen.getByRole('textbox', {name: 'Message'})).toBeVisible();
  });
});

describe('ChatMessageMetadata', () => {
  it('keeps each figure attached to what it measures', () => {
    renderUi(
      <ChatMessageMetadata
        entries={[
          {label: 'Model', value: 'kioku-1'},
          {label: 'Latency', value: '1.2s'},
        ]}
      />,
    );

    // "1.2s" alone would tell a screen-reader user nothing, so the pairing has
    // to survive without the layout — it is `dt`/`dd`, not a colon typed into
    // a text node that no translation can move.
    const latency = screen.getByText('Latency');
    expect(latency.closest('dt')).not.toBeNull();
    expect(latency.closest('div')?.querySelector('dd')).toHaveTextContent(
      '1.2s',
    );
    expect(screen.getByText('Model').closest('div')).not.toBe(
      latency.closest('div'),
    );
  });
});

describe('ChatSystemMessage', () => {
  it('sits in the transcript attributed to no one', () => {
    renderUi(
      <ChatMessageList label="Conversation">
        <ChatSystemMessage>Conversation started</ChatSystemMessage>
      </ChatMessageList>,
    );

    expect(screen.getByRole('listitem')).toHaveTextContent(
      'Conversation started',
    );
  });
});
