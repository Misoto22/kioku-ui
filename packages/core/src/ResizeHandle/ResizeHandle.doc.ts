import type {ComponentDoc} from '../docs/types.js';

export const resizeHandleDoc = {
  name: 'ResizeHandle',
  description: 'Divides two panes with a control arrow keys can move.',
  props: [
    {name: 'label', description: 'Names the divider control.'},
    {name: 'max', description: 'Reports and caps the largest value.'},
    {name: 'min', description: 'Reports and caps the smallest value.'},
    {name: 'onValueChange', description: 'Receives the next clamped value.'},
    {name: 'orientation', description: 'Sets the axis the divider runs along.'},
    {name: 'step', description: 'Sets how far each arrow key moves it.'},
    {name: 'value', description: 'Reports where the divider currently sits.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except aria-label, aria-orientation, aria-valuemax, aria-valuemin, aria-valuenow, children, className, onKeyDown, role, and tabIndex',
  ],
  example:
    '<ResizeHandle max={480} min={160} onValueChange={setWidth} value={width} />',
  storyId: 'core-resize-handle--default',
} satisfies ComponentDoc;
