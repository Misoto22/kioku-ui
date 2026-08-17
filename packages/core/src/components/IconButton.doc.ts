import type {ComponentDoc} from '../docs/types.js';

export const iconButtonDoc = {
  name: 'IconButton',
  description: 'Triggers an icon-only action with a required accessible label.',
  props: [
    {
      name: 'aria-label',
      description: 'Names the icon-only action.',
      required: true,
    },
  ],
  inheritedProps: [
    'ButtonHTMLAttributes<HTMLButtonElement> except aria-label and className',
  ],
  example: '<IconButton aria-label="Close"><CloseIcon /></IconButton>',
  storyId: 'controls--icon-button',
} satisfies ComponentDoc;
