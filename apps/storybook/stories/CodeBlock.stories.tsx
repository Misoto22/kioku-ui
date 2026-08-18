import type {Meta, StoryObj} from '@storybook/react-vite';

import {CodeBlock, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-code-block',
  title: 'Core/CodeBlock',
  component: CodeBlock,
  args: {code: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const snippet = [
  "import {ThemeProvider} from '@misoto22/kioku-ui';",
  '',
  'export function App({children}) {',
  '  return <ThemeProvider themes={themes}>{children}</ThemeProvider>;',
  '}',
].join('\n');

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <CodeBlock {...args} code={snippet} language="tsx" />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text>Wrap the application once at its entry point:</Text>
        <CodeBlock code={snippet} language="tsx" />
        <Text size="sm" tone="muted">
          The copy control reports its own result, so a reader knows the copy
          happened.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
