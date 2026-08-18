import type {Meta, StoryObj} from '@storybook/react-vite';

import {Code, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Code',
  component: Code,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Code {...args}>pnpm add @misoto22/kioku-ui</Code>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Text>
        Wrap the application in <Code>ThemeProvider</Code> and import{' '}
        <Code>@misoto22/kioku-ui/styles.css</Code> once at the entry point.
      </Text>
    </DemoFrame>
  ),
};
