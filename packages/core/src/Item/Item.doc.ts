import type {ComponentDoc} from '../docs/types.js';

export const itemDoc = {
  name: 'Item',
  description:
    'Lays out a leading slot, label, description, and trailing slot.',
  props: [
    {name: 'description', description: 'Adds secondary text under the label.'},
    {name: 'leading', description: 'Places content before the label.'},
    {name: 'trailing', description: 'Places content after the label.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
  example: '<Item description="Updated today">Release notes</Item>',
  storyId: 'core-item--default',
} satisfies ComponentDoc;
