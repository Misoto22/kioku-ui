import type {ComponentDoc} from '../docs/types.js';

export const popoverDoc = {
  name: 'Popover',
  description: 'Floats content beside an anchor without blocking the page.',
  props: [
    {
      name: 'alignment',
      description: 'Lines the surface up along the cross axis.',
    },
    {name: 'anchorRef', description: 'References the element to float beside.'},
    {name: 'children', description: 'Supplies the floating content.'},
    {name: 'offset', description: 'Sets the gap between anchor and surface.'},
    {name: 'onDismiss', description: 'Runs on Escape or an outside click.'},
    {name: 'open', description: 'Controls whether the surface renders.'},
    {
      name: 'placement',
      description: 'Selects the preferred side of the anchor.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children and className',
  ],
  example:
    '<Popover anchorRef={triggerRef} onDismiss={close} open={open}>Details</Popover>',
  storyId: 'core-popover--default',
} satisfies ComponentDoc;
