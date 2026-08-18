import type {ComponentDoc} from '../docs/types.js';

export const fieldStatusDoc = {
  name: 'FieldStatus',
  description: 'States the validation outcome for one control.',
  props: [
    {name: 'children', description: 'Supplies the message text.'},
    {name: 'tone', description: 'Selects the semantic status colour.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLParagraphElement> except children and className',
  ],
  example: '<FieldStatus tone="danger">Enter a release number.</FieldStatus>',
  storyId: 'core-field-status--default',
} satisfies ComponentDoc;
