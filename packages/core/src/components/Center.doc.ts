import type {ComponentDoc} from '../docs/types.js';

export const centerDoc = {
  name: 'Center',
  description: 'Centers child content on both layout axes.',
  props: [{name: 'children', description: 'The content to center.'}],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except className and children',
  ],
  example: '<Center><Text>Centered content</Text></Center>',
  storyId: 'foundations--center',
} satisfies ComponentDoc;
