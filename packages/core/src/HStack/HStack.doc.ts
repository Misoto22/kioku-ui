import type {ComponentDoc} from '../docs/types.js';

export const hStackDoc = {
  name: 'HStack',
  description: 'Arranges children in an evenly spaced row.',
  props: [
    {name: 'align', description: 'Places children along the cross axis.'},
    {name: 'gap', description: 'Selects the space between children.'},
    {name: 'justify', description: 'Distributes children along the row.'},
    {name: 'wrap', description: 'Allows children to flow onto more rows.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
  example: '<HStack gap="sm" justify="between">…</HStack>',
  storyId: 'core-h-stack--default',
} satisfies ComponentDoc;
