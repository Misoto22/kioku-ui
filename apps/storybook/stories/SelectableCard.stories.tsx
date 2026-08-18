import type {Meta, StoryObj} from '@storybook/react-vite';

import {SelectableCard, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-selectable-card',
  title: 'Core/SelectableCard',
  component: SelectableCard,
  args: {label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof SelectableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <SelectableCard
        {...args}
        description="Twelve seats included"
        label="Standard"
        name="plan-default"
        value="standard"
      />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'unselected',
            content: (
              <SelectableCard label="Standard" name="plan-states" value="a" />
            ),
          },
          {
            label: 'selected',
            content: (
              <SelectableCard
                defaultChecked
                label="Standard"
                name="plan-selected"
                value="b"
              />
            ),
          },
          {
            label: 'disabled',
            content: (
              <SelectableCard
                disabled
                label="Standard"
                name="plan-disabled"
                value="c"
              />
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
      <Stack gap="sm">
        <SelectableCard
          defaultChecked
          description="Twelve seats included"
          label="Standard"
          name="plan-composition"
          value="standard"
        />
        <SelectableCard
          description="Unlimited seats"
          label="Team"
          name="plan-composition"
          value="team"
        />
        <Text size="sm" tone="muted">
          Set multiple when several choices can hold at once.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
