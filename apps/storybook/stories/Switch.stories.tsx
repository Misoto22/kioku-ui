import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Item, Stack, Switch, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Switch',
  component: Switch,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Switch {...args}>Live updates</Switch>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'off', content: <Switch>Live updates</Switch>},
          {label: 'on', content: <Switch defaultPressed>Live updates</Switch>},
        ]}
      />
    </DemoFrame>
  ),
};

export const Disabled: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'disabled off',
            content: <Switch disabled>Live updates</Switch>,
          },
          {
            label: 'disabled on',
            content: (
              <Switch defaultPressed disabled>
                Live updates
              </Switch>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="sm">
          <Item
            description="Applies as soon as it is flipped"
            trailing={<Switch defaultPressed aria-label="Live updates" />}
          >
            Live updates
          </Item>
          <Text size="sm" tone="muted">
            Use CheckboxInput instead when the value is only submitted with a
            form.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
