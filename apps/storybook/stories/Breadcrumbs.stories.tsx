import type {Meta, StoryObj} from '@storybook/react-vite';

import {Breadcrumbs, Heading, Stack} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Breadcrumbs',
  component: Breadcrumbs,
  args: {items: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  {href: '/', label: 'Home'},
  {href: '/releases', label: 'Releases'},
  {label: 'Release 12'},
];

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Breadcrumbs {...args} items={items} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <Breadcrumbs items={items} />
        <Heading level={1} size="section">
          Release 12
        </Heading>
      </Stack>
    </DemoFrame>
  ),
};
