import type {ComponentDoc} from '../docs/types.js';

export const treeListDoc = {
  name: 'TreeList',
  description: 'Presents a collapsible hierarchy as one tab stop.',
  props: [
    {name: 'expandedIds', description: 'Controls which branches are open.'},
    {name: 'label', description: 'Names the tree for assistive technology.'},
    {name: 'nodes', description: 'Supplies the hierarchy in reading order.'},
    {name: 'onExpandedChange', description: 'Receives the next open branches.'},
    {name: 'onSelect', description: 'Receives the id of the chosen node.'},
    {name: 'selectedId', description: 'Marks which node is selected.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLUListElement> except children, className, onSelect, and role',
  ],
  example:
    '<TreeList expandedIds={open} label="Files" nodes={tree} onExpandedChange={setOpen} />',
  storyId: 'core-tree-list--default',
} satisfies ComponentDoc;
