import type {ComponentDoc} from '../docs/types.js';

export const sliderDoc = {
  name: 'Slider',
  description: 'Chooses a number along a visible range.',
  props: [
    {name: 'defaultValue', description: 'Sets the initial uncontrolled value.'},
    {
      name: 'formatValue',
      description: 'Supplies the text shown and announced for a value.',
    },
    {name: 'max', description: 'Sets the upper bound of the range.'},
    {name: 'min', description: 'Sets the lower bound of the range.'},
    {name: 'onValueChange', description: 'Receives the newly chosen number.'},
    {name: 'step', description: 'Sets the increment between allowed values.'},
    {name: 'value', description: 'Controls the current number.'},
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, defaultValue, onChange, type, and value',
  ],
  example:
    '<Slider formatValue={(v) => `${v} percent`} onValueChange={setLevel} value={level} />',
  storyId: 'core-slider--default',
} satisfies ComponentDoc;
