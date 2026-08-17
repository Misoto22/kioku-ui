import type {Meta, StoryObj} from '@storybook/react-vite';

import {AsyncState, Button, Card, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-async-state',
  title: 'Core/AsyncState',
  component: AsyncState,
  args: {state: {kind: 'loading', label: 'Loading activity'}},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof AsyncState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {state: {kind: 'loading', label: 'Loading delivery activity'}},
  render: (args) => <AsyncState {...args} />,
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Loading',
          content: (
            <AsyncState
              state={{kind: 'loading', label: 'Loading saved views'}}
            />
          ),
        },
        {
          label: 'Empty',
          content: (
            <AsyncState
              state={{
                kind: 'empty',
                title: 'No saved views yet',
                detail: 'Save a filtered view to return to it quickly.',
              }}
            />
          ),
        },
        {
          label: 'Error',
          content: (
            <AsyncState
              state={{
                kind: 'error',
                title: 'Activity is temporarily unavailable',
                detail: 'Try again after checking your connection.',
                retry: <Button variant="secondary">Retry</Button>,
              }}
            />
          ),
        },
        {
          label: 'Ready',
          content: (
            <AsyncState state={{kind: 'ready', data: '12 updates'}}>
              {(summary) => <Text>{summary} are ready to review.</Text>}
            </AsyncState>
          ),
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Text>Recent workspace activity</Text>
          <AsyncState
            state={{
              kind: 'ready',
              data: ['Delivery view updated', 'Access review completed'],
            }}
          >
            {(events) => (
              <Stack gap="sm">
                {events.map((event) => (
                  <Text key={event} tone="secondary">
                    {event}
                  </Text>
                ))}
              </Stack>
            )}
          </AsyncState>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
