import type {ComponentDoc} from '../docs/types.js';

export const spinnerDoc = {
  name: 'Spinner',
  description:
    'Announces indeterminate progress with a required accessible label and a static reduced-motion fallback.',
  props: [
    {
      name: 'label',
      description: 'Names the operation in progress.',
      required: true,
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLSpanElement> except aria-label, children, className, and role',
  ],
  example: '<Spinner label="Loading items" />',
  storyId: 'core-spinner--default',
} satisfies ComponentDoc;
