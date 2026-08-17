import type {ComponentDoc} from '../docs/types.js';

export const cardDoc = {
  name: 'Card',
  description:
    'Groups self-contained content in a token-backed article surface.',
  props: ['native article attributes'],
  example: '<Card aria-label="Summary"><Text>Content</Text></Card>',
  storyId: 'foundations--card',
} satisfies ComponentDoc;
