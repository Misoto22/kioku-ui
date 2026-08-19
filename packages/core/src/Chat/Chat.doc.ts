import type {ComponentDoc} from '../docs/types.js';

export const chatLayoutDoc = {
  name: 'ChatLayout',
  description: 'Frames a scrolling transcript above a fixed composer.',
  props: [
    {name: 'composer', description: 'Supplies the composer to pin below.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
  example:
    '<ChatLayout composer={<ChatComposer … />}>{transcript}</ChatLayout>',
  storyId: 'core-chat-layout--default',
} satisfies ComponentDoc;

export const chatMessageListDoc = {
  name: 'ChatMessageList',
  description: 'Holds the transcript and announces new messages.',
  props: [{name: 'label', description: 'Names the transcript.'}],
  inheritedProps: [
    'HTMLAttributes<HTMLUListElement> except className and the aria-atomic, aria-label, aria-live and aria-relevant attributes it owns',
  ],
  example: '<ChatMessageList label="Conversation">{messages}</ChatMessageList>',
  storyId: 'core-chat-message-list--default',
} satisfies ComponentDoc;

export const chatMessageDoc = {
  name: 'ChatMessage',
  description: 'Shows one message and names its author.',
  props: [
    {name: 'author', description: 'States who produced the message.'},
    {name: 'authorName', description: 'Names the author in visible text.'},
    {name: 'pending', description: 'Shows progress while a reply is awaited.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLLIElement> except className'],
  example: '<ChatMessage author="assistant" authorName="Kioku">…</ChatMessage>',
  storyId: 'core-chat-message--default',
} satisfies ComponentDoc;

export const chatToolCallsDoc = {
  name: 'ChatToolCalls',
  description: 'Lists the tool calls behind a reply.',
  props: [
    {name: 'calls', description: 'Supplies the tool invocations to list.'},
    {name: 'label', description: 'Names the list for assistive technology.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLUListElement> except aria-label, children, and className',
  ],
  example: '<ChatToolCalls calls={calls} />',
  storyId: 'core-chat-tool-calls--default',
} satisfies ComponentDoc;

export const chatComposerDoc = {
  name: 'ChatComposer',
  description: 'Composes a message; Enter sends, Shift+Enter adds a line.',
  props: [
    {
      name: 'disabled',
      description: 'Blocks sending while a reply is in flight.',
    },
    {name: 'label', description: 'Names the entry field.'},
    {name: 'onSend', description: 'Receives the trimmed message.'},
    {name: 'placeholder', description: 'Hints at what to write.'},
    {name: 'sendLabel', description: 'Names the send control.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLFormElement> except children, className, and onSubmit',
  ],
  example: '<ChatComposer label="Message" onSend={send} />',
  storyId: 'core-chat-composer--default',
} satisfies ComponentDoc;

export const chatMessageMetadataDoc = {
  name: 'ChatMessageMetadata',
  description: 'States how a reply was produced.',
  props: [
    {name: 'entries', description: 'Supplies the labelled facts to list.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLUListElement> except children and className',
  ],
  example:
    '<ChatMessageMetadata entries={[{label: "Latency", value: "1.2s"}]} />',
  storyId: 'core-chat-message--composition',
} satisfies ComponentDoc;

export const chatSystemMessageDoc = {
  name: 'ChatSystemMessage',
  description: 'A note in the transcript attributed to no participant.',
  props: [{name: 'children', description: 'Supplies the note.'}],
  inheritedProps: ['HTMLAttributes<HTMLLIElement> except className'],
  example: '<ChatSystemMessage>Conversation started</ChatSystemMessage>',
  storyId: 'core-chat-message--states',
} satisfies ComponentDoc;
