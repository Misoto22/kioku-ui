import type {ComponentDoc} from '../docs/types.js';

export const dividerDoc = {
  name: 'Divider',
  description: 'Renders a token-backed native horizontal separator.',
  props: ['native hr attributes'],
  example: '<Divider aria-label="Separates summary from details" />',
  storyId: 'foundations--divider',
} satisfies ComponentDoc;
