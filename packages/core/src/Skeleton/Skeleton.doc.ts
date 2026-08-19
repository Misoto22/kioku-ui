import type {ComponentDoc} from '../docs/types.js';

export const skeletonDoc = {
  name: 'Skeleton',
  description:
    'Displays a decorative or explicitly labelled loading placeholder as a still bar that never pulses.',
  props: [
    {name: 'label', description: 'Optionally announces what is loading.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except aria-label, children, className, and role',
  ],
  example: '<Skeleton label="Loading summary" />',
  storyId: 'core-skeleton--default',
} satisfies ComponentDoc;
