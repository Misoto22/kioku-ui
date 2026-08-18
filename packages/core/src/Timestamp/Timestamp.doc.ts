import type {ComponentDoc} from '../docs/types.js';

export const timestampDoc = {
  name: 'Timestamp',
  description: 'Shows a point in time with its machine-readable value.',
  props: [
    {name: 'format', description: 'Builds the text a reader sees.'},
    {name: 'value', description: 'Supplies the date to show.'},
  ],
  inheritedProps: [
    'TimeHTMLAttributes<HTMLTimeElement> except children, className, and dateTime',
  ],
  example: '<Timestamp value="2026-08-18T09:30:00Z" />',
  storyId: 'core-timestamp--default',
} satisfies ComponentDoc;
