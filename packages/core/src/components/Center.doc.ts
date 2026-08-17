import type {ComponentDoc} from '../docs/types.js';

export const centerDoc = {
  name: 'Center',
  description: 'Centers child content on both layout axes.',
  props: ['native div attributes'],
  example: '<Center><Text>Centered content</Text></Center>',
  storyId: 'foundations--center',
} satisfies ComponentDoc;
