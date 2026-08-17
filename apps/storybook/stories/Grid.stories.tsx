import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Grid, Heading, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Grid',
  component: Grid,
  argTypes: {
    columns: {control: 'select', options: [1, 2, 3, 4]},
    gap: {control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl']},
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

function GridItem({title}: {readonly title: string}) {
  return (
    <Card>
      <Text>{title}</Text>
    </Card>
  );
}

export const Default: Story = {
  args: {
    children: (
      <>
        <GridItem title="Delivery" />
        <GridItem title="Access" />
        <GridItem title="Activity" />
      </>
    ),
    columns: 3,
  },
  render: (args) => (
    <DemoFrame>
      <Grid {...args} />
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Two columns',
          content: (
            <Grid columns={2}>
              <GridItem title="Scheduled" />
              <GridItem title="Completed" />
            </Grid>
          ),
        },
        {
          label: 'Three columns · large gap',
          content: (
            <Grid columns={3} gap="lg">
              <GridItem title="Today" />
              <GridItem title="This week" />
              <GridItem title="Later" />
            </Grid>
          ),
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="lg">
        <Stack gap="xs">
          <Heading level={2}>Workspace areas</Heading>
          <Text tone="secondary">Choose an area to continue.</Text>
        </Stack>
        <Grid columns={3} gap="lg">
          <GridItem title="Delivery planning" />
          <GridItem title="Member access" />
          <GridItem title="Saved views" />
        </Grid>
      </Stack>
    </DemoFrame>
  ),
};
