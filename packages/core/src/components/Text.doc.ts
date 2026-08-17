import type {ComponentDoc} from '../docs/types.js';

export const textDoc = {
  name: 'Text',
  description: 'Renders body copy with semantic typography tokens.',
  props: [
    {name: 'size', description: 'Optional semantic size: "sm", "md", or "lg".'},
    {
      name: 'tone',
      description:
        'Optional hierarchy tone: "primary", "secondary", or "muted".',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLParagraphElement> except className'],
  example: '<Text size="md" tone="secondary">Supporting copy.</Text>',
  storyId: 'core-text--default',
} satisfies ComponentDoc;
