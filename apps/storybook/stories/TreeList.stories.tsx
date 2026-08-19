import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Card, Stack, Text, TreeList, type TreeNode} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-tree-list',
  title: 'Core/TreeList',
  component: TreeList,
  args: {expandedIds: [], label: '', nodes: [], onExpandedChange: () => {}},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof TreeList>;

export default meta;
type Story = StoryObj<typeof meta>;

const nodes: readonly TreeNode[] = [
  {
    children: [
      {id: 'core', label: 'core'},
      {id: 'themes', label: 'themes'},
      {id: 'build', label: 'build'},
    ],
    id: 'packages',
    label: 'packages',
  },
  {
    children: [{id: 'storybook', label: 'storybook'}],
    id: 'apps',
    label: 'apps',
  },
  {id: 'readme', label: 'README.md'},
];

function TreeDemo({
  initialExpanded = [],
  initialSelected = '',
}: {
  readonly initialExpanded?: readonly string[];
  readonly initialSelected?: string;
}) {
  const [expandedIds, setExpandedIds] =
    useState<readonly string[]>(initialExpanded);
  const [selectedId, setSelectedId] = useState(initialSelected);

  return (
    <TreeList
      expandedIds={expandedIds}
      label="Files"
      nodes={nodes}
      onExpandedChange={setExpandedIds}
      onSelect={setSelectedId}
      selectedId={selectedId}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <TreeDemo initialExpanded={args.expandedIds} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'collapsed', content: <TreeDemo />},
          {
            label: 'expanded',
            content: <TreeDemo initialExpanded={['packages']} />,
          },
          {
            label: 'selected',
            content: (
              <TreeDemo
                initialExpanded={['packages']}
                initialSelected="themes"
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
      <Card>
        <Stack gap="sm">
          <TreeDemo
            initialExpanded={['packages', 'apps']}
            initialSelected="themes"
          />
          <Text size="sm" tone="muted">
            The whole tree is one tab stop: up and down move between visible
            nodes, right opens a branch, left closes it.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
