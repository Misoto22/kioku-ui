import type {ComponentDoc} from '../docs/types.js';

export const alertDoc = {
  name: 'Alert',
  description:
    'Announces feedback with polite status or assertive error semantics.',
  props: [
    {
      name: 'tone',
      description: 'Selects the semantic status tone and live behavior.',
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className and role'],
  example: '<Alert tone="danger">Unable to save.</Alert>',
  storyId: 'data-display--alert',
} satisfies ComponentDoc;
