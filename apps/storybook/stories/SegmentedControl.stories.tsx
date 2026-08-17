import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, SegmentedControl, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const rangeOptions = [
  {label: 'Week', value: 'week'},
  {label: 'Month', value: 'month'},
  {label: 'Quarter', value: 'quarter'},
] as const;

const meta = {
  id: 'core-segmented-control',
  title: 'Core/SegmentedControl',
  component: SegmentedControl,
  args: {
    'aria-label': 'Activity range',
    defaultValue: 'month',
    options: rangeOptions,
    orientation: 'horizontal',
  },
  argTypes: {
    disabled: {control: 'boolean'},
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <SegmentedControl {...args} />,
};

export const States: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Rest',
          content: (
            <SegmentedControl
              aria-label="Delivery range"
              data-story-state="rest"
              defaultValue="month"
              options={rangeOptions}
            />
          ),
        },
        {
          label: 'Pointer hover',
          content: (
            <SegmentedControl
              aria-label="Hovered delivery range"
              data-story-state="hover"
              defaultValue="month"
              options={rangeOptions}
            />
          ),
        },
        {
          label: 'Keyboard focus',
          content: (
            <SegmentedControl
              aria-label="Focused delivery range"
              data-story-state="focus"
              defaultValue="month"
              options={rangeOptions}
            />
          ),
        },
        {
          label: 'Pointer active',
          content: (
            <SegmentedControl
              aria-label="Active delivery range"
              data-story-state="active"
              defaultValue="month"
              options={rangeOptions}
            />
          ),
        },
      ]}
    />
  ),
  play: async ({canvasElement, userEvent}) => {
    function target(state: string) {
      return canvasElement.querySelector<HTMLElement>(
        `[data-story-state="${state}"] [role="radio"]:not([aria-checked="true"])`,
      );
    }

    const focusTarget = target('focus');
    const activeTarget = target('active');
    const hoverTarget = target('hover');
    if (!focusTarget || !activeTarget || !hoverTarget) {
      throw new Error('SegmentedControl state targets are missing');
    }

    await userEvent.pointer({keys: '[MouseLeft>]', target: activeTarget});
    focusTarget.focus();
    await userEvent.hover(hoverTarget);
  },
};

export const Disabled: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Disabled activity range"
      defaultValue="month"
      disabled
      options={rangeOptions}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Stack gap="xs">
            <Text>Activity summary</Text>
            <Text size="sm" tone="secondary">
              Compare completed deliveries over a selected period.
            </Text>
          </Stack>
          <SegmentedControl
            aria-label="Activity summary range"
            defaultValue="month"
            options={rangeOptions}
          />
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
