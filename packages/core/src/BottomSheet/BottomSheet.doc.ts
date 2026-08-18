import type {ComponentDoc} from '../docs/types.js';

export const bottomSheetDoc = {
  name: 'BottomSheet',
  description: 'Presents a modal panel anchored to the bottom edge.',
  props: [
    {name: 'children', description: 'Supplies the panel body.'},
    {name: 'onDismiss', description: 'Runs on Escape or a scrim click.'},
    {name: 'open', description: 'Controls whether the panel renders.'},
    {name: 'title', description: 'Names the panel for assistive technology.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, role, and title',
  ],
  example:
    '<BottomSheet onDismiss={close} open={open} title="Filters">...</BottomSheet>',
  storyId: 'core-bottom-sheet--default',
} satisfies ComponentDoc;
