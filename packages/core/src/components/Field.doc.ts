import type {ComponentDoc} from '../docs/types.js';

export const fieldDoc = {
  name: 'Field',
  description:
    'Connects a form control to its label, description, and validation status.',
  props: [
    {
      name: 'controlId',
      description: 'Overrides the generated form-control identifier.',
    },
    {
      name: 'description',
      description: 'Adds supporting text to the control description.',
    },
    {name: 'label', description: 'Provides the control label.', required: true},
    {
      name: 'status',
      description: 'Adds validation or status text to the control description.',
    },
    {
      name: 'statusTone',
      description: 'Selects status color, announcement, and invalid semantics.',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
  example: '<Field label="Email"><TextInput /></Field>',
  storyId: 'controls--field',
} satisfies ComponentDoc;
