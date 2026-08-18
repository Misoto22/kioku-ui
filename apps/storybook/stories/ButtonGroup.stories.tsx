import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {ButtonGroup, Stack, Text, ToggleButton} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-button-group',
  title: 'Core/ButtonGroup',
  component: ButtonGroup,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const alignments = ['Left', 'Centre', 'Right'] as const;

function AlignmentGroup({
  orientation,
}: {
  readonly orientation?: 'horizontal' | 'vertical';
}) {
  const [chosen, setChosen] = useState<string>('Left');

  return (
    <ButtonGroup label="Alignment" {...(orientation ? {orientation} : {})}>
      {alignments.map((alignment) => (
        <ToggleButton
          key={alignment}
          onPressedChange={() => setChosen(alignment)}
          pressed={chosen === alignment}
          size="sm"
        >
          {alignment}
        </ToggleButton>
      ))}
    </ButtonGroup>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ButtonGroup {...args} label="Alignment">
        <AlignmentGroup />
      </ButtonGroup>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['horizontal', 'vertical'] as const).map((orientation) => ({
          label: orientation,
          content: <AlignmentGroup orientation={orientation} />,
        }))}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <AlignmentGroup />
        <Text size="sm" tone="muted">
          The actions here are alternatives to each other; use Toolbar when they
          are separate commands.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
