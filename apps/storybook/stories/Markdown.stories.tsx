import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Markdown, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Markdown',
  component: Markdown,
  args: {source: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const source = [
  '## Release 12',
  '',
  'Ready to **publish** with *twelve* changes. Run `pnpm release` to ship.',
  '',
  '- Accessibility baseline refreshed',
  '- Tokens renamed for clarity',
  '',
  '> Focus order now matches reading order.',
  '',
  'See the [release runbook](https://example.com/runbook).',
].join('\n');

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Markdown {...args} source={source} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Card>
          <Markdown source={source} />
        </Card>
        <Text size="sm" tone="muted">
          Raw HTML is never interpreted and only http(s) or root-relative links
          survive, so untrusted text stays inert.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
