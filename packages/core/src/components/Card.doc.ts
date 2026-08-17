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
    {
      name: 'elevation',
      description:
        'Optional boundary treatment: "none" uses a border; "low" and "medium" use only the matching elevation.',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className and children'],
  example:
    '<Card aria-label="Summary" elevation="none"><Text>Content</Text></Card>',
  storyId: 'core-card--default',
} satisfies ComponentDoc;
