import type {ComponentDoc} from '../docs/types.js';

export const cardHeaderDoc = {
  name: 'CardHeader',
  description:
    'Provides a padded native header with an inward divider when composed directly inside a Card.',
  props: [{name: 'children', description: 'The header content.'}],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className and children'],
  example:
    '<Card><CardHeader><Heading level={2}>Card title</Heading></CardHeader><Text>Content</Text></Card>',
  storyId: 'core-card--card-header',
} satisfies ComponentDoc;
