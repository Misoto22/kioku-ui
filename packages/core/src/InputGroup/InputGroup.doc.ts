import type {ComponentDoc} from '../docs/types.js';

export const inputGroupDoc = {
  name: 'InputGroup',
  description: 'Places fixed affixes beside a control.',
  props: [
    {name: 'children', description: 'Supplies the control being flanked.'},
    {
      name: 'prefix',
      description: 'Places a decorative affix before the control.',
    },
    {
      name: 'suffix',
      description: 'Places a decorative affix after the control.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, and prefix',
  ],
  example:
    '<InputGroup suffix="AUD"><TextInput defaultValue="120" /></InputGroup>',
  storyId: 'core-input-group--default',
} satisfies ComponentDoc;
