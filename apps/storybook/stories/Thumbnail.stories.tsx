import type {Meta, StoryObj} from '@storybook/react-vite';

import {Item, Stack, Text, Thumbnail} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Thumbnail',
  component: Thumbnail,
  args: {alt: '', src: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Thumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

// An inline SVG keeps the story self-contained instead of fetching an asset.
const cover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23b8c4c0"/><circle cx="32" cy="26" r="12" fill="%23f4efe6"/></svg>',
  );

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Thumbnail {...args} alt="Release cover" src={cover} />
    </DemoFrame>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['sm', 'md', 'lg'] as const).map((size) => ({
          label: size,
          content: <Thumbnail alt="Release cover" size={size} src={cover} />,
        }))}
      />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'loaded',
            content: <Thumbnail alt="Release cover" src={cover} />,
          },
          {
            label: 'failed',
            content: <Thumbnail alt="Release cover" src="/missing.png" />,
          },
          {
            label: 'failed with fallback',
            content: (
              <Thumbnail
                alt="Release cover"
                fallback="No preview"
                src="/missing.png"
              />
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="sm">
        <Item
          description="Updated moments ago"
          leading={<Thumbnail alt="Release cover" size="sm" src={cover} />}
        >
          Release 12
        </Item>
        <Text size="sm" tone="muted">
          A failed image degrades to text rather than a broken-image glyph.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
