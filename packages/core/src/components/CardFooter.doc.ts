import type {ComponentDoc} from '../docs/types.js';

export const cardFooterDoc = {
  name: 'CardFooter',
  description: 'Provides a padded native footer for a Card.',
  props: ['native footer attributes'],
  example: '<CardFooter><Text>Updated now</Text></CardFooter>',
  storyId: 'foundations--card-footer',
} satisfies ComponentDoc;
