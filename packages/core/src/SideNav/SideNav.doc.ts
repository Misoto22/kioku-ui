import type {ComponentDoc} from '../docs/types.js';

export const sideNavDoc = {
  name: 'SideNav',
  description: 'Holds persistent navigation beside the main content.',
  props: [
    {name: 'children', description: 'Supplies the navigation sections.'},
    {name: 'footer', description: 'Pins content to the end of the rail.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children and className',
  ],
  example: '<SideNav><SideNavSection title="Work">…</SideNavSection></SideNav>',
  storyId: 'core-side-nav--default',
} satisfies ComponentDoc;

export const sideNavSectionDoc = {
  name: 'SideNavSection',
  description: 'Groups related destinations under an optional heading.',
  props: [
    {name: 'children', description: 'Supplies the destinations.'},
    {name: 'title', description: 'Names the group.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, and title',
  ],
  example: '<SideNavSection title="Work">…</SideNavSection>',
  storyId: 'core-side-nav--default',
} satisfies ComponentDoc;
