import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Grid, IconButton, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-icon-button',
  title: 'Core/IconButton',
  component: IconButton,
  args: {'aria-label': 'Action'},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {'aria-label': 'Close panel', children: '×'},
};

export const Variants: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Primary',
          content: <IconButton aria-label="Add view">+</IconButton>,
        },
        {
          label: 'Secondary',
          content: (
            <IconButton aria-label="Go back" variant="secondary">
              ←
            </IconButton>
          ),
        },
        {
          label: 'Ghost',
          content: (
            <IconButton aria-label="Close notice" variant="ghost">
              ×
            </IconButton>
          ),
        },
        {
          label: 'Destructive',
          content: (
            <IconButton aria-label="Remove view" variant="destructive">
              −
            </IconButton>
          ),
        },
      ]}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Small · 28px',
          content: (
            <IconButton aria-label="Small add action" size="sm">
              +
            </IconButton>
          ),
        },
        {
          label: 'Medium · 32px',
          content: <IconButton aria-label="Add action">+</IconButton>,
        },
        {
          label: 'Large · 36px',
          content: (
            <IconButton aria-label="Large add action" size="lg">
              +
            </IconButton>
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
          label: 'Rest',
          content: <IconButton aria-label="Add filter">+</IconButton>,
        },
        {
          label: 'Keyboard focus',
          content: (
            <IconButton aria-label="Close filters" autoFocus>
              ×
            </IconButton>
          ),
        },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <IconButton aria-label="Remove unavailable" disabled>
      −
    </IconButton>
  ),
};

export const Loading: Story = {
  render: () => <IconButton aria-label="Saving view" loading />,
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Text tone="secondary">Saved view actions</Text>
          <Grid columns={3} gap="sm">
            <IconButton aria-label="Go back" variant="secondary">
              ←
            </IconButton>
            <IconButton aria-label="Add saved view">+</IconButton>
            <IconButton aria-label="Close panel" variant="ghost">
              ×
            </IconButton>
          </Grid>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
