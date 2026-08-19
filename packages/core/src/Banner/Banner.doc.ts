import type {ComponentDoc} from '../docs/types.js';

export const bannerDoc = {
  name: 'Banner',
  description: 'Announces something about the whole page or account.',
  props: [
    {name: 'actions', description: 'Places a follow-up action at the end.'},
    {name: 'children', description: 'Supplies the announcement.'},
    {name: 'tone', description: 'Selects the semantic status colour.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, and role',
  ],
  example:
    '<Banner tone="warning">Billing details expire in three days.</Banner>',
  storyId: 'core-banner--default',
} satisfies ComponentDoc;
