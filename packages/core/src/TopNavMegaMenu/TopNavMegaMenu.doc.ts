import type {ComponentDoc} from '../docs/types.js';

export const topNavMegaMenuDoc = {
  name: 'TopNavMegaMenu',
  description: 'A wide banner panel holding columns of destinations.',
  props: [
    {name: 'columns', description: 'Supplies the titled columns of links.'},
    {
      name: 'featured',
      description: 'Places a promoted entry beside the columns.',
    },
    {name: 'label', description: 'Names the trigger and the panel.'},
  ],
  inheritedProps: ['None; TopNavMegaMenu owns its trigger and panel'],
  example: '<TopNavMegaMenu columns={columns} label="Product" />',
  storyId: 'core-top-nav-mega-menu--default',
} satisfies ComponentDoc;

export const topNavMegaMenuFeaturedCardDoc = {
  name: 'TopNavMegaMenuFeaturedCard',
  description: 'The promoted destination inside a mega menu.',
  props: [
    {
      name: 'description',
      description: 'Adds a supporting line under the title.',
    },
    {name: 'href', description: 'Sets the destination the card links to.'},
    {name: 'media', description: 'Places an image or glyph above the title.'},
    {name: 'title', description: 'Names the promoted destination.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLAnchorElement> except children, className, and title',
  ],
  example: '<TopNavMegaMenuFeaturedCard href="/new" title="What’s new" />',
  storyId: 'core-top-nav-mega-menu--default',
} satisfies ComponentDoc;
