import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Button,
  Card,
  Icon,
  IconButton,
  Stack,
  Text,
  Toolbar,
} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Toolbar',
  component: Toolbar,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Glyph({d}: {readonly d: string}) {
  return (
    <Icon>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

const controls = (
  <>
    <IconButton aria-label="Bold" variant="ghost">
      <Glyph d="M7 5h6a3.5 3.5 0 0 1 0 7H7Zm0 7h7a3.5 3.5 0 0 1 0 7H7Z" />
    </IconButton>
    <IconButton aria-label="Italic" variant="ghost">
      <Glyph d="M14 5h-4M14 19h-4M14 5 10 19" />
    </IconButton>
    <IconButton aria-label="Underline" variant="ghost">
      <Glyph d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />
    </IconButton>
  </>
);

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Toolbar {...args} label="Text style">
        {controls}
      </Toolbar>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['horizontal', 'vertical'] as const).map((orientation) => ({
          label: orientation,
          content: (
            <Toolbar label={orientation} orientation={orientation}>
              {controls}
            </Toolbar>
          ),
        }))}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Toolbar label="Release actions">
            {controls}
            <Button variant="secondary">Publish</Button>
          </Toolbar>
          <Text tone="secondary">
            A toolbar of ten buttons costs one Tab press, not ten.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
