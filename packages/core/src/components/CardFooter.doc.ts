import type {ComponentDoc} from '../docs/types.js';

export const cardFooterDoc = {
  name: 'CardFooter',
  description: 'Provides a padded native footer for a Card.',
  props: [{name: 'children', description: 'The footer content.'}],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className and children'],
  example: '<CardFooter><Text>Updated now</Text></CardFooter>',
  storyId: 'foundations--card-footer',
} satisfies ComponentDoc;
