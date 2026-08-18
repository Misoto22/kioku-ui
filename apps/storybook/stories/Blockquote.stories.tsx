import type {Meta, StoryObj} from '@storybook/react-vite';

import {Blockquote, Card, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Blockquote',
  component: Blockquote,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Blockquote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Blockquote {...args} attribution="Ada Lovelace">
        The engine weaves algebraic patterns.
      </Blockquote>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Text>Reviewers kept coming back to one line from the notes.</Text>
          <Blockquote attribution="Ada Lovelace, 1843">
            The engine weaves algebraic patterns just as the loom weaves
            flowers.
          </Blockquote>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
