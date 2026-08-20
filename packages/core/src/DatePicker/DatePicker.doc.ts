import type {ComponentDoc} from '../docs/types.js';

export const datePickerDoc = {
  name: 'DatePicker',
  description: "Picks a date from this system's own month grid.",
  props: [
    {name: 'defaultValue', description: 'Sets the initial uncontrolled date.'},
    {name: 'id', description: 'Names the field a label points at.'},
    {name: 'label', description: 'Names the month grid.', required: true},
    {name: 'max', description: 'Refuses days after this ISO date.'},
    {name: 'min', description: 'Refuses days before this ISO date.'},
    {name: 'onValueChange', description: 'Receives the ISO date string.'},
    {name: 'value', description: 'Controls the current ISO date string.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLSpanElement> except children, className, defaultValue, and onChange',
  ],
  example:
    '<DatePicker label="Release date" onValueChange={setDate} value={date} />',
  storyId: 'core-date-picker--default',
} satisfies ComponentDoc;
