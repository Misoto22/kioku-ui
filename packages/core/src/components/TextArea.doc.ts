import type {ComponentDoc} from '../docs/types.js';

export const textAreaDoc = {
  name: 'TextArea',
  description: 'Collects multiple lines of controlled or uncontrolled text.',
  props: [
    {
      name: 'aria-invalid',
      description:
        'Exposes invalid semantics and danger styling; an explicit value overrides Field status inference.',
    },
    {
      name: 'defaultValue',
      description: 'Sets the initial value for an uncontrolled text area.',
    },
    {
      name: 'disabled',
      description: 'Disables editing and native form interaction.',
    },
    {
      name: 'onValueChange',
      description: 'Receives the current string value after input.',
    },
    {
      name: 'readOnly',
      description: 'Keeps the value legible while preventing edits.',
    },
    {
      name: 'required',
      description:
        'Sets native required semantics; an explicit value overrides the enclosing Field necessity.',
    },
    {
      name: 'value',
      description: 'Controls the current value when onValueChange is supplied.',
    },
  ],
  inheritedProps: [
    'TextareaHTMLAttributes<HTMLTextAreaElement> except children, className, defaultValue, onChange, and value',
  ],
  example: '<Field label="Notes"><TextArea /></Field>',
  storyId: 'controls--text-area',
} satisfies ComponentDoc;
