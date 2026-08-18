import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Heading, MetadataList, Stack} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-metadata-list',
  title: 'Core/MetadataList',
  component: MetadataList,
  args: {entries: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof MetadataList>;

export default meta;
type Story = StoryObj<typeof meta>;

const entries = [
  {detail: 'Ada Lovelace', term: 'Owner'},
  {detail: '18 August 2026', term: 'Released'},
  {detail: 'Twelve changes', term: 'Scope'},
];

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <MetadataList {...args} entries={entries} />
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['stacked', 'inline'] as const).map((layout) => ({
          label: layout,
          content: <MetadataList entries={entries} layout={layout} />,
        }))}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <Heading level={2} size="subsection">
            Release 12
          </Heading>
          <MetadataList entries={entries} layout="inline" />
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
