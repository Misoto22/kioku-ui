import type {ComponentDoc} from '../docs/types.js';

export const vStackDoc = {
  name: 'VStack',
  description: 'Arranges children in an evenly spaced column.',
  props: [
    {name: 'align', description: 'Places children along the cross axis.'},
    {name: 'gap', description: 'Selects the space between children.'},
  ],
  inheritedProps: ['StackProps, which VStack forwards unchanged'],
  example: '<VStack gap="md">…</VStack>',
  storyId: 'core-v-stack--default',
} satisfies ComponentDoc;
