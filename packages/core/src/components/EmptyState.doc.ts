import type {ComponentDoc} from '../docs/types.js';

export const emptyStateDoc = {
  name: 'EmptyState',
  description:
    'Presents an announced empty result with optional detail and action.',
  props: [
    {
      name: 'action',
      description: 'Provides an optional consumer-owned recovery action.',
    },
    {
      name: 'detail',
      description: 'Provides optional supporting empty-state content.',
    },
    {
      name: 'size',
      description: 'Adjusts container padding and grouping rhythm.',
    },
    {name: 'title', description: 'Names the empty state.', required: true},
    {
      name: 'visual',
      description:
        'Provides optional consumer-owned visual content before the copy; consumers own its accessible semantics.',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className and title'],
  example:
    '<EmptyState title="No results" detail="Try another query." size="compact" />',
  storyId: 'data-display--empty-state',
} satisfies ComponentDoc;
