import type {ComponentDoc} from '../docs/types.js';

export const overlayDoc = {
  name: 'Overlay',
  description: 'Supplies scrim, dismissal, focus, and scroll behaviour.',
  props: [
    {name: 'children', description: 'Supplies the surface the overlay wraps.'},
    {
      name: 'dismissOnOutsideClick',
      description: 'Allows a click on the scrim to dismiss the overlay.',
    },
    {name: 'lockScroll', description: 'Freezes document scrolling while open.'},
    {name: 'onDismiss', description: 'Runs on Escape or an outside click.'},
    {name: 'open', description: 'Controls whether the overlay renders.'},
    {name: 'scrim', description: 'Draws a dimming layer behind the surface.'},
    {name: 'trapFocus', description: 'Confines Tab to the wrapped surface.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children and className',
  ],
  example: '<Overlay onDismiss={close} open={open}><Card>...</Card></Overlay>',
  storyId: 'core-overlay--default',
} satisfies ComponentDoc;
