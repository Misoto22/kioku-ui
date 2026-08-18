import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Stack, Text, ToggleButtonGroup} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-toggle-button-group',
  title: 'Core/ToggleButtonGroup',
  component: ToggleButtonGroup,
  args: {label: '', onValueChange: () => {}, options: [], value: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const alignments = [
  {label: 'Left', value: 'left'},
  {label: 'Centre', value: 'centre'},
  {label: 'Right', value: 'right'},
];

const formats = [
  {label: 'Bold', value: 'bold'},
  {label: 'Italic', value: 'italic'},
  {label: 'Underline', value: 'underline'},
];

function SingleDemo({
  orientation,
}: {
  readonly orientation?: 'horizontal' | 'vertical';
}) {
  const [value, setValue] = useState('left');
  return (
    <ToggleButtonGroup
      label="Alignment"
      onValueChange={setValue}
      options={alignments}
      {...(orientation ? {orientation} : {})}
      size="sm"
      value={value}
    />
  );
}

function MultipleDemo() {
  const [value, setValue] = useState<readonly string[]>(['bold']);
  return (
    <ToggleButtonGroup
      label="Formatting"
      onValueChange={setValue}
      options={formats}
      selectionMode="multiple"
      size="sm"
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <SingleDemo
        {...(args.orientation ? {orientation: args.orientation} : {})}
      />
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'single select', content: <SingleDemo />},
          {label: 'multiple select', content: <MultipleDemo />},
          {label: 'vertical', content: <SingleDemo orientation="vertical" />},
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <MultipleDemo />
        <Text size="sm" tone="muted">
          A single-select group never empties: pressing the active option again
          leaves it pressed, so the control never says nothing is chosen.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
