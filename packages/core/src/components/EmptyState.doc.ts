import type {ComponentDoc} from '../docs/types.js';

export const emptyStateDoc = {
  name: 'EmptyState',
  description:
    'Presents an announced empty result with optional detail and action.',
  props: [
    {name: 'title', description: 'Names the empty state.', required: true},
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className and title'],
  example: '<EmptyState title="No results" detail="Try another query." />',
  storyId: 'data-display--empty-state',
} satisfies ComponentDoc;
