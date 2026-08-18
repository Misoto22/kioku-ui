import type {Meta, StoryObj} from '@storybook/react-vite';

import {AspectRatio, Card, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-aspect-ratio',
  title: 'Core/AspectRatio',
  component: AspectRatio,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

function Placeholder({label}: {readonly label: string}) {
  return (
    <div
      style={{
        alignItems: 'center',
        backgroundColor: 'var(--kioku-ui-color-surface-muted)',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Text size="sm" tone="muted">
        {label}
      </Text>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <AspectRatio {...args}>
        <Placeholder label="16 : 9" />
      </AspectRatio>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <StateGrid
          items={[
            {
              label: '16 : 9',
              content: (
                <AspectRatio>
                  <Placeholder label="16 : 9" />
                </AspectRatio>
              ),
            },
            {
              label: '1 : 1',
              content: (
                <AspectRatio ratio={1}>
                  <Placeholder label="1 : 1" />
                </AspectRatio>
              ),
            },
            {
              label: '4 : 3',
              content: (
                <AspectRatio ratio={4 / 3}>
                  <Placeholder label="4 : 3" />
                </AspectRatio>
              ),
            },
          ]}
        />
        <Card>
          <Text size="sm" tone="muted">
            The box holds its shape before the content loads, so the page does
            not jump when an image arrives.
          </Text>
        </Card>
      </Stack>
    </DemoFrame>
  ),
};
