import type {ComponentDoc} from '../docs/types.js';

export const aspectRatioDoc = {
  name: 'AspectRatio',
  description: 'Reserves space at a fixed width-to-height ratio.',
  props: [
    {name: 'children', description: 'Supplies the content to frame.'},
    {name: 'ratio', description: 'Sets the width divided by the height.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, and style',
  ],
  example: '<AspectRatio ratio={4 / 3}><img alt="" src={src} /></AspectRatio>',
  storyId: 'core-aspect-ratio--default',
} satisfies ComponentDoc;
