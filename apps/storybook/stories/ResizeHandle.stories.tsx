import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Card, ResizeHandle, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-resize-handle',
  title: 'Core/ResizeHandle',
  component: ResizeHandle,
  args: {max: 480, min: 160, value: 240},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

// The handle is a primitive: the caller lays the panes out and owns the size,
// so a demo has to do the same rather than hand the work back to Resizable.
function SplitPanes({
  label,
  max = 480,
  min = 160,
  step,
}: {
  readonly label?: string;
  readonly max?: number;
  readonly min?: number;
  readonly step?: number;
}) {
  const [width, setWidth] = useState(240);

  return (
    <div style={{display: 'flex', height: '12rem'}}>
      <div style={{minWidth: 0, overflow: 'auto', width: `${width}px`}}>
        <Card>Files</Card>
      </div>
      <ResizeHandle
        label={label}
        max={max}
        min={min}
        onValueChange={setWidth}
        step={step}
        value={width}
      />
      <div style={{flexGrow: 1, minWidth: 0, overflow: 'auto'}}>
        <Card>Editor</Card>
      </div>
    </div>
  );
}

function StackedPanes() {
  const [height, setHeight] = useState(96);

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '14rem'}}>
      <div style={{height: `${height}px`, minHeight: 0, overflow: 'auto'}}>
        <Card>Query</Card>
      </div>
      <ResizeHandle
        label="Resize the query pane"
        max={192}
        min={48}
        onValueChange={setHeight}
        orientation="horizontal"
        value={height}
      />
      <div style={{flexGrow: 1, minHeight: 0, overflow: 'auto'}}>
        <Card>Results</Card>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <SplitPanes max={args.max} min={args.min} step={args.step} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <SplitPanes label="Resize the file rail" />
        <StackedPanes />
        <Text size="sm" tone="secondary">
          The handle is a separator, so arrow keys move it along its own axis
          and Home and End jump to the bounds. It draws a hairline and widens
          only its grab area, so the seam stays one pixel wide.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
