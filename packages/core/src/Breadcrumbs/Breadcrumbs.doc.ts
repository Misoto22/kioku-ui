import type {ComponentDoc} from '../docs/types.js';

export const breadcrumbsDoc = {
  name: 'Breadcrumbs',
  description: 'Shows the path leading to the current page.',
  props: [
    {
      name: 'items',
      description: 'Supplies the trail from root to current page.',
    },
    {name: 'label', description: 'Names the navigation landmark.'},
    {name: 'separator', description: 'Replaces the decorative divider glyph.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLElement> except children and className'],
  example:
    '<Breadcrumbs items={[{href: "/", label: "Home"}, {label: "Release"}]} />',
  storyId: 'core-breadcrumbs--default',
} satisfies ComponentDoc;
