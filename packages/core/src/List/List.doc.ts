import type {ComponentDoc} from '../docs/types.js';

export const listDoc = {
  name: 'List',
  description: 'Groups related items with semantic list markup.',
  props: [
    {name: 'gap', description: 'Selects the space between items.'},
    {
      name: 'variant',
      description: 'Selects the marker treatment and the underlying element.',
    },
  ],
  inheritedProps: [
    'OlHTMLAttributes<HTMLOListElement> and HTMLAttributes<HTMLUListElement> except className and type',
  ],
  example: '<List><ListItem>Draft</ListItem></List>',
  storyId: 'core-list--default',
} satisfies ComponentDoc;

export const listItemDoc = {
  name: 'ListItem',
  description: 'Renders one entry inside a List.',
  props: [{name: 'children', description: 'Supplies the entry content.'}],
  inheritedProps: ['LiHTMLAttributes<HTMLLIElement> except className'],
  example: '<ListItem>Ready to review</ListItem>',
  storyId: 'core-list--default',
} satisfies ComponentDoc;
