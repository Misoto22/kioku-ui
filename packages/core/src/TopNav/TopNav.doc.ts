import type {ComponentDoc} from '../docs/types.js';

export const topNavDoc = {
  name: 'TopNav',
  description: 'Places identity, navigation, and actions in the page banner.',
  props: [
    {
      name: 'actions',
      description: 'Places account or global actions at the end.',
    },
    {name: 'brand', description: 'Places identity at the start of the banner.'},
    {name: 'children', description: 'Supplies the primary navigation.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLElement> except children, className, and role',
  ],
  example:
    '<TopNav brand="Kioku"><NavMenu label="Primary">…</NavMenu></TopNav>',
  storyId: 'core-top-nav--default',
} satisfies ComponentDoc;
