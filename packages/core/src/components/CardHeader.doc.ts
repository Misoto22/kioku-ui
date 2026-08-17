import type {ComponentDoc} from '../docs/types.js';

export const cardHeaderDoc = {
  name: 'CardHeader',
  description: 'Provides a padded native header for a Card.',
  props: [{name: 'children', description: 'The header content.'}],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className and children'],
  example: '<CardHeader><Heading level={2}>Card title</Heading></CardHeader>',
  storyId: 'foundations--card-header',
} satisfies ComponentDoc;
