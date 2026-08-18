import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  ChatMessage,
  ChatMessageList,
  ChatToolCalls,
  Stack,
  Text,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-chat-tool-calls',
  title: 'Core/ChatToolCalls',
  component: ChatToolCalls,
  args: {calls: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ChatToolCalls>;

export default meta;
type Story = StoryObj<typeof meta>;

const calls = [
  {id: '1', name: 'search_releases', status: 'done' as const},
  {detail: '3 rows', id: '2', name: 'read_table', status: 'done' as const},
  {id: '3', name: 'summarise', status: 'running' as const},
];

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ChatToolCalls {...args} calls={calls} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <ChatMessageList label="Conversation">
          <ChatMessage author="assistant" authorName="Kioku">
            <Stack gap="sm">
              <Text>Three releases are still open.</Text>
              <ChatToolCalls calls={calls} />
            </Stack>
          </ChatMessage>
        </ChatMessageList>
        <Text size="sm" tone="muted">
          Listing the calls keeps the work behind a reply inspectable.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
