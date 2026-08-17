import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Card, Grid, Heading, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Button',
  component: Button,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {args: {children: 'Save changes'}};

export const Variants: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'Primary', content: <Button>Save changes</Button>},
        {
          label: 'Secondary',
          content: <Button variant="secondary">Preview changes</Button>,
        },
        {
          label: 'Ghost',
          content: <Button variant="ghost">Cancel</Button>,
        },
        {
          label: 'Destructive',
          content: <Button variant="destructive">Remove access</Button>,
        },
      ]}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'Small · 28px', content: <Button size="sm">Add note</Button>},
        {label: 'Medium · 32px', content: <Button>Save view</Button>},
        {
          label: 'Large · 36px',
          content: <Button size="lg">Create workspace</Button>,
        },
      ]}
    />
  ),
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'Rest', content: <Button>Open activity</Button>},
        {
          label: 'Keyboard focus',
          content: <Button autoFocus>Continue setup</Button>,
        },
        {
          label: 'Pressed semantics',
          content: <Button aria-pressed="true">Pinned view</Button>,
        },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => <Button disabled>Invite member</Button>,
};

export const Loading: Story = {
  render: () => <Button loading>Saving changes</Button>,
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card elevation="low">
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={2} size="subsection">
              Publish workspace changes?
            </Heading>
            <Text tone="secondary">
              Members will see the updated navigation and saved views.
            </Text>
          </Stack>
          <Grid columns={2} gap="sm">
            <Button>Publish changes</Button>
            <Button variant="secondary">Review again</Button>
          </Grid>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
