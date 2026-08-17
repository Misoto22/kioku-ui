import type {ComponentDoc} from '../docs/types.js';

export const textDoc = {
  name: 'Text',
  description: 'Renders body copy with semantic typography tokens.',
  props: ['size?: "sm" | "md" | "lg"', 'native paragraph attributes'],
  example: '<Text size="md">Readable body copy.</Text>',
  storyId: 'foundations--text',
} satisfies ComponentDoc;
