import type {ComponentDoc} from '../docs/types.js';

export const topNavMenuDoc = {
  name: 'TopNavMenu',
  description: 'A grouped disclosure menu inside the page banner.',
  props: [
    {
      name: 'alignment',
      description: 'Lines the panel up along the cross axis.',
    },
    {name: 'children', description: 'Supplies the destinations.'},
    {name: 'label', description: 'Names the trigger and the panel.'},
    {
      name: 'placement',
      description: 'Selects the preferred side of the trigger.',
    },
  ],
  inheritedProps: ['None; TopNavMenu owns its trigger and panel'],
  example:
    '<TopNavMenu label="Product"><NavItem href="/a">A</NavItem></TopNavMenu>',
  storyId: 'core-top-nav-menu--default',
} satisfies ComponentDoc;
