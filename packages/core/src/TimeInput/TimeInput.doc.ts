import type {ComponentDoc} from '../docs/types.js';

export const timeInputDoc = {
  name: 'TimeInput',
  description: 'Accepts one time of day as an ISO string.',
  props: [
    {name: 'defaultValue', description: 'Sets the initial uncontrolled value.'},
    {name: 'onValueChange', description: 'Receives the ISO string.'},
    {name: 'value', description: 'Controls the current ISO string.'},
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, defaultValue, onChange, type, and value',
  ],
  example: '<TimeInput onValueChange={setValue} value={value} />',
  storyId: 'core-time-input--default',
} satisfies ComponentDoc;
