import type {ComponentDoc} from '../docs/types.js';

export const visuallyHiddenDoc = {
  name: 'VisuallyHidden',
  description:
    'Keeps text available to assistive technology while hiding it visually.',
  props: [
    {
      name: 'children',
      description: 'Accessible text to hide visually.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLSpanElement> except className and children',
  ],
  example: '<button><VisuallyHidden>Open navigation</VisuallyHidden></button>',
  storyId: 'foundations--visually-hidden',
} satisfies ComponentDoc;
