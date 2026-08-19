import type {ComponentDoc} from '../docs/types.js';

export const tokenDoc = {
  name: 'Token',
  description: 'Shows one discrete value as a removable chip.',
  props: [
    {name: 'children', description: 'Supplies the value label.'},
    {name: 'leading', description: 'Places content before the label.'},
    {
      name: 'onRemove',
      description: 'Adds a remove control and receives its click.',
    },
    {name: 'removeLabel', description: 'Names the remove control.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLSpanElement> except children and className',
  ],
  example: '<Token onRemove={clear} removeLabel="Remove Ada">Ada</Token>',
  storyId: 'core-token--default',
} satisfies ComponentDoc;
