import type {ComponentDoc} from '../docs/types.js';

export const buttonGroupDoc = {
  name: 'ButtonGroup',
  description: 'Groups related actions so they read as one control.',
  props: [
    {name: 'children', description: 'Supplies the grouped actions.'},
    {name: 'label', description: 'Names the group for assistive technology.'},
    {
      name: 'orientation',
      description: 'Selects the axis arrow keys travel along.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except aria-label, children, className, and role',
  ],
  example: '<ButtonGroup label="Alignment"><Button>Left</Button></ButtonGroup>',
  storyId: 'core-button-group--default',
} satisfies ComponentDoc;
