import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Field, Slider, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Slider',
  component: Slider,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

function SliderDemo(
  props: Omit<
    Partial<Parameters<typeof Slider>[0]>,
    'defaultValue' | 'onValueChange' | 'value'
  >,
) {
  const [value, setValue] = useState(40);

  return (
    <Stack gap="xs">
      <Slider
        aria-label="Rollout"
        {...props}
        formatValue={(current) => `${current} percent`}
        onValueChange={setValue}
        value={value}
      />
      <Text size="sm" tone="muted">
        {value} percent
      </Text>
    </Stack>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <SliderDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'default', content: <SliderDemo />},
          {label: 'stepped', content: <SliderDemo step={25} />},
          {
            label: 'disabled',
            content: <Slider aria-label="Rollout" defaultValue={40} disabled />,
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field
        label="Rollout"
        description="formatValue supplies the text a screen reader announces."
      >
        <SliderDemo />
      </Field>
    </DemoFrame>
  ),
};
