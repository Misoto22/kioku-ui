import type {ComponentDoc} from '../docs/types.js';

export const toggleDoc = {
  name: 'Toggle',
  description: 'Switches a controlled or uncontrolled boolean setting.',
  props: [
    {
      name: 'defaultPressed',
      description: 'Sets the initial state for an uncontrolled switch.',
    },
    {
      name: 'onPressedChange',
      description: 'Receives the next boolean state after activation.',
    },
    {name: 'pressed', description: 'Controls the current switch state.'},
  ],
  inheritedProps: [
    'ButtonHTMLAttributes<HTMLButtonElement> except aria-checked, aria-pressed, className, onChange, and role',
  ],
  example: '<Toggle aria-label="Enable option" defaultPressed />',
  storyId: 'controls--toggle',
} satisfies ComponentDoc;
