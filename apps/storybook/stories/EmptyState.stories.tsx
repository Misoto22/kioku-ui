import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, EmptyState, Grid} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-empty-state',
  title: 'Core/EmptyState',
  component: EmptyState,
  args: {title: 'No saved views yet'},
  argTypes: {
    size: {control: 'select', options: ['compact', 'default']},
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No saved views yet',
    detail: 'Save a filtered view to return to it quickly.',
    action: <Button>Create saved view</Button>,
  },
};

export const Sizes: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Compact',
          content: (
            <EmptyState
              size="compact"
              title="No recent activity"
              detail="New updates will appear here."
            />
          ),
        },
        {
          label: 'Default',
          content: (
            <EmptyState
              title="No delivery groups"
              detail="Create a group to organize upcoming work."
              action={<Button>Create group</Button>}
            />
          ),
        },
      ]}
    />
  ),
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Title only',
          content: <EmptyState title="Nothing needs review" />,
        },
        {
          label: 'With visual',
          content: (
            <EmptyState
              visual={<span aria-hidden="true">◇</span>}
              title="No pinned views"
              detail="Pin a view to keep it close at hand."
            />
          ),
        },
        {
          label: 'With two actions',
          content: (
            <EmptyState
              title="No workspace members"
              detail="Invite a member or review pending invitations."
              action={
                <Grid columns={2} gap="sm">
                  <Button>Invite member</Button>
                  <Button variant="secondary">Review invites</Button>
                </Grid>
              }
            />
          ),
        },
      ]}
    />
  ),
};

// The empty state brings its own plate, so it is placed on the canvas rather
// than inside a Card: nesting one would draw the same edge twice.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <EmptyState
        visual={<span aria-hidden="true">◇</span>}
        title="No activity matches this view"
        detail="Adjust the date range or clear filters to see workspace updates."
        action={
          <Grid columns={2} gap="sm">
            <Button>Clear filters</Button>
            <Button variant="secondary">Edit view</Button>
          </Grid>
        }
      />
    </DemoFrame>
  ),
};
