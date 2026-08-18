import type {ComponentDoc} from '../docs/types.js';

export const overflowListDoc = {
  name: 'OverflowList',
  description: 'Shows leading entries and folds the rest into a menu.',
  props: [
    {name: 'entries', description: 'Supplies every entry in priority order.'},
    {
      name: 'overflowLabel',
      description: 'Names the overflow trigger and menu.',
    },
    {
      name: 'visibleCount',
      description: 'Sets how many entries stay in the row.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children and className',
  ],
  example: '<OverflowList entries={actions} visibleCount={3} />',
  storyId: 'core-overflow-list--default',
} satisfies ComponentDoc;
