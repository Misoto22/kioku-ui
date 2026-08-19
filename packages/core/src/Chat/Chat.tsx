import * as stylex from '@stylexjs/stylex';
import {
  useState,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Button} from '../Button/index.js';
import {Spinner} from '../Spinner/index.js';

// A line of chat stops being readable long before it reaches the width of the
// transcript, so the bubble caps itself in spacing steps.
const bubbleMaxWidth = `calc(20 * ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  layout: {
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
    gridTemplateRows: '1fr auto',
    minHeight: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingMd,
    listStyleType: 'none',
    marginBlock: 0,
    minHeight: 0,
    overflowY: 'auto',
    paddingInlineStart: 0,
  },
  message: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
  },
  fromReader: {alignItems: 'flex-end'},
  // A message is a small surface in the transcript, not a coloured balloon:
  // the accent stays reserved for focus, marks and links.
  bubble: {
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: 'none',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    maxWidth: bubbleMaxWidth,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingMd,
  },
  bubbleReader: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    boxShadow: semanticTokens.elevationLow,
    color: semanticTokens.colorText,
  },
  bubbleAssistant: {
    backgroundColor: semanticTokens.colorSurface,
    boxShadow: semanticTokens.elevationLow,
    color: semanticTokens.colorText,
  },
  bubbleSystem: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    paddingInline: 0,
    textAlign: 'center',
  },
  // An eyebrow: heading face, smallest size, opened right up, second rank.
  // It names who is speaking without competing with what they said.
  author: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
  },
  composer: {
    alignItems: 'flex-end',
    display: 'flex',
    gap: semanticTokens.spacingSm,
  },
  input: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    flexGrow: 1,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    minHeight: semanticTokens.sizeControlMd,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingSm,
    resize: 'vertical',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    '::placeholder': {color: semanticTokens.colorTextMuted},
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
    },
    ':focus-visible': {
      borderColor: semanticTokens.borderInteractive,
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.borderInteractive,
    },
  },
  // A register of calls, ruled row by row rather than fenced in a box. A box
  // inside a bubble draws a second edge around something that already has
  // one; a rule between rows says the same thing with one line fewer.
  toolCalls: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeXs,
    // Every figure in this register — row counts, durations, sizes — has to
    // line up against the one above it.
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: semanticTokens.lineHeightBody,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  toolCall: {
    alignItems: 'baseline',
    color: semanticTokens.colorTextSecondary,
    display: 'flex',
    gap: semanticTokens.spacingSm,
    justifyContent: 'space-between',
    paddingBlock: semanticTokens.spacingXs,
    ':not(:last-child)': {
      borderBlockEndColor: semanticTokens.borderDefault,
      borderBlockEndStyle: semanticTokens.borderStyle,
      borderBlockEndWidth: semanticTokens.borderWidth,
    },
  },
  // The name is what was called; the outcome beside it is context.
  toolCallOutcome: {color: semanticTokens.colorTextMuted},
  // The row carries no type of its own: every fact inside it is set by the
  // pair below, so a size here would have to be overridden twice.
  metadata: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: semanticTokens.spacingSm,
    lineHeight: semanticTokens.lineHeightBody,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  // The label names the fact and the figure states it, so the two are set
  // apart: an eyebrow in the heading face against a mono, tabular figure.
  metadataLabel: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
  },
  metadataValue: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeXs,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
  },
  systemMessage: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    textAlign: 'center',
  },
});

/** Who produced a chat message. */
export type ChatAuthor = 'assistant' | 'reader' | 'system';

const bubbleAuthors = {
  assistant: styles.bubbleAssistant,
  reader: styles.bubbleReader,
  system: styles.bubbleSystem,
} satisfies Record<ChatAuthor, (typeof styles)[keyof typeof styles]>;

/** Props for the message-and-composer frame. */
export interface ChatLayoutProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  readonly composer: ReactNode;
}

/** Frames a scrolling transcript above a fixed composer. */
export function ChatLayout({children, composer, ...props}: ChatLayoutProps) {
  return (
    <div {...props} {...stylex.props(styles.layout)}>
      {children}
      {composer}
    </div>
  );
}

/** Props for the scrolling transcript. */
export interface ChatMessageListProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'aria-atomic' | 'aria-label' | 'aria-live' | 'aria-relevant' | 'className'
> {
  readonly label: string;
}

/**
 * Holds the transcript. A message is announced politely as it lands: the
 * region is not atomic, so a reply arriving does not replay the conversation,
 * and only additions are relevant, so a reply that streams in is announced
 * once rather than re-read on every token.
 */
export function ChatMessageList({
  children,
  label,
  ...props
}: ChatMessageListProps) {
  return (
    <ul
      {...props}
      aria-atomic="false"
      aria-label={label}
      aria-live="polite"
      aria-relevant="additions"
      {...stylex.props(styles.list)}
    >
      {children}
    </ul>
  );
}

/** Props for one message in the transcript. */
export interface ChatMessageProps extends Omit<
  HTMLAttributes<HTMLLIElement>,
  'className'
> {
  readonly author: ChatAuthor;
  readonly authorName?: ReactNode;
  readonly pending?: boolean;
}

/**
 * Shows one message. The author is named in text rather than implied by which
 * side the bubble sits on, because alignment is invisible to a screen reader.
 */
export function ChatMessage({
  author,
  authorName,
  children,
  pending = false,
  ...props
}: ChatMessageProps) {
  const {messages} = useInternationalization();

  return (
    <li
      {...props}
      {...stylex.props(
        styles.message,
        author === 'reader' && styles.fromReader,
      )}
    >
      {authorName === undefined ? null : (
        <span {...stylex.props(styles.author)}>{authorName}</span>
      )}
      <div {...stylex.props(styles.bubble, bubbleAuthors[author])}>
        {pending ? <Spinner label={messages.chatWaitingForReply} /> : children}
      </div>
    </li>
  );
}

/** One tool invocation attached to a message. */
export interface ChatToolCall {
  readonly detail?: ReactNode;
  readonly id: string;
  readonly name: string;
  readonly status?: 'done' | 'failed' | 'running';
}

/** Props for the tool calls behind a reply. */
export interface ChatToolCallsProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'aria-label' | 'children' | 'className'
> {
  readonly calls: readonly ChatToolCall[];
  readonly label?: string;
}

/** Lists the tool calls behind a reply so the work stays inspectable. */
export function ChatToolCalls({
  calls,
  label = 'Tool calls',
  ...props
}: ChatToolCallsProps) {
  return (
    <ul {...props} aria-label={label} {...stylex.props(styles.toolCalls)}>
      {calls.map((call) => (
        <li key={call.id} {...stylex.props(styles.toolCall)}>
          <span>{call.name}</span>
          <span {...stylex.props(styles.toolCallOutcome)}>
            {call.detail ?? call.status ?? ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Props for the message composer. */
export interface ChatComposerProps extends Omit<
  HTMLAttributes<HTMLFormElement>,
  'children' | 'className' | 'onSubmit'
> {
  readonly disabled?: boolean;
  readonly label: string;
  readonly onSend: (message: string) => void;
  readonly placeholder?: string;
  readonly sendLabel?: ReactNode;
}

/**
 * Composes a message. Enter sends and Shift+Enter starts a new line, which is
 * what a reader expects from every other chat field.
 */
export function ChatComposer({
  disabled = false,
  label,
  onSend,
  placeholder,
  sendLabel = 'Send',
  ...props
}: ChatComposerProps) {
  const [draft, setDraft] = useState('');

  function send() {
    const message = draft.trim();
    if (message === '' || disabled) {
      return;
    }
    onSend(message);
    setDraft('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <form {...props} onSubmit={handleSubmit} {...stylex.props(styles.composer)}>
      <textarea
        aria-label={label}
        disabled={disabled}
        onChange={(event) => {
          setDraft(event.currentTarget.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        value={draft}
        {...stylex.props(styles.input)}
      />
      <Button disabled={disabled || draft.trim() === ''} type="submit">
        {sendLabel}
      </Button>
    </form>
  );
}

/** One labelled fact about how a message was produced. */
export interface ChatMetadataEntry {
  readonly label: string;
  readonly value: ReactNode;
}

/** Props for the provenance line under a message. */
export interface ChatMessageMetadataProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'children' | 'className'
> {
  readonly entries: readonly ChatMetadataEntry[];
}

/**
 * States how a reply was produced — model, latency, token count. Each fact
 * carries its label in the accessible name, because "1.2s" on its own tells a
 * screen-reader user nothing about what took that long.
 */
export function ChatMessageMetadata({
  entries,
  ...props
}: ChatMessageMetadataProps) {
  return (
    <ul {...props} {...stylex.props(styles.metadata)}>
      {entries.map((entry) => (
        <li key={entry.label}>
          <span {...stylex.props(styles.metadataLabel)}>
            {`${entry.label}: `}
          </span>
          <span {...stylex.props(styles.metadataValue)}>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** Props for a message from the system rather than a participant. */
export interface ChatSystemMessageProps extends Omit<
  HTMLAttributes<HTMLLIElement>,
  'className'
> {
  readonly children: ReactNode;
}

/**
 * A note from the system — a conversation start, a model change, a
 * disconnection. It sits in the transcript but is attributed to no one, so it
 * is centred and quiet rather than dressed as either side of the exchange.
 */
export function ChatSystemMessage({
  children,
  ...props
}: ChatSystemMessageProps) {
  return (
    <li {...props} {...stylex.props(styles.systemMessage)}>
      {children}
    </li>
  );
}
