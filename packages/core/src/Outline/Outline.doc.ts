import type {ComponentDoc} from '../docs/types.js';

export const outlineDoc = {
  name: 'Outline',
  description: 'Lists the headings of the current page for in-page jumps.',
  props: [
    {name: 'currentHref', description: 'Marks which heading the reader is at.'},
    {name: 'entries', description: 'Supplies the headings in reading order.'},
    {name: 'label', description: 'Names the navigation landmark.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLElement> except children and className'],
  example: '<Outline currentHref="#tokens" entries={headings} />',
  storyId: 'core-outline--default',
} satisfies ComponentDoc;
