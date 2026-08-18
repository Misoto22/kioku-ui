import type {ComponentDoc} from '../docs/types.js';

export const selectableCardDoc = {
  name: 'SelectableCard',
  description: 'A card surface that records a choice.',
  props: [
    {name: 'description', description: 'Adds detail under the label.'},
    {name: 'label', description: 'Names the choice.'},
    {name: 'multiple', description: 'Allows several cards to hold at once.'},
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, and type',
  ],
  example: '<SelectableCard label="Standard" name="plan" value="standard" />',
  storyId: 'core-selectable-card--default',
} satisfies ComponentDoc;
