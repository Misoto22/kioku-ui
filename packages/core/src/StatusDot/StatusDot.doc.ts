import type {ComponentDoc} from '../docs/types.js';

export const statusDotDoc = {
  name: 'StatusDot',
  description:
    'Announces a compact live status indicator by its supplied label.',
  props: [
    {
      name: 'aria-label',
      description: 'Names the represented status.',
      required: true,
    },
    {
      name: 'tone',
      description: 'Selects one of the four semantic status tones.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLSpanElement> except aria-label, children, className, and role',
  ],
  example: '<StatusDot aria-label="Service available" tone="success" />',
  storyId: 'core-status-dot--default',
} satisfies ComponentDoc;
