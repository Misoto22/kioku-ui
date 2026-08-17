import type {ComponentDoc} from '../docs/types.js';

export const headingDoc = {
  name: 'Heading',
  description: 'Renders a native heading at the requested document level.',
  props: [
    'level: 1 | 2 | 3 | 4 | 5 | 6',
    'size?: "page" | "section" | "subsection"',
  ],
  example: '<Heading level={2}>Section title</Heading>',
  storyId: 'foundations--heading',
} satisfies ComponentDoc;
