import type {ComponentDoc} from '../docs/types.js';

export const toolbarDoc = {
  name: 'Toolbar',
  description: 'Groups related controls into a single tab stop.',
  props: [
    {name: 'children', description: 'Supplies the grouped controls.'},
    {name: 'label', description: 'Names the toolbar for assistive technology.'},
    {
      name: 'orientation',
      description: 'Selects the axis arrow keys travel along.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, and role',
  ],
  example:
    '<Toolbar label="Text style"><IconButton aria-label="Bold" /></Toolbar>',
  storyId: 'core-toolbar--default',
} satisfies ComponentDoc;
