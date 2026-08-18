import type {ComponentDoc} from '../docs/types.js';

export const boxDoc = {
  name: 'Box',
  description: 'A plain box that spends only token values.',
  props: [
    {name: 'bordered', description: 'Draws the default border.'},
    {name: 'padding', description: 'Selects the inset from the spacing scale.'},
    {name: 'radius', description: 'Selects the corner treatment.'},
    {name: 'surface', description: 'Selects the background colour role.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
  example: '<Box padding="lg" radius="container" surface="muted">…</Box>',
  storyId: 'core-box--default',
} satisfies ComponentDoc;
