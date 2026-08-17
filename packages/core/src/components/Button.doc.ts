import type {ComponentDoc} from '../docs/types.js';

export const buttonDoc = {
  name: 'Button',
  description: 'Triggers an action through native button semantics.',
  props: [
    {name: 'variant', description: 'Selects a semantic visual emphasis.'},
  ],
  inheritedProps: ['ButtonHTMLAttributes<HTMLButtonElement> except className'],
  example: '<Button onClick={save}>Save</Button>',
  storyId: 'controls--button',
} satisfies ComponentDoc;
