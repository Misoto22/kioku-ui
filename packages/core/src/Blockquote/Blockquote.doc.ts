import type {ComponentDoc} from '../docs/types.js';

export const blockquoteDoc = {
  name: 'Blockquote',
  description: 'Sets off quoted text and names its source.',
  props: [
    {name: 'attribution', description: 'Names where the quotation came from.'},
    {name: 'children', description: 'Supplies the quoted text.'},
  ],
  inheritedProps: [
    'BlockquoteHTMLAttributes<HTMLQuoteElement> except children and className',
  ],
  example: '<Blockquote attribution="Ada Lovelace">…</Blockquote>',
  storyId: 'core-blockquote--default',
} satisfies ComponentDoc;
