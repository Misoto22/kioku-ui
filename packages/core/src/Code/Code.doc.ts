import type {ComponentDoc} from '../docs/types.js';

export const codeDoc = {
  name: 'Code',
  description: 'Marks an inline fragment as code.',
  props: [{name: 'children', description: 'Supplies the code fragment.'}],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className'],
  example: '<Code>pnpm add @misoto22/kioku-ui</Code>',
  storyId: 'core-code--default',
} satisfies ComponentDoc;
