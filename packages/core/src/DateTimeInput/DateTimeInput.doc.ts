import type {ComponentDoc} from '../docs/types.js';

export const dateTimeInputDoc = {
  name: 'DateTimeInput',
  description: 'Accepts one local date and time as an ISO string.',
  props: [
    {name: 'defaultValue', description: 'Sets the initial uncontrolled value.'},
    {name: 'onValueChange', description: 'Receives the ISO string.'},
    {name: 'value', description: 'Controls the current ISO string.'},
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, defaultValue, onChange, type, and value',
  ],
  example: '<DateTimeInput onValueChange={setValue} value={value} />',
  storyId: 'core-date-time-input--default',
} satisfies ComponentDoc;
