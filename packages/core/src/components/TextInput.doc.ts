import type {ComponentDoc} from '../docs/types.js';

export const textInputDoc = {
  name: 'TextInput',
  description: 'Collects one line of controlled or uncontrolled text.',
  props: [
    {
      name: 'aria-invalid',
      description:
        'Exposes invalid semantics and danger styling; an explicit value overrides Field status inference.',
    },
    {
      name: 'defaultValue',
      description: 'Sets the initial value for an uncontrolled input.',
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
    'InputHTMLAttributes<HTMLInputElement> except children, className, defaultValue, onChange, and value',
  ],
  example: '<Field label="Name"><TextInput defaultValue="" /></Field>',
  storyId: 'controls--text-input',
} satisfies ComponentDoc;
