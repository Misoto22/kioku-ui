import type {ComponentDoc} from '../docs/types.js';

export const navMenuDoc = {
  name: 'NavMenu',
  description: 'Groups destinations into a named navigation landmark.',
  props: [
    {name: 'children', description: 'Supplies the destinations.'},
    {
      name: 'label',
      description: 'Names the landmark for assistive technology.',
    },
    {name: 'orientation', description: 'Selects the axis the list runs along.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLElement> except children and className'],
  example:
    '<NavMenu label="Primary"><NavItem href="/">Home</NavItem></NavMenu>',
  storyId: 'core-nav-menu--default',
} satisfies ComponentDoc;
