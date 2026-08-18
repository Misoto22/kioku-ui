import type {ComponentDoc} from '../docs/types.js';

export const kbdDoc = {
  name: 'Kbd',
  description: 'Renders a keyboard key inside running text.',
  props: [{name: 'children', description: 'Supplies the key label.'}],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className'],
  example: '<Kbd>Esc</Kbd>',
  storyId: 'core-kbd--default',
} satisfies ComponentDoc;
