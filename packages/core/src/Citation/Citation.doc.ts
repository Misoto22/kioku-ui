import type {ComponentDoc} from '../docs/types.js';

export const citationDoc = {
  name: 'Citation',
  description: 'Names the source of a claim.',
  props: [
    {name: 'children', description: 'Supplies the source name.'},
    {name: 'href', description: 'Links the source name to the source itself.'},
    {name: 'marker', description: 'Adds a decorative superscript marker.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLElement> except children and className'],
  example: '<Citation href="/rfc" marker="1">RFC 9457</Citation>',
  storyId: 'core-citation--default',
} satisfies ComponentDoc;
