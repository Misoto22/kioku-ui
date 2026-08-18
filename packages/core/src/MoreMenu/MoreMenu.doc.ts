import type {ComponentDoc} from '../docs/types.js';

export const moreMenuDoc = {
  name: 'MoreMenu',
  description: 'Collects secondary actions behind a self-managed trigger.',
  props: [
    {name: 'alignment', description: 'Lines the menu up along the cross axis.'},
    {name: 'children', description: 'Supplies the menu items.'},
    {name: 'label', description: 'Names the trigger and the menu.'},
    {
      name: 'placement',
      description: 'Selects the preferred side of the trigger.',
    },
  ],
  inheritedProps: ['None; MoreMenu owns its trigger and menu'],
  example:
    '<MoreMenu label="More actions"><DropdownMenuItem>Archive</DropdownMenuItem></MoreMenu>',
  storyId: 'core-more-menu--default',
} satisfies ComponentDoc;
