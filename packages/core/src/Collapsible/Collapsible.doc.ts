import type {ComponentDoc} from '../docs/types.js';

export const collapsibleDoc = {
  name: 'Collapsible',
  description: 'Folds a section away behind its own heading.',
  props: [
    {name: 'children', description: 'Supplies the panel content.'},
    {name: 'defaultOpen', description: 'Sets the initial uncontrolled state.'},
    {name: 'label', description: 'Names the section on the trigger.'},
    {name: 'onOpenChange', description: 'Receives the next open state.'},
    {name: 'open', description: 'Controls whether the panel is shown.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, and onChange',
  ],
  example: '<Collapsible label="Advanced">…</Collapsible>',
  storyId: 'core-collapsible--default',
} satisfies ComponentDoc;
