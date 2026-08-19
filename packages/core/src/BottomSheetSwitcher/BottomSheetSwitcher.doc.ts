import type {ComponentDoc} from '../docs/types.js';

export const bottomSheetSwitcherDoc = {
  name: 'BottomSheetSwitcher',
  description: 'Swaps one sheet between several named views.',
  props: [
    {name: 'backLabel', description: 'Names the control back to the parent.'},
    {name: 'defaultViewId', description: 'Sets the initial uncontrolled view.'},
    {name: 'onDismiss', description: 'Runs on Escape or a scrim click.'},
    {name: 'onViewChange', description: 'Receives the next view id.'},
    {name: 'open', description: 'Controls whether the sheet renders.'},
    {name: 'viewId', description: 'Controls which view is shown.'},
    {name: 'views', description: 'Supplies each view and its parent.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, role, and title',
  ],
  example:
    '<BottomSheetSwitcher onDismiss={close} open={open} views={views} />',
  storyId: 'core-bottom-sheet-switcher--default',
} satisfies ComponentDoc;
