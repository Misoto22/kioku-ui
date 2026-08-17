import type {ComponentDoc} from '../docs/types.js';

export const visuallyHiddenDoc = {
  name: 'VisuallyHidden',
  description:
    'Keeps text available to assistive technology while hiding it visually.',
  props: ['native span attributes'],
  example: '<button><VisuallyHidden>Open navigation</VisuallyHidden></button>',
  storyId: 'foundations--visually-hidden',
} satisfies ComponentDoc;
