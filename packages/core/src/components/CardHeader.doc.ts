import type {ComponentDoc} from '../docs/types.js';

export const cardHeaderDoc = {
  name: 'CardHeader',
  description: 'Provides a padded native header for a Card.',
  props: ['native header attributes'],
  example: '<CardHeader><Heading level={2}>Card title</Heading></CardHeader>',
  storyId: 'foundations--card-header',
} satisfies ComponentDoc;
