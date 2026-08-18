import type {ComponentDoc} from '../docs/types.js';

export const tooltipDoc = {
  name: 'Tooltip',
  description: 'Describes its trigger on hover and on focus.',
  props: [
    {
      name: 'alignment',
      description: 'Lines the surface up along the cross axis.',
    },
    {name: 'children', description: 'Supplies the single trigger element.'},
    {name: 'content', description: 'Supplies the supplementary description.'},
    {name: 'delay', description: 'Sets the hover delay in milliseconds.'},
    {
      name: 'placement',
      description: 'Selects the preferred side of the trigger.',
    },
  ],
  inheritedProps: ['None; Tooltip renders only its trigger and description'],
  example: '<Tooltip content="Saves a draft"><Button>Save</Button></Tooltip>',
  storyId: 'core-tooltip--default',
} satisfies ComponentDoc;
