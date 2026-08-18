import type {ComponentDoc} from '../docs/types.js';

export const alertDialogDoc = {
  name: 'AlertDialog',
  description: 'Asks for a decision that cannot be dismissed by the scrim.',
  props: [
    {name: 'children', description: 'Supplies the dialog body.'},
    {name: 'description', description: 'Adds a described-by summary line.'},
    {name: 'footer', description: 'Places the decision actions.'},
    {name: 'onDismiss', description: 'Runs on Escape.'},
    {name: 'open', description: 'Controls whether the dialog renders.'},
    {name: 'size', description: 'Selects the maximum surface width.'},
    {
      name: 'title',
      description: 'Names the decision for assistive technology.',
    },
  ],
  inheritedProps: ['DialogProps except dismissOnOutsideClick'],
  example:
    '<AlertDialog onDismiss={cancel} open={open} title="Discard draft?">...</AlertDialog>',
  storyId: 'core-alert-dialog--default',
} satisfies ComponentDoc;
