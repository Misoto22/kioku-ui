import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Field, Slider} from '@misoto22/kioku-ui';

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

  // The readout is the control's own, in tabular figures beside the track, so
  // the story no longer hand-rolls a second one underneath it.
  return (
    <Slider
      aria-label="Rollout"
      {...props}
      formatValue={(current) => `${current} percent`}
      onValueChange={setValue}
      value={value}
    />
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
        description="formatValue supplies the figure shown and the text announced."
      >
        <SliderDemo />
      </Field>
    </DemoFrame>
  ),
};
