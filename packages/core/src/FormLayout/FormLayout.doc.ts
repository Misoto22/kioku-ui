import type {ComponentDoc} from '../docs/types.js';

export const formLayoutDoc = {
  name: 'FormLayout',
  description: 'Arranges fields and their submit actions.',
  props: [
    {
      name: 'actions',
      description: 'Places submit actions across the full width.',
    },
    {name: 'children', description: 'Supplies the fields.'},
    {name: 'columns', description: 'Selects one or two responsive columns.'},
  ],
  inheritedProps: [
    'FormHTMLAttributes<HTMLFormElement> except children and className',
  ],
  example:
    '<FormLayout actions={<Button>Save</Button>} columns={2}>…</FormLayout>',
  storyId: 'core-form-layout--default',
} satisfies ComponentDoc;
