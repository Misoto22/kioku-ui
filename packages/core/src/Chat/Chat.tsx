import * as stylex from '@stylexjs/stylex';
import {
  Children,
  useState,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {scrolling} from '../scrolling/index.js';
import {useInternationalization} from '../i18n/index.js';
import {Button} from '../Button/index.js';
import {Eyebrow} from '../Eyebrow/index.js';
import {Numeral} from '../Numeral/index.js';
import {Spinner} from '../Spinner/index.js';
import {TextArea} from '../TextArea/index.js';

// A line of chat stops being readable long before it reaches the width of the
// transcript, and where it stops is a fact about the TYPE rather than about
// the spacing scale. Built from `spacing2xl` this measure grew 36% at the
// standard density while the type inside it stayed at 13.5px — a longer line
// for the reader who asked for more air, which is backwards.
const bubbleMaxWidth = `calc(34 * ${semanticTokens.fontSizeMd})`;

// A dot, so it is two of the smallest spacing step across rather than a size
// of its own.
const progressDotSize = `calc(2 * ${semanticTokens.spacingXs})`;

const styles = stylex.create({
  layout: {
    // The frame fills what it is given: a transcript that scrolls above a
    // fixed composer has to know where its bottom is, and `1fr auto` divides
    // a height rather than supplying one. Every story had to wrap this in a
    // sized box to see it behave.
    blockSize: '100%',
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
    gridTemplateRows: '1fr auto',
    minHeight: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingLg,
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
  // The eyebrow names the turn beneath it, so it stands on the same edge as
  // the words it names. The reader's slip is inset by a step; without matching
  // it the name and the sentence under it sat on two different margins.
  authorInset: {paddingInline: semanticTokens.spacingMd},
  // A transcript that has not started yet is still a transcript. Without this
  // the region was empty markup, which reads as a component that failed.
  listEmpty: {
    color: semanticTokens.colorTextMuted,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingMd,
    textAlign: 'center',
  },
  // A transcript is a page of record, not a feed of balloons. Only the turns
  // that need to be told apart from the page get a surface, and the accent
  // stays reserved for focus, marks and links.
  bubble: {
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: 'none',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    maxWidth: bubbleMaxWidth,
  },
  // The reader's own words are the interjection, so they are the ones set on a
  // slip of darker stock and closed with a hairline. Muted, not raised: raised
  // is the same paper as the card underneath it in this skin, and a slip you
  // cannot see is a ring drawn for nothing.
  bubbleReader: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    boxShadow: semanticTokens.elevationLow,
    color: semanticTokens.colorText,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingMd,
  },
  // The reply is the body of the record, so it is set bare on the page. It is
  // already named by the eyebrow above it and already the majority of the
  // transcript; wrapping every one of them in its own card leaves a column of
  // rings with nothing between them.
  bubbleAssistant: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: semanticTokens.colorText,
    paddingBlock: 0,
    paddingInline: 0,
  },
  // A note from the transcript itself, centred across the column. It overrides
  // the bubble measure as well as the fill: a line told to centre inside a
  // 560px box that is itself flush left is not centred on anything the reader
  // can see.
  bubbleSystem: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    maxWidth: 'none',
    paddingBlock: 0,
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
    gap: semanticTokens.spacingMd,
  },
  // The composer's field is a `TextArea`; all this row asks of it is that it
  // take the space the send control does not.
  entry: {flexGrow: 1},
  // A register of calls, each one a slip pressed into the reply rather than a
  // ruled table under it. A table implies a set the reader has to read across;
  // a call is a single line of evidence, so it takes only the width it needs
  // and the list stops at the longest one instead of stretching to the bubble.
  // The label names the fact and the figure states it, and the pairing is
  // carried by `dt`/`dd` rather than by a colon baked into a text node — a
  // separator written into the markup is one no translation can move. The two
  // ranks come from `Eyebrow` and `Numeral`, which is where those recipes
  // live; this file used to declare a copy of each.
  metadataPair: {
    alignItems: 'baseline',
    display: 'flex',
    gap: semanticTokens.spacingXs,
  },
  metadataTerm: {marginBlock: 0, marginInline: 0},
  metadataDetail: {marginBlock: 0, marginInline: 0},
  toolCalls: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  toolCall: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusElement,
    color: semanticTokens.colorTextSecondary,
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeXs,
    // Every figure in this register — row counts, durations, sizes — has to
    // line up against the one above it.
    fontVariantNumeric: 'tabular-nums',
    gap: semanticTokens.spacingSm,
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
  // The slot is always there so every row in the register starts on one edge;
  // only the two statuses that want the reader's attention draw into it. A
  // hollow ring says the call is still running, where a filled dot would read
  // as a status that had already settled.
  toolCallMark: {
    borderColor: 'transparent',
    borderRadius: semanticTokens.radiusFull,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    flexShrink: 0,
    height: progressDotSize,
    width: progressDotSize,
  },
  toolCallMarkRunning: {borderColor: semanticTokens.colorTextMuted},
  toolCallMarkFailed: {
    backgroundColor: semanticTokens.statusDangerText,
    borderColor: semanticTokens.statusDangerText,
  },
  // The name is what was called; the outcome beside it is context.
  toolCallOutcome: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyMono,
  },
  // A call that failed is the one line in the register a reader must not skim
  // past, so it is the one that takes colour.
  toolCallOutcomeFailed: {color: semanticTokens.statusDangerText},
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
  const {messages} = useInternationalization();

  return (
    <ul
      {...props}
      aria-atomic="false"
      aria-label={label}
      aria-live="polite"
      aria-relevant="additions"
      {...stylex.props(styles.list, scrolling.region)}
    >
      {Children.count(children) === 0 ? (
        <li {...stylex.props(styles.listEmpty)}>
          {messages.chatTranscriptEmpty}
        </li>
      ) : (
        children
      )}
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
        <span
          {...stylex.props(
            styles.author,
            author === 'reader' && styles.authorInset,
          )}
        >
          {authorName}
        </span>
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
  const {messages} = useInternationalization();
  // `status` is an enum, not a sentence. Printed straight it put the English
  // words "running" and "failed" into a transcript in any language, and only
  // one of the three ever reached the page at all.
  const outcomes = {
    done: messages.chatToolCallDone,
    failed: messages.chatToolCallFailed,
    running: messages.chatToolCallRunning,
  };

  return (
    <ul {...props} aria-label={label} {...stylex.props(styles.toolCalls)}>
      {calls.map((call) => (
        <li key={call.id} {...stylex.props(styles.toolCall)}>
          <span
            aria-hidden="true"
            {...stylex.props(
              styles.toolCallMark,
              call.status === 'running' && styles.toolCallMarkRunning,
              call.status === 'failed' && styles.toolCallMarkFailed,
            )}
          />
          <span>{call.name}</span>
          <span
            {...stylex.props(
              styles.toolCallOutcome,
              call.status === 'failed' && styles.toolCallOutcomeFailed,
            )}
          >
            {call.detail ?? (call.status ? outcomes[call.status] : '')}
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
      {/*
        `TextArea`, not a private copy of it. The copy had drifted: a step more
        padding, a min-height of one control rather than four lines, and none
        of the active, read-only or invalid states the real one carries.
      */}
      <TextArea
        aria-label={label}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onValueChange={setDraft}
        placeholder={placeholder}
        rows={2}
        value={draft}
        {...stylex.props(styles.entry)}
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
  HTMLAttributes<HTMLDListElement>,
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
    <dl {...props} {...stylex.props(styles.metadata)}>
      {entries.map((entry) => (
        <div key={entry.label} {...stylex.props(styles.metadataPair)}>
          <dt {...stylex.props(styles.metadataTerm)}>
            <Eyebrow>{entry.label}</Eyebrow>
          </dt>
          <dd {...stylex.props(styles.metadataDetail)}>
            <Numeral>{entry.value}</Numeral>
          </dd>
        </div>
      ))}
    </dl>
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
  // The same note `ChatMessage author="system"` draws. Two renderings of one
  // thing is two places to change it, and they had already drifted: this one
  // had no bubble box, so a system note sat on a different rhythm from every
  // other row in the transcript.
  return (
    <ChatMessage author="system" {...props}>
      {children}
    </ChatMessage>
  );
}
