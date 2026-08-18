import type {ComponentDoc} from '../docs/types.js';

export const mobileNavDoc = {
  name: 'MobileNav',
  description: 'Holds navigation behind a trigger on narrow viewports.',
  props: [
    {name: 'children', description: 'Supplies the navigation content.'},
    {name: 'closeLabel', description: 'Names the dismiss control.'},
    {name: 'label', description: 'Names the trigger and the drawer.'},
    {name: 'title', description: 'Replaces the drawer heading text.'},
  ],
  inheritedProps: ['None; MobileNav owns its trigger and drawer'],
  example: '<MobileNav label="Open navigation">{menu}</MobileNav>',
  storyId: 'core-mobile-nav--default',
} satisfies ComponentDoc;
