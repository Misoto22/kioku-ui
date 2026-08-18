import type {ComponentDoc} from '../docs/types.js';

export const indicatorDoc = {
  name: 'Indicator',
  description: 'Attaches a count or dot to the control it wraps.',
  props: [
    {name: 'children', description: 'Supplies the control being marked.'},
    {name: 'count', description: 'Shows a number; omit to show a plain dot.'},
    {name: 'label', description: 'States what the indicator means.'},
    {
      name: 'max',
      description: 'Caps the number before it reads as "max plus".',
    },
    {name: 'tone', description: 'Selects the semantic status colour.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLSpanElement> except children and className',
  ],
  example: '<Indicator count={3} label="3 unread"><IconButton … /></Indicator>',
  storyId: 'core-indicator--default',
} satisfies ComponentDoc;
