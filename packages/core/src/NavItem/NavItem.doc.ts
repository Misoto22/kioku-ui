import type {ComponentDoc} from '../docs/types.js';

export const navItemDoc = {
  name: 'NavItem',
  description: 'Links to one destination and can mark it as current.',
  props: [
    {name: 'current', description: 'Marks the destination the reader is on.'},
    {name: 'href', description: 'Sets the destination the item links to.'},
    {name: 'leading', description: 'Places a glyph before the label.'},
  ],
  inheritedProps: [
    'AnchorHTMLAttributes<HTMLAnchorElement> except aria-current, className, and href',
  ],
  example: '<NavItem current href="/releases">Releases</NavItem>',
  storyId: 'core-nav-item--default',
} satisfies ComponentDoc;
