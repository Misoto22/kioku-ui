import type {Meta, StoryObj} from '@storybook/react-vite';

import {Kbd, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Kbd',
  component: Kbd,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Kbd {...args}>Esc</Kbd>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Text>
        Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to open the search field, then{' '}
        <Kbd>Esc</Kbd> to dismiss it.
      </Text>
    </DemoFrame>
  ),
};
