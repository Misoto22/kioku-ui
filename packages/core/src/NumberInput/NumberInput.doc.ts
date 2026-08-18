import type {ComponentDoc} from '../docs/types.js';

export const numberInputDoc = {
  name: 'NumberInput',
  description: 'Accepts a number and reports an empty field as undefined.',
  props: [
    {
      name: 'defaultValue',
      description: 'Sets the initial uncontrolled number.',
    },
    {
      name: 'onValueChange',
      description: 'Receives the parsed number or undefined.',
    },
    {name: 'value', description: 'Controls the current number.'},
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, defaultValue, onChange, type, and value',
  ],
  example: '<NumberInput onValueChange={setCount} value={count} />',
  storyId: 'core-number-input--default',
} satisfies ComponentDoc;
