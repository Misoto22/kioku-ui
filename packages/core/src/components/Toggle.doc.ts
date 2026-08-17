import type {ComponentDoc} from '../docs/types.js';

export const toggleDoc = {
  name: 'Toggle',
  description: 'Switches a controlled or uncontrolled boolean setting.',
  props: [{name: 'pressed', description: 'Controls the current switch state.'}],
  inheritedProps: [
    'ButtonHTMLAttributes<HTMLButtonElement> except aria-checked, aria-pressed, className, onChange, and role',
  ],
  example: '<Toggle aria-label="Enable option" defaultPressed />',
  storyId: 'controls--toggle',
} satisfies ComponentDoc;
