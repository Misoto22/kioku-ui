import type {ComponentDoc} from '../docs/types.js';

export const textInputDoc = {
  name: 'TextInput',
  description: 'Collects one line of controlled or uncontrolled text.',
  props: [
    {
      name: 'onValueChange',
      description: 'Receives the current string value after input.',
    },
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, defaultValue, onChange, and value',
  ],
  example: '<Field label="Name"><TextInput defaultValue="" /></Field>',
  storyId: 'controls--text-input',
} satisfies ComponentDoc;
