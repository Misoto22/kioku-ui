import type {ComponentDoc} from '../docs/types.js';

export const dropdownMenuDoc = {
  name: 'DropdownMenu',
  description:
    'Presents a keyboard-navigable list of actions beside a trigger.',
  props: [
    {name: 'alignment', description: 'Lines the menu up along the cross axis.'},
    {
      name: 'anchorRef',
      description: 'References the trigger to anchor against.',
    },
    {name: 'children', description: 'Supplies the menu items.'},
    {name: 'label', description: 'Names the menu for assistive technology.'},
    {name: 'onDismiss', description: 'Runs on Escape or an outside click.'},
    {name: 'open', description: 'Controls whether the menu renders.'},
    {
      name: 'placement',
      description: 'Selects the preferred side of the trigger.',
    },
  ],
  inheritedProps: ['None; DropdownMenu owns its menu element'],
  example:
    '<DropdownMenu anchorRef={triggerRef} label="Actions" onDismiss={close} open={open}>...</DropdownMenu>',
  storyId: 'core-dropdown-menu--default',
} satisfies ComponentDoc;

export const dropdownMenuItemDoc = {
  name: 'DropdownMenuItem',
  description: 'Renders one action inside a DropdownMenu.',
  props: [
    {name: 'description', description: 'Adds secondary text under the label.'},
    {name: 'leading', description: 'Places content before the label.'},
    {name: 'trailing', description: 'Places content after the label.'},
  ],
  inheritedProps: [
    'ButtonHTMLAttributes<HTMLButtonElement> except className and role',
  ],
  example: '<DropdownMenuItem onClick={publish}>Publish</DropdownMenuItem>',
  storyId: 'core-dropdown-menu--default',
} satisfies ComponentDoc;
