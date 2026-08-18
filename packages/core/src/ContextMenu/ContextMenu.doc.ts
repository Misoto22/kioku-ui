import type {ComponentDoc} from '../docs/types.js';

export const contextMenuDoc = {
  name: 'ContextMenu',
  description: 'Opens a menu at the pointer on a secondary click.',
  props: [
    {
      name: 'children',
      description: 'Supplies the region that accepts the click.',
    },
    {name: 'label', description: 'Names the menu for assistive technology.'},
    {name: 'menu', description: 'Supplies the menu items.'},
  ],
  inheritedProps: ['None; ContextMenu owns its region and menu'],
  example:
    '<ContextMenu label="Row actions" menu={items}><TableRow>...</TableRow></ContextMenu>',
  storyId: 'core-context-menu--default',
} satisfies ComponentDoc;
