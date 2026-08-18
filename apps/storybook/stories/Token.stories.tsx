import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Stack, Text, Token} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Token',
  component: Token,
  args: {children: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Token>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Token {...args}>release</Token>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'plain', content: <Token>release</Token>},
          {
            label: 'removable',
            content: (
              <Token onRemove={() => {}} removeLabel="Remove release">
                release
              </Token>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

function TokenRow() {
  const [tags, setTags] = useState(['release', 'docs', 'a11y']);

  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem'}}>
      {tags.map((tag) => (
        <Token
          key={tag}
          onRemove={() =>
            setTags((current) => current.filter((entry) => entry !== tag))
          }
          removeLabel={`Remove ${tag}`}
        >
          {tag}
        </Token>
      ))}
    </div>
  );
}

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <TokenRow />
        <Text size="sm" tone="muted">
          Each remove control names the value it clears.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
