import type {ComponentDoc} from '../docs/types.js';

export const tableDoc = {
  name: 'Table',
  description:
    'Composes native table, caption, section, row, header, and cell primitives.',
  props: [
    {
      name: 'children',
      description: 'Supplies semantic table primitives.',
      required: true,
    },
  ],
  inheritedProps: ['TableHTMLAttributes<HTMLTableElement> except className'],
  example: '<Table><TableCaption>Values</TableCaption><TableBody /></Table>',
  storyId: 'data-display--table',
} satisfies ComponentDoc;
