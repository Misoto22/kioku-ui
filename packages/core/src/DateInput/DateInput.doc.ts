import type {ComponentDoc} from '../docs/types.js';

export const dateInputDoc = {
  name: 'DateInput',
  description: 'Accepts one calendar date as an ISO string.',
  props: [
    {name: 'defaultValue', description: 'Sets the initial uncontrolled date.'},
    {name: 'onValueChange', description: 'Receives the ISO date string.'},
    {name: 'value', description: 'Controls the current ISO date string.'},
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, defaultValue, onChange, type, and value',
  ],
  example: '<DateInput onValueChange={setReleaseDate} value={releaseDate} />',
  storyId: 'core-date-input--default',
} satisfies ComponentDoc;
