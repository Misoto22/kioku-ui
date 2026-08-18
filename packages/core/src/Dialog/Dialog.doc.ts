import type {ComponentDoc} from '../docs/types.js';

export const dialogDoc = {
  name: 'Dialog',
  description: 'Interrupts the page with a focus-trapped modal surface.',
  props: [
    {name: 'children', description: 'Supplies the dialog body.'},
    {name: 'description', description: 'Adds a described-by summary line.'},
    {
      name: 'dismissOnOutsideClick',
      description: 'Allows a click on the scrim to close the dialog.',
    },
    {name: 'footer', description: 'Places actions at the end of the surface.'},
    {
      name: 'onDismiss',
      description: 'Runs on Escape or an allowed outside click.',
    },
    {name: 'open', description: 'Controls whether the dialog renders.'},
    {name: 'size', description: 'Selects the maximum surface width.'},
    {name: 'title', description: 'Names the dialog for assistive technology.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, role, and title',
  ],
  example: '<Dialog onDismiss={close} open={open} title="Publish">...</Dialog>',
  storyId: 'core-dialog--default',
} satisfies ComponentDoc;
