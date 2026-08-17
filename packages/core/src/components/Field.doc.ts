import type {ComponentDoc} from '../docs/types.js';

export const fieldDoc = {
  name: 'Field',
  description:
    'Connects a form control to its label, description, and validation status.',
  props: [
    {name: 'label', description: 'Provides the control label.', required: true},
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
  example: '<Field label="Email"><TextInput /></Field>',
  storyId: 'controls--field',
} satisfies ComponentDoc;
