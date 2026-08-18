import type {ComponentDoc} from '../docs/types.js';

export const clickableCardDoc = {
  name: 'ClickableCard',
  description: 'A card surface that is itself one control.',
  props: [{name: 'children', description: 'Supplies the card content.'}],
  inheritedProps: ['ButtonHTMLAttributes<HTMLButtonElement> except className'],
  example: '<ClickableCard onClick={open}>Release 12</ClickableCard>',
  storyId: 'core-clickable-card--default',
} satisfies ComponentDoc;
