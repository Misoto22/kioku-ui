import type {ComponentDoc} from '../docs/types.js';

export const navIconDoc = {
  name: 'NavIcon',
  description: 'Reserves a fixed square for a navigation glyph.',
  props: [{name: 'children', description: 'Supplies the glyph to place.'}],
  inheritedProps: ['None; NavIcon owns its decorative wrapper'],
  example: '<NavIcon><Icon>{path}</Icon></NavIcon>',
  storyId: 'core-nav-icon--default',
} satisfies ComponentDoc;
