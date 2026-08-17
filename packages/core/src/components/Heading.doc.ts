import type {ComponentDoc} from '../docs/types.js';

export const headingDoc = {
  name: 'Heading',
  description: 'Renders a native heading at the requested document level.',
  props: [
    {
      name: 'family',
      description:
        'Optional "interface" family, or explicit "display" family for page-level and editorial headings.',
    },
    {
      name: 'level',
      description: 'Required native heading level from 1 through 6.',
      required: true,
    },
    {
      name: 'size',
      description:
        'Optional semantic size: "page", "section", or "subsection".',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLHeadingElement> except className'],
  example: '<Heading level={2} size="section">Section title</Heading>',
  storyId: 'foundations--heading',
} satisfies ComponentDoc;
