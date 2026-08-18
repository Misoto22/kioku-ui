import type {Meta, StoryObj} from '@storybook/react-vite';

import {Heading, Outline, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Outline',
  component: Outline,
  args: {entries: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Outline>;

export default meta;
type Story = StoryObj<typeof meta>;

const entries = [
  {href: '#tokens', label: 'Tokens'},
  {depth: 2 as const, href: '#colour', label: 'Colour roles'},
  {depth: 2 as const, href: '#spacing', label: 'Spacing scale'},
  {href: '#themes', label: 'Themes'},
  {href: '#density', label: 'Density'},
];

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Outline {...args} currentHref="#colour" entries={entries} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Heading level={2} size="subsection">
          On this page
        </Heading>
        <Outline currentHref="#themes" entries={entries} />
        <Text size="sm" tone="muted">
          The active entry is marked with aria-current, not colour alone.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
