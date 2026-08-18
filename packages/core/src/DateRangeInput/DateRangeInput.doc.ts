import type {ComponentDoc} from '../docs/types.js';

export const dateRangeInputDoc = {
  name: 'DateRangeInput',
  description: 'Accepts a start and end date that cannot cross.',
  props: [
    {name: 'defaultValue', description: 'Sets the initial uncontrolled range.'},
    {name: 'endLabel', description: 'Names the end control.'},
    {name: 'legend', description: 'States what the range covers.'},
    {name: 'onValueChange', description: 'Receives the next range.'},
    {name: 'startLabel', description: 'Names the start control.'},
    {name: 'value', description: 'Controls the current range.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLFieldSetElement> except children, className, defaultValue, and onChange',
  ],
  example:
    '<DateRangeInput legend="Reporting period" onValueChange={setRange} value={range} />',
  storyId: 'core-date-range-input--default',
} satisfies ComponentDoc;
