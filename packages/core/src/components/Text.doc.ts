import type {ComponentDoc} from '../docs/types.js';

export const textDoc = {
  name: 'Text',
  description: 'Renders body copy with semantic typography tokens.',
  props: [
    {name: 'size', description: 'Optional semantic size: "sm", "md", or "lg".'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLParagraphElement> except className'],
  example: '<Text size="md">Readable body copy.</Text>',
  storyId: 'foundations--text',
} satisfies ComponentDoc;
