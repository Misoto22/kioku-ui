import type {ComponentDoc} from '../docs/types.js';

export const numeralDoc = {
  name: 'Numeral',
  description: 'Sets a figure in the mono face with tabular numerals.',
  props: [{name: 'children', description: 'Supplies the figure.'}],
  inheritedProps: ['HTMLAttributes<HTMLSpanElement> except className'],
  example: '<Numeral>1,204</Numeral>',
  storyId: 'core-numeral--default',
} satisfies ComponentDoc;
