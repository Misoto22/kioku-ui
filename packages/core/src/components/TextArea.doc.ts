import type {ComponentDoc} from '../docs/types.js';

export const textAreaDoc = {
  name: 'TextArea',
  description: 'Collects multiple lines of controlled or uncontrolled text.',
  props: [
    {
      name: 'onValueChange',
      description: 'Receives the current string value after input.',
    },
  ],
  inheritedProps: [
    'TextareaHTMLAttributes<HTMLTextAreaElement> except children, className, defaultValue, onChange, and value',
  ],
  example: '<Field label="Notes"><TextArea /></Field>',
  storyId: 'controls--text-area',
} satisfies ComponentDoc;
