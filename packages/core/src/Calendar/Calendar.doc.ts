import type {ComponentDoc} from '../docs/types.js';

export const calendarDoc = {
  name: 'Calendar',
  description: 'Selects a date from a month grid.',
  props: [
    {
      name: 'defaultValue',
      description: 'Sets the initial uncontrolled ISO date.',
    },
    {name: 'formatDay', description: 'Builds the accessible name of one day.'},
    {
      name: 'formatMonth',
      description: 'Builds the heading for the shown month.',
    },
    {name: 'label', description: 'Names the grid for assistive technology.'},
    {name: 'max', description: 'Blocks dates after this ISO date.'},
    {name: 'min', description: 'Blocks dates before this ISO date.'},
    {name: 'onValueChange', description: 'Receives the chosen ISO date.'},
    {name: 'value', description: 'Controls the selected ISO date.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, defaultValue, onChange, and role',
  ],
  example:
    '<Calendar label="Release date" onValueChange={setDate} value={date} />',
  storyId: 'core-calendar--default',
} satisfies ComponentDoc;
