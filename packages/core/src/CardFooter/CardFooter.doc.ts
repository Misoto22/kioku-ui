import type {ComponentDoc} from '../docs/types.js';

export const cardFooterDoc = {
  name: 'CardFooter',
  description:
    'Provides a padded native footer with an inward divider when composed directly inside a Card.',
  props: [{name: 'children', description: 'The footer content.'}],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className and children'],
  example:
    '<Card><Text>Content</Text><CardFooter><Text>Updated now</Text></CardFooter></Card>',
  storyId: 'core-card--card-footer',
} satisfies ComponentDoc;
