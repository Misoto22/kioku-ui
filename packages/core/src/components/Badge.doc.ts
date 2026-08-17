import type {ComponentDoc} from '../docs/types.js';

export const badgeDoc = {
  name: 'Badge',
  description: 'Displays compact, non-live status or category text.',
  props: [
    {
      name: 'tone',
      description: 'Selects the neutral default or a semantic status tone.',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLSpanElement> except className'],
  example: '<Badge tone="success">Available</Badge>',
  storyId: 'controls--badge',
} satisfies ComponentDoc;
