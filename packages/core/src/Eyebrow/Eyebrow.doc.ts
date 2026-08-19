import type {ComponentDoc} from '../docs/types.js';

export const eyebrowDoc = {
  name: 'Eyebrow',
  description: 'Names a thing without competing with it.',
  props: [
    {name: 'children', description: 'Supplies the label.'},
    {
      name: 'tone',
      description: 'Optional ink rank: "secondary", "muted", or "danger".',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLSpanElement> except className'],
  example: '<Eyebrow>Recent activity</Eyebrow>',
  storyId: 'core-eyebrow--default',
} satisfies ComponentDoc;
