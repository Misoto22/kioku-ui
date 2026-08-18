import type {ComponentDoc} from '../docs/types.js';

export const carouselDoc = {
  name: 'Carousel',
  description: 'Scrolls a row of slides horizontally.',
  props: [
    {name: 'children', description: 'Supplies the slides.'},
    {
      name: 'label',
      description: 'Names the carousel for assistive technology.',
    },
    {name: 'nextLabel', description: 'Names the forward control.'},
    {name: 'previousLabel', description: 'Names the backward control.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except aria-label, aria-roledescription, className, and role',
  ],
  example: '<Carousel label="Screenshots">{slides}</Carousel>',
  storyId: 'core-carousel--default',
} satisfies ComponentDoc;
