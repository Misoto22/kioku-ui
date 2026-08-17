import type {ComponentDoc} from '../docs/types.js';

export const cardDoc = {
  name: 'Card',
  description:
    'Groups self-contained content in a token-backed article surface.',
  props: [
    {
      name: 'children',
      description: 'The self-contained article content.',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className and children'],
  example: '<Card aria-label="Summary"><Text>Content</Text></Card>',
  storyId: 'foundations--card',
} satisfies ComponentDoc;
