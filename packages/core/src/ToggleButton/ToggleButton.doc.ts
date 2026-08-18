import type {ComponentDoc} from '../docs/types.js';

export const toggleButtonDoc = {
  name: 'ToggleButton',
  description: 'A button that stays pressed.',
  props: [
    {
      name: 'defaultPressed',
      description: 'Sets the initial uncontrolled state.',
    },
    {name: 'onPressedChange', description: 'Receives the next pressed state.'},
    {name: 'pressed', description: 'Controls the pressed state.'},
    {name: 'size', description: 'Selects the fixed control height.'},
  ],
  inheritedProps: [
    'ButtonHTMLAttributes<HTMLButtonElement> except aria-pressed and className',
  ],
  example:
    '<ToggleButton onPressedChange={setBold} pressed={bold}>Bold</ToggleButton>',
  storyId: 'core-toggle-button--default',
} satisfies ComponentDoc;
